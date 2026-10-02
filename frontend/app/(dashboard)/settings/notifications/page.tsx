"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { getNotificationPreferences, updateNotificationPreferences } from "@/lib/api/notifications";
import { NotificationPreferenceUpdate } from "@/lib/types/notification";
import { Loader2, Bell, Save, CheckCircle2, AlertTriangle } from "lucide-react";

export default function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState<NotificationPreferenceUpdate>({
    notify_on_critical_alerts: true,
    notify_on_high_risk: true,
    notify_on_incident_assigned: true,
    notify_on_incident_created: true,
    notify_on_incident_escalated: true,
    notify_on_response_failure: true,
    notify_on_ml_anomaly: true,
    notify_on_ti_match: true,
    receive_emails: false,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const prefs = await getNotificationPreferences();
        setPreferences({
          notify_on_critical_alerts: prefs.notify_on_critical_alerts,
          notify_on_high_risk: prefs.notify_on_high_risk,
          notify_on_incident_assigned: prefs.notify_on_incident_assigned,
          notify_on_incident_created: prefs.notify_on_incident_created,
          notify_on_incident_escalated: prefs.notify_on_incident_escalated,
          notify_on_response_failure: prefs.notify_on_response_failure,
          notify_on_ml_anomaly: prefs.notify_on_ml_anomaly,
          notify_on_ti_match: prefs.notify_on_ti_match,
          receive_emails: prefs.receive_emails,
        });
      } catch (e) {
        console.error("Failed to load preferences:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, []);

  const handleChange = (key: keyof NotificationPreferenceUpdate, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      await updateNotificationPreferences(preferences);
      setMessage({ type: 'success', text: 'Preferences saved successfully.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      console.error("Failed to save preferences:", e);
      setMessage({ type: 'error', text: 'Failed to save preferences.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-muted-foreground glass-panel max-w-4xl">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-sm font-medium">Loading preferences...</p>
      </div>
    );
  }

  const sections = [
    {
      title: "Alert & Detection Settings",
      description: "Get notified when important security alerts are generated.",
      items: [
        { key: 'notify_on_critical_alerts', label: 'Critical Alerts', desc: 'Alerts scored 75+ or manually marked as Critical' },
        { key: 'notify_on_high_risk', label: 'High Risk Alerts', desc: 'Alerts scored 50-74' },
        { key: 'notify_on_ml_anomaly', label: 'ML Anomalies', desc: 'Anomalous behavior detected by machine learning' },
        { key: 'notify_on_ti_match', label: 'Threat Intel Matches', desc: 'Known malicious indicators observed in your environment' },
      ]
    },
    {
      title: "Incident Workflow Settings",
      description: "Get notified about incident assignments and escalations.",
      items: [
        { key: 'notify_on_incident_created', label: 'Incident Created', desc: 'When a new incident is created manually or automatically' },
        { key: 'notify_on_incident_assigned', label: 'Incident Assigned', desc: 'When an incident is assigned to you' },
        { key: 'notify_on_incident_escalated', label: 'Incident Escalated', desc: 'When an incident severity is increased' },
      ]
    },
    {
      title: "Response & Automation Settings",
      description: "Get notified about automated response actions.",
      items: [
        { key: 'notify_on_response_failure', label: 'Response Action Failed', desc: 'When an automated or manual response action fails to execute' },
      ]
    },
    {
      title: "Delivery Settings",
      description: "How you want to receive notifications.",
      items: [
        { key: 'receive_emails', label: 'Receive Emails', desc: 'Send a copy of notifications to your email address' },
      ]
    }
  ];

  return (
    <div className="max-w-4xl space-y-8 pb-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
          <Bell className="h-6 w-6 text-primary" />
        </div>
        <PageHeader 
          title="Notification Preferences" 
          description="Manage how and when you receive security notifications."
        />
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 shadow-sm animate-in slide-in-from-top-2 ${
          message.type === 'success' 
            ? 'bg-success/10 text-success border border-success/20' 
            : 'bg-critical/10 text-critical border border-critical/20'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <div className="space-y-8">
        {sections.map((section, idx) => (
          <div key={idx} className="glass-panel overflow-hidden">
            <div className="border-b border-border px-6 py-5 bg-secondary/30 relative">
              <div className="absolute inset-y-0 left-0 w-1 bg-primary/50" />
              <h3 className="text-base font-semibold text-foreground">{section.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
            </div>
            <div className="divide-y divide-border p-2">
              {section.items.map((item) => (
                <div key={item.key} className="flex items-center justify-between px-4 py-4 hover:bg-secondary/30 rounded-lg transition-colors group">
                  <div className="flex flex-col pr-8">
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{item.label}</span>
                    <span className="text-sm text-muted-foreground mt-1">{item.desc}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={preferences[item.key as keyof NotificationPreferenceUpdate] as boolean}
                      onChange={(e) => handleChange(item.key as keyof NotificationPreferenceUpdate, e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-secondary border border-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-foreground after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:border-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-6 border-t border-border mt-10">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 transition-all hover:shadow-primary/20 hover:shadow-lg"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}
