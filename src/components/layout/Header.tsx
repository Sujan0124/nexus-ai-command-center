import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Menu, 
  Plus, 
  LogOut, 
  User, 
  Settings, 
  Shield, 
  CheckCheck,
  Radio,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../common/Button';

interface HeaderProps {
  onOpenCommandPalette: () => void;
  onToggleMobileMenu: () => void;
  onOpenProjectModal: () => void;
  onOpenWorkflowModal: () => void;
  onOpenTour?: () => void;
  onOpenWebhookSimulator?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCommandPalette,
  onToggleMobileMenu,
  onOpenProjectModal,
  onOpenWorkflowModal,
  onOpenTour,
  onOpenWebhookSimulator,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { unreadNotificationsCount, notifications, markAllNotificationsRead } = useAppData();
  const { theme, toggleTheme } = useTheme();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showNotifPreview, setShowNotifPreview] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const quickMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setShowNotifPreview(false);
      }
      if (quickMenuRef.current && !quickMenuRef.current.contains(e.target as Node)) {
        setShowQuickCreate(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format breadcrumb based on current path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const pageTitle = pathParts.length > 0 
    ? pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1)
    : 'Dashboard';

  const unreadItems = notifications.filter(n => !n.read).slice(0, 5);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 sm:px-6 bg-nexus-surface/90 backdrop-blur-md border-b border-nexus-border">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-nexus-text-muted hover:text-nexus-text hover:bg-nexus-elevated rounded-lg"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-nexus-text">{pageTitle}</span>
          {pathParts.length > 1 && (
            <>
              <span className="text-nexus-text-dim">/</span>
              <span className="text-nexus-text-muted font-mono text-xs">{pathParts[1]}</span>
            </>
          )}
        </div>
      </div>

      {/* Middle: Command Palette Quick Trigger */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-nexus-base border border-nexus-border hover:border-nexus-border-bright text-nexus-text-muted hover:text-nexus-text transition-all text-xs shadow-inner"
        >
          <span className="flex items-center gap-2">
            <Search className="w-4 h-4 text-nexus-text-dim" />
            <span>Search projects, workflows, commands...</span>
          </span>
          <kbd className="px-2 py-0.5 font-mono text-[11px] text-nexus-text-dim bg-nexus-elevated border border-nexus-border rounded">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Theme, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick New Dropdown */}
        <div className="relative" ref={quickMenuRef}>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowQuickCreate(!showQuickCreate)}
          >
            <span className="hidden sm:inline">New</span>
          </Button>

          {showQuickCreate && (
            <div className="absolute right-0 mt-2 w-48 bg-nexus-surface border border-nexus-border-bright rounded-xl shadow-nexus-elevated py-1 z-30">
              <button
                onClick={() => {
                  setShowQuickCreate(false);
                  onOpenProjectModal();
                }}
                className="w-full text-left px-4 py-2.5 text-xs text-nexus-text hover:bg-nexus-elevated flex items-center gap-2.5 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>New Project</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickCreate(false);
                  onOpenWorkflowModal();
                }}
                className="w-full text-left px-4 py-2.5 text-xs text-nexus-text hover:bg-nexus-elevated flex items-center gap-2.5 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-violet-400" />
                <span>New AI Workflow</span>
              </button>
              {onOpenWebhookSimulator && (
                <button
                  onClick={() => {
                    setShowQuickCreate(false);
                    onOpenWebhookSimulator();
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-nexus-text hover:bg-nexus-elevated flex items-center gap-2.5 transition-colors border-t border-nexus-border"
                >
                  <Radio className="w-3.5 h-3.5 text-amber-400" />
                  <span>Simulate Webhook Event</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Onboarding Tour Trigger */}
        {onOpenTour && (
          <button
            onClick={onOpenTour}
            className="p-2 text-nexus-text-muted hover:text-indigo-400 hover:bg-nexus-elevated rounded-xl border border-transparent hover:border-nexus-border transition-colors hidden sm:flex items-center gap-1.5 text-xs font-medium"
            aria-label="Start feature tour"
            title="Interactive feature tour"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline">Tour</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 text-nexus-text-muted hover:text-nexus-text hover:bg-nexus-elevated rounded-xl border border-transparent hover:border-nexus-border transition-colors"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Notifications Dropdown Preview */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => setShowNotifPreview(!showNotifPreview)}
            className="relative p-2 text-nexus-text-muted hover:text-nexus-text hover:bg-nexus-elevated rounded-xl border border-transparent hover:border-nexus-border transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 status-ring-pulse" />
            )}
          </button>

          {showNotifPreview && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-nexus-surface border border-nexus-border-bright rounded-2xl shadow-nexus-elevated z-30 overflow-hidden">
              <div className="flex items-center justify-between p-3.5 border-b border-nexus-border bg-nexus-base/50">
                <span className="text-xs font-semibold text-nexus-text">Notifications</span>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={() => markAllNotificationsRead()}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-nexus-border">
                {unreadItems.length === 0 ? (
                  <div className="p-6 text-center text-xs text-nexus-text-muted">
                    No unread notifications. All caught up!
                  </div>
                ) : (
                  unreadItems.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setShowNotifPreview(false);
                        if (n.targetUrl) navigate(n.targetUrl);
                        else navigate('/notifications');
                      }}
                      className="p-3 hover:bg-nexus-elevated cursor-pointer transition-colors text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-nexus-text truncate">{n.title}</span>
                        <span className="text-[10px] text-nexus-text-dim">Just now</span>
                      </div>
                      <p className="text-nexus-text-muted mt-1 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-nexus-border bg-nexus-base/50 text-center">
                <button
                  onClick={() => {
                    setShowNotifPreview(false);
                    navigate('/notifications');
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  View all notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-nexus-elevated border border-transparent hover:border-nexus-border transition-colors"
            aria-label="User profile menu"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-lg object-cover border border-nexus-border"
            />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-nexus-surface border border-nexus-border-bright rounded-2xl shadow-nexus-elevated py-1.5 z-30">
              <div className="px-4 py-3 border-b border-nexus-border">
                <p className="text-xs font-semibold text-nexus-text truncate">{user?.name}</p>
                <p className="text-[11px] text-nexus-text-dim truncate">{user?.email}</p>
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                  <Shield className="w-3 h-3" />
                  {user?.role} · {user?.workspaceName}
                </div>
              </div>

              <button
                onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                className="w-full text-left px-4 py-2 text-xs text-nexus-text hover:bg-nexus-elevated flex items-center gap-2.5 transition-colors"
              >
                <User className="w-4 h-4 text-nexus-text-dim" />
                <span>Profile & Account</span>
              </button>

              <button
                onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                className="w-full text-left px-4 py-2 text-xs text-nexus-text hover:bg-nexus-elevated flex items-center gap-2.5 transition-colors"
              >
                <Settings className="w-4 h-4 text-nexus-text-dim" />
                <span>Preferences</span>
              </button>

              {onOpenTour && (
                <button
                  onClick={() => { setShowUserMenu(false); onOpenTour(); }}
                  className="w-full text-left px-4 py-2 text-xs text-indigo-300 hover:bg-nexus-elevated flex items-center gap-2.5 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Feature Tour</span>
                </button>
              )}

              <div className="border-t border-nexus-border my-1" />

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
