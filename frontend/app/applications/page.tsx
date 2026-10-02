/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from "@/components/layout/PageHeader"
import { usePermissions } from "@/lib/permissions"
import { applicationsApi } from "@/lib/api/applications"
import { api } from "@/lib/api"
import type { Application, AppEnvironment, AppStatus } from "@/lib/types/application"
import {
  Search,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Box,
  PauseCircle,
  Database
} from "lucide-react"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const ENV_BADGE_STYLES: Record<string, string> = {
  DEVELOPMENT: 'bg-secondary text-muted-foreground border border-border',
  STAGING: 'bg-medium/15 text-medium border border-medium/30',
  PRODUCTION: 'bg-primary/15 text-primary border border-primary/30 shadow-[0_0_8px_rgba(var(--primary),0.1)]',
}

const STATUS_BADGE_STYLES: Record<string, string> = {
  ACTIVE: 'bg-success/15 text-success border border-success/30',
  INACTIVE: 'bg-secondary text-muted-foreground border border-border',
  SUSPENDED: 'bg-critical/15 text-critical border border-critical/30',
}

const STATUS_ICONS: Record<string, any> = {
  ACTIVE: Activity,
  INACTIVE: Box,
  SUSPENDED: PauseCircle,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function EnvBadge({ env }: { env: AppEnvironment }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest ${ENV_BADGE_STYLES[env] || ENV_BADGE_STYLES.DEVELOPMENT}`}>
      {env}
    </span>
  )
}

function StatusBadge({ status }: { status: AppStatus }) {
  const Icon = STATUS_ICONS[status] || Activity
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest ${STATUS_BADGE_STYLES[status] || STATUS_BADGE_STYLES.INACTIVE}`}>
      <Icon className="h-3 w-3" />
      {status}
    </span>
  )
}

