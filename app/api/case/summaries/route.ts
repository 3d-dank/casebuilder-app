import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('case_summaries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) throw error
    return NextResponse.json({ summaries: data || [] })
  } catch (err) {
    console.error('GET /api/case/summaries:', err)
    return NextResponse.json({ error: 'Failed to fetch summaries' }, { status: 500 })
  }
}
