require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  console.log("Running migration: add role column to users...");

  // Step 1: Add role column (idempotent via IF NOT EXISTS)
  const { error: e1 } = await supabase.rpc("exec_ddl", {
    sql: "ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role varchar(20) NOT NULL DEFAULT \"client\" CHECK (role IN (\"client\", \"provider\", \"admin\"))"
  });

  if (e1) {
    console.log("RPC not available, trying direct approach via JS SDK...");
    
    // Check if role column already exists by trying to select it
    const { data, error: checkErr } = await supabase
      .from("users")
      .select("role")
      .limit(1);

    if (checkErr && checkErr.message.includes("column")) {
      console.error("Role column missing and cannot add via SDK. Please run migration manually in Supabase SQL Editor.");
      console.log("SQL to run:", `
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role varchar(20) NOT NULL DEFAULT ''client'' CHECK (role IN (''client'', ''provider'', ''admin''));
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role) WHERE deleted_at IS NULL;
UPDATE public.users u SET role = ''provider'' WHERE EXISTS (SELECT 1 FROM public.provider_profiles pp WHERE pp.user_id = u.id) AND u.role = ''client'';
      `);
    } else {
      console.log("? Role column already exists or was added successfully");
    }
  } else {
    console.log("? Migration applied successfully");
  }
}

runMigration().catch(console.error).finally(() => process.exit());
