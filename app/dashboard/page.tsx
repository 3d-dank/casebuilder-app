'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface SectionProgress {
  label: string
  count: number
  complete: boolean
  percent: number
}

interface ProgressData {
  sections: {
    medical_team: SectionProgress
    documents: SectionProgress
    forms: SectionProgress
    symptoms: SectionProgress
    medications: SectionProgress
    case_summary: SectionProgress
  }
  overallPercent: number
}

const sectionConfig = [
  {
    key: 'medical_team',
    href: '/dashboard/medical-team',
    icon: '👩‍⚕️',
    description: 'Log all doctors and treatment providers',
    tip: 'Add at least 3 providers for a complete picture',
  },
  {
    key: 'documents',
    href: '/dashboard/documents',
    icon: '📄',
    description: 'Upload medical records, test results, and letters',
    tip: 'More documentation strengthens your case',
  },
  {
    key: 'forms',
    href: '/dashboard/forms',
    icon: '📋',
    description: 'Fill out the 4 required SSA forms',
    tip: 'The Function Report (SSA-3373) is most important',
  },
  {
    key: 'symptoms',
    href: '/dashboard/symptoms',
    icon: '📊',
    description: 'Track daily cognitive and physical limitations',
    tip: 'Log symptoms daily — consistency is powerful evidence',
  },
  {
    key: 'medications',
    href: '/dashboard/medications',
    icon: '💊',
    description: 'Current and past medications including chemotherapy',
    tip: 'Include all chemo regimens with dates',
  },
  {
    key: 'case_summary',
    href: '/dashboard/case-summary',
    icon: '✨',
    description: 'AI-generated narrative for your attorney and SSA',
    tip: 'Generate after completing other sections',
  },
]

function getMotivationalMessage(percent: number): string {
  if (percent === 0) return "Let's start building your case. Every step you take matters."
  if (percent < 20) return "You've taken the first steps. Keep going — you're building something important."
  if (percent < 40) return "Great progress! You're laying a solid foundation for your case."
  if (percent < 60) return "You're doing great. More than halfway through the key sections."
  if (percent < 80) return "Almost there! Your case is really coming together."
  if (percent < 100) return "You're so close! A few more details and your case will be complete."
  return "Excellent work! Your case documentation is complete. You've done something remarkable."
}

function getNextAction(sections: ProgressData['sections'] | null): { href: string; label: string } | null {
  if (!sections) return null
  const order: (keyof ProgressData['sections'])[] = ['medical_team', 'medications', 'symptoms', 'documents', 'forms', 'case_summary']
  for (const key of order) {
    if (!sections[key].complete) {
      const config = sectionConfig.find((c) => c.key === key)
      if (config) return { href: config.href, label: `Continue: ${sections[key].label}` }
    }
  }
  return { href: '/dashboard/case-summary', label: 'Review your completed case' }
}

export default function DashboardPage() {
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/case/progress')
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setProgress(data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const overallPercent = progress?.overallPercent || 0
  const motivationalMessage = getMotivationalMessage(overallPercent)
  const nextAction = getNextAction(progress?.sections || null)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#1E3A5F' }}>Your Case Dashboard</h1>
        <p className="mt-1 text-lg" style={{ color: '#4a6080' }}>
          Building a strong SSDI case, one step at a time
        </p>
      </div>

      {/* Overall progress card */}
      <div className="rounded-2xl p-6 text-white" style={{ background: '#1E3A5F' }}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex-1">
            <div className="text-sm font-medium opacity-80 mb-1">Overall Case Completion</div>
            <div className="text-5xl font-bold mb-2">{overallPercent}%</div>
            <p className="text-base opacity-90 max-w-lg">{motivationalMessage}</p>
          </div>
          {nextAction && (
            <Link
              href={nextAction.href}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm self-start"
              style={{ background: '#0D9488', color: '#fff' }}
            >
              {nextAction.label} →
            </Link>
          )}
        </div>
        <div className="mt-5">
          <div className="w-full rounded-full h-3" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <div
              className="h-3 rounded-full transition-all duration-700"
              style={{ width: `${overallPercent}%`, background: '#0D9488' }}
            />
          </div>
        </div>
      </div>

      {/* Section cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl p-6 animate-pulse" style={{ background: '#e8edf2', height: 180 }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectionConfig.map((config) => {
            const section = progress?.sections[config.key as keyof ProgressData['sections']]
            const percent = section?.percent || 0
            const complete = section?.complete || false

            return (
              <div
                key={config.key}
                className="bg-white rounded-2xl border p-6 flex flex-col"
                style={{ borderColor: complete ? '#0D9488' : '#e8edf2', borderWidth: complete ? 2 : 1 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-2xl">{config.icon}</span>
                    <div className="mt-1 font-semibold text-lg" style={{ color: '#1E3A5F' }}>
                      {section?.label || config.key}
                    </div>
                  </div>
                  {complete && (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: '#d1fae5', color: '#065f46' }}>
                      ✓ Done
                    </span>
                  )}
                </div>

                <p className="text-sm flex-1 mb-4" style={{ color: '#6b7a8d' }}>{config.description}</p>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1" style={{ color: '#9aa5b1' }}>
                    <span>{Math.round(percent)}% complete</span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ background: '#f0f4f8' }}>
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        background: complete ? '#0D9488' : '#1E3A5F',
                      }}
                    />
                  </div>
                </div>

                {!complete && (
                  <p className="text-xs mb-3 italic" style={{ color: '#9aa5b1' }}>💡 {config.tip}</p>
                )}

                <Link
                  href={config.href}
                  className="mt-auto inline-flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl text-sm font-semibold"
                  style={{
                    background: complete ? '#f0fdf4' : '#1E3A5F',
                    color: complete ? '#0D9488' : '#fff',
                  }}
                >
                  {complete ? 'Review' : 'Continue'} →
                </Link>
              </div>
            )
          })}
        </div>
      )}

      {/* Encouragement footer */}
      <div className="rounded-2xl p-6 text-center" style={{ background: '#f0fdf9', border: '1px solid #a7f3d0' }}>
        <p className="text-base font-medium" style={{ color: '#065f46' }}>
          💙 You are doing something important and brave. Every document, every form, every log entry builds a stronger case.
        </p>
        <p className="text-sm mt-1" style={{ color: '#047857' }}>
          Take it one step at a time. You've got this.
        </p>
      </div>
    </div>
  )
}
