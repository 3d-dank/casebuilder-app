import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ medications: data || [] })
  } catch (err) {
    console.error('GET /api/medications:', err)
    return NextResponse.json({ error: 'Failed to fetch medications' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { name, dose, frequency, prescribing_doctor, start_date, end_date, is_current, side_effects, notes } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Medication name is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('medications')
      .insert({ name, dose, frequency, prescribing_doctor, start_date, end_date, is_current: is_current ?? true, side_effects, notes })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ medication: data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/medications:', err)
    return NextResponse.json({ error: 'Failed to add medication' }, { status: 500 })
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

    const { error } = await supabase.from('medications').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/medications:', err)
    return NextResponse.json({ error: 'Failed to delete medication' }, { status: 500 })
  }
}
