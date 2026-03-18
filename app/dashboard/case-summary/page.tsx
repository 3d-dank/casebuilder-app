'use client'

import { useEffect, useState } from 'react'

export default function CaseSummaryPage() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  // Load most recent summary on mount
  useEffect(() => {
    fetch('/api/case/summaries')
      .then((r) => r.json())
      .then((d) => {
        if (d.summaries?.length > 0) {
          setContent(d.summaries[0].content)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingHistory(false))
  }, [])

  async function handleGenerate() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/case/generate', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to generate summary')
        return
      }
      setContent(data.content || '')
    } catch {
      setError('Failed to generate summary. Please check your OpenAI API key.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = content
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function handleDownload() {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `case-summary-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1E3A5F' }}>Case Summary</h1>
        <p className="mt-1" style={{ color: '#4a6080' }}>
          Generate a professional narrative that tells the full story of this disability case.
        </p>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#e8edf2' }}>
        <h2 className="font-semibold text-lg mb-3" style={{ color: '#1E3A5F' }}>How the AI Summary Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <div className="font-medium mb-1" style={{ color: '#1E3A5F' }}>Pulls all your data</div>
              <div style={{ color: '#6b7a8d' }}>Reads your medical team, medications, symptoms, and form responses</div>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">✍️</span>
            <div>
              <div className="font-medium mb-1" style={{ color: '#1E3A5F' }}>Writes in SSA language</div>
              <div style={{ color: '#6b7a8d' }}>Uses GPT-4o to craft a professional, factual disability narrative</div>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl">📤</span>
            <div>
              <div className="font-medium mb-1" style={{ color: '#1E3A5F' }}>Ready to share</div>
              <div style={{ color: '#6b7a8d' }}>Copy for your attorney or download as a document</div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-xl text-sm" style={{ background: '#fef3c7', border: '1px solid #fcd34d' }}>
          <strong style={{ color: '#92400e' }}>💡 Best results:</strong>{' '}
          <span style={{ color: '#78350f' }}>
            Fill out as many sections as possible before generating — especially the Medical Team, Symptoms Log, and Function Report (SSA-3373). The more data you provide, the stronger the narrative.
          </span>
        </div>

        <div className="mt-4">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-3 rounded-xl text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: loading ? '#4a7a9b' : '#0D9488', fontSize: '15px' }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating — this may take 15-30 seconds…
              </span>
            ) : content ? '✨ Regenerate Case Summary' : '✨ Generate Case Summary'}
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl text-sm" style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}
      </div>

      {/* Summary content */}
      {loadingHistory ? (
        <div className="rounded-2xl p-8 animate-pulse" style={{ background: '#e8edf2', height: 200 }} />
      ) : content ? (
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: '#e8edf2' }}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="font-semibold text-lg" style={{ color: '#1E3A5F' }}>Case Narrative</h2>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="text-sm px-4 py-2 rounded-xl font-medium"
                style={{ background: copied ? '#d1fae5' : '#eff6ff', color: copied ? '#065f46' : '#1d4ed8' }}
              >
                {copied ? '✓ Copied!' : '📋 Copy for Attorney'}
              </button>
              <button
                onClick={handleDownload}
                className="text-sm px-4 py-2 rounded-xl font-medium"
                style={{ background: '#f0f4f8', color: '#374151' }}
              >
                ⬇️ Download
              </button>
            </div>
          </div>

          <textarea
            rows={20}
            className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none resize-y leading-relaxed"
            style={{
              borderColor: '#d1d9e0',
              background: '#fafafa',
              color: '#1a2332',
              fontFamily: 'Georgia, serif',
              fontSize: '15px',
              lineHeight: '1.8',
            }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <p className="text-xs mt-2" style={{ color: '#9aa5b1' }}>
            You can edit the text above. Changes are not automatically saved — use the Copy or Download buttons to preserve your work.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border p-10 text-center" style={{ borderColor: '#e8edf2' }}>
          <p className="text-5xl mb-4">✨</p>
          <p className="font-medium text-xl mb-2" style={{ color: '#1E3A5F' }}>No summary yet</p>
          <p className="text-sm max-w-md mx-auto" style={{ color: '#6b7a8d' }}>
            Once you&apos;ve added your medical team, medications, symptoms, and filled out the SSA forms, 
            click &ldquo;Generate Case Summary&rdquo; above to create a professional narrative.
          </p>
        </div>
      )}

      {/* Encouragement */}
      {content && (
        <div className="rounded-2xl p-5 text-center" style={{ background: '#f0fdf9', border: '1px solid #a7f3d0' }}>
          <p className="font-medium" style={{ color: '#065f46' }}>
            💙 You have done something extraordinary by organizing all of this. This narrative is the result of your hard work.
          </p>
          <p className="text-sm mt-1" style={{ color: '#047857' }}>
            Share this with your attorney, disability advocate, or include it with your SSA submission.
          </p>
        </div>
      )}
    </div>
  )
}
