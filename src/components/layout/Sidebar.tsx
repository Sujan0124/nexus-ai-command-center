import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  GitFork, 
  BarChart2, 
  Clock, 
  Users, 
  Settings, 
  Bell, 
  Zap, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  onCloseMobile,
}) => {
  const { unreadNotificationsCount } = useAppData();
  const { user } = useAuth();

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'AI Workflows', path: '/workflows', icon: GitFork },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Activity', path: '/activity', icon: Clock },
    { name: 'Team', path: '/team', icon: Users },
    { 
      name: 'Notifications', 
      path: '/notifications', 
      icon: Bell, 
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined 
    },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative flex flex-col h-screen bg-nexus-surface border-r border-nexus-border transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-nexus-border">
        <NavLink
          to="/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-3 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 p-0.5 shadow-nexus-glow shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-nexus-base rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold tracking-wider text-base gradient-text leading-none">
                NEXUS
              </span>
              <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase mt-0.5">
                AI COMMAND
              </span>
            </div>
          )}
        </NavLink>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 text-nexus-text-dim hover:text-nexus-text hover:bg-nexus-elevated rounded-lg transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5" aria-label="Main Navigation">
        {navigationItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/30'
                    : 'text-nexus-text-muted hover:text-nexus-text hover:bg-nexus-elevated border border-transparent'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" />
              {!isCollapsed && <span className="truncate">{item.name}</span>}

              {/* Badge if available */}
              {item.badge !== undefined && (
                <span
                  className={`flex items-center justify-center font-bold text-[11px] rounded-full bg-indigo-500 text-white shrink-0 ${
                    isCollapsed
                      ? 'absolute -top-1 -right-1 w-4 h-4 text-[9px]'
                      : 'ml-auto px-2 py-0.5'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* System Status / Engine Telemetry */}
      {!isCollapsed && (
        <div className="px-4 py-3 mx-3 mb-3 rounded-xl bg-nexus-base border border-nexus-border text-xs">
          <div className="flex items-center justify-between text-[11px] text-nexus-text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 status-ring-pulse" />
              Core Engine
            </span>
            <span className="font-mono text-emerald-400">NOMINAL</span>
          </div>
          <p className="text-[10px] text-nexus-text-dim mt-1.5 leading-relaxed">
            Deterministic local AI runner active. Zero API latency bottlenecks.
          </p>
        </div>
      )}

      {/* User Footer Profile */}
      <div className="p-3 border-t border-nexus-border">
        <NavLink
          to="/settings"
          onClick={onCloseMobile}
          className={`flex items-center gap-3 p-2 rounded-xl hover:bg-nexus-elevated transition-colors text-nexus-text ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? user?.name : undefined}
        >
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={user?.name || 'User avatar'}
            className="w-9 h-9 rounded-xl object-cover border border-nexus-border shrink-0"
          />
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-nexus-text truncate">{user?.name}</span>
              <span className="text-[10px] text-indigo-400 font-medium truncate flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-indigo-400 shrink-0" />
                {user?.role} · {user?.workspaceName.split(' ')[0]}
              </span>
            </div>
          )}
        </NavLink>
      </div>
    </aside>
  );
};
