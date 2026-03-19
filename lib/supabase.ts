import { createClient } from '@supabase/supabase-js'

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || ''
}

function getAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
}

function getServiceKey() {
  return process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
}

// Client-side Supabase client (lazy — not created at module evaluation time)
export function createBrowserClient() {
  return createClient(getSupabaseUrl(), getAnonKey())
}

// Server-side Supabase client (uses service role key — bypasses RLS)
export function createServerClient() {
  const url = getSupabaseUrl()
  const key = getServiceKey()
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  return createClient(url, key)
}
