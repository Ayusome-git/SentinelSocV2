"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { ShieldAlert, Loader2, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        const data = await response.json()
        login(data.access_token)
        router.push('/dashboard')
      } else {
        const data = await response.json()
        setError(data.detail || 'Invalid email or password')
        setLoading(false)
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-[#050505] overflow-hidden text-zinc-50">
      
      {/* LEFT: Branding & Abstract Visualization */}
      <div className="hidden lg:flex flex-col flex-1 relative border-r border-white/5 bg-[#0B0D0E] p-12 overflow-hidden justify-between">
        <div className="relative z-10 flex items-center gap-2">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold tracking-wider text-sm text-foreground">SentinelSOC</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md mt-24">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4 leading-tight">
            Security Intelligence for Every Application.
          </h1>
          <p className="text-lg text-muted-foreground">
            Log in to the Security Operations Center to investigate alerts, correlate events, and orchestrate incident response.
          </p>
        </div>

        {/* Abstract Visualization */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Subtle grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:48px_48px] opacity-10" />
          
          {/* Glowing orb */}
          <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
          
          {/* Animated data stream lines */}
          <div className="absolute bottom-0 left-12 w-px h-64 bg-gradient-to-t from-transparent via-primary/50 to-transparent opacity-50" />
          <div className="absolute bottom-24 left-32 w-px h-48 bg-gradient-to-t from-transparent via-medium/30 to-transparent opacity-30" />
          <div className="absolute top-32 right-24 w-px h-72 bg-gradient-to-b from-transparent via-success/30 to-transparent opacity-40" />

          {/* Node connections */}
          <div className="absolute top-1/2 right-1/4 transform -translate-y-1/2 flex items-center">
            <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
            <div className="h-px w-24 bg-gradient-to-r from-primary to-transparent opacity-30" />
          </div>
          <div className="absolute top-[40%] right-1/3 transform -translate-y-1/2 flex flex-col items-center">
            <div className="w-1.5 h-1.5 bg-medium rounded-full shadow-[0_0_10px_rgba(var(--medium),0.5)]" />
            <div className="w-px h-16 bg-gradient-to-b from-medium to-transparent opacity-30" />
          </div>
        </div>

        <div className="relative z-10 text-xs text-muted-foreground">
          © {new Date().getFullYear()} SentinelSOC. All rights reserved.
        </div>
      </div>

      {/* RIGHT: Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        <Link href="/" className="absolute top-8 left-8 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 lg:hidden">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
        
        <div className="w-full max-w-sm space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-700">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Enter your credentials to access the SOC.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-critical/30 bg-critical/10 px-4 py-3 text-sm text-critical flex items-center gap-2 shadow-[0_0_10px_rgba(var(--critical),0.1)]">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full rounded-lg border border-border bg-[#0B0D0E] px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors text-sm"
                  placeholder="admin@sentinelsoc.local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-foreground" htmlFor="password">Password</label>
                  <a href="#" className="text-xs text-primary hover:text-primary/80 transition-colors">Forgot password?</a>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full rounded-lg border border-border bg-[#0B0D0E] px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 font-medium rounded-lg group"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign in to SOC
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border/50">
            Secure connection established. Your session is monitored.
          </div>
        </div>
      </div>
    </div>
  )
}
