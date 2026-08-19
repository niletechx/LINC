require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { createClient } = require('@supabase/supabase-js');
const { mockSupabase } = require('./mockSupabase');

const url = process.env.SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const isPlaceholder = !url || url.includes('your-project-id') || !key || key.includes('your-service-role');

let supabase;
if (isPlaceholder) {
  console.log('ℹ️ [LINC Backend] Using local in-memory DB (Supabase credentials in server/.env are placeholder)');
  supabase = mockSupabase;
} else {
  supabase = createClient(url, key);
}

module.exports = supabase;
