const supabase = require('../config/supabase');
const { error } = require('../utils/apiResponse');

/**
 * Checks that the authenticated user owns or is a member of the
 * entity they are trying to modify.
 * Usage: entityAccess('provider') — looks for req.params.id
 */
function entityAccess(entityType) {
  return async (req, res, next) => {
    const userId = req.user?.id;
    const entityId = req.params.id;

    if (!userId) return error(res, 'Unauthorized', 401);

    try {
      let hasAccess = false;

      if (entityType === 'provider') {
        const { data } = await supabase
          .from('provider_profiles')
          .select('id')
          .eq('id', entityId)
          .eq('user_id', userId)
          .single();
        hasAccess = !!data;
      } else if (entityType === 'business') {
        const { data } = await supabase
          .from('business_members')
          .select('id')
          .eq('business_id', entityId)
          .eq('user_id', userId)
          .in('role', ['owner', 'manager'])
          .single();
        hasAccess = !!data;
      } else if (entityType === 'organization') {
        const { data } = await supabase
          .from('organization_members')
          .select('id')
          .eq('organization_id', entityId)
          .eq('user_id', userId)
          .in('role', ['owner', 'manager'])
          .single();
        hasAccess = !!data;
      }

      if (!hasAccess) return error(res, 'Forbidden — you do not have access to this entity', 403);
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = entityAccess;
