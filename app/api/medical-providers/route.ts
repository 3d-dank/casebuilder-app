import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('medical_providers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ providers: data || [] })
  } catch (err) {
    console.error('GET /api/medical-providers:', err)
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { name, specialty, clinic, phone, address, dates_of_treatment, notes } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Provider name is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('medical_providers')
      .insert({ name, specialty, clinic, phone, address, dates_of_treatment, notes })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ provider: data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/medical-providers:', err)
    return NextResponse.json({ error: 'Failed to create provider' }, { status: 500 })
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

    const { error } = await supabase
      .from('medical_providers')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/medical-providers:', err)
    return NextResponse.json({ error: 'Failed to delete provider' }, { status: 500 })
  }
}
