const supabase = require('../../../config/supabase');

async function listMembers(businessId) {
  const { data, error } = await supabase
    .from('business_members')
    .select('id, business_id, user_id, role, joined_at, users!user_id (id, full_name, username, avatar_url)')
    .eq('business_id', businessId)
    .order('joined_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function addMember(businessId, userId, role = 'staff') {
  if (!['owner', 'manager', 'staff'].includes(role)) {
    const err = new Error('Invalid role');
    err.statusCode = 400;
    throw err;
  }

  const { data, error } = await supabase
    .from('business_members')
    .insert({ business_id: businessId, user_id: userId, role })
    .select('id, business_id, user_id, role, joined_at')
    .single();

  if (error) throw error;
  return data;
}

async function removeMember(businessId, userId) {
  const { error } = await supabase
    .from('business_members')
    .delete()
    .eq('business_id', businessId)
    .eq('user_id', userId);

  if (error) throw error;
  return { success: true };
}

module.exports = { listMembers, addMember, removeMember };
