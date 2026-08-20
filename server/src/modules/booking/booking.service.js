const bookingRepo = require('./booking.repository');
const servicesRepo = require('../services/services.repository');
const supabase = require('../../config/supabase');

const BOOKING_FIELDS = [
  'service_id', 'entity_type', 'entity_id', 'scheduled_at',
  'duration_hours', 'agreed_price', 'currency', 'notes', 'status',
];

function normalizeBookingInput(payload = {}) {
  const filtered = {};
  BOOKING_FIELDS.forEach((field) => {
    if (payload[field] !== undefined) filtered[field] = payload[field];
  });
  return filtered;
}

async function getUserEntityIds(userId) {
  if (!userId) return [];
  const ids = new Set([String(userId)]);
  try {
    const { data: provs } = await supabase
      .from('provider_profiles')
      .select('id, user_id')
      .or(`user_id.eq.${userId},id.eq.${userId}`);
    if (provs && provs.length > 0) {
      provs.forEach((p) => {
        if (p.id) ids.add(String(p.id));
        if (p.user_id) ids.add(String(p.user_id));
      });
    }
  } catch (_) {}
  return Array.from(ids);
}

async function listBookings(userId) {
  const userEntityIds = await getUserEntityIds(userId);
  const bookings = await bookingRepo.listBookings(userEntityIds);
  const enriched = await Promise.all(
    bookings.map(async (b) => {
      let providerName = 'Provider';
      let providerAvatar = null;
      let providerHeadline = '';
      let clientName = b.users?.full_name || b.users?.username || 'Client';
      let clientAvatar = b.users?.avatar_url || null;

      if (b.entity_type === 'provider') {
        const { data: prov } = await supabase
          .from('provider_profiles')
          .select('id, user_id, headline, users!user_id(id, full_name, username, avatar_url)')
          .eq('id', b.entity_id)
          .maybeSingle();
        if (prov) {
          providerName = prov.users?.full_name || prov.headline || 'Provider';
          providerAvatar = prov.users?.avatar_url || null;
          providerHeadline = prov.headline || '';
        }
      }

      if (!b.users && b.requester_id) {
        const { data: usr } = await supabase
          .from('users')
          .select('id, full_name, username, avatar_url')
          .eq('id', b.requester_id)
          .maybeSingle();
        if (usr) {
          clientName = usr.full_name || usr.username || 'Client';
          clientAvatar = usr.avatar_url || null;
        }
      }

      const isProvider = userEntityIds.includes(String(b.entity_id));

      return {
        ...b,
        provider_name: providerName,
        provider_avatar: providerAvatar,
        provider_headline: providerHeadline,
        client_name: clientName,
        client_avatar: clientAvatar,
        is_provider_view: isProvider,
      };
    })
  );
  return enriched;
}

async function getBookingById(userId, id) {
  const record = await bookingRepo.findById(id);
  if (!record) { const err = new Error('Booking not found'); err.statusCode = 404; throw err; }

  const userEntityIds = await getUserEntityIds(userId);
  const isRequester = userEntityIds.includes(String(record.requester_id));
  const isProvider = userEntityIds.includes(String(record.entity_id)) || (await _isProviderForBooking(userId, record));

  if (!isRequester && !isProvider) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }
  return record;
}

async function createBooking(userId, payload = {}) {
  const data = normalizeBookingInput(payload);
  
  let service = null;
  if (data.service_id) {
    service = await servicesRepo.findById(data.service_id);
  }
  if (!service && data.entity_id) {
    const { data: svcList } = await supabase
      .from('services')
      .select('*')
      .eq('provider_id', data.entity_id)
      .limit(1);
    if (svcList && svcList.length > 0) service = svcList[0];
  }

  const entityType = data.entity_type || (service?.provider_id ? 'provider' : service?.business_id ? 'business' : 'organization');
  const entityId = data.entity_id || service?.provider_id || service?.business_id || service?.organization_id;

  const newBooking = await bookingRepo.createBooking({
    requester_id: userId,
    service_id: service ? service.id : null,
    entity_type: entityType,
    entity_id: entityId,
    scheduled_at: data.scheduled_at,
    duration_hours: data.duration_hours || 1,
    agreed_price: data.agreed_price ?? (service ? service.price_amount : 350),
    currency: data.currency || (service ? service.currency : 'ETB'),
    notes: data.notes,
    status: data.status || 'pending',
  });

  // Automatically create a notification for the provider!
  try {
    let providerUserId = null;
    if (entityType === 'provider') {
      const { data: prov } = await supabase
        .from('provider_profiles')
        .select('user_id')
        .eq('id', entityId)
        .maybeSingle();
      if (prov && prov.user_id) providerUserId = prov.user_id;
    }

    const { data: clientUser } = await supabase
      .from('users')
      .select('full_name, username')
      .eq('id', userId)
      .maybeSingle();
    const clientName = clientUser?.full_name || clientUser?.username || 'A client';

    if (providerUserId) {
      await supabase.from('notifications').insert({
        user_id: providerUserId,
        title: 'New Booking Request! 📋',
        body: `${clientName} has sent you a booking request for ${newBooking.agreed_price || 350} ETB.`,
        type: 'booking',
        data: { booking_id: newBooking.id },
      });
    }
  } catch (_) {}

  return newBooking;
}

