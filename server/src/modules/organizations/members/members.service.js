const supabase = require('../../../config/supabase');

async function listMembers(organizationId) {
  const { data, error } = await supabase
    .from('organization_members')
    .select('id, organization_id, user_id, role, joined_at, users!user_id (id, full_name, username, avatar_url)')
    .eq('organization_id', organizationId)
    .order('joined_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function addMember(organizationId, userId, role = 'staff') {
  if (!['owner', 'manager', 'staff'].includes(role)) {
    const err = new Error('Invalid role');
    err.statusCode = 400;
    throw err;
  }

  const { data, error } = await supabase
    .from('organization_members')
    .insert({ organization_id: organizationId, user_id: userId, role })
    .select('id, organization_id, user_id, role, joined_at')
    .single();

  if (error) throw error;
  return data;
}

async function removeMember(organizationId, userId) {
  const { error } = await supabase
    .from('organization_members')
    .delete()
    .eq('organization_id', organizationId)
    .eq('user_id', userId);

  if (error) throw error;
  return { success: true };
}

module.exports = { listMembers, addMember, removeMember };
