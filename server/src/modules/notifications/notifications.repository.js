const supabase = require('../../config/supabase');

const NOTIFICATION_SELECT = `
  id,
  user_id,
  type,
  title,
  body,
  data,
  is_read,
  created_at
`;

async function listByUser(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select(NOTIFICATION_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function findById(id) {
  const { data, error } = await supabase
    .from('notifications')
    .select(NOTIFICATION_SELECT)
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function createNotification(notification) {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select(NOTIFICATION_SELECT)
    .single();

  if (error) throw error;
  return data;
}

async function markAsRead(id) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .select(NOTIFICATION_SELECT)
    .single();

  if (error) throw error;
  return data;
}

async function markAllAsRead(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .select(NOTIFICATION_SELECT);

  if (error) throw error;
  return data || [];
}

module.exports = { listByUser, findById, createNotification, markAsRead, markAllAsRead };
