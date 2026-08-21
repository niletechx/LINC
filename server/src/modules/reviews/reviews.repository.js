const supabase = require('../../config/supabase');

const REVIEW_SELECT = `
  id,
  booking_id,
  reviewer_id,
  entity_type,
  entity_id,
  rating,
  comment,
  is_visible,
  created_at
`;

async function listByEntity(entityType, entityId) {
  const { data, error } = await supabase
    .from('reviews')
    .select(REVIEW_SELECT)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .eq('is_visible', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function listByReviewer(reviewerId) {
  const { data, error } = await supabase
    .from('reviews')
    .select(REVIEW_SELECT)
    .eq('reviewer_id', reviewerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function findById(id) {
  const { data, error } = await supabase
    .from('reviews')
    .select(REVIEW_SELECT)
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function findByBookingId(bookingId) {
  const { data, error } = await supabase
    .from('reviews')
    .select(REVIEW_SELECT)
    .eq('booking_id', bookingId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function createReview(review) {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select(REVIEW_SELECT)
    .single();

  if (error) throw error;
  return data;
}

async function updateReview(id, updates) {
  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', id)
    .select(REVIEW_SELECT)
    .single();

  if (error) throw error;
  return data;
}

module.exports = { listByEntity, listByReviewer, findById, findByBookingId, createReview, updateReview };
