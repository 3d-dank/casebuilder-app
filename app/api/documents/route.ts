import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const signId = searchParams.get('id')
    const sign = searchParams.get('sign')

    // Signed URL mode: ?id=X&sign=1
    if (signId && sign === '1') {
      const { data: doc, error: fetchErr } = await supabase
        .from('documents')
        .select('storage_path, name')
        .eq('id', signId)
        .single()
      if (fetchErr || !doc) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }
      const { data: urlData, error: urlErr } = await supabase.storage
        .from('case-documents')
        .createSignedUrl(doc.storage_path, 3600)
      if (urlErr) throw urlErr
      return NextResponse.json({ url: urlData.signedUrl, name: doc.name })
    }

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ documents: data || [] })
  } catch (err) {
    console.error('GET /api/documents:', err)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string
    const description = formData.get('description') as string
    const doc_date = formData.get('doc_date') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Upload to Supabase Storage
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const { data: storageData, error: storageError } = await supabase.storage
      .from('case-documents')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (storageError) throw storageError

    // Save metadata to database
    const { data, error } = await supabase
      .from('documents')
      .insert({
        name: file.name,
        type: type || 'other',
        description,
        doc_date,
        storage_path: storageData.path,
        file_size: file.size,
        mime_type: file.type,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ document: data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/documents:', err)
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 })
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

    // Get the document to find storage path
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('storage_path')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    // Delete from storage
    if (doc?.storage_path) {
      await supabase.storage.from('case-documents').remove([doc.storage_path])
    }

    // Delete from database
    const { error } = await supabase.from('documents').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/documents:', err)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}
