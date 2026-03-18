import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import OpenAI from 'openai'

export async function POST() {
  try {
    const supabase = createServerClient()
    const openaiKey = process.env.OPENAI_API_KEY

    if (!openaiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    // Gather all case data
    const [providers, symptoms, medications, formDataRes] = await Promise.all([
      supabase.from('medical_providers').select('*').order('created_at'),
      supabase.from('symptom_logs').select('*').order('log_date', { ascending: false }).limit(30),
      supabase.from('medications').select('*').order('created_at'),
      supabase.from('form_data').select('*'),
    ])

    const medicalTeam = providers.data || []
    const symptomLogs = symptoms.data || []
    const medicationList = medications.data || []
    const forms = formDataRes.data || []

    const form3368 = forms.find((f) => f.id === 'ssa-3368')?.data || {}
    const form3373 = forms.find((f) => f.id === 'ssa-3373')?.data || {}

    const systemPrompt = `You are a compassionate, highly skilled Social Security Disability advocate and medical writer. 
Your task is to write a comprehensive, professional case narrative for an SSDI application. 
The narrative should be written in third-person, factual, and appropriate for Social Security Administration review.
Use clear, precise language that demonstrates the severity and legitimacy of the disability.
Focus on functional limitations and how they prevent substantial gainful activity.`

    const userPrompt = `Please write a comprehensive SSDI case narrative for a disability applicant with the following information:

DIAGNOSIS: Leukemia with chemotherapy-induced cognitive impairment (chemo brain / cancer-related cognitive dysfunction)

MEDICAL TEAM (${medicalTeam.length} providers):
${medicalTeam.map((p) => `- ${p.name}, ${p.specialty || 'Provider'} at ${p.clinic || 'medical facility'} (${p.dates_of_treatment || 'ongoing treatment'})`).join('\n') || 'To be populated from medical team section'}

CURRENT MEDICATIONS (${medicationList.length} medications):
${medicationList.filter((m) => m.is_current).map((m) => `- ${m.name} ${m.dose || ''} ${m.frequency || ''} — Side effects: ${m.side_effects || 'none listed'}`).join('\n') || 'To be populated from medications section'}

PAST MEDICATIONS/CHEMOTHERAPY:
${medicationList.filter((m) => !m.is_current).map((m) => `- ${m.name} ${m.dose || ''} (${m.start_date || ''} to ${m.end_date || ''})`).join('\n') || 'Chemotherapy history to be documented'}

RECENT SYMPTOM LOG (last 30 entries):
${symptomLogs.slice(0, 10).map((s) => `- ${s.log_date}: [${s.category}] ${s.symptom} — Severity ${s.severity}/10. ${s.description || ''}`).join('\n') || 'Symptom logging in progress'}

DAILY FUNCTION (from SSA-3373):
- Daily activities: ${(form3373 as Record<string, unknown>).daily_activities || 'see function report'}
- Personal care: ${(form3373 as Record<string, unknown>).personal_care || 'see function report'}
- Meal preparation: ${(form3373 as Record<string, unknown>).meal_prep || 'see function report'}
- Getting around: ${(form3373 as Record<string, unknown>).getting_around || 'see function report'}
- Social activities: ${(form3373 as Record<string, unknown>).social_activities || 'see function report'}
- Concentration/memory: ${(form3373 as Record<string, unknown>).concentration || 'significant impairment due to chemo brain'}
- How conditions affect life: ${(form3373 as Record<string, unknown>).conditions_affect_life || 'see function report'}

PERSONAL INFO (from SSA-3368):
${Object.keys(form3368).length > 0 ? `Name: ${(form3368 as Record<string, unknown>).full_name || 'Applicant'}, Conditions: ${(form3368 as Record<string, unknown>).medical_conditions || 'Leukemia, chemotherapy-induced cognitive impairment'}` : 'Personal information documented in disability report'}

Please write a 4-6 paragraph professional narrative that:
1. Opens with the applicant's diagnosis and how it affects their ability to work
2. Describes the medical treatment history (chemotherapy, ongoing care)
3. Details the cognitive symptoms of chemo brain and their functional impact
4. Explains specific limitations in daily living and work-related activities  
5. Closes with a clear statement of why substantial gainful activity is not possible

Use SSA-appropriate language. Be factual, compassionate, and thorough.`

    const openai = new OpenAI({ apiKey: openaiKey })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    })

    const content = completion.choices[0]?.message?.content || ''

    // Save to database
    const { data: saved, error: saveError } = await supabase
      .from('case_summaries')
      .insert({ content })
      .select()
      .single()

    if (saveError) console.error('Error saving summary:', saveError)

    return NextResponse.json({ content, id: saved?.id })
  } catch (err) {
    console.error('POST /api/case/generate:', err)
    return NextResponse.json({ error: 'Failed to generate case summary' }, { status: 500 })
  }
}
