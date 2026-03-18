'use client'

import { useEffect, useState, useRef } from 'react'

interface Document {
  id: string
  name: string
  type: string
  description: string
  doc_date: string
  storage_path: string
  file_size: number
  mime_type: string
  created_at: string
}

const DOC_TYPES = [
  { value: 'medical_record', label: 'Medical Record' },
  { value: 'doctor_letter', label: "Doctor's Letter" },
  { value: 'test_result', label: 'Test / Lab Result' },
  { value: 'imaging', label: 'Imaging / Scan' },
  { value: 'legal', label: 'Legal Document' },
  { value: 'other', label: 'Other' },
]

function formatSize(bytes: number): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function typeLabel(type: string): string {
  return DOC_TYPES.find((t) => t.value === type)?.label || type
}

function typeBadgeStyle(type: string): React.CSSProperties {
  const styles: Record<string, React.CSSProperties> = {
    medical_record: { background: '#dbeafe', color: '#1e40af' },
    doctor_letter: { background: '#d1fae5', color: '#065f46' },
    test_result: { background: '#fce7f3', color: '#9d174d' },
    imaging: { background: '#ede9fe', color: '#5b21b6' },
    legal: { background: '#fef3c7', color: '#92400e' },
    other: { background: '#f0f4f8', color: '#374151' },
  }
  return styles[type] || styles.other
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadType, setUploadType] = useState('medical_record')
  const [uploadDescription, setUploadDescription] = useState('')
  const [uploadDate, setUploadDate] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function loadDocuments() {
    try {
      const res = await fetch('/api/documents')
      const data = await res.json()
      setDocuments(data.documents || [])
    } catch {
      console.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDocuments() }, [])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', uploadType)
      fd.append('description', uploadDescription)
      fd.append('doc_date', uploadDate)

      const res = await fetch('/api/documents', { method: 'POST', body: fd })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Upload failed')
        return
      }
      setUploadDescription('')
      setUploadDate('')
      await loadDocuments()
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await fetch(`/api/documents?id=${id}`, { method: 'DELETE' })
      setDocuments((prev) => prev.filter((d) => d.id !== id))
    } catch {
      alert('Failed to delete document')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1E3A5F' }}>Documents</h1>
        <p className="mt-1" style={{ color: '#4a6080' }}>
          Upload and organize your medical records, letters, and supporting documentation.
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-4 flex-wrap">
        <div className="bg-white rounded-xl border px-5 py-3" style={{ borderColor: '#e8edf2' }}>
          <div className="text-2xl font-bold" style={{ color: '#1E3A5F' }}>{documents.length}</div>
          <div className="text-sm" style={{ color: '#6b7a8d' }}>Documents uploaded</div>
        </div>
        {DOC_TYPES.map((t) => {
          const count = documents.filter((d) => d.type === t.value).length
          if (count === 0) return null
          return (
            <div key={t.value} className="bg-white rounded-xl border px-5 py-3" style={{ borderColor: '#e8edf2' }}>
              <div className="text-2xl font-bold" style={{ color: '#1E3A5F' }}>{count}</div>
              <div className="text-sm" style={{ color: '#6b7a8d' }}>{t.label}</div>
            </div>
          )
        })}
      </div>

      {/* Upload section */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#e8edf2' }}>
        <h2 className="font-semibold text-lg mb-4" style={{ color: '#1E3A5F' }}>Upload a Document</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Document Type</label>
            <select
              className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
              style={{ borderColor: '#d1d9e0', background: '#fff' }}
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value)}
            >
              {DOC_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Document Date</label>
            <input
              type="date"
              className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
              style={{ borderColor: '#d1d9e0', background: '#fff' }}
              value={uploadDate}
              onChange={(e) => setUploadDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Description (optional)</label>
            <input
              className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
              style={{ borderColor: '#d1d9e0', background: '#fff' }}
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              placeholder="e.g., CBC results from Jan 2024"
            />
          </div>
        </div>

        <div
          className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer"
          style={{ borderColor: '#d1d9e0', background: '#f8fafc' }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-3xl mb-2">{uploading ? '⏳' : '📎'}</div>
          <div className="font-medium" style={{ color: '#1E3A5F' }}>
            {uploading ? 'Uploading…' : 'Click to choose a file'}
          </div>
          <div className="text-sm mt-1" style={{ color: '#9aa5b1' }}>
            PDF, images, Word documents — any medical file
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt,.tiff,.tif"
            onChange={handleUpload}
            disabled={uploading}
          />
        </div>
        {error && <p className="mt-2 text-sm" style={{ color: '#ef4444' }}>{error}</p>}
      </div>

      {/* Document list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ background: '#e8edf2', height: 80 }} />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-2xl border p-10 text-center" style={{ borderColor: '#e8edf2' }}>
          <p className="text-4xl mb-3">📄</p>
          <p className="font-medium text-lg mb-1" style={{ color: '#1E3A5F' }}>No documents yet</p>
          <p className="text-sm" style={{ color: '#6b7a8d' }}>
            Upload medical records, doctor letters, test results, and any supporting documents.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-2xl border p-4 flex items-start gap-4" style={{ borderColor: '#e8edf2' }}>
              <div className="text-2xl">📄</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate" style={{ color: '#1E3A5F' }}>{doc.name}</div>
                <div className="flex flex-wrap gap-2 mt-1 items-center">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={typeBadgeStyle(doc.type)}>
                    {typeLabel(doc.type)}
                  </span>
                  {doc.doc_date && (
                    <span className="text-xs" style={{ color: '#9aa5b1' }}>{doc.doc_date}</span>
                  )}
                  {doc.file_size && (
                    <span className="text-xs" style={{ color: '#9aa5b1' }}>{formatSize(doc.file_size)}</span>
                  )}
                </div>
                {doc.description && (
                  <div className="text-sm mt-1" style={{ color: '#6b7a8d' }}>{doc.description}</div>
                )}
              </div>
              <button
                onClick={() => handleDelete(doc.id, doc.name)}
                className="text-xs px-3 py-1.5 rounded-lg flex-shrink-0"
                style={{ color: '#ef4444', background: '#fef2f2' }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
