'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push('/dashboard')
      } else {
        setError('Incorrect password. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#FAFAF9' }}>
      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: '#1E3A5F' }}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: '#1E3A5F' }}>CaseBuilder</h1>
          <p className="text-lg mt-2" style={{ color: '#4a6080' }}>Your private workspace to organize<br />and build your disability case</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-sm border p-8" style={{ borderColor: '#e8edf2' }}>
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#1E3A5F' }}>Welcome back</h2>
          <p className="text-sm mb-6" style={{ color: '#6b7a8d' }}>
            This is a private, secure workspace. Enter your household password to continue.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-xl border text-base focus:outline-none focus:ring-2"
                style={{
                  borderColor: error ? '#ef4444' : '#d1d9e0',
                  background: '#fff',
                  color: '#1a2332',
                  focusRingColor: '#0D9488',
                }}
                required
                autoComplete="current-password"
              />
              {error && (
                <p className="mt-2 text-sm" style={{ color: '#ef4444' }}>{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl text-white font-semibold text-base cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: loading ? '#4a7a9b' : '#1E3A5F' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Reassurance footer */}
        <p className="text-center text-sm mt-6" style={{ color: '#9aa5b1' }}>
          🔒 Your information is private and secure
        </p>
      </div>
    </div>
  )
}
