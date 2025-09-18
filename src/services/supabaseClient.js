const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || (!SUPABASE_ANON_KEY && !SUPABASE_SERVICE_ROLE)) {
    throw new Error('Missing SUPABASE_URL and a key (SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE) in environment');
}

// Prefer service role for server-side privileged access when available
const effectiveKey = SUPABASE_SERVICE_ROLE || SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, effectiveKey, {
    auth: {
        persistSession: false
    }
});

module.exports = { supabase };


