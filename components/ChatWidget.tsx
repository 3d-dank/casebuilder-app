'use client'

import { useState, useEffect, useRef } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load history on first open
  useEffect(() => {
    if (open && !loaded) {
      setLoaded(true)
      fetch('/api/chat')
        .then(r => r.json())
        .then(d => {
          if (d.messages?.length) {
            setMessages(d.messages.map((m: { role: 'user' | 'assistant'; content: string }) => ({
              role: m.role,
              content: m.content,
            })))
          } else {
            // Welcome message
            setMessages([{
              role: 'assistant',
              content: "Hi! I'm your case assistant. I know your entire case — your doctors, symptoms, medications, and form progress. Ask me anything about the SSDI process, how to fill out forms, or what information to gather next. I'm here to help. 💙",
            }])
          }
        })
        .catch(() => {
          setMessages([{
            role: 'assistant',
            content: "Hi! I'm your case assistant. Ask me anything about the SSDI process or how to fill out your forms. I'm here to help. 💙",
          }])
        })
    }
  }, [open, loaded])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-10),
        }),
      })
      const data = await res.json()
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble connecting. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition-transform hover:scale-110"
        style={{ background: 'linear-gradient(135deg, #1E3A5F, #0D9488)' }}
        aria-label="Open case assistant"
        title="Ask your case assistant"
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 flex flex-col rounded-2xl shadow-2xl overflow-hidden"
          style={{
            width: '360px',
            maxWidth: 'calc(100vw - 24px)',
            height: '520px',
            background: '#FAFAF9',
            border: '1px solid #e2e8f0',
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, #1E3A5F, #0D9488)' }}
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">🤝</div>
            <div>
              <div className="text-white font-semibold text-sm">Case Assistant</div>
              <div className="text-white/70 text-xs">Knows your full case · Always here</div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed"
                  style={
                    m.role === 'user'
                      ? { background: '#1E3A5F', color: '#fff', borderBottomRightRadius: '4px' }
                      : { background: '#fff', color: '#1a2332', border: '1px solid #e2e8f0', borderBottomLeftRadius: '4px' }
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-3 py-2 text-sm text-slate-400">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-slate-200 bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask anything about your case..."
              disabled={loading}
              className="flex-1 rounded-xl px-3 py-2 text-sm border border-slate-200 outline-none focus:border-teal-500 bg-slate-50"
              style={{ fontSize: '15px' }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-opacity disabled:opacity-40"
              style={{ background: '#0D9488', minWidth: '36px' }}
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  )
}
