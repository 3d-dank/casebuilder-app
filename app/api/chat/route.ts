import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServerClient } from '@/lib/supabase'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `You are a compassionate and knowledgeable disability case assistant helping a family navigate the Social Security Disability Insurance (SSDI) process. The applicant has leukemia and cognitive impairment (chemo brain) and is applying for disability benefits.

Your role:
- Answer questions about the SSDI application process clearly and simply
- Help them fill out SSA forms (SSA-3368, SSA-3369, SSA-3373, SSA-827)
- Suggest what information to gather and from which doctors
- Help write descriptions of symptoms and limitations in SSA-appropriate language
- Be warm, patient, and encouraging — this is a stressful process
- Remember: the primary user is the applicant's husband, who is doing most of the work

Key SSDI knowledge:
- The SSA-3373 Function Report is the most critical form — be very detailed and specific
- Cognitive limitations (memory, concentration, word-finding) are valid and important disabilities
- "Chemo brain" is medically recognized as Chemotherapy-Related Cognitive Impairment (CRCI)
- SSA looks for consistency across all forms and medical records
- Specific examples beat vague descriptions ("can't concentrate for more than 10 minutes" > "has trouble focusing")
- The applicant should describe their WORST days, not their best
- A well-documented medical record trail is essential — every treatment, every specialist

When you have case context below, use it to give specific, personalized answers.`

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()
    const supabase = createServerClient()

    // Gather case context
    const [providers, symptoms, medications, forms] = await Promise.all([
      supabase.from('medical_providers').select('name, specialty, clinic, dates_of_treatment').limit(20),
      supabase.from('symptom_logs').select('category, symptom, severity, description, log_date').order('log_date', { ascending: false }).limit(20),
      supabase.from('medications').select('name, dose, frequency, is_current, side_effects').limit(20),
      supabase.from('form_data').select('id, data').limit(10),
    ])

    // Build case context string
    let caseContext = '\n\n--- CURRENT CASE CONTEXT ---\n'

    if (providers.data?.length) {
      caseContext += `\nMedical Team (${providers.data.length} providers):\n`
      providers.data.forEach(p => {
        caseContext += `- ${p.name} (${p.specialty || 'Unknown specialty'}) at ${p.clinic || 'Unknown clinic'}, treated: ${p.dates_of_treatment || 'dates unknown'}\n`
      })
    } else {
      caseContext += '\nMedical Team: Not yet added\n'
    }

    if (symptoms.data?.length) {
      caseContext += `\nRecent Symptoms Logged (${symptoms.data.length} entries):\n`
      symptoms.data.slice(0, 5).forEach(s => {
        caseContext += `- ${s.log_date}: [${s.category}] ${s.symptom} (severity ${s.severity}/10) — ${s.description || ''}\n`
      })
    } else {
      caseContext += '\nSymptoms: Not yet logged\n'
    }

    if (medications.data?.length) {
      const current = medications.data.filter(m => m.is_current)
      caseContext += `\nMedications (${current.length} current):\n`
      current.forEach(m => {
        caseContext += `- ${m.name} ${m.dose || ''} ${m.frequency || ''}\n`
      })
    } else {
      caseContext += '\nMedications: Not yet added\n'
    }

    const completedForms = forms.data?.filter(f => f.data?.completed) || []
    caseContext += `\nForms completed: ${completedForms.map(f => f.id).join(', ') || 'None yet'}\n`
    caseContext += '--- END CASE CONTEXT ---\n'

    // Save user message
    await supabase.from('chat_messages').insert({
      role: 'user',
      content: message,
    })

    // Build messages for OpenAI
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT + caseContext },
      ...(history || []).slice(-10).map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 800,
    })

    const reply = completion.choices[0]?.message?.content || 'Sorry, I had trouble responding. Please try again.'

    // Save assistant reply
    await supabase.from('chat_messages').insert({
      role: 'assistant',
      content: reply,
    })

    return NextResponse.json({ reply })
  } catch (err) {
    console.error('Chat error:', err)
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(50)
    return NextResponse.json({ messages: data || [] })
  } catch {
    return NextResponse.json({ messages: [] })
  }
}
