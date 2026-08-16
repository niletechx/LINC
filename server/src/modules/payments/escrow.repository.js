const supabase = require('../../config/supabase');

async function create(data) {
  const { data: row, error } = await supabase
    .from('escrow_transactions')
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return row;
}

async function findById(id) {
  const { data, error } = await supabase
    .from('escrow_transactions')
    .select('*, bookings(*)')
    .eq('id', id)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function findByBookingId(bookingId) {
  const { data, error } = await supabase
    .from('escrow_transactions')
    .select('*')
    .eq('booking_id', bookingId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function findByTxRef(txRef) {
  const { data, error } = await supabase
    .from('escrow_transactions')
    .select('*')
    .eq('chapa_tx_ref', txRef)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function findByUser(userId) {
  const { data, error } = await supabase
    .from('escrow_transactions')
    .select('*, bookings(service_id, scheduled_at, entity_type, entity_id)')
    .eq('requester_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function update(id, updates) {
  const { data, error } = await supabase
    .from('escrow_transactions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Find all pending_confirmation records past their auto_release_at
async function findOverdueForRelease() {
  const { data, error } = await supabase
    .from('escrow_transactions')
    .select('*')
    .eq('status', 'pending_confirmation')
    .lte('auto_release_at', new Date().toISOString());
  if (error) throw error;
  return data || [];
}

// Disputes
async function createDispute(data) {
  const { data: row, error } = await supabase
    .from('escrow_disputes')
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return row;
}

async function findOpenDisputes() {
  const { data, error } = await supabase
    .from('escrow_disputes')
    .select('*, escrow_transactions(*)')
    .eq('status', 'open')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

async function findDisputeById(id) {
  const { data, error } = await supabase
    .from('escrow_disputes')
    .select('*, escrow_transactions(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

async function updateDispute(id, updates) {
  const { data, error } = await supabase
    .from('escrow_disputes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

module.exports = {
  create,
  findById,
  findByBookingId,
  findByTxRef,
  findByUser,
  update,
  findOverdueForRelease,
  createDispute,
  findOpenDisputes,
  findDisputeById,
  updateDispute,
};
