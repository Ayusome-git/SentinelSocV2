"use client";

import { useState, useEffect } from "react";
import { Bell, Check, CheckCircle2, AlertTriangle, AlertCircle, Shield, BrainCircuit, ShieldAlert, Settings, Loader2 } from "lucide-react";
import Link from "next/link";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "@/lib/api/notifications";
import { Notification } from "@/lib/types/notification";
import { PageHeader } from "@/components/layout/PageHeader";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications(1, 100); // Fetch up to 100 on page
      setNotifications(res.items);
      setTotal(res.total);
    } catch (e) {
      console.error("Failed to fetch notifications:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const notif = await markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? notif : n));
    } catch (e) {
      console.error("Failed to mark as read:", e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      console.error("Failed to mark all as read:", e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'CRITICAL_ALERT':
        return <AlertTriangle className="h-5 w-5 text-critical" />;
      case 'HIGH_RISK_ALERT':
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case 'INCIDENT_CREATED':
      case 'INCIDENT_ESCALATED':
        return <ShieldAlert className="h-5 w-5 text-critical" />;
      case 'INCIDENT_ASSIGNED':
        return <Shield className="h-5 w-5 text-info" />;
      case 'RESPONSE_ACTION_FAILED':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'ML_ANOMALY_DETECTED':
        return <BrainCircuit className="h-5 w-5 text-primary" />;
      case 'THREAT_INTELLIGENCE_MATCH':
        return <ShieldAlert className="h-5 w-5 text-critical" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="Notifications" 
          description="View and manage your security notifications"
        />
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/settings/notifications"
            className="flex items-center justify-center gap-2 rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-secondary/80 transition-colors w-full sm:w-auto h-10"
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
            Preferences
          </Link>
          <button
            onClick={handleMarkAllRead}
            className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors w-full sm:w-auto h-10"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark all as read
          </button>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-sm font-medium">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground bg-secondary/30">
            <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4 border border-border/50">
              <Bell className="h-8 w-8 opacity-50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">All caught up</h3>
            <p className="text-sm">You have no unread notifications.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {notifications.map((notif) => (
              <li 
                key={notif.id} 
                className={`relative p-5 hover:bg-secondary/50 transition-colors flex gap-4 group ${
                  !notif.is_read ? 'bg-primary/5 before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-primary' : ''
                }`}
              >
                <div className="mt-1 flex-shrink-0 h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
                  {getIcon(notif.notification_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1 pr-4">
                      <h4 className={`text-sm ${!notif.is_read ? 'font-bold text-foreground' : 'font-semibold text-foreground/80'}`}>
                        {notif.title}
                      </h4>
                      <p className={`text-sm line-clamp-2 ${!notif.is_read ? 'text-foreground/90' : 'text-muted-foreground'}`}>
                        {notif.message}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                        {new Date(notif.created_at).toLocaleString(undefined, {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                      {!notif.is_read && (
                        <button
                          onClick={(e) => handleMarkRead(notif.id, e)}
                          className="text-muted-foreground hover:text-primary hover:bg-primary/10 p-1.5 rounded-md transition-colors z-20 relative opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Mark as read"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  {notif.link_path && (
                    <Link 
                      href={notif.link_path}
                      className="absolute inset-0 z-10"
                    >
                      <span className="sr-only">View notification details</span>
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
