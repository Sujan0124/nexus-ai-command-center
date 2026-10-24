// NEXUS AI Command Center - Core Type Definitions

export type ProjectStatus = 'Planning' | 'Active' | 'Paused' | 'Completed' | 'Archived';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: Priority;
  assignee: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  owner: string;
  tags: string[];
  progress: number; // 0 - 100
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  relatedWorkflowIds?: string[];
}

export type StepType = 
  | 'input' 
  | 'transform' 
  | 'condition' 
  | 'delay' 
  | 'mock_api' 
  | 'output';

export interface StepConfig {
  // Input
  inputSchema?: string; // JSON or field description
  defaultPayload?: string;

  // Transform
  transformOperation?: 'uppercase' | 'lowercase' | 'json_parse' | 'json_stringify' | 'regex_extract' | 'ai_summarize';
  regexPattern?: string;

  // Condition
  conditionField?: string;
  conditionOperator?: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'is_truthy';
  conditionValue?: string;
  thenStepId?: string;
  elseStepId?: string;

  // Delay
  delayDurationMs?: number; // e.g. 500, 1000

  // Mock API
  apiEndpoint?: string;
  apiMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  simulatedStatus?: number;
  simulatedLatencyMs?: number;
  mockResponseBody?: string;

  // Output
  outputTemplate?: string;
  destination?: 'console' | 'webhook' | 'slack_mock' | 'storage';
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  type: StepType;
  config: StepConfig;
  order: number;
}

export type WorkflowTrigger = 'manual' | 'webhook' | 'scheduled' | 'event';
export type WorkflowStatus = 'active' | 'inactive' | 'draft' | 'archived';

export interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  status: WorkflowStatus;
  owner: string;
  projectId?: string;
  steps: WorkflowStep[];
  executionCount: number;
  successRate: number; // e.g. 98.4%
  avgDurationMs: number;
  lastExecutedAt?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export type ExecutionStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled';

export interface StepExecutionLog {
  stepId: string;
  stepTitle: string;
  stepType: StepType;
  status: 'success' | 'failed' | 'skipped' | 'running';
  inputData: any;
  outputData: any;
  durationMs: number;
  timestamp: string;
  error?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  trigger: WorkflowTrigger;
  status: ExecutionStatus;
  startedAt: string;
  finishedAt?: string;
  durationMs: number;
  inputPayload: any;
  finalOutput?: any;
  logs: StepExecutionLog[];
  failedStepId?: string;
  errorMessage?: string;
}

export type ActivityEventType = 
  | 'workflow_executed' 
  | 'project_created' 
  | 'project_updated'
  | 'task_completed' 
  | 'task_created' 
  | 'team_member_added' 
  | 'settings_updated'
  | 'workflow_created'
  | 'workflow_failed';

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  title: string;
  description: string;
  actor: {
    name: string;
    avatar?: string;
    role: string;
  };
  targetId?: string;
  targetType?: 'project' | 'workflow' | 'task' | 'team' | 'settings';
  timestamp: string;
  metadata?: Record<string, any>;
}

export type NotificationCategory = 'workflow' | 'project' | 'team' | 'system' | 'security';

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  targetUrl?: string;
  priority?: Priority;
}

export type TeamRole = 'Owner' | 'Admin' | 'Member' | 'Viewer';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  avatar: string;
  department: string;
  joinedAt: string;
  lastActive: string;
  status: 'active' | 'invited' | 'offline';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  avatar: string;
  workspaceName: string;
  jobTitle: string;
  timezone: string;
}

export interface AppSettings {
  profile: UserProfile;
  appearance: {
    theme: 'dark' | 'light';
    accentColor: string;
    compactMode: boolean;
  };
  notifications: {
    emailAlerts: boolean;
    workflowFailures: boolean;
    taskAssignments: boolean;
    weeklyDigest: boolean;
  };
  dashboardWidgets: {
    kpiCards: boolean;
    executionsChart: boolean;
    workflowTypes: boolean;
    recentProjects: boolean;
    activityFeed: boolean;
  };
}
