import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from '../command/CommandPalette';
import { ProjectFormModal } from '../projects/ProjectFormModal';
import { WorkflowFormModal } from '../workflow/WorkflowFormModal';
import { ProductTour } from '../tour/ProductTour';
import { WebhookSimulatorModal } from '../workflow/WebhookSimulatorModal';

export const AppLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen bg-nexus-base text-nexus-text overflow-hidden">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-nexus-surface z-50">
            <Sidebar
              isCollapsed={false}
              onToggleCollapse={() => {}}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenProjectModal={() => setIsProjectModalOpen(true)}
          onOpenWorkflowModal={() => setIsWorkflowModalOpen(true)}
          onOpenTour={() => setIsTourOpen(true)}
          onOpenWebhookSimulator={() => setIsWebhookModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 focus:outline-none">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenProjectModal={() => setIsProjectModalOpen(true)}
        onOpenWorkflowModal={() => setIsWorkflowModalOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
        onOpenWebhookSimulator={() => setIsWebhookModalOpen(true)}
      />

      {/* Global Quick Create Modals */}
      <ProjectFormModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />

      <WorkflowFormModal
        isOpen={isWorkflowModalOpen}
        onClose={() => setIsWorkflowModalOpen(false)}
      />

      {/* Product Onboarding Tour Modal */}
      <ProductTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />

      {/* Mock Webhook Event Simulator Modal */}
      <WebhookSimulatorModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
      />
    </div>
  );
};
