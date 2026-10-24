import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  ShieldAlert, 
  FolderKanban, 
  GitFork, 
  Users, 
  Cpu, 
  CheckCircle2, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { NotificationCategory, NotificationItem } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead, 
    clearNotifications 
  } = useAppData();
  const { success } = useToast();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const matchesCategory = categoryFilter === 'ALL' || n.category === categoryFilter;
      const matchesRead = 
        readFilter === 'all' 
          ? true 
          : readFilter === 'unread' 
          ? !n.read 
          : n.read;

      return matchesCategory && matchesRead;
    });
  }, [notifications, categoryFilter, readFilter]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'workflow': return <GitFork className="w-4 h-4 text-violet-400" />;
      case 'project': return <FolderKanban className="w-4 h-4 text-cyan-400" />;
      case 'security': return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'team': return <Users className="w-4 h-4 text-blue-400" />;
      case 'system': return <Cpu className="w-4 h-4 text-amber-400" />;
      default: return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleItemClick = (item: NotificationItem) => {
    markNotificationRead(item.id);
    if (item.targetUrl) {
      navigate(item.targetUrl);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-nexus-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-nexus-text">
              Notifications Center
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500 text-white">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-nexus-text-muted mt-1">
            System milestones, vulnerability advisories, and pipeline execution alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              leftIcon={<CheckCheck className="w-4 h-4 text-indigo-400" />}
              onClick={() => {
                markAllNotificationsRead();
                success('All notifications marked as read.');
              }}
            >
              Mark All Read
            </Button>
          )}

          {notifications.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Trash2 className="w-4 h-4 text-nexus-text-dim" />}
              onClick={() => {
                clearNotifications();
                success('Notification list cleared.');
              }}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['ALL', 'workflow', 'project', 'security', 'team', 'system'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors capitalize ${
                categoryFilter === cat
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-nexus-surface text-nexus-text-dim hover:text-nexus-text border border-nexus-border'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        {/* Read / Unread Status */}
        <div className="flex items-center rounded-xl bg-nexus-surface border border-nexus-border p-1 text-xs">
          {(['all', 'unread', 'read'] as const).map(statusKey => (
            <button
              key={statusKey}
              onClick={() => setReadFilter(statusKey)}
              className={`px-3 py-1 rounded-lg font-medium capitalize transition-colors ${
                readFilter === statusKey
                  ? 'bg-nexus-elevated text-nexus-text shadow-sm'
                  : 'text-nexus-text-dim hover:text-nexus-text'
              }`}
            >
              {statusKey}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-6 h-6" />}
          title="No notifications to show"
          description="You are completely up to date. Alerts and findings will appear here."
        />
      ) : (
        <div className="bg-nexus-surface border border-nexus-border rounded-2xl shadow-sm divide-y divide-nexus-border overflow-hidden">
          {filteredNotifications.map(notif => {
            const isUnread = !notif.read;

            return (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`p-4 sm:p-5 flex items-start gap-4 cursor-pointer transition-colors ${
                  isUnread
                    ? 'bg-indigo-950/15 hover:bg-indigo-950/25 border-l-4 border-l-indigo-500'
                    : 'hover:bg-nexus-elevated/40'
                }`}
              >
                {/* Icon box */}
                <div className="w-9 h-9 rounded-xl bg-nexus-elevated border border-nexus-border flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  {getCategoryIcon(notif.category)}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-xs sm:text-sm ${isUnread ? 'font-bold text-nexus-text' : 'font-medium text-nexus-text'}`}>
                        {notif.title}
                      </h3>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-nexus-text-dim">
                      {new Date(notif.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-nexus-text-muted mt-1 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-nexus-text-dim">
                    <span className="capitalize font-mono px-2 py-0.5 rounded bg-nexus-base border border-nexus-border">
                      {notif.category}
                    </span>

                    {notif.targetUrl && (
                      <span className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                        <span>Inspect Resource</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
