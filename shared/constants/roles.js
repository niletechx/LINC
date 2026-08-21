const USER_ROLES = {
  REQUESTER: 'requester',   // anyone with an account — always available
  PROVIDER: 'provider',     // user who has created a provider profile
  BUSINESS_OWNER: 'business_owner',
  BUSINESS_MEMBER: 'business_member',
  ORG_OWNER: 'org_owner',
  ORG_MEMBER: 'org_member',
  ADMIN: 'admin',
};

const ENTITY_TYPES = {
  USER: 'user',
  PROVIDER: 'provider',
  BUSINESS: 'business',
  ORGANIZATION: 'organization',
};

const MEMBER_ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager',
  STAFF: 'staff',
};

module.exports = { USER_ROLES, ENTITY_TYPES, MEMBER_ROLES };
