import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Project, 
  Workflow, 
  Task, 
  WorkflowExecution, 
  ActivityEvent, 
  NotificationItem, 
  TeamMember, 
  AppSettings,
  WorkflowStep,
  TeamRole
} from '../types';
import { 
  INITIAL_PROJECTS, 
  INITIAL_WORKFLOWS, 
  INITIAL_TASKS, 
  INITIAL_ACTIVITY, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_TEAM_MEMBERS, 
  INITIAL_SETTINGS 
} from '../data/seedData';

interface AppDataContextType {
  // State
  projects: Project[];
  workflows: Workflow[];
  tasks: Task[];
  executions: WorkflowExecution[];
  activity: ActivityEvent[];
  notifications: NotificationItem[];
  teamMembers: TeamMember[];
  settings: AppSettings;
  unreadNotificationsCount: number;

  // Project Actions
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Task Actions
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;

  // Workflow Actions
  createWorkflow: (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'executionCount' | 'successRate' | 'avgDurationMs'>) => Workflow;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  duplicateWorkflow: (id: string) => Workflow;
  deleteWorkflow: (id: string) => void;
  toggleWorkflowStatus: (id: string) => void;
  saveWorkflowSteps: (workflowId: string, steps: WorkflowStep[]) => void;

  // Executions
  recordExecution: (execution: WorkflowExecution) => void;

