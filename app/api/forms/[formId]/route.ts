import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('form_data')
      .select('*')
      .eq('id', formId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return NextResponse.json({ formData: data?.data || {} })
  } catch (err) {
    console.error('GET /api/forms/[formId]:', err)
    return NextResponse.json({ error: 'Failed to fetch form data' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params
    const supabase = createServerClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('form_data')
      .upsert({
        id: formId,
        data: body,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ formData: data?.data || {} })
  } catch (err) {
    console.error('POST /api/forms/[formId]:', err)
    return NextResponse.json({ error: 'Failed to save form data' }, { status: 500 })
  }
}
