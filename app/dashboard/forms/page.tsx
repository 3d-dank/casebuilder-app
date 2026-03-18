'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

type FormId = 'ssa-3368' | 'ssa-3369' | 'ssa-3373' | 'ssa-827'

const FORMS = [
  {
    id: 'ssa-3368' as FormId,
    title: 'SSA-3368',
    subtitle: 'Disability Report',
    icon: '📋',
    description: 'Personal information, medical conditions, and work history summary',
  },
  {
    id: 'ssa-3369' as FormId,
    title: 'SSA-3369',
    subtitle: 'Work History Report',
    icon: '💼',
    description: 'Jobs held in the past 15 years and physical demands of each position',
  },
  {
    id: 'ssa-3373' as FormId,
    title: 'SSA-3373',
    subtitle: 'Function Report',
    icon: '🌟',
    description: 'Daily activities, personal care, and how your condition affects everyday life',
    important: true,
  },
  {
    id: 'ssa-827' as FormId,
    title: 'SSA-827',
    subtitle: 'Medical Release Authorization',
    icon: '✅',
    description: 'Authorization for SSA to obtain your medical records',
  },
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormData = Record<string, any>

function useAutoSave(formId: FormId, data: FormData, enabled: boolean) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const save = useCallback(async (d: FormData) => {
    setSaving(true)
    try {
      await fetch(`/api/forms/${formId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d),
      })
      setLastSaved(new Date())
    } catch {
      console.error('Auto-save failed')
    } finally {
      setSaving(false)
    }
  }, [formId])

  useEffect(() => {
    if (!enabled) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => save(data), 1500)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [data, enabled, save])

  return { saving, lastSaved }
}

function SSA3368Form({ data, onChange }: { data: FormData; onChange: (d: FormData) => void }) {
  const set = (key: string, val: string) => onChange({ ...data, [key]: val })
  return (
    <div className="space-y-6">
      <section>
        <h3 className="font-semibold text-base mb-3" style={{ color: '#1E3A5F' }}>Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: 'full_name', label: 'Full Legal Name', placeholder: 'First Middle Last' },
            { key: 'ssn', label: 'Social Security Number', placeholder: 'XXX-XX-XXXX' },
            { key: 'date_of_birth', label: 'Date of Birth', placeholder: 'MM/DD/YYYY' },
            { key: 'phone', label: 'Phone Number', placeholder: '(555) 123-4567' },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>{f.label}</label>
              <input
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: '#d1d9e0', background: '#fff' }}
                value={data[f.key] || ''}
                onChange={(e) => set(f.key, e.target.value)}
                placeholder={f.placeholder}
              />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Mailing Address</label>
          <input
            className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
            style={{ borderColor: '#d1d9e0', background: '#fff' }}
            value={data.address || ''}
            onChange={(e) => set('address', e.target.value)}
            placeholder="Street, City, State, ZIP"
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Living Situation</label>
          <textarea
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none resize-y"
            style={{ borderColor: '#d1d9e0', background: '#fff' }}
            value={data.living_situation || ''}
            onChange={(e) => set('living_situation', e.target.value)}
            placeholder="Who do you live with? Describe your home situation."
          />
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3" style={{ color: '#1E3A5F' }}>Medical Conditions</h3>
        <p className="text-sm mb-3" style={{ color: '#6b7a8d' }}>
          List all medical conditions that limit your ability to work. Include both physical and cognitive conditions.
        </p>
        <textarea
          rows={5}
          className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none resize-y"
          style={{ borderColor: '#d1d9e0', background: '#fff' }}
          value={data.medical_conditions || ''}
          onChange={(e) => set('medical_conditions', e.target.value)}
          placeholder="1. Leukemia (acute lymphoblastic leukemia, diagnosed...)&#10;2. Chemotherapy-induced cognitive impairment (chemo brain) — memory loss, difficulty concentrating, word-finding problems&#10;3. Chemotherapy-induced fatigue&#10;4. (add more conditions)"
        />
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3" style={{ color: '#1E3A5F' }}>Medical Treatment</h3>
        <p className="text-sm mb-3" style={{ color: '#6b7a8d' }}>
          Describe your medical treatment. Your medical team will also be listed from the Medical Team section.
        </p>
        <textarea
          rows={4}
          className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none resize-y"
          style={{ borderColor: '#d1d9e0', background: '#fff' }}
          value={data.medical_treatment || ''}
          onChange={(e) => set('medical_treatment', e.target.value)}
          placeholder="Describe your treatment history — chemotherapy regimens, hospital stays, ongoing treatment, etc."
        />
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3" style={{ color: '#1E3A5F' }}>Disability Onset</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Date disability began</label>
            <input
              type="date"
              className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
              style={{ borderColor: '#d1d9e0', background: '#fff' }}
              value={data.disability_onset || ''}
              onChange={(e) => set('disability_onset', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Last day worked</label>
            <input
              type="date"
              className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
              style={{ borderColor: '#d1d9e0', background: '#fff' }}
              value={data.last_day_worked || ''}
              onChange={(e) => set('last_day_worked', e.target.value)}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function SSA3369Form({ data, onChange }: { data: FormData; onChange: (d: FormData) => void }) {
  const set = (key: string, val: string) => onChange({ ...data, [key]: val })
  return (
    <div className="space-y-6">
      <div className="rounded-xl p-4 text-sm" style={{ background: '#fef3c7', border: '1px solid #fcd34d' }}>
        <strong style={{ color: '#92400e' }}>📌 Note:</strong>{' '}
        <span style={{ color: '#78350f' }}>
          Include all jobs held in the past 15 years. Even part-time or seasonal work. The SSA uses this to evaluate what work you may still be able to do.
        </span>
      </div>

      <section>
        <h3 className="font-semibold text-base mb-3" style={{ color: '#1E3A5F' }}>Most Recent Job</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: 'last_job_title', label: 'Job Title', placeholder: 'e.g., Administrative Assistant' },
            { key: 'last_employer', label: 'Employer Name', placeholder: 'Company name' },
            { key: 'last_job_start', label: 'Start Date', placeholder: 'MM/YYYY' },
            { key: 'last_job_end', label: 'End Date', placeholder: 'MM/YYYY or Present' },
            { key: 'last_job_hours', label: 'Hours per Week', placeholder: 'e.g., 40' },
            { key: 'last_job_rate', label: 'Rate of Pay', placeholder: 'e.g., $18/hr' },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>{f.label}</label>
              <input
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: '#d1d9e0', background: '#fff' }}
                value={data[f.key] || ''}
                onChange={(e) => set(f.key, e.target.value)}
                placeholder={f.placeholder}
              />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Describe your job duties</label>
          <textarea
            rows={4}
            className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none resize-y"
            style={{ borderColor: '#d1d9e0', background: '#fff' }}
            value={data.last_job_duties || ''}
            onChange={(e) => set('last_job_duties', e.target.value)}
            placeholder="Describe what you did each day — tasks, responsibilities, equipment used..."
          />
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3" style={{ color: '#1E3A5F' }}>Physical Demands of Most Recent Job</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: 'lifting_weight', label: 'Heaviest weight lifted', placeholder: 'e.g., 10 lbs, 25 lbs' },
            { key: 'walking_hours', label: 'Hours walking per day', placeholder: 'e.g., 2 hours' },
            { key: 'standing_hours', label: 'Hours standing per day', placeholder: 'e.g., 4 hours' },
            { key: 'sitting_hours', label: 'Hours sitting per day', placeholder: 'e.g., 6 hours' },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>{f.label}</label>
              <input
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: '#d1d9e0', background: '#fff' }}
                value={data[f.key] || ''}
                onChange={(e) => set(f.key, e.target.value)}
                placeholder={f.placeholder}
              />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3" style={{ color: '#1E3A5F' }}>Other Jobs (Past 15 Years)</h3>
        <textarea
          rows={8}
          className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none resize-y"
          style={{ borderColor: '#d1d9e0', background: '#fff' }}
          value={data.other_jobs || ''}
          onChange={(e) => set('other_jobs', e.target.value)}
          placeholder="List other jobs:&#10;&#10;Job Title: ___&#10;Employer: ___&#10;Dates: ___ to ___&#10;Duties: ___&#10;Physical demands: ___&#10;&#10;(Repeat for each job)"
        />
      </section>
    </div>
  )
}

function SSA3373Form({ data, onChange }: { data: FormData; onChange: (d: FormData) => void }) {
  const set = (key: string, val: string) => onChange({ ...data, [key]: val })

  const sections = [
    {
      title: 'Daily Activities',
      key: 'daily_activities',
      rows: 4,
      placeholder: 'Describe a typical day from morning to night. Be specific and honest — what can you do, what do you struggle with, what have you stopped doing altogether?',
      tip: 'Include cognitive difficulties: forgetting tasks, losing track, confusion, needing reminders',
    },
    {
      title: 'Personal Care (bathing, dressing, grooming)',
      key: 'personal_care',
      rows: 3,
      placeholder: 'Can you bathe and dress yourself? Do you need reminders or help? Do you have bad days where this is harder?',
      tip: 'Chemo brain can make even simple self-care tasks overwhelming on difficult days',
    },
    {
      title: 'Meal Preparation',
      key: 'meal_prep',
      rows: 3,
      placeholder: "Can you prepare meals? Do you forget you left things on the stove? Do you struggle to follow recipes? How has this changed since your diagnosis?",
      tip: 'Cognitive impairment can make cooking dangerous — memory lapses, inability to multi-step tasks',
    },
    {
      title: 'Getting Around / Transportation',
      key: 'getting_around',
      rows: 3,
      placeholder: 'Can you drive? Take public transportation? Do you get confused or disoriented? Do you need someone to accompany you?',
      tip: "Many people with chemo brain cannot safely drive due to cognitive impairment",
    },
    {
      title: 'Shopping and Errands',
      key: 'shopping',
      rows: 3,
      placeholder: 'Can you go grocery shopping alone? Do you forget what you came for? Become overwhelmed in stores? Need accompaniment?',
    },
    {
      title: 'Household Tasks',
      key: 'household_tasks',
      rows: 3,
      placeholder: 'What household chores can you do? What have you stopped doing? How long can you do tasks before needing to rest?',
    },
    {
      title: 'Social Activities',
      key: 'social_activities',
      rows: 3,
      placeholder: 'Do you spend time with family/friends? Have you withdrawn from social activities? Is socializing tiring or overstimulating?',
    },
    {
      title: 'Concentration & Memory',
      key: 'concentration',
      rows: 5,
      placeholder: "This is critical — be very detailed:&#10;• Can you follow written instructions?&#10;• Can you follow spoken instructions?&#10;• How long can you pay attention before losing focus?&#10;• Do you forget conversations, appointments, medications?&#10;• Do you have word-finding problems?&#10;• Can you handle changes in routine?&#10;• How has your memory changed since chemotherapy?",
      tip: '⭐ This section is especially important for chemo brain. Describe specific incidents and examples.',
    },
    {
      title: 'Sleep',
      key: 'sleep',
      rows: 3,
      placeholder: 'How much do you sleep? Do you nap during the day? Is fatigue a constant issue? How does poor sleep affect your functioning?',
    },
    {
      title: 'Ability to Handle Stress & Changes in Routine',
      key: 'stress_handling',
      rows: 3,
      placeholder: 'How do you handle stress? Does stress worsen your cognitive symptoms? Do you get overwhelmed easily? How do you handle unexpected changes?',
    },
    {
      title: 'How Your Conditions Affect Daily Life',
      key: 'conditions_affect_life',
      rows: 6,
      placeholder: "Write a summary of how leukemia and chemo brain affect every aspect of your daily life. Include:&#10;• What you can no longer do that you used to do&#10;• How long you can do tasks before exhaustion&#10;• Your worst symptoms&#10;• Why you cannot work even part-time&#10;• What a 'bad day' looks like vs a 'good day'",
      tip: '⭐ This is your chance to tell your story. The SSA examiner will read this carefully.',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-xl p-4 text-sm" style={{ background: '#d1fae5', border: '1px solid #6ee7b7' }}>
        <strong style={{ color: '#065f46' }}>⭐ Most Important Form:</strong>{' '}
        <span style={{ color: '#047857' }}>
          The Function Report directly shows the SSA how your conditions affect your daily life. Be specific and honest. 
          Describe your worst days, not your best days. Every detail matters.
        </span>
      </div>

      {sections.map((section) => (
        <div key={section.key}>
          <label className="block font-semibold text-sm mb-1" style={{ color: '#1E3A5F' }}>
            {section.title}
          </label>
          {section.tip && (
            <p className="text-xs mb-2" style={{ color: '#0D9488' }}>💡 {section.tip}</p>
          )}
          <textarea
            rows={section.rows}
            className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none resize-y"
            style={{ borderColor: '#d1d9e0', background: '#fff' }}
            value={data[section.key] || ''}
            onChange={(e) => set(section.key, e.target.value)}
            placeholder={section.placeholder.replace(/&#10;/g, '\n')}
          />
        </div>
      ))}

      <div>
        <label className="block font-semibold text-sm mb-1" style={{ color: '#1E3A5F' }}>
          What activities, if any, were affected by your conditions?
        </label>
        <p className="text-xs mb-2" style={{ color: '#6b7a8d' }}>
          Check all that apply and add notes below
        </p>
        {[
          'Dressing', 'Bathing', 'Caring for hair', 'Shaving', 'Feeding self', 'Using the toilet',
          'Cooking', 'Cleaning', 'Shopping', 'Driving', 'Paying bills', 'Counting change',
          'Handling a savings account', 'Using a checkbook / money orders',
        ].map((activity) => (
          <label key={activity} className="flex items-center gap-2 mb-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={data[`activity_${activity.toLowerCase().replace(/[^a-z]/g, '_')}`] === 'yes'}
              onChange={(e) => set(`activity_${activity.toLowerCase().replace(/[^a-z]/g, '_')}`, e.target.checked ? 'yes' : '')}
              className="rounded"
            />
            <span className="text-sm" style={{ color: '#374151' }}>{activity}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function SSA827Form({ data, onChange }: { data: FormData; onChange: (d: FormData) => void }) {
  const set = (key: string, val: string) => onChange({ ...data, [key]: val })
  return (
    <div className="space-y-6">
      <div className="rounded-xl p-4 text-sm" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <strong style={{ color: '#1d4ed8' }}>ℹ️ About this form:</strong>{' '}
        <span style={{ color: '#1e40af' }}>
          The SSA-827 authorizes the Social Security Administration to request your medical records directly from your doctors. 
          You will need to sign the official PDF version, but this helps you organize the information.
        </span>
      </div>

      <section>
        <h3 className="font-semibold text-base mb-3" style={{ color: '#1E3A5F' }}>Applicant Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: 'applicant_name', label: 'Full Name', placeholder: 'Legal name as it appears on your SSN card' },
            { key: 'applicant_ssn', label: 'Social Security Number', placeholder: 'XXX-XX-XXXX' },
            { key: 'applicant_dob', label: 'Date of Birth', placeholder: 'MM/DD/YYYY' },
            { key: 'applicant_address', label: 'Current Address', placeholder: 'Street, City, State, ZIP' },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>{f.label}</label>
              <input
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: '#d1d9e0', background: '#fff' }}
                value={data[f.key] || ''}
                onChange={(e) => set(f.key, e.target.value)}
                placeholder={f.placeholder}
              />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3" style={{ color: '#1E3A5F' }}>Authorized Providers</h3>
        <p className="text-sm mb-3" style={{ color: '#6b7a8d' }}>
          List all medical providers who should release records. Include your medical team from the Medical Team section.
        </p>
        <textarea
          rows={8}
          className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none resize-y"
          style={{ borderColor: '#d1d9e0', background: '#fff' }}
          value={data.authorized_providers || ''}
          onChange={(e) => set('authorized_providers', e.target.value)}
          placeholder="Provider 1: Dr. [Name], [Clinic], [Address], [Phone]&#10;Provider 2: Dr. [Name], [Clinic], [Address], [Phone]&#10;...&#10;&#10;(Auto-populate from Medical Team section after saving)"
        />
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3" style={{ color: '#1E3A5F' }}>Authorization Period</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Records from (date)</label>
            <input
              type="date"
              className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
              style={{ borderColor: '#d1d9e0', background: '#fff' }}
              value={data.records_from || ''}
              onChange={(e) => set('records_from', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Records through (date)</label>
            <input
              type="date"
              className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
              style={{ borderColor: '#d1d9e0', background: '#fff' }}
              value={data.records_through || ''}
              onChange={(e) => set('records_through', e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="rounded-xl p-4" style={{ background: '#fef3c7', border: '1px solid #fcd34d' }}>
        <p className="text-sm font-medium" style={{ color: '#92400e' }}>
          ✍️ Remember: You must sign and date the official SSA-827 PDF form. Download it from SSA.gov or ask your SSA representative for a copy.
        </p>
      </div>
    </div>
  )
}

export default function FormsPage() {
  const [activeForm, setActiveForm] = useState<FormId | null>(null)
  const [formData, setFormData] = useState<FormData>({})
  const [loadingForm, setLoadingForm] = useState(false)
  const [completedForms, setCompletedForms] = useState<Set<FormId>>(new Set())

  const { saving, lastSaved } = useAutoSave(activeForm || 'ssa-3368', formData, !!activeForm)

  useEffect(() => {
    // Load which forms have been saved
    Promise.all(
      FORMS.map((f) =>
        fetch(`/api/forms/${f.id}`)
          .then((r) => r.json())
          .then((d) => ({ id: f.id, hasData: Object.keys(d.formData || {}).length > 0 }))
          .catch(() => ({ id: f.id, hasData: false }))
      )
    ).then((results) => {
      const done = new Set<FormId>(results.filter((r) => r.hasData).map((r) => r.id as FormId))
      setCompletedForms(done)
    })
  }, [])

  async function openForm(formId: FormId) {
    setLoadingForm(true)
    setActiveForm(formId)
    try {
      const res = await fetch(`/api/forms/${formId}`)
      const d = await res.json()
      setFormData(d.formData || {})
    } catch {
      setFormData({})
    } finally {
      setLoadingForm(false)
    }
  }

  function exportAsText() {
    if (!activeForm) return
    const formInfo = FORMS.find((f) => f.id === activeForm)
    let text = `${formInfo?.title} — ${formInfo?.subtitle}\n`
    text += `Exported: ${new Date().toLocaleDateString()}\n`
    text += '='.repeat(60) + '\n\n'
    Object.entries(formData).forEach(([key, val]) => {
      if (val && val !== 'no') {
        text += `${key.replace(/_/g, ' ').toUpperCase()}:\n${val}\n\n`
      }
    })
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeForm}-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function markComplete() {
    if (!activeForm) return
    setCompletedForms((prev) => new Set([...prev, activeForm]))
  }

  if (activeForm) {
    const formInfo = FORMS.find((f) => f.id === activeForm)!
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => { setActiveForm(null); setFormData({}) }}
            className="text-sm font-medium px-3 py-1.5 rounded-lg"
            style={{ background: '#f0f4f8', color: '#374151' }}
          >
            ← Back to Forms
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold" style={{ color: '#1E3A5F' }}>
              {formInfo.icon} {formInfo.title} — {formInfo.subtitle}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: '#9aa5b1' }}>
              {saving ? '💾 Saving…' : lastSaved ? `✓ Saved ${lastSaved.toLocaleTimeString()}` : 'Auto-saves as you type'}
            </span>
            <button
              onClick={exportAsText}
              className="text-sm px-3 py-1.5 rounded-lg font-medium"
              style={{ background: '#eff6ff', color: '#1d4ed8' }}
            >
              Export
            </button>
            <button
              onClick={markComplete}
              className="text-sm px-3 py-1.5 rounded-lg font-medium"
              style={{ background: '#d1fae5', color: '#065f46' }}
            >
              Mark Complete ✓
            </button>
          </div>
        </div>

        {loadingForm ? (
          <div className="animate-pulse rounded-2xl p-8" style={{ background: '#e8edf2' }} />
        ) : (
          <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#e8edf2' }}>
            {activeForm === 'ssa-3368' && <SSA3368Form data={formData} onChange={setFormData} />}
            {activeForm === 'ssa-3369' && <SSA3369Form data={formData} onChange={setFormData} />}
            {activeForm === 'ssa-3373' && <SSA3373Form data={formData} onChange={setFormData} />}
            {activeForm === 'ssa-827' && <SSA827Form data={formData} onChange={setFormData} />}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1E3A5F' }}>SSA Forms</h1>
        <p className="mt-1" style={{ color: '#4a6080' }}>
          Fill out the four required forms for your SSDI application. Your progress saves automatically.
        </p>
      </div>

      <div className="rounded-xl p-4 text-sm" style={{ background: '#fef3c7', border: '1px solid #fcd34d' }}>
        <strong style={{ color: '#92400e' }}>📌 Important:</strong>{' '}
        <span style={{ color: '#78350f' }}>
          These are interactive forms to help you organize your information. You will still need to submit the official SSA forms through SSA.gov or your local SSA office. Use the Export button to get your typed answers.
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FORMS.map((form) => (
          <button
            key={form.id}
            onClick={() => openForm(form.id)}
            className="bg-white rounded-2xl border p-6 text-left group hover:shadow-md transition-all"
            style={{
              borderColor: completedForms.has(form.id) ? '#0D9488' : form.important ? '#fbbf24' : '#e8edf2',
              borderWidth: completedForms.has(form.id) || form.important ? 2 : 1,
            }}
          >
            <div className="flex items-start justify-between">
              <div className="text-3xl mb-2">{form.icon}</div>
              {completedForms.has(form.id) && (
                <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: '#d1fae5', color: '#065f46' }}>
                  ✓ Started
                </span>
              )}
              {form.important && !completedForms.has(form.id) && (
                <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: '#fef3c7', color: '#92400e' }}>
                  Most Important
                </span>
              )}
            </div>
            <div className="font-bold text-lg" style={{ color: '#1E3A5F' }}>{form.title}</div>
            <div className="font-medium text-sm mb-2" style={{ color: '#0D9488' }}>{form.subtitle}</div>
            <div className="text-sm" style={{ color: '#6b7a8d' }}>{form.description}</div>
            <div className="mt-4 text-sm font-semibold" style={{ color: '#1E3A5F' }}>
              {completedForms.has(form.id) ? 'Continue editing →' : 'Start form →'}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