  // Activity
  logActivity: (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Team
  inviteMember: (name: string, email: string, role: TeamRole, department: string) => TeamMember;
  updateMemberRole: (id: string, role: TeamRole) => void;
  removeMember: (id: string) => void;

  // Settings
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateDashboardWidgets: (widgets: Partial<AppSettings['dashboardWidgets']>) => void;

  // Reset & Export
  resetToDemoData: () => void;
  exportAllDataJson: () => string;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

// Storage helper with safe error recovery
function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (err) {
    console.warn(`Failed reading ${key} from storage, using fallback.`, err);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed persisting ${key} to storage.`, err);
  }
}

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => getStored('nexus_projects', INITIAL_PROJECTS));
  const [workflows, setWorkflows] = useState<Workflow[]>(() => getStored('nexus_workflows', INITIAL_WORKFLOWS));
  const [tasks, setTasks] = useState<Task[]>(() => getStored('nexus_tasks', INITIAL_TASKS));
  const [executions, setExecutions] = useState<WorkflowExecution[]>(() => getStored('nexus_executions', []));
  const [activity, setActivity] = useState<ActivityEvent[]>(() => getStored('nexus_activity', INITIAL_ACTIVITY));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => getStored('nexus_notifications', INITIAL_NOTIFICATIONS));
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => getStored('nexus_team', INITIAL_TEAM_MEMBERS));
  const [settings, setSettings] = useState<AppSettings>(() => getStored('nexus_settings', INITIAL_SETTINGS));

  // Sync to localStorage
  useEffect(() => { setStored('nexus_projects', projects); }, [projects]);
  useEffect(() => { setStored('nexus_workflows', workflows); }, [workflows]);
  useEffect(() => { setStored('nexus_tasks', tasks); }, [tasks]);
  useEffect(() => { setStored('nexus_executions', executions); }, [executions]);
  useEffect(() => { setStored('nexus_activity', activity); }, [activity]);
  useEffect(() => { setStored('nexus_notifications', notifications); }, [notifications]);
  useEffect(() => { setStored('nexus_team', teamMembers); }, [teamMembers]);
  useEffect(() => { setStored('nexus_settings', settings); }, [settings]);

  // Derived: unread count
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Log activity helper
  const logActivity = useCallback((event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    const newEvent: ActivityEvent = {
      ...event,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    setActivity(prev => [newEvent, ...prev]);
  }, []);

  // Project Actions
  const createProject = useCallback((data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project => {
    const id = `proj_${Date.now()}`;
    const timestamp = new Date().toISOString();
    const newProject: Project = {
      ...data,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setProjects(prev => [newProject, ...prev]);
    logActivity({
      type: 'project_created',
      title: `Project created: ${newProject.name}`,
      description: newProject.description,
      actor: { name: settings.profile.name, role: settings.profile.role },
      targetId: id,
      targetType: 'project',
    });
    return newProject;
  }, [logActivity, settings.profile]);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    const timestamp = new Date().toISOString();
    setProjects(prev => prev.map(p => (p.id === id ? { ...p, ...updates, updatedAt: timestamp } : p)));
    logActivity({
      type: 'project_updated',
      title: `Project updated: ${updates.name || id}`,
      description: 'Project details, tags, or progress were modified.',
      actor: { name: settings.profile.name, role: settings.profile.role },
      targetId: id,
      targetType: 'project',
    });
  }, [logActivity, settings.profile]);

  const deleteProject = useCallback((id: string) => {
    const target = projects.find(p => p.id === id);
    setProjects(prev => prev.filter(p => p.id !== id));
    // Clean up related tasks
    setTasks(prev => prev.filter(t => t.projectId !== id));
    logActivity({
      type: 'project_updated',
      title: `Project deleted: ${target?.name || id}`,
      description: 'Project and all associated tasks removed.',
      actor: { name: settings.profile.name, role: settings.profile.role },
      targetId: id,
      targetType: 'project',
    });
  }, [projects, logActivity, settings.profile]);

  // Task Actions
  const createTask = useCallback((data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task => {
    const id = `task_${Date.now()}`;
    const timestamp = new Date().toISOString();
    const newTask: Task = {
      ...data,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setTasks(prev => [newTask, ...prev]);
    logActivity({
      type: 'task_created',
      title: `Task created: ${newTask.title}`,
      description: `Assigned to ${newTask.assignee} with priority ${newTask.priority}`,
      actor: { name: settings.profile.name, role: settings.profile.role },
      targetId: id,
      targetType: 'task',
    });
    return newTask;
  }, [logActivity, settings.profile]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    const timestamp = new Date().toISOString();
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates, updatedAt: timestamp } : t)));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleTaskStatus = useCallback((id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const isDone = t.status === 'done';
      const newStatus = isDone ? 'todo' : 'done';
      if (!isDone) {
        logActivity({
          type: 'task_completed',
          title: `Task completed: ${t.title}`,
          description: `Completed by ${settings.profile.name}`,
          actor: { name: settings.profile.name, role: settings.profile.role },
          targetId: id,
          targetType: 'task',
        });
      }
      return { ...t, status: newStatus, updatedAt: new Date().toISOString() };
    }));
  }, [logActivity, settings.profile]);

  // Workflow Actions
  const createWorkflow = useCallback((data: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'executionCount' | 'successRate' | 'avgDurationMs'>): Workflow => {
    const id = `wf_${Date.now()}`;
    const timestamp = new Date().toISOString();
    const newWorkflow: Workflow = {
      ...data,
      id,
      executionCount: 0,
      successRate: 100,
      avgDurationMs: 350,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setWorkflows(prev => [newWorkflow, ...prev]);
    logActivity({
      type: 'workflow_created',
      title: `Workflow created: ${newWorkflow.name}`,
      description: newWorkflow.description,
      actor: { name: settings.profile.name, role: settings.profile.role },
      targetId: id,
      targetType: 'workflow',
    });
    return newWorkflow;
  }, [logActivity, settings.profile]);

  const updateWorkflow = useCallback((id: string, updates: Partial<Workflow>) => {
    const timestamp = new Date().toISOString();
    setWorkflows(prev => prev.map(w => (w.id === id ? { ...w, ...updates, updatedAt: timestamp } : w)));
  }, []);

  const duplicateWorkflow = useCallback((id: string): Workflow => {
    const source = workflows.find(w => w.id === id);
    if (!source) throw new Error(`Workflow ${id} not found.`);
    const newId = `wf_${Date.now()}`;
    const timestamp = new Date().toISOString();
    const duplicated: Workflow = {
      ...source,
      id: newId,
      name: `${source.name} (Copy)`,
      executionCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
      steps: source.steps.map(s => ({ ...s, id: `step_${Date.now()}_${Math.random().toString(36).substring(2, 6)}` })),
    };
    setWorkflows(prev => [duplicated, ...prev]);
    logActivity({
      type: 'workflow_created',
      title: `Duplicated workflow: ${duplicated.name}`,
      description: `Cloned from ${source.name}`,
      actor: { name: settings.profile.name, role: settings.profile.role },
      targetId: newId,
      targetType: 'workflow',
    });
    return duplicated;
  }, [workflows, logActivity, settings.profile]);

  const deleteWorkflow = useCallback((id: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== id));
  }, []);

  const toggleWorkflowStatus = useCallback((id: string) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id !== id) return w;
      const nextStatus = w.status === 'active' ? 'inactive' : 'active';
      return { ...w, status: nextStatus, updatedAt: new Date().toISOString() };
    }));
  }, []);

  const saveWorkflowSteps = useCallback((workflowId: string, steps: WorkflowStep[]) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id !== workflowId) return w;
      return { ...w, steps, updatedAt: new Date().toISOString() };
    }));
  }, []);

  // Record Execution
  const recordExecution = useCallback((execution: WorkflowExecution) => {
    setExecutions(prev => [execution, ...prev]);
    // Update workflow metrics
    setWorkflows(prev => prev.map(w => {
      if (w.id !== execution.workflowId) return w;
      const newCount = w.executionCount + 1;
      const isSuccess = execution.status === 'success';
      const prevSuccesses = Math.round((w.executionCount * w.successRate) / 100);
      const newSuccesses = isSuccess ? prevSuccesses + 1 : prevSuccesses;
      const newRate = Number(((newSuccesses / newCount) * 100).toFixed(1));
      const newAvgDuration = Math.round((w.avgDurationMs * w.executionCount + execution.durationMs) / newCount);

      return {
        ...w,
        executionCount: newCount,
        successRate: newRate,
        avgDurationMs: newAvgDuration,
        lastExecutedAt: execution.startedAt,
        updatedAt: new Date().toISOString(),
      };
    }));

    // Log Activity
    logActivity({
      type: execution.status === 'success' ? 'workflow_executed' : 'workflow_failed',
      title: `${execution.workflowName} ${execution.status === 'success' ? 'succeeded' : 'failed'}`,
      description: execution.errorMessage || `Executed in ${execution.durationMs}ms with ${execution.logs.length} steps.`,
      actor: { name: settings.profile.name, role: settings.profile.role },
      targetId: execution.workflowId,
      targetType: 'workflow',
    });

    // If failed, trigger notification
    if (execution.status === 'failed') {
      const notif: NotificationItem = {
        id: `notif_${Date.now()}`,
        category: 'workflow',
        title: `Workflow Failed: ${execution.workflowName}`,
        message: execution.errorMessage || 'Execution encountered an unhandled error during step processing.',
        read: false,
        timestamp: new Date().toISOString(),
        targetUrl: `/workflows/${execution.workflowId}`,
        priority: 'high',
      };
      setNotifications(prev => [notif, ...prev]);
    }
  }, [logActivity, settings.profile]);

  // Notifications
  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Team
  const inviteMember = useCallback((name: string, email: string, role: TeamRole, department: string): TeamMember => {
    const id = `user_${Date.now()}`;
    const newMember: TeamMember = {
      id,
      name: name.trim(),
      email: email.trim(),
      role,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      department: department.trim() || 'General Engineering',
      joinedAt: new Date().toISOString().split('T')[0],
      lastActive: 'Invited (Pending)',
      status: 'invited',
    };
    setTeamMembers(prev => [...prev, newMember]);
    logActivity({
      type: 'team_member_added',
      title: `${newMember.name} invited to workspace`,
      description: `Invited as ${role} in ${newMember.department}`,
      actor: { name: settings.profile.name, role: settings.profile.role },
      targetId: id,
      targetType: 'team',
    });
    return newMember;
  }, [logActivity, settings.profile]);

  const updateMemberRole = useCallback((id: string, role: TeamRole) => {
    setTeamMembers(prev => prev.map(m => (m.id === id ? { ...m, role } : m)));
  }, []);

  const removeMember = useCallback((id: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
  }, []);

  // Settings
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    logActivity({
      type: 'settings_updated',
      title: 'Workspace settings updated',
      description: 'Modified user profile, appearance, or notification preferences.',
      actor: { name: settings.profile.name, role: settings.profile.role },
      targetId: 'settings',
      targetType: 'settings',
    });
  }, [logActivity, settings.profile]);

  const updateDashboardWidgets = useCallback((widgets: Partial<AppSettings['dashboardWidgets']>) => {
    setSettings(prev => ({
      ...prev,
      dashboardWidgets: { ...prev.dashboardWidgets, ...widgets }
    }));
  }, []);

  // Reset to initial demo state
  const resetToDemoData = useCallback(() => {
    setProjects(INITIAL_PROJECTS);
    setWorkflows(INITIAL_WORKFLOWS);
    setTasks(INITIAL_TASKS);
    setExecutions([]);
    setActivity(INITIAL_ACTIVITY);
    setNotifications(INITIAL_NOTIFICATIONS);
    setTeamMembers(INITIAL_TEAM_MEMBERS);
    setSettings(INITIAL_SETTINGS);

    localStorage.removeItem('nexus_projects');
    localStorage.removeItem('nexus_workflows');
    localStorage.removeItem('nexus_tasks');
    localStorage.removeItem('nexus_executions');
    localStorage.removeItem('nexus_activity');
    localStorage.removeItem('nexus_notifications');
    localStorage.removeItem('nexus_team');
    localStorage.removeItem('nexus_settings');
  }, []);

  // Export full JSON
  const exportAllDataJson = useCallback((): string => {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      workspace: settings.profile.workspaceName,
      projects,
      workflows,
      tasks,
      executions,
      activity,
      teamMembers,
      settings,
    }, null, 2);
  }, [projects, workflows, tasks, executions, activity, teamMembers, settings]);

  return (
    <AppDataContext.Provider
      value={{
        projects,
        workflows,
        tasks,
        executions,
        activity,
        notifications,
        teamMembers,
        settings,
        unreadNotificationsCount,

        createProject,
        updateProject,
        deleteProject,

        createTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,

        createWorkflow,
        updateWorkflow,
        duplicateWorkflow,
        deleteWorkflow,
        toggleWorkflowStatus,
        saveWorkflowSteps,

        recordExecution,
        logActivity,

        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,

        inviteMember,
        updateMemberRole,
        removeMember,

        updateSettings,
        updateDashboardWidgets,

        resetToDemoData,
        exportAllDataJson,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = (): AppDataContextType => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
