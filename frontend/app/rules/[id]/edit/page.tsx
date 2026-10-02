"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from "@/components/layout/PageHeader"
import { rulesApi } from "@/lib/api/rules"
import { usePermissions } from "@/lib/permissions"
import { ArrowLeft, Loader2, Target, AlertTriangle } from "lucide-react"

export default function EditRulePage() {
  const params = useParams()
  const router = useRouter()
  const { hasPermission, isLoading } = usePermissions()
  const canManage = hasPermission('RULES_MANAGE')

  const [form, setForm] = useState({
    name: '',
    description: '',
    severity: 'MEDIUM',
    threshold: 5,
    window_seconds: 300,
    enabled: true
  })
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fetchRule = useCallback(async () => {
    try {
      const data = await rulesApi.get(params.id as string)
      setForm({
        name: data.name,
        description: data.description || '',
        severity: data.severity,
        threshold: data.threshold ?? 5,
        window_seconds: data.window_seconds ?? 300,
        enabled: data.enabled
      })
    } catch (err: any) {
      setError(err.message || 'Failed to fetch rule')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchRule()
  }, [fetchRule])

  if (isLoading || loading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  if (!canManage) {
    router.push(`/rules/${params.id}`)
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!form.name.trim()) return setError('Name is required')
    if (form.threshold < 1) return setError('Threshold must be at least 1')
    if (form.window_seconds < 1) return setError('Window must be at least 1 second')

    setSubmitting(true)
    try {
      await rulesApi.update(params.id as string, form)
      router.push(`/rules/${params.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to update rule')
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/rules/${params.id}`} className="rounded-full h-10 w-10 flex items-center justify-center hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border/50">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title="Edit Detection Rule" description="Update rule configuration." />
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="border-b border-border bg-secondary/30 px-6 py-4 flex items-center gap-3">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Rule Configuration</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="rounded-lg border border-critical/30 bg-critical/10 px-4 py-3 text-sm text-critical flex items-center gap-2 shadow-sm">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-foreground">Rule Name <span className="text-critical">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full rounded-md border border-border bg-input px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-foreground">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full rounded-md border border-border bg-input px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Severity</label>
              <select
                value={form.severity}
                onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}
                className="w-full rounded-md border border-border bg-input px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              >
                <option value="INFO">Info</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Threshold (Count) <span className="text-critical">*</span></label>
              <input
                type="number"
                min="1"
                value={form.threshold}
                onChange={e => setForm(f => ({ ...f, threshold: parseInt(e.target.value) || 1 }))}
                className="w-full rounded-md border border-border bg-input px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Time Window (Seconds) <span className="text-critical">*</span></label>
              <input
                type="number"
                min="1"
                value={form.window_seconds}
                onChange={e => setForm(f => ({ ...f, window_seconds: parseInt(e.target.value) || 60 }))}
                className="w-full rounded-md border border-border bg-input px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all font-mono"
              />
            </div>

            <div className="space-y-2 md:col-span-2 pt-4">
              <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary bg-input"
                />
                <div>
                  <span className="text-sm font-semibold text-foreground block">Rule Enabled</span>
                  <span className="text-xs text-muted-foreground">If disabled, this rule will not evaluate incoming events.</span>
                </div>
              </label>
            </div>
          </div>

          <div className="border-t border-border pt-6 flex items-center justify-end gap-3 mt-8">
            <Link
              href={`/rules/${params.id}`}
              className="px-4 py-2.5 rounded-md border border-border bg-secondary text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors shadow-sm"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2.5 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
