const supabase = require('../../config/supabase');

async function getOverview() {
  const [users, providers, businesses, organizations, requests, reports, verification] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('provider_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('businesses').select('id', { count: 'exact', head: true }),
    supabase.from('organizations').select('id', { count: 'exact', head: true }),
    supabase.from('requests').select('id', { count: 'exact', head: true }),
    supabase.from('reports').select('id', { count: 'exact', head: true }),
    supabase.from('verification_requests').select('id', { count: 'exact', head: true }),
  ]);

  return {
    users: users.count || 0,
    providers: providers.count || 0,
    businesses: businesses.count || 0,
    organizations: organizations.count || 0,
    requests: requests.count || 0,
    reports: reports.count || 0,
    verificationRequests: verification.count || 0,
  };
}

async function listUsers(filters = {}) {
  let query = supabase.from('users').select('id, email, full_name, username, is_admin, is_active, created_at');

  if (filters.is_admin !== undefined) {
    query = query.eq('is_admin', filters.is_admin === 'true' || filters.is_admin === true);
  }

  const { data, error } = await query.order('created_at', { ascending: false }).limit(Number(filters.limit) || 20);
  if (error) throw error;
  return data || [];
}

async function listReports() {
  const { data, error } = await supabase
    .from('reports')
    .select('id, reporter_id, entity_type, entity_id, reason, status, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function listVerificationRequests() {
  const { data, error } = await supabase
    .from('verification_requests')
    .select('id, entity_type, entity_id, submitted_by, status, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

module.exports = { getOverview, listUsers, listReports, listVerificationRequests };
