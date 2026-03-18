import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServerClient()

    // Fetch counts from all tables
    const [providers, documents, symptoms, medications, formData, summaries] = await Promise.all([
      supabase.from('medical_providers').select('id', { count: 'exact', head: true }),
      supabase.from('documents').select('id', { count: 'exact', head: true }),
      supabase.from('symptom_logs').select('id', { count: 'exact', head: true }),
      supabase.from('medications').select('id', { count: 'exact', head: true }),
      supabase.from('form_data').select('id'),
      supabase.from('case_summaries').select('id', { count: 'exact', head: true }),
    ])

    const formIds = formData.data?.map((f) => f.id) || []
    const completedForms = ['ssa-3368', 'ssa-3369', 'ssa-3373', 'ssa-827'].filter((id) =>
      formIds.includes(id)
    ).length

    const sections = {
      medical_team: {
        label: 'Medical Team',
        count: providers.count || 0,
        complete: (providers.count || 0) >= 2,
        percent: Math.min(100, ((providers.count || 0) / 3) * 100),
      },
      documents: {
        label: 'Documents',
        count: documents.count || 0,
        complete: (documents.count || 0) >= 5,
        percent: Math.min(100, ((documents.count || 0) / 10) * 100),
      },
      forms: {
        label: 'SSA Forms',
        count: completedForms,
        complete: completedForms === 4,
        percent: (completedForms / 4) * 100,
      },
      symptoms: {
        label: 'Symptoms Log',
        count: symptoms.count || 0,
        complete: (symptoms.count || 0) >= 7,
        percent: Math.min(100, ((symptoms.count || 0) / 14) * 100),
      },
      medications: {
        label: 'Medications',
        count: medications.count || 0,
        complete: (medications.count || 0) >= 1,
        percent: Math.min(100, ((medications.count || 0) / 3) * 100),
      },
      case_summary: {
        label: 'Case Summary',
        count: summaries.count || 0,
        complete: (summaries.count || 0) >= 1,
        percent: (summaries.count || 0) >= 1 ? 100 : 0,
      },
    }

    const sectionValues = Object.values(sections)
    const overallPercent = Math.round(
      sectionValues.reduce((sum, s) => sum + s.percent, 0) / sectionValues.length
    )

    return NextResponse.json({ sections, overallPercent })
  } catch (err) {
    console.error('GET /api/case/progress:', err)
    return NextResponse.json({ error: 'Failed to calculate progress' }, { status: 500 })
  }
}
