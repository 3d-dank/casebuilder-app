'use client'

import { useEffect, useState } from 'react'

interface Medication {
  id: string
  name: string
  dose: string
  frequency: string
  prescribing_doctor: string
  start_date: string
  end_date: string
  is_current: boolean
  side_effects: string
  notes: string
  created_at: string
}

const emptyForm = {
  name: '',
  dose: '',
  frequency: '',
  prescribing_doctor: '',
  start_date: '',
  end_date: '',
  is_current: true,
  side_effects: '',
  notes: '',
}

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadMedications() {
    try {
      const res = await fetch('/api/medications')
      const data = await res.json()
      setMedications(data.medications || [])
    } catch {
      console.error('Failed to load medications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadMedications() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Failed to save')
        return
      }
      setForm(emptyForm)
      setShowForm(false)
      await loadMedications()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove ${name}?`)) return
    await fetch(`/api/medications?id=${id}`, { method: 'DELETE' })
    setMedications((prev) => prev.filter((m) => m.id !== id))
  }

  const currentMeds = medications.filter((m) => m.is_current)
  const pastMeds = medications.filter((m) => !m.is_current)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1E3A5F' }}>Medications</h1>
          <p className="mt-1" style={{ color: '#4a6080' }}>
            Document all current and past medications, including chemotherapy regimens.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setError('') }}
          className="px-4 py-2 rounded-xl text-white font-semibold text-sm"
          style={{ background: '#0D9488' }}
        >
          + Add Medication
        </button>
      </div>

      <div className="rounded-xl p-4 text-sm" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <strong style={{ color: '#1d4ed8' }}>💡 Tip:</strong>{' '}
        <span style={{ color: '#1e40af' }}>
          Include ALL medications — current prescriptions, chemotherapy drugs (with dates and cycles), supplements, and anything prescribed in the past. Side effects are important evidence, especially cognitive side effects of chemo.
        </span>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#d1fae5', borderWidth: 2 }}>
          <h2 className="font-semibold text-lg mb-4" style={{ color: '#1E3A5F' }}>Add Medication</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current / Past toggle */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, is_current: true })}
                className="px-4 py-2 rounded-xl text-sm font-semibold border"
                style={form.is_current
                  ? { background: '#0D9488', color: '#fff', borderColor: '#0D9488' }
                  : { background: '#fff', color: '#374151', borderColor: '#d1d9e0' }
                }
              >
                Current Medication
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, is_current: false })}
                className="px-4 py-2 rounded-xl text-sm font-semibold border"
                style={!form.is_current
                  ? { background: '#1E3A5F', color: '#fff', borderColor: '#1E3A5F' }
                  : { background: '#fff', color: '#374151', borderColor: '#d1d9e0' }
                }
              >
                Past Medication
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                  Medication Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  required
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: '#d1d9e0', background: '#fff' }}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Methotrexate, Prednisone, Rituximab"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Dose</label>
                <input
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: '#d1d9e0', background: '#fff' }}
                  value={form.dose}
                  onChange={(e) => setForm({ ...form, dose: e.target.value })}
                  placeholder="e.g., 20mg, 500mg/m²"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Frequency / Schedule</label>
                <input
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: '#d1d9e0', background: '#fff' }}
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  placeholder="e.g., Daily, Every 3 weeks, 6 cycles"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Prescribing Doctor</label>
                <input
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: '#d1d9e0', background: '#fff' }}
                  value={form.prescribing_doctor}
                  onChange={(e) => setForm({ ...form, prescribing_doctor: e.target.value })}
                  placeholder="Dr. Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Start Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: '#d1d9e0', background: '#fff' }}
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              {!form.is_current && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>End Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                    style={{ borderColor: '#d1d9e0', background: '#fff' }}
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                Side Effects <span style={{ color: '#9aa5b1' }}>(especially cognitive effects)</span>
              </label>
              <textarea
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none resize-y"
                style={{ borderColor: '#d1d9e0', background: '#fff' }}
                value={form.side_effects}
                onChange={(e) => setForm({ ...form, side_effects: e.target.value })}
                placeholder="e.g., Cognitive impairment, memory loss, severe fatigue, neuropathy, nausea..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Notes</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none resize-y"
                style={{ borderColor: '#d1d9e0', background: '#fff' }}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any additional context — reason discontinued, how it affected you, etc."
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
                {saving ? 'Saving…' : 'Save Medication'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(emptyForm); setError('') }}
                className="px-5 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: '#f0f4f8', color: '#374151' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Current medications */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ background: '#e8edf2', height: 80 }} />)}
        </div>
      ) : (
        <>
          <div>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#1E3A5F' }}>
              Current Medications
              <span className="ml-2 text-sm font-normal" style={{ color: '#0D9488' }}>({currentMeds.length})</span>
            </h2>
            {currentMeds.length === 0 ? (
              <div className="bg-white rounded-xl border p-6 text-center" style={{ borderColor: '#e8edf2' }}>
                <p className="text-sm" style={{ color: '#6b7a8d' }}>No current medications added yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentMeds.map((med) => (
                  <MedCard key={med.id} med={med} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="font-semibold text-lg mb-3" style={{ color: '#1E3A5F' }}>
              Past Medications / Chemotherapy
              <span className="ml-2 text-sm font-normal" style={{ color: '#6b7a8d' }}>({pastMeds.length})</span>
            </h2>
            {pastMeds.length === 0 ? (
              <div className="bg-white rounded-xl border p-6 text-center" style={{ borderColor: '#e8edf2' }}>
                <p className="text-sm" style={{ color: '#6b7a8d' }}>Add past medications and chemotherapy regimens here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pastMeds.map((med) => (
                  <MedCard key={med.id} med={med} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function MedCard({ med, onDelete }: { med: Medication; onDelete: (id: string, name: string) => void }) {
  return (
    <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#e8edf2' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-lg" style={{ color: '#1E3A5F' }}>💊 {med.name}</span>
            {med.is_current && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#d1fae5', color: '#065f46' }}>
                Current
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm" style={{ color: '#6b7a8d' }}>
            {med.dose && <span>Dose: {med.dose}</span>}
            {med.frequency && <span>Frequency: {med.frequency}</span>}
            {med.prescribing_doctor && <span>Dr: {med.prescribing_doctor}</span>}
            {med.start_date && <span>Started: {med.start_date}</span>}
            {med.end_date && <span>Ended: {med.end_date}</span>}
          </div>
          {med.side_effects && (
            <div className="mt-2 text-sm p-2 rounded-lg" style={{ background: '#fef3c7', color: '#92400e' }}>
              ⚠️ Side effects: {med.side_effects}
            </div>
          )}
          {med.notes && (
            <div className="mt-2 text-sm" style={{ color: '#6b7a8d' }}>{med.notes}</div>
          )}
        </div>
        <button
          onClick={() => onDelete(med.id, med.name)}
          className="text-xs px-3 py-1.5 rounded-lg flex-shrink-0"
          style={{ color: '#ef4444', background: '#fef2f2' }}
        >
          Remove
        </button>
      </div>
    </div>
  )
}
