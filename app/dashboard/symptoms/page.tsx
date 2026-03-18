'use client'

import { useEffect, useState } from 'react'

interface SymptomLog {
  id: string
  log_date: string
  category: string
  symptom: string
  severity: number
  description: string
  created_at: string
}

const CATEGORIES = [
  { value: 'cognitive', label: 'Cognitive', description: 'Memory, focus, confusion, word-finding', color: '#7c3aed', bg: '#ede9fe' },
  { value: 'physical', label: 'Physical', description: 'Fatigue, pain, mobility', color: '#0369a1', bg: '#e0f2fe' },
  { value: 'emotional', label: 'Emotional', description: 'Mood, anxiety, depression', color: '#b45309', bg: '#fef3c7' },
]

const COGNITIVE_SYMPTOMS = [
  'Memory problems',
  'Difficulty concentrating',
  'Confusion / brain fog',
  'Word-finding difficulty',
  'Losing track mid-task',
  'Difficulty following instructions',
  'Forgetting recent conversations',
  'Getting disoriented / lost',
]

const PHYSICAL_SYMPTOMS = [
  'Extreme fatigue / exhaustion',
  'Body weakness',
  'Pain',
  'Nausea',
  'Headache',
  'Shortness of breath',
  'Limited mobility',
  'Dizziness',
]

const EMOTIONAL_SYMPTOMS = [
  'Anxiety / overwhelm',
  'Depression',
  'Irritability',
  'Social withdrawal',
  'Emotional dysregulation',
  'Lack of motivation',
]

function getSymptomsForCategory(cat: string): string[] {
  if (cat === 'cognitive') return COGNITIVE_SYMPTOMS
  if (cat === 'physical') return PHYSICAL_SYMPTOMS
  if (cat === 'emotional') return EMOTIONAL_SYMPTOMS
  return []
}

function severityColor(severity: number): string {
  if (severity <= 3) return '#22c55e'
  if (severity <= 6) return '#f59e0b'
  return '#ef4444'
}

function severityLabel(severity: number): string {
  if (severity <= 3) return 'Mild'
  if (severity <= 6) return 'Moderate'
  return 'Severe'
}

const emptyForm = {
  log_date: new Date().toISOString().split('T')[0],
  category: 'cognitive',
  symptom: '',
  severity: 5,
  description: '',
}

