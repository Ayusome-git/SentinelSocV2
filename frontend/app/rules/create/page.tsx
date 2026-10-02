"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from "@/components/layout/PageHeader"
import { rulesApi } from "@/lib/api/rules"
import { usePermissions } from "@/lib/permissions"
import { ArrowLeft, Loader2, Target, AlertTriangle } from "lucide-react"

export default function CreateRulePage() {
  const router = useRouter()
  const { hasPermission, isLoading } = usePermissions()
  const canManage = hasPermission('RULES_MANAGE')

  const [form, setForm] = useState({
    name: '',
    description: '',
    rule_type: 'THRESHOLD',
    category: 'AUTHENTICATION',
    event_type: '',
    severity: 'MEDIUM',
    threshold: 5,
    window_seconds: 300,
    group_by: 'source_ip',
    distinct_field: '',
    pattern: '',
    enabled: true
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (isLoading) return null
  if (!canManage) {
    router.push('/rules')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!form.name.trim()) return setError('Name is required')
    if (!form.event_type.trim()) return setError('Event Type is required')
    
    if (form.rule_type === 'THRESHOLD') {
      if (!form.group_by.trim()) return setError('Group By field is required for Threshold rules')
      if (form.threshold < 1) return setError('Threshold must be at least 1')
      if (form.window_seconds < 1) return setError('Window must be at least 1 second')
    } else if (form.rule_type === 'PATTERN') {
      if (!form.pattern.trim()) return setError('Pattern is required for Pattern rules')
    } else if (form.rule_type === 'SEQUENCE') {
      if (form.window_seconds < 1) return setError('Window must be at least 1 second')
    }

    setSubmitting(true)
    try {
      const payload: any = { ...form }
      if (form.rule_type === 'PATTERN') {
        delete payload.threshold
        delete payload.window_seconds
        delete payload.group_by
        delete payload.distinct_field
      } else if (form.rule_type === 'SEQUENCE') {
        delete payload.threshold
        delete payload.group_by
        delete payload.distinct_field
        delete payload.pattern
      } else {
        delete payload.pattern
      }

      await rulesApi.create(payload)
      router.push('/rules')
    } catch (err: any) {
      setError(err.message || 'Failed to create rule')
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/rules" className="rounded-full p-2 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <PageHeader title="Create Detection Rule" description="Define a new security threshold rule." />
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="border-b border-border bg-secondary/30 px-6 py-5 flex items-center gap-3">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Rule Configuration</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="rounded-lg border border-critical/30 bg-critical/10 px-4 py-3 text-sm text-critical flex items-center gap-2 shadow-[0_0_10px_rgba(var(--critical),0.1)]">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Rule Name <span className="text-critical">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                placeholder="e.g. Multiple Failed Logins"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Event Type <span className="text-critical">*</span></label>
              <input
                type="text"
                value={form.event_type}
                onChange={e => setForm(f => ({ ...f, event_type: e.target.value }))}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors font-mono text-[13px]"
                placeholder="e.g. AUTH_FAILED"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors min-h-[80px]"
                placeholder="Describe what this rule detects..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Rule Type</label>
              <select
                value={form.rule_type}
                onChange={e => setForm(f => ({ ...f, rule_type: e.target.value }))}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              >
                <option value="THRESHOLD">Threshold</option>
                <option value="PATTERN">Pattern</option>
                <option value="SEQUENCE">Sequence</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              >
                <option value="AUTHENTICATION">Authentication</option>
                <option value="AUTHORIZATION">Authorization</option>
                <option value="API_ABUSE">API Abuse</option>
                <option value="PRIVILEGE_ABUSE">Privilege Abuse</option>
                <option value="WEB_ATTACK">Web Attack</option>
                <option value="ANOMALY">Anomaly</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Severity</label>
              <select
                value={form.severity}
                onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              >
                <option value="INFO">Info</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            
            {form.rule_type === 'PATTERN' && (
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Pattern (Regex) <span className="text-critical">*</span></label>
                <input
                  type="text"
                  value={form.pattern}
                  onChange={e => setForm(f => ({ ...f, pattern: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors font-mono"
                  placeholder="e.g. (?i)(\.\./|\.\.\\|/etc/passwd)"
                />
              </div>
            )}

            {form.rule_type === 'THRESHOLD' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Group By Field <span className="text-critical">*</span></label>
                  <input
                    type="text"
                    value={form.group_by}
                    onChange={e => setForm(f => ({ ...f, group_by: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors font-mono text-[13px]"
                    placeholder="e.g. source_ip"
                  />
                  <p className="text-xs text-muted-foreground">The event field used to group occurrences.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Distinct Field (Optional)</label>
                  <input
                    type="text"
                    value={form.distinct_field}
                    onChange={e => setForm(f => ({ ...f, distinct_field: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors font-mono text-[13px]"
                    placeholder="e.g. username"
                  />
                  <p className="text-xs text-muted-foreground">Count unique values of this field instead of total events.</p>
                </div>
              </>
            )}

            {(form.rule_type === 'THRESHOLD' || form.rule_type === 'SEQUENCE') && (
              <>
                {form.rule_type === 'THRESHOLD' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Threshold (Count) <span className="text-critical">*</span></label>
                    <input
                      type="number"
                      min="1"
                      value={form.threshold}
                      onChange={e => setForm(f => ({ ...f, threshold: parseInt(e.target.value) || 1 }))}
                      className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Time Window (Seconds) <span className="text-critical">*</span></label>
                  <input
                    type="number"
                    min="1"
                    value={form.window_seconds}
                    onChange={e => setForm(f => ({ ...f, window_seconds: parseInt(e.target.value) || 60 }))}
                    className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
              </>
            )}

            <div className="space-y-2 md:col-span-2 flex items-center gap-3 pt-4 border-t border-border mt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={form.enabled}
                    onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))}
                    className="peer sr-only"
                  />
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    form.enabled ? 'bg-primary border-primary' : 'bg-input border-border group-hover:border-primary/50'
                  }`}>
                    {form.enabled && (
                      <svg className="w-3.5 h-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">Enable this rule immediately</span>
              </label>
            </div>
          </div>

          <div className="border-t border-border pt-6 flex items-center justify-end gap-3 mt-6">
            <Link
              href="/rules"
              className="px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