async function updateBooking(userId, id, payload = {}) {
  const existing = await bookingRepo.findById(id);
  if (!existing) { const err = new Error('Booking not found'); err.statusCode = 404; throw err; }

  const userEntityIds = await getUserEntityIds(userId);
  const isRequester = userEntityIds.includes(String(existing.requester_id));
  const isProvider = userEntityIds.includes(String(existing.entity_id)) || (await _isProviderForBooking(userId, existing));

  if (!isRequester && !isProvider) {
    const err = new Error('Forbidden — you are not a party to this booking');
    err.statusCode = 403;
    throw err;
  }

  const data = normalizeBookingInput(payload);
  if (Object.keys(data).length === 0) {
    const err = new Error('No valid fields to update');
    err.statusCode = 400;
    throw err;
  }

  const updated = await bookingRepo.updateBooking(id, data);

  // If status was changed, notify the other party
  try {
    if (data.status) {
      if (isProvider && (data.status === 'confirmed' || data.status === 'in_progress')) {
        const { data: provProfile } = await supabase
          .from('provider_profiles')
          .select('headline, users!user_id(full_name)')
          .eq('id', existing.entity_id)
          .maybeSingle();
        const pName = provProfile?.users?.full_name || provProfile?.headline || 'Your provider';

        await supabase.from('notifications').insert({
          user_id: existing.requester_id,
          title: 'Booking Accepted! ✅',
          body: `${pName} accepted your booking request. Status is now Confirmed.`,
          type: 'booking',
          data: { booking_id: id, status: data.status },
        });
      } else if (isProvider && data.status === 'cancelled') {
        await supabase.from('notifications').insert({
          user_id: existing.requester_id,
          title: 'Booking Update',
          body: 'Your booking request was declined by the provider.',
          type: 'booking',
          data: { booking_id: id, status: 'cancelled' },
        });
      } else if (isRequester && data.status === 'cancelled') {
        let providerUserId = null;
        if (existing.entity_type === 'provider') {
          const { data: p } = await supabase.from('provider_profiles').select('user_id').eq('id', existing.entity_id).maybeSingle();
          if (p) providerUserId = p.user_id;
        }
        if (providerUserId) {
          await supabase.from('notifications').insert({
            user_id: providerUserId,
            title: 'Booking Cancelled',
            body: 'A client has cancelled their booking request.',
            type: 'booking',
            data: { booking_id: id, status: 'cancelled' },
          });
        }
      }
    }
  } catch (_) {}

  return updated;
}

/**
 * Provider marks a booking as complete.
 * Triggers the 72-hour escrow confirmation window.
 */
async function markComplete(bookingId, providerUserId) {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) { const err = new Error('Booking not found'); err.statusCode = 404; throw err; }

  const allowedStatuses = ['confirmed', 'in_progress', 'paid_escrow', 'pending'];
  if (!allowedStatuses.includes(booking.status)) {
    const err = new Error(`Cannot mark complete — booking status is: ${booking.status}`);
    err.statusCode = 400; throw err;
  }

  // Escrow path: delegate to escrow.service
  const { findByBookingId } = require('../payments/escrow.repository');
  const escrow = await findByBookingId(bookingId);

  if (escrow && escrow.status === 'funds_held') {
    const escrowService = require('../payments/escrow.service');
    return escrowService.markServiceComplete({ bookingId, providerUserId });
  }

  const userEntityIds = await getUserEntityIds(providerUserId);
  const isProvider = userEntityIds.includes(String(booking.entity_id)) || (await _isProviderForBooking(providerUserId, booking));

  if (!isProvider && !userEntityIds.includes(String(booking.requester_id))) {
    const err = new Error('Forbidden — only the assigned provider or client can complete this');
    err.statusCode = 403; throw err;
  }

  const updated = await bookingRepo.updateBooking(bookingId, { status: 'completed' });

  // Notify client if completed by provider
  try {
    await supabase.from('notifications').insert({
      user_id: booking.requester_id,
      title: 'Job Completed! 🎉',
      body: 'Your service provider marked the job as completed. Please release escrow payment and leave a review.',
      type: 'booking',
      data: { booking_id: bookingId, status: 'completed' },
    });
  } catch (_) {}

  return updated;
}

async function _isProviderForBooking(userId, booking) {
  if (booking.entity_type === 'provider') {
    const { data } = await supabase.from('provider_profiles').select('id')
      .eq('id', booking.entity_id).eq('user_id', userId).single();
    return !!data;
  } else if (booking.entity_type === 'business') {
    const { data } = await supabase.from('business_members').select('id')
      .eq('business_id', booking.entity_id).eq('user_id', userId).in('role', ['owner', 'manager']).single();
    return !!data;
  } else if (booking.entity_type === 'organization') {
    const { data } = await supabase.from('organization_members').select('id')
      .eq('organization_id', booking.entity_id).eq('user_id', userId).in('role', ['owner', 'manager']).single();
    return !!data;
  }
  return false;
}

module.exports = { listBookings, getBookingById, createBooking, updateBooking, markComplete };

