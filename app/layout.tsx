import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CaseBuilder — SSDI Case Management',
  description: 'Your private workspace to organize and build your disability case',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ background: '#FAFAF9' }}>
        {children}
      </body>
    </html>
  )
}
