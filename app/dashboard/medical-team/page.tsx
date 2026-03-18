'use client'

import { useEffect, useState } from 'react'

interface Provider {
  id: string
  name: string
  specialty: string
  clinic: string
  phone: string
  address: string
  dates_of_treatment: string
  notes: string
  created_at: string
}

const emptyForm = {
  name: '',
  specialty: '',
  clinic: '',
  phone: '',
  address: '',
  dates_of_treatment: '',
  notes: '',
}

export default function MedicalTeamPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadProviders() {
    try {
      const res = await fetch('/api/medical-providers')
      const data = await res.json()
      setProviders(data.providers || [])
    } catch {
      console.error('Failed to load providers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProviders() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/medical-providers', {
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
      await loadProviders()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove ${name} from your medical team?`)) return
    try {
      await fetch(`/api/medical-providers?id=${id}`, { method: 'DELETE' })
      setProviders((prev) => prev.filter((p) => p.id !== id))
    } catch {
      alert('Failed to delete provider')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1E3A5F' }}>Medical Team</h1>
          <p className="mt-1" style={{ color: '#4a6080' }}>
            Document all doctors and healthcare providers involved in your care.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setError('') }}
          className="px-4 py-2 rounded-xl text-white font-semibold text-sm"
          style={{ background: '#0D9488' }}
        >
          + Add Provider
        </button>
      </div>

      {/* Tip card */}
      <div className="rounded-xl p-4 text-sm" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <strong style={{ color: '#1d4ed8' }}>💡 Tip:</strong>{' '}
        <span style={{ color: '#1e40af' }}>
          Include every provider who has treated or evaluated you — oncologists, hematologists, neurologists, primary care, therapists, and specialists. Even a single visit counts.
        </span>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#d1fae5', borderWidth: 2 }}>
          <h2 className="font-semibold text-lg mb-4" style={{ color: '#1E3A5F' }}>Add New Provider</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>
                  Provider Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  required
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: '#d1d9e0', background: '#fff' }}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Dr. Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Specialty</label>
                <input
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: '#d1d9e0', background: '#fff' }}
                  value={form.specialty}
                  onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                  placeholder="Oncologist, Hematologist, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Clinic / Hospital</label>
                <input
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: '#d1d9e0', background: '#fff' }}
                  value={form.clinic}
                  onChange={(e) => setForm({ ...form, clinic: e.target.value })}
                  placeholder="Memorial Cancer Center"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Phone</label>
                <input
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: '#d1d9e0', background: '#fff' }}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Address</label>
                <input
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: '#d1d9e0', background: '#fff' }}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="123 Medical Dr, City, State 12345"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Dates of Treatment</label>
                <input
                  className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: '#d1d9e0', background: '#fff' }}
                  value={form.dates_of_treatment}
                  onChange={(e) => setForm({ ...form, dates_of_treatment: e.target.value })}
                  placeholder="Jan 2023 – Present"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Notes</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none resize-y"
                style={{ borderColor: '#d1d9e0', background: '#fff' }}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Type of treatment provided, key diagnoses, test results, anything relevant..."
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
                {saving ? 'Saving…' : 'Save Provider'}
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

      {/* Provider list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ background: '#e8edf2', height: 100 }} />
          ))}
        </div>
      ) : providers.length === 0 ? (
        <div className="bg-white rounded-2xl border p-10 text-center" style={{ borderColor: '#e8edf2' }}>
          <p className="text-4xl mb-3">👩‍⚕️</p>
          <p className="font-medium text-lg mb-1" style={{ color: '#1E3A5F' }}>No providers added yet</p>
          <p className="text-sm" style={{ color: '#6b7a8d' }}>
            Start by adding your oncologist or primary care doctor.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {providers.map((provider) => (
            <div key={provider.id} className="bg-white rounded-2xl border p-5" style={{ borderColor: '#e8edf2' }}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1">
                  <div className="font-semibold text-lg" style={{ color: '#1E3A5F' }}>{provider.name}</div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm" style={{ color: '#6b7a8d' }}>
                    {provider.specialty && <span>🩺 {provider.specialty}</span>}
                    {provider.clinic && <span>🏥 {provider.clinic}</span>}
                    {provider.phone && <span>📞 {provider.phone}</span>}
                    {provider.dates_of_treatment && <span>📅 {provider.dates_of_treatment}</span>}
                  </div>
                  {provider.address && (
                    <div className="text-sm mt-1" style={{ color: '#6b7a8d' }}>📍 {provider.address}</div>
                  )}
                  {provider.notes && (
                    <div className="text-sm mt-2 p-3 rounded-lg" style={{ background: '#f8fafc', color: '#374151' }}>
                      {provider.notes}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(provider.id, provider.name)}
                  className="text-sm px-3 py-1.5 rounded-lg"
                  style={{ color: '#ef4444', background: '#fef2f2' }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
