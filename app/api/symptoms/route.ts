import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('symptom_logs')
      .select('*')
      .order('log_date', { ascending: false })

    if (error) throw error
    return NextResponse.json({ symptoms: data || [] })
  } catch (err) {
    console.error('GET /api/symptoms:', err)
    return NextResponse.json({ error: 'Failed to fetch symptoms' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { log_date, category, symptom, severity, description } = body

    if (!log_date || !category || !symptom) {
      return NextResponse.json({ error: 'Date, category, and symptom are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('symptom_logs')
      .insert({ log_date, category, symptom, severity, description })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ symptom: data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/symptoms:', err)
    return NextResponse.json({ error: 'Failed to log symptom' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const { error } = await supabase.from('symptom_logs').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/symptoms:', err)
    return NextResponse.json({ error: 'Failed to delete symptom' }, { status: 500 })
  }
}