function Modal({ open, onClose, title, children }: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-secondary/30 rounded-t-xl">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-secondary rounded-md">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel, loading, destructive }: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel: string
  loading?: boolean
  destructive?: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5">
          <div className="flex items-start gap-4">
            <div className={`mt-0.5 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${destructive ? 'bg-critical/10 border border-critical/20' : 'bg-medium/10 border border-medium/20'}`}>
              <AlertTriangle className={`h-6 w-6 ${destructive ? 'text-critical' : 'text-medium'}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-border px-6 py-4 bg-secondary/30 rounded-b-xl">
          <button onClick={onClose} disabled={loading} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 shadow-sm ${destructive ? 'bg-critical text-critical-foreground hover:bg-critical/90' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-lg border px-4 py-3 shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-4 ${
      type === 'success' ? 'border-success/30 bg-success/10 text-success' : 'border-critical/30 bg-critical/10 text-critical'
    }`}>
      {type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-background/20">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------
export default function ApplicationsPage() {
  const { isAdmin } = usePermissions()

  // State
  const [applications, setApplications] = useState<Application[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modals
  const [createOpen, setCreateOpen] = useState(false)
  const [editApp, setEditApp] = useState<Application | null>(null)
  const [statusConfirm, setStatusConfirm] = useState<{ app: Application, newStatus: AppStatus } | null>(null)
  const [actionsOpen, setActionsOpen] = useState<string | null>(null)

  // System Users
  const [users, setUsers] = useState<any[]>([])

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // -----------------------------------------------------------------------
  // Data fetching
  // -----------------------------------------------------------------------
  const fetchApplications = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await applicationsApi.list({ page, page_size: pageSize })
      setApplications(data.items)
      setTotal(data.total)
    } catch (e: any) {
      setError(e.message || 'Failed to load applications')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize])

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return
    try {
      const data = await api.get<any>('/api/v1/users?page=1&page_size=100')
      setUsers(data.items)
    } catch (e) {
      console.error('Failed to fetch users', e)
    }
  }, [isAdmin])

  useEffect(() => {
    fetchApplications()
    fetchUsers()
  }, [fetchApplications, fetchUsers])

  const totalPages = Math.ceil(total / pageSize)

  // -----------------------------------------------------------------------
  // Create Application Form
  // -----------------------------------------------------------------------
  function CreateAppForm({ onClose }: { onClose: () => void }) {
    const [form, setForm] = useState({
      name: '',
      slug: '',
      description: '',
      environment: 'DEVELOPMENT' as AppEnvironment,
      owner_id: ''
    })
    const [submitting, setSubmitting] = useState(false)
    const [formError, setFormError] = useState('')

    // Auto-generate slug
    useEffect(() => {
      if (form.name && !form.slug) {
        setForm(f => ({ ...f, slug: f.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') }))
      }
    }, [form.name])

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setFormError('')
      if (!form.name.trim()) { setFormError('Name is required'); return }
      if (!form.slug.trim()) { setFormError('Slug is required'); return }
      if (!form.owner_id) { setFormError('Owner is required'); return }

      setSubmitting(true)
      try {
        await applicationsApi.create(form)
        setToast({ message: 'Application registered successfully', type: 'success' })
        onClose()
        fetchApplications()
      } catch (e: any) {
        setFormError(e.message || 'Failed to register application')
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Application Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            placeholder="My E-Commerce App"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">App Slug</label>
          <input
            type="text"
            value={form.slug}
            onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
            className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            placeholder="my-ecommerce-app"
          />
          <p className="mt-1 text-xs text-muted-foreground">URL-safe unique identifier</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            placeholder="Main e-commerce storefront"
            rows={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Environment</label>
          <select
            value={form.environment}
            onChange={e => setForm(f => ({ ...f, environment: e.target.value as AppEnvironment }))}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          >
            <option value="DEVELOPMENT">Development</option>
            <option value="STAGING">Staging</option>
            <option value="PRODUCTION">Production</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Owner</label>
          <select
            value={form.owner_id}
            onChange={e => setForm(f => ({ ...f, owner_id: e.target.value }))}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          >
            <option value="">Select an owner</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
            ))}
          </select>
        </div>

        {formError && (
          <div className="rounded-lg border border-critical/30 bg-critical/10 px-3 py-2 text-sm text-critical flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {formError}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-border">
          <button type="button" onClick={onClose} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Register App'}
          </button>
        </div>
      </form>
    )
  }

  // -----------------------------------------------------------------------
  // Edit Application Form
  // -----------------------------------------------------------------------
  function EditAppForm({ app, onClose }: { app: Application; onClose: () => void }) {
    const [form, setForm] = useState({
      name: app.name,
      description: app.description || '',
      environment: app.environment,
      owner_id: app.owner_id
    })
    const [submitting, setSubmitting] = useState(false)
    const [formError, setFormError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setFormError('')
      if (!form.name.trim()) { setFormError('Name is required'); return }
      if (!form.owner_id) { setFormError('Owner is required'); return }

      setSubmitting(true)
      try {
        await applicationsApi.update(app.id, form)
        setToast({ message: 'Application updated successfully', type: 'success' })
        onClose()
        fetchApplications()
      } catch (e: any) {
        setFormError(e.message || 'Failed to update application')
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Application Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            rows={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Environment</label>
          <select
            value={form.environment}
            onChange={e => setForm(f => ({ ...f, environment: e.target.value as AppEnvironment }))}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          >
            <option value="DEVELOPMENT">Development</option>
            <option value="STAGING">Staging</option>
            <option value="PRODUCTION">Production</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Owner</label>
          <select
            value={form.owner_id}
            onChange={e => setForm(f => ({ ...f, owner_id: e.target.value }))}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          >
            <option value="">Select an owner</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
            ))}
          </select>
        </div>

        {formError && (
          <div className="rounded-lg border border-critical/30 bg-critical/10 px-3 py-2 text-sm text-critical flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {formError}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-border">
          <button type="button" onClick={onClose} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
          </button>
        </div>
      </form>
    )
  }

  // -----------------------------------------------------------------------
  // Status toggle handler
  // -----------------------------------------------------------------------
  const [statusLoading, setStatusLoading] = useState(false)

  const handleStatusChange = async () => {
    if (!statusConfirm) return
    setStatusLoading(true)
    try {
      await applicationsApi.changeStatus(statusConfirm.app.id, { status: statusConfirm.newStatus })
      setToast({ message: `Application status changed to ${statusConfirm.newStatus}`, type: 'success' })
      setStatusConfirm(null)
      fetchApplications()
    } catch (e: any) {
      setToast({ message: e.message || 'Failed to update status', type: 'error' })
      setStatusConfirm(null)
    } finally {
      setStatusLoading(false)
    }
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div className="flex flex-col">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Applications</h1>
          <p className="text-sm text-muted-foreground mt-1">Register applications to integrate with SentinelSOC for event ingestion and monitoring.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1" />
        {isAdmin && (
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm h-10"
          >
            <Plus className="h-4 w-4" />
            Register Application
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-critical/30 bg-critical/10 px-4 py-3 text-sm text-critical flex items-center gap-2 shadow-[0_0_10px_rgba(var(--critical),0.1)]">
          <AlertTriangle className="h-4 w-4" />
          {error}
          <button onClick={fetchApplications} className="ml-auto text-critical/80 hover:text-critical underline text-xs">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/30">
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Application</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Environment</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Owner</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Registered</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                    <p className="mt-2 text-sm text-muted-foreground">Loading applications…</p>
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <Database className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <h3 className="text-lg font-medium text-foreground">No applications registered</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Register an application to begin integrating events.
                    </p>
                  </td>
                </tr>
              ) : (
                applications.map(app => (
                  <tr key={app.id} className="group hover:bg-secondary/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                          <Database className="h-5 w-5" />
                        </div>
                        <div>
                          <Link href={`/applications/${app.id}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                            {app.name}
                          </Link>
                          <p className="text-xs text-muted-foreground font-mono">{app.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <EnvBadge env={app.environment} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {app.owner_name}
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground font-mono text-[11px]">
                      {formatDate(app.created_at)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {isAdmin ? (
                        <div className="relative inline-block">
                          <button
                            onClick={() => setActionsOpen(actionsOpen === app.id ? null : app.id)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                          {actionsOpen === app.id && (
                            <>
                              <div className="fixed inset-0 z-30" onClick={() => setActionsOpen(null)} />
                              <div className="absolute right-0 z-40 mt-1 w-44 rounded-lg border border-border bg-card shadow-xl py-1 animate-in zoom-in-95 duration-100 origin-top-right">
                                <Link
                                  href={`/applications/${app.id}`}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                                >
                                  View Details
                                </Link>
                                <button
                                  onClick={() => { setActionsOpen(null); setEditApp(app) }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                                >
                                  Edit App Settings
                                </button>
                                <div className="my-1 border-t border-border" />
                                {app.status === 'ACTIVE' && (
                                  <>
                                    <button
                                      onClick={() => { setActionsOpen(null); setStatusConfirm({ app, newStatus: 'INACTIVE' }) }}
                                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-medium hover:bg-medium/10 transition-colors"
                                    >
                                      Mark Inactive
                                    </button>
                                    <button
                                      onClick={() => { setActionsOpen(null); setStatusConfirm({ app, newStatus: 'SUSPENDED' }) }}
                                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-critical hover:bg-critical/10 transition-colors"
                                    >
                                      Suspend App
                                    </button>
                                  </>
                                )}
                                {app.status !== 'ACTIVE' && (
                                  <button
                                    onClick={() => { setActionsOpen(null); setStatusConfirm({ app, newStatus: 'ACTIVE' }) }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-success hover:bg-success/10 transition-colors"
                                  >
                                    Activate App
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <Link href={`/applications/${app.id}`} className="text-sm font-medium text-primary hover:text-primary/80">
                          View
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border bg-card/50 px-6 py-4">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-medium text-foreground">{(page - 1) * pageSize + 1}</span>–<span className="font-medium text-foreground">{Math.min(page * pageSize, total)}</span> of <span className="font-medium text-foreground">{total}</span> applications
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-border bg-card p-1.5 text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2 text-xs font-medium text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-border bg-card p-1.5 text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Application Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Register Application">
        <CreateAppForm onClose={() => setCreateOpen(false)} />
      </Modal>

      {/* Edit Application Modal */}
      <Modal open={!!editApp} onClose={() => setEditApp(null)} title="Edit Application">
        {editApp && <EditAppForm app={editApp} onClose={() => setEditApp(null)} />}
      </Modal>

      {/* Status Confirm Dialog */}
      <ConfirmDialog
        open={!!statusConfirm}
        onClose={() => setStatusConfirm(null)}
        onConfirm={handleStatusChange}
        loading={statusLoading}
        destructive={statusConfirm?.newStatus === 'SUSPENDED'}
        title={`Change Status to ${statusConfirm?.newStatus}`}
        message={`Are you sure you want to change the status of ${statusConfirm?.app.name} to ${statusConfirm?.newStatus}?`}
        confirmLabel="Change Status"
      />

      {/* Toast notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
