import React, { useState } from 'react';
import { 
  User, 
  Moon, 
  Sun, 
  Building, 
  Bell, 
  Database, 
  Download, 
  RotateCcw, 
  Save, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useToast } from '../context/ToastContext';

export const Settings: React.FC = () => {
  const { settings, updateSettings, resetToDemoData, exportAllDataJson } = useAppData();
  const { theme, toggleTheme, setTheme } = useTheme();
  const { user, updateUser } = useAuth();
  const { success } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'workspace' | 'preferences' | 'data'>('profile');

  // Profile fields
  const [profileName, setProfileName] = useState(user?.name || settings.profile.name);
  const [profileEmail, setProfileEmail] = useState(user?.email || settings.profile.email);
  const [profileTitle, setProfileTitle] = useState(settings.profile.jobTitle || 'Principal Systems Architect');
  const [profileTz, setProfileTz] = useState(settings.profile.timezone || 'UTC+00:00 (London, Dublin)');

  // Workspace fields
  const [workspaceName, setWorkspaceName] = useState(user?.workspaceName || settings.profile.workspaceName);

  // Notifications
  const [emailAlerts, setEmailAlerts] = useState(settings.notifications.emailAlerts);
  const [workflowFailures, setWorkflowFailures] = useState(settings.notifications.workflowFailures);
  const [taskAssignments, setTaskAssignments] = useState(settings.notifications.taskAssignments);

  // Reset demo dialog
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name: profileName, email: profileEmail });
    updateSettings({
      profile: {
        ...settings.profile,
        name: profileName,
        email: profileEmail,
        jobTitle: profileTitle,
        timezone: profileTz,
      }
    });
    success('Profile Updated', 'User profile preferences successfully saved.');
  };

  const handleSaveWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ workspaceName });
    updateSettings({
      profile: {
        ...settings.profile,
        workspaceName,
      }
    });
    success('Workspace Updated', `Organization name updated to "${workspaceName}".`);
  };

  const handleSaveNotifications = () => {
    updateSettings({
      notifications: {
        ...settings.notifications,
        emailAlerts,
        workflowFailures,
        taskAssignments,
      }
    });
    success('Notification Preferences Saved');
  };

  const handleExportData = () => {
    const jsonStr = exportAllDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-workspace-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    success('Backup Exported', 'Full workspace JSON state downloaded.');
  };

  const handleResetConfirm = () => {
    resetToDemoData();
    setIsResetConfirmOpen(false);
    success('Data Reset Completed', 'Restored deterministic initial baseline for all modules.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-nexus-border">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-nexus-text">
          Workspace Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-nexus-text-muted mt-1">
          Configure personal preferences, theme aesthetics, telemetry alerts, and data state.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-nexus-surface border border-nexus-border">
        {[
          { key: 'profile', label: 'Profile', icon: User },
          { key: 'appearance', label: 'Appearance', icon: theme === 'dark' ? Moon : Sun },
          { key: 'workspace', label: 'Workspace', icon: Building },
          { key: 'preferences', label: 'Notifications', icon: Bell },
          { key: 'data', label: 'Data Management', icon: Database },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-nexus-elevated text-nexus-text shadow-sm'
                  : 'text-nexus-text-dim hover:text-nexus-text'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-nexus-surface border border-nexus-border rounded-2xl p-6 shadow-sm max-w-3xl">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <h2 className="text-base font-semibold text-nexus-text">Personal Profile Details</h2>
            <p className="text-xs text-nexus-text-muted">
              Displayed on task assignments, comments, and audit trail events.
            </p>

            <div className="flex items-center gap-4 py-2">
              <img
                src={user?.avatar || settings.profile.avatar}
                alt="Avatar"
                className="w-16 h-16 rounded-2xl object-cover border border-nexus-border shadow-sm"
              />
              <div>
                <Button size="sm" variant="outline" type="button" onClick={() => success('Avatar synced with profile')}>
                  Change Avatar
                </Button>
                <p className="text-[11px] text-nexus-text-dim mt-1">JPG or PNG. Max size 2MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-nexus-text mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border text-xs sm:text-sm text-nexus-text focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-nexus-text mb-1">Email Address</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={e => setProfileEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border text-xs sm:text-sm text-nexus-text focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-nexus-text mb-1">Job Title</label>
                <input
                  type="text"
                  value={profileTitle}
                  onChange={e => setProfileTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border text-xs sm:text-sm text-nexus-text focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-nexus-text mb-1">Timezone</label>
                <input
                  type="text"
                  value={profileTz}
                  onChange={e => setProfileTz(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border text-xs sm:text-sm text-nexus-text focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-nexus-border flex justify-end">
              <Button size="sm" variant="primary" type="submit" leftIcon={<Save className="w-3.5 h-3.5" />}>
                Save Profile
              </Button>
            </div>
          </form>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-nexus-text">Visual Interface Theme</h2>
              <p className="text-xs text-nexus-text-muted mt-0.5">
                Toggle between dark charcoal theme and crisp high-contrast light theme.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Dark Option */}
              <div
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  theme === 'dark'
                    ? 'bg-nexus-elevated border-indigo-500 shadow-nexus-glow ring-1 ring-indigo-500'
                    : 'bg-nexus-base border-nexus-border hover:border-nexus-border-bright'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-nexus-text">Dark Command Mode (Default)</span>
                  </div>
                  {theme === 'dark' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                </div>
                <p className="text-[11px] text-nexus-text-dim">
                  Optimized for low-light engineering environments (#090B10 base with electric violet accents).
                </p>
              </div>

              {/* Light Option */}
              <div
                onClick={() => setTheme('light')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  theme === 'light'
                    ? 'bg-white border-indigo-500 shadow-sm ring-1 ring-indigo-500 text-slate-900'
                    : 'bg-nexus-base border-nexus-border hover:border-nexus-border-bright'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold">Light Contrast Mode</span>
                  </div>
                  {theme === 'light' && <CheckCircle2 className="w-4 h-4 text-indigo-500" />}
                </div>
                <p className="text-[11px] text-slate-500">
                  High-readability daylight palette for office displays and presentations.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-nexus-base border border-nexus-border text-xs text-nexus-text-dim">
              Theme preferences persist in browser storage and apply consistently across all charts, menus, and modals.
            </div>
          </div>
        )}

        {/* Workspace Tab */}
        {activeTab === 'workspace' && (
          <form onSubmit={handleSaveWorkspace} className="space-y-4">
            <h2 className="text-base font-semibold text-nexus-text">Organization Workspace</h2>
            <p className="text-xs text-nexus-text-muted">
              Configure workspace name, billing tier, and tenant domain.
            </p>

            <div>
              <label className="block text-xs font-semibold text-nexus-text mb-1">Workspace Title</label>
              <input
                type="text"
                value={workspaceName}
                onChange={e => setWorkspaceName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border text-xs sm:text-sm text-nexus-text focus:outline-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-nexus-base border border-nexus-border text-xs space-y-1">
              <div className="flex justify-between text-nexus-text-dim">
                <span>Deployment Tier:</span>
                <span className="font-semibold text-emerald-400">Enterprise AI Dedicated</span>
              </div>
              <div className="flex justify-between text-nexus-text-dim">
                <span>Active Region:</span>
                <span className="font-mono text-nexus-text">us-east-1 (Self-hosted Local)</span>
              </div>
            </div>

            <div className="pt-4 border-t border-nexus-border flex justify-end">
              <Button size="sm" variant="primary" type="submit" leftIcon={<Save className="w-3.5 h-3.5" />}>
                Save Workspace
              </Button>
            </div>
          </form>
        )}

        {/* Preferences / Notifications Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-nexus-text">Notification Channels</h2>
            <p className="text-xs text-nexus-text-muted">
              Choose which alerts trigger in-app notifications and email summaries.
            </p>

            <div className="space-y-3">
              {[
                {
                  label: 'Workflow Execution Failures',
                  desc: 'Receive immediate alerts whenever a pipeline step encounters a fatal exception.',
                  checked: workflowFailures,
                  setter: setWorkflowFailures,
                },
                {
                  label: 'Task Assignments & Due Dates',
                  desc: 'Notify when new tasks are assigned to your profile or due in under 24 hours.',
                  checked: taskAssignments,
                  setter: setTaskAssignments,
                },
                {
                  label: 'Weekly Architecture Digest',
                  desc: 'Summarize weekly throughput velocity, total time saved, and top pipelines.',
                  checked: emailAlerts,
                  setter: setEmailAlerts,
                },
              ].map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-nexus-base border border-nexus-border hover:border-nexus-border-bright cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={e => item.setter(e.target.checked)}
                    className="mt-1 rounded bg-nexus-surface border-nexus-border text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-xs font-semibold text-nexus-text">{item.label}</p>
                    <p className="text-[11px] text-nexus-text-dim">{item.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="pt-4 border-t border-nexus-border flex justify-end">
              <Button size="sm" variant="primary" onClick={handleSaveNotifications}>
                Save Preferences
              </Button>
            </div>
          </div>
        )}

        {/* Data Management Tab */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-nexus-text">Workspace Data & Persistence</h2>
              <p className="text-xs text-nexus-text-muted mt-0.5">
                Export full JSON backup or reset application state back to deterministic seed data.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-nexus-base border border-nexus-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-nexus-text">Export Full Application State</h3>
                  <p className="text-[11px] text-nexus-text-dim mt-0.5">
                    Download complete snapshot of projects, workflows, tasks, executions, and settings.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  onClick={handleExportData}
                >
                  Export JSON
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-rose-400">Restore Initial Demo Baseline</h3>
                  <p className="text-[11px] text-nexus-text-dim mt-0.5">
                    Resets all local modifications back to the original 8 projects, 12 workflows, and 30 activity events.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="danger"
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  onClick={() => setIsResetConfirmOpen(true)}
                >
                  Reset Demo
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetConfirm}
        title="Reset All Workspace Data?"
        message="This will overwrite current browser storage and restore the deterministic initial demo state. Continue?"
        confirmText="Reset to Initial Baseline"
        isDestructive={true}
      />
    </div>
  );
};