export default function SymptomsPage() {
  const [logs, setLogs] = useState<SymptomLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<string>('all')

  async function loadLogs() {
    try {
      const res = await fetch('/api/symptoms')
      const data = await res.json()
      setLogs(data.symptoms || [])
    } catch {
      console.error('Failed to load symptoms')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadLogs() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.symptom) { setError('Please select or enter a symptom'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, severity: Number(form.severity) }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Failed to save')
        return
      }
      setForm({ ...emptyForm, log_date: new Date().toISOString().split('T')[0] })
      setShowForm(false)
      await loadLogs()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this symptom entry?')) return
    await fetch(`/api/symptoms?id=${id}`, { method: 'DELETE' })
    setLogs((prev) => prev.filter((l) => l.id !== id))
  }

  const filteredLogs = filter === 'all' ? logs : logs.filter((l) => l.category === filter)

  // Group by date
  const grouped = filteredLogs.reduce<Record<string, SymptomLog[]>>((acc, log) => {
    const key = log.log_date
    if (!acc[key]) acc[key] = []
    acc[key].push(log)
    return acc
  }, {})

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  const avgSeverity = logs.length > 0
    ? Math.round(logs.reduce((s, l) => s + (l.severity || 0), 0) / logs.length * 10) / 10
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1E3A5F' }}>Symptoms Log</h1>
          <p className="mt-1" style={{ color: '#4a6080' }}>
            Track your daily limitations. This builds powerful evidence for your case.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setError('') }}
          className="px-4 py-2 rounded-xl text-white font-semibold text-sm"
          style={{ background: '#0D9488' }}
        >
          + Log Symptom
        </button>
      </div>

      {/* Stats row */}
      {logs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#e8edf2' }}>
            <div className="text-2xl font-bold" style={{ color: '#1E3A5F' }}>{logs.length}</div>
            <div className="text-sm" style={{ color: '#6b7a8d' }}>Total entries</div>
          </div>
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#e8edf2' }}>
            <div className="text-2xl font-bold" style={{ color: severityColor(avgSeverity) }}>{avgSeverity}</div>
            <div className="text-sm" style={{ color: '#6b7a8d' }}>Avg severity</div>
          </div>
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#e8edf2' }}>
            <div className="text-2xl font-bold" style={{ color: '#7c3aed' }}>
              {logs.filter((l) => l.category === 'cognitive').length}
            </div>
            <div className="text-sm" style={{ color: '#6b7a8d' }}>Cognitive</div>
          </div>
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#e8edf2' }}>
            <div className="text-2xl font-bold" style={{ color: '#0369a1' }}>
              {logs.filter((l) => l.category === 'physical').length}
            </div>
            <div className="text-sm" style={{ color: '#6b7a8d' }}>Physical</div>
          </div>
        </div>
      )}

      <div className="rounded-xl p-4 text-sm" style={{ background: '#f0fdf9', border: '1px solid #a7f3d0' }}>
        <strong style={{ color: '#065f46' }}>💡 Why this matters:</strong>{' '}
        <span style={{ color: '#047857' }}>
          A consistent record of daily symptoms is compelling evidence for SSA. Log every day you can — even "good days" 
          are valuable because they show your baseline. The cognitive symptoms from chemo brain are especially important to document.
        </span>
      </div>

      {/* Log form */}
      {showForm && (
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#d1fae5', borderWidth: 2 }}>
          <h2 className="font-semibold text-lg mb-4" style={{ color: '#1E3A5F' }}>Log a Symptom</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: '#d1d9e0', background: '#fff' }}
                  value={form.log_date}
                  onChange={(e) => setForm({ ...form, log_date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Category</label>
                <select
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: '#d1d9e0', background: '#fff' }}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value, symptom: '' })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label} — {c.description}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                  Severity: <strong style={{ color: severityColor(form.severity) }}>{form.severity}/10 — {severityLabel(form.severity)}</strong>
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  className="w-full"
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Symptom</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {getSymptomsForCategory(form.category).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm({ ...form, symptom: s })}
                    className="text-xs px-3 py-1.5 rounded-full border font-medium transition-colors"
                    style={form.symptom === s
                      ? { background: '#1E3A5F', color: '#fff', borderColor: '#1E3A5F' }
                      : { background: '#fff', color: '#374151', borderColor: '#d1d9e0' }
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
              <input
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{ borderColor: '#d1d9e0', background: '#fff' }}
                value={form.symptom}
                onChange={(e) => setForm({ ...form, symptom: e.target.value })}
                placeholder="Or type a symptom..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                Description <span style={{ color: '#9aa5b1' }}>(optional but helpful)</span>
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none resize-y"
                style={{ borderColor: '#d1d9e0', background: '#fff' }}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe what happened. Examples: 'Forgot what I was doing mid-sentence, happened 4 times today' or 'Too exhausted to get out of bed until noon'"
              />
            </div>

            {error && <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-60"
                style={{ background: '#1E3A5F' }}
              >
                {saving ? 'Saving…' : 'Save Entry'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setError('') }}
                className="px-5 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: '#f0f4f8', color: '#374151' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      {logs.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {[{ value: 'all', label: 'All' }, ...CATEGORIES].map((c) => (
            <button
              key={c.value}
              onClick={() => setFilter(c.value)}
              className="text-sm px-4 py-1.5 rounded-full font-medium border transition-colors"
              style={filter === c.value
                ? { background: '#1E3A5F', color: '#fff', borderColor: '#1E3A5F' }
                : { background: '#fff', color: '#374151', borderColor: '#d1d9e0' }
              }
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {/* Symptom log */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ background: '#e8edf2', height: 80 }} />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-2xl border p-10 text-center" style={{ borderColor: '#e8edf2' }}>
          <p className="text-4xl mb-3">📊</p>
          <p className="font-medium text-lg mb-1" style={{ color: '#1E3A5F' }}>Start your symptom log</p>
          <p className="text-sm" style={{ color: '#6b7a8d' }}>
            Log symptoms daily — even on good days. Consistent documentation builds a compelling case.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((date) => (
            <div key={date}>
              <div className="text-sm font-semibold mb-2" style={{ color: '#4a6080' }}>
                {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div className="space-y-2">
                {grouped[date].map((log) => {
                  const cat = CATEGORIES.find((c) => c.value === log.category)
                  return (
                    <div key={log.id} className="bg-white rounded-xl border p-4 flex gap-3" style={{ borderColor: '#e8edf2' }}>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bold"
                        style={{ background: cat?.bg || '#f0f4f8', color: cat?.color || '#374151' }}
                      >
                        {log.severity}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium" style={{ color: '#1E3A5F' }}>{log.symptom}</span>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: cat?.bg || '#f0f4f8', color: cat?.color || '#374151' }}
                          >
                            {cat?.label}
                          </span>
                          <span className="text-xs font-medium" style={{ color: severityColor(log.severity) }}>
                            {severityLabel(log.severity)}
                          </span>
                        </div>
                        {log.description && (
                          <p className="text-sm mt-1" style={{ color: '#6b7a8d' }}>{log.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(log.id)}
                        className="text-xs px-2 py-1 rounded flex-shrink-0 self-start"
                        style={{ color: '#ef4444', background: '#fef2f2' }}
                      >
                        ×
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
