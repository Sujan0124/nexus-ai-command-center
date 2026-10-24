import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  FolderKanban, 
  GitFork, 
  BarChart2, 
  Users, 
  Settings as SettingsIcon, 
  Bell, 
  Sun, 
  Moon, 
  Plus, 
  Clock, 
  CheckCheck, 
  RotateCcw,
  LayoutDashboard,
  Radio,
  Sparkles
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProjectModal?: () => void;
  onOpenWorkflowModal?: () => void;
  onOpenTour?: () => void;
  onOpenWebhookSimulator?: () => void;
}

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Projects' | 'Workflows' | 'Quick Actions';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenProjectModal,
  onOpenWorkflowModal,
  onOpenTour,
  onOpenWebhookSimulator,
}) => {
  const navigate = useNavigate();
  const { projects, workflows, markAllNotificationsRead, resetToDemoData } = useAppData();
  const { theme, toggleTheme } = useTheme();
  const { success } = useToast();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Construct command list
  const baseCommands: CommandItem[] = [
    // Navigation
    {
      id: 'nav_dash',
      category: 'Navigation',
      title: 'Dashboard',
      subtitle: 'System overview, KPIs, and live charts',
      icon: <LayoutDashboard className="w-4 h-4 text-indigo-400" />,
      action: () => { navigate('/dashboard'); onClose(); },
    },
    {
      id: 'nav_proj',
      category: 'Navigation',
      title: 'Projects',
      subtitle: 'Manage all engineering and AI projects',
      icon: <FolderKanban className="w-4 h-4 text-cyan-400" />,
      action: () => { navigate('/projects'); onClose(); },
    },
    {
      id: 'nav_wf',
      category: 'Navigation',
      title: 'AI Workflows',
      subtitle: 'Visual orchestration pipelines and execution runner',
      icon: <GitFork className="w-4 h-4 text-violet-400" />,
      action: () => { navigate('/workflows'); onClose(); },
    },
    {
      id: 'nav_analytics',
      category: 'Navigation',
      title: 'Analytics & Reporting',
      subtitle: 'Telemetry trends, metrics, and CSV export',
      icon: <BarChart2 className="w-4 h-4 text-emerald-400" />,
      action: () => { navigate('/analytics'); onClose(); },
    },
    {
      id: 'nav_act',
      category: 'Navigation',
      title: 'Activity Feed',
      subtitle: 'Audit log and real-time event timeline',
      icon: <Clock className="w-4 h-4 text-amber-400" />,
      action: () => { navigate('/activity'); onClose(); },
    },
    {
      id: 'nav_team',
      category: 'Navigation',
      title: 'Team Members',
      subtitle: 'Manage roles and workspace permissions',
      icon: <Users className="w-4 h-4 text-blue-400" />,
      action: () => { navigate('/team'); onClose(); },
    },
    {
      id: 'nav_notif',
      category: 'Navigation',
      title: 'Notifications Center',
      subtitle: 'Alerts, security findings, and reminders',
      icon: <Bell className="w-4 h-4 text-rose-400" />,
      action: () => { navigate('/notifications'); onClose(); },
    },
    {
      id: 'nav_sett',
      category: 'Navigation',
      title: 'Settings',
      subtitle: 'Profile, appearance, preferences, and data reset',
      icon: <SettingsIcon className="w-4 h-4 text-slate-400" />,
      action: () => { navigate('/settings'); onClose(); },
    },

    // Quick Actions
    {
      id: 'act_theme',
      category: 'Quick Actions',
      title: `Toggle Theme (Current: ${theme === 'dark' ? 'Dark' : 'Light'})`,
      subtitle: 'Switch between Dark and Light mode',
      icon: theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />,
      action: () => { toggleTheme(); onClose(); },
    },
    {
      id: 'act_new_proj',
      category: 'Quick Actions',
      title: 'Create New Project',
      subtitle: 'Open project initialization dialog',
      icon: <Plus className="w-4 h-4 text-indigo-400" />,
      action: () => {
        onClose();
        if (onOpenProjectModal) onOpenProjectModal();
        else navigate('/projects?create=true');
      },
    },
    {
      id: 'act_new_wf',
      category: 'Quick Actions',
      title: 'Create AI Workflow',
      subtitle: 'Open visual workflow builder',
      icon: <Plus className="w-4 h-4 text-cyan-400" />,
      action: () => {
        onClose();
        if (onOpenWorkflowModal) onOpenWorkflowModal();
        else navigate('/workflows?create=true');
      },
    },
    {
      id: 'act_read_all',
      category: 'Quick Actions',
      title: 'Mark All Notifications as Read',
      subtitle: 'Clear all unread notification badges',
      icon: <CheckCheck className="w-4 h-4 text-emerald-400" />,
      action: () => { markAllNotificationsRead(); success('All notifications marked as read.'); onClose(); },
    },
    {
      id: 'act_webhook_sim',
      category: 'Quick Actions',
      title: 'Open Mock Webhook Simulator',
      subtitle: 'Simulate inbound HTTP POST events and payloads',
      icon: <Radio className="w-4 h-4 text-amber-400" />,
      action: () => {
        onClose();
        if (onOpenWebhookSimulator) onOpenWebhookSimulator();
        else navigate('/workflows');
      },
    },
    {
      id: 'act_tour',
      category: 'Quick Actions',
      title: 'Start Product Onboarding Tour',
      subtitle: 'Interactive walk-through of NEXUS capabilities',
      icon: <Sparkles className="w-4 h-4 text-violet-400" />,
      action: () => {
        onClose();
        if (onOpenTour) onOpenTour();
      },
    },
    {
      id: 'act_reset_demo',
      category: 'Quick Actions',
      title: 'Reset Demo Data to Initial State',
      subtitle: 'Restores deterministic seed data',
      icon: <RotateCcw className="w-4 h-4 text-rose-400" />,
      action: () => { resetToDemoData(); success('Demo data reset to initial baseline.'); onClose(); },
    },
  ];

  // Dynamic Project results
  const projectCommands: CommandItem[] = projects.map(p => ({
    id: `p_${p.id}`,
    category: 'Projects',
    title: p.name,
    subtitle: `${p.status} · ${p.progress}% complete · Owner: ${p.owner}`,
    icon: <FolderKanban className="w-4 h-4 text-cyan-400" />,
    action: () => { navigate(`/projects/${p.id}`); onClose(); },
  }));

  // Dynamic Workflow results
  const workflowCommands: CommandItem[] = workflows.map(w => ({
    id: `wf_${w.id}`,
    category: 'Workflows',
    title: w.name,
    subtitle: `${w.trigger} trigger · ${w.steps.length} steps · ${w.successRate}% success rate`,
    icon: <GitFork className="w-4 h-4 text-violet-400" />,
    action: () => { navigate(`/workflows/${w.id}`); onClose(); },
  }));

  const allCommands = [...baseCommands, ...projectCommands, ...workflowCommands];

  const filteredCommands = query.trim() === ''
    ? baseCommands
    : allCommands.filter(c => 
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        (c.subtitle && c.subtitle.toLowerCase().includes(query.toLowerCase())) ||
        c.category.toLowerCase().includes(query.toLowerCase())
      );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filteredCommands.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-150"
        aria-hidden="true"
      />

      {/* Palette Surface */}
      <div
        className="relative w-full max-w-2xl bg-nexus-surface border border-nexus-border-bright rounded-2xl shadow-nexus-elevated z-10 overflow-hidden transform transition-all"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-nexus-border gap-3">
          <Search className="w-5 h-5 text-nexus-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, project, workflow, or shortcut..."
            className="w-full bg-transparent text-nexus-text placeholder-nexus-text-dim text-sm sm:text-base focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono text-nexus-text-dim bg-nexus-elevated border border-nexus-border rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-sm text-nexus-text-muted">
              No matching commands, projects, or workflows found for "{query}".
            </div>
          ) : (
            filteredCommands.map((command, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={command.id}
                  onClick={() => command.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-indigo-600/15 border border-indigo-500/30' : 'hover:bg-nexus-elevated border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-nexus-elevated border border-nexus-border shrink-0">
                      {command.icon}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${isSelected ? 'text-indigo-300 font-semibold' : 'text-nexus-text'}`}>
                        {command.title}
                      </p>
                      {command.subtitle && (
                        <p className="text-xs text-nexus-text-dim truncate">{command.subtitle}</p>
                      )}
                    </div>
                  </div>

                  <span className="shrink-0 text-[10px] font-mono uppercase tracking-wider text-nexus-text-dim px-2 py-0.5 rounded bg-nexus-elevated border border-nexus-border ml-2">
                    {command.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-nexus-base border-t border-nexus-border text-[11px] text-nexus-text-dim">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Dismiss</span>
          </div>
          <span>NEXUS AI Omnisearch</span>
        </div>
      </div>
    </div>
  );
};
