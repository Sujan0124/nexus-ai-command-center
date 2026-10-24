import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppDataProvider } from './context/AppDataContext';
import { AppLayout } from './components/layout/AppLayout';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { Workflows } from './pages/Workflows';
import { WorkflowDetail } from './pages/WorkflowDetail';
import { Analytics } from './pages/Analytics';
import { Activity } from './pages/Activity';
import { Team } from './pages/Team';
import { Settings } from './pages/Settings';
import { Notifications } from './pages/Notifications';
import { NotFound } from './pages/NotFound';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-nexus-base flex items-center justify-center text-xs text-nexus-text-muted">
        Loading NEXUS workspace...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppDataProvider>
              <Routes>
                {/* Public Route */}
                <Route path="/login" element={<Login />} />

                {/* Root Redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Protected Application Layout & Routes */}
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/:id" element={<ProjectDetail />} />
                  <Route path="/workflows" element={<Workflows />} />
                  <Route path="/workflows/:id" element={<WorkflowDetail />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/activity" element={<Activity />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/notifications" element={<Notifications />} />
                </Route>

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppDataProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};
