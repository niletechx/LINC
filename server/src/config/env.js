const required = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GEMINI_API_KEY',
  'JWT_SECRET',
  'CHAPA_SECRET_KEY',
  'SERVER_URL',
  'CLIENT_URL',
];

function validateEnv() {
  if (process.env.NODE_ENV === 'test' || process.env.SKIP_ENV_VALIDATION === 'true') {
    return;
  }
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.warn(`[ENV WARNING] Missing non-critical environment variables: ${missing.join(', ')}. Using development defaults.`);
  }
}

module.exports = { validateEnv };
