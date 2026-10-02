"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { applicationsApi } from "@/lib/api/applications"
import type { Application } from "@/lib/types/application"
import type { ApiKey } from "@/lib/types/api_key"
import { usePermissions } from "@/lib/permissions"
import {
  ChevronLeft,
  Loader2,
  AlertTriangle,
  Database,
  Activity,
  Code,
  Key,
  Plus,
  Copy,
  CheckCircle2,
  Trash2,
  Clock
} from "lucide-react"

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { hasPermission } = usePermissions()
  const canManage = hasPermission('APPLICATIONS_MANAGE')

  const [application, setApplication] = useState<Application | null>(null)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal states
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeySecret, setNewKeySecret] = useState('')
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchApplicationData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const appData = await applicationsApi.get(id)
      setApplication(appData)
      
      const keysData = await applicationsApi.listApiKeys(id)
      setApiKeys(keysData)
    } catch (e: any) {
      setError(e.message || 'Failed to load application details')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchApplicationData()
  }, [fetchApplicationData])

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKeyName.trim()) return
    
    setGenerating(true)
    try {
      const res = await applicationsApi.createApiKey(id, { name: newKeyName })
      setNewKeySecret(res.api_key)
      setApiKeys(prev => [res, ...prev])
    } catch (e: any) {
      alert(e.message || 'Failed to generate API Key')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopySecret = () => {
    navigator.clipboard.writeText(newKeySecret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const closeSecretModal = () => {
    setShowGenerateModal(false)
    setNewKeySecret('')
    setNewKeyName('')
  }

  const handleRevoke = async (keyId: string) => {
    if (!confirm('Revoke this API key? Any application using this credential will immediately lose access to SentinelSOC.')) return
    
    try {
      await applicationsApi.revokeApiKey(id, keyId, false)
      setApiKeys(prev => prev.map(k => k.id === keyId ? { ...k, is_active: false } : k))
    } catch (e: any) {
      alert(e.message || 'Failed to revoke API key')
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="space-y-6">
        <Link href="/applications" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Applications
        </Link>
        <div className="rounded-xl border border-critical/30 bg-critical/10 p-6 text-center shadow-sm">
          <AlertTriangle className="mx-auto h-10 w-10 text-critical mb-3" />
          <h2 className="text-lg font-semibold text-foreground">Application Not Found</h2>
          <p className="mt-1 text-sm text-critical/80">{error || 'The requested application does not exist or you do not have access.'}</p>
          <button onClick={() => router.push('/applications')} className="mt-4 rounded-lg bg-critical px-4 py-2 text-sm font-medium text-white hover:bg-critical/90 transition-colors">
            Return to Directory
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl relative pb-10 animate-in fade-in duration-500">
      <Link href="/applications" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-secondary/50 px-3 py-1.5 rounded-md border border-border/50">
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Applications
      </Link>

      <div className="flex items-start justify-between gap-4 glass-panel p-6">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-inner">
            <Database className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{application.name}</h1>
            <div className="mt-1.5 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="font-mono bg-secondary px-2 py-0.5 rounded text-xs border border-border">{application.slug}</span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span className="flex items-center gap-1.5"><Activity className="h-3.5 w-3.5" /> {application.owner_name}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
            application.environment === 'PRODUCTION' ? 'bg-primary/10 text-primary border border-primary/20' :
            application.environment === 'STAGING' ? 'bg-warning/10 text-warning border border-warning/20' :
            'bg-secondary text-muted-foreground border border-border'
          }`}>
            {application.environment}
          </span>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
            application.status === 'ACTIVE' ? 'bg-success/10 text-success border border-success/20' :
            application.status === 'INACTIVE' ? 'bg-secondary text-muted-foreground border border-border' :
            'bg-critical/10 text-critical border border-critical/20'
          }`}>
            {application.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="space-y-6 md:col-span-1">
          <div className="glass-panel p-6">
            <h3 className="text-base font-semibold text-foreground mb-6 flex items-center gap-2 border-b border-border/50 pb-4">
              <Activity className="h-4 w-4 text-primary" />
              Application Details
            </h3>
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Description</p>
                <p className="text-sm text-foreground/90 leading-relaxed">{application.description || 'No description provided.'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Application ID</p>
                <p className="text-sm text-muted-foreground font-mono bg-secondary/50 px-2 py-1 rounded border border-border/50 inline-block">{application.id}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Registered On</p>
                  <p className="text-xs text-foreground/80">{new Date(application.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Last Updated</p>
                  <p className="text-xs text-foreground/80">{new Date(application.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Integrations */}
        <div className="space-y-6 md:col-span-2">
          <div className="glass-panel overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Code className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Integration</h3>
              </div>
              {canManage && (
                <button
                  onClick={() => setShowGenerateModal(true)}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 shadow-sm transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Generate API Key
                </button>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b border-border/50 pb-3 mb-4">
                <Key className="h-4 w-4 text-primary" />
                Active Credentials
              </div>

              {apiKeys.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-secondary/30 rounded-lg border border-dashed border-border/50">
                  <Key className="h-8 w-8 mb-3 opacity-50" />
                  <span className="text-sm font-medium">No API keys generated yet.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {apiKeys.map(key => {
                    const isExpired = key.expires_at && new Date(key.expires_at) < new Date()
                    let statusLabel = key.is_active ? 'Active' : 'Revoked'
                    let statusClass = key.is_active ? 'bg-success/10 text-success border-success/20' : 'bg-critical/10 text-critical border-critical/20'
                    
                    if (key.is_active && isExpired) {
                      statusLabel = 'Expired'
                      statusClass = 'bg-warning/10 text-warning border-warning/20'
                    }

                    return (
                      <div key={key.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border bg-card shadow-sm group hover:border-primary/50 transition-colors gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-foreground text-sm">{key.name}</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusClass}`}>
                              {statusLabel}
                            </span>
                          </div>
                          <div className="font-mono text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded inline-block border border-border/50">
                            {key.key_prefix}<span className="tracking-widest">••••••••••••</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground mt-1">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Clock className="h-3 w-3" />
                              Created {new Date(key.created_at).toLocaleDateString()}
                            </span>
                            <span className="text-border">•</span>
                            {key.last_used_at ? (
                              <span className="font-medium text-foreground/70 flex items-center gap-1.5">
                                <Activity className="h-3 w-3" />
                                Last used {new Date(key.last_used_at).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="italic text-muted-foreground/70">Never used</span>
                            )}
                          </div>
                        </div>
                        {canManage && key.is_active && !isExpired && (
                          <button
                            onClick={() => handleRevoke(key.id)}
                            className="p-2.5 text-muted-foreground hover:text-critical hover:bg-critical/10 rounded-md transition-colors border border-transparent hover:border-critical/20"
                            title="Revoke API Key"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            {!newKeySecret ? (
              <>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Generate API Key</h3>
                </div>
                <form onSubmit={handleGenerateKey} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Key Name</label>
                    <input
                      type="text"
                      required
                      value={newKeyName}
                      onChange={e => setNewKeyName(e.target.value)}
                      placeholder="e.g. Production Backend"
                      className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Choose a descriptive name to easily identify this key later.</p>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowGenerateModal(false)}
                      className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={generating || !newKeyName.trim()}
                      className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      Generate Key
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="animate-in fade-in duration-300">
                <div className="text-center mb-6">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 border border-success/20 mb-4 shadow-sm">
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">API Key Created</h3>
                </div>

                <div className="rounded-lg bg-warning/10 border border-warning/20 p-4 mb-6 shadow-sm">
                  <div className="flex gap-3 items-start">
                    <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                    <p className="text-sm text-warning font-medium leading-relaxed">
                      This key will only be shown once. Please copy it now and store it securely. You will not be able to see it again.
                    </p>
                  </div>
                </div>

                <div className="relative mb-8 group">
                  <div className="w-full rounded-md border border-border bg-secondary/50 p-4 pr-12 font-mono text-sm text-foreground break-all shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent pointer-events-none" />
                    {newKeySecret}
                  </div>
                  <button
                    onClick={handleCopySecret}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors border border-transparent group-hover:border-border/50"
                    title="Copy to clipboard"
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                <button
                  onClick={closeSecretModal}
                  className="w-full rounded-md bg-secondary border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary/80 transition-colors shadow-sm"
                >
                  I have saved this key safely
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
