const supabase = require('../../config/supabase');

const BOOKING_SELECT = `
  id,
  requester_id,
  service_id,
  entity_type,
  entity_id,
  scheduled_at,
  duration_hours,
  agreed_price,
  currency,
  notes,
  status,
  cancelled_by,
  cancellation_reason,
  created_at,
  updated_at,
  users!requester_id (id, full_name, username, avatar_url),
  services!service_id (id, title, price_type, price_amount, provider_id, business_id, organization_id)
`;

async function listBookings(userId) {
  const { data, error } = await supabase
    .from('bookings')
    .select(BOOKING_SELECT)
    .eq('requester_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

async function findById(id) {
  const { data, error } = await supabase
    .from('bookings')
    .select(BOOKING_SELECT)
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function createBooking(booking) {
  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select(BOOKING_SELECT)
    .single();

  if (error) throw error;
  return data;
}

async function updateBooking(id, updates) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(BOOKING_SELECT)
    .single();

  if (error) throw error;
  return data;
}

module.exports = { listBookings, findById, createBooking, updateBooking };
