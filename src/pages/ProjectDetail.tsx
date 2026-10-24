import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Tag, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Edit3, 
  GitFork, 
  Clock, 
  Play,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { Task, Priority } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ProjectFormModal } from '../components/projects/ProjectFormModal';
import { useToast } from '../context/ToastContext';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    projects, 
    tasks, 
    workflows, 
    activity, 
    teamMembers, 
    deleteProject, 
    createTask, 
    updateTask, 
    deleteTask, 
    toggleTaskStatus 
  } = useAppData();
  const { success } = useToast();

  const project = projects.find(p => p.id === id);

  // Task filtering
  const [taskStatusFilter, setTaskStatusFilter] = useState<'all' | 'todo' | 'in_progress' | 'review' | 'done'>('all');
  const [taskSort, setTaskSort] = useState<'created' | 'priority' | 'dueDate'>('created');

  // Modals
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false);

  // Task Create / Edit Modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskError, setTaskError] = useState('');

  const openCreateTask = () => {
    setTaskToEdit(null);
    setTaskTitle('');
    setTaskDesc('');
    setTaskPriority('medium');
    setTaskAssignee(project?.owner || teamMembers[0]?.name || 'Elena Rostova');
    setTaskDueDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
    setTaskError('');
    setIsTaskModalOpen(true);
  };

  const openEditTask = (task: Task) => {
    setTaskToEdit(task);
    setTaskTitle(task.title);
    setTaskDesc(task.description || '');
    setTaskPriority(task.priority);
    setTaskAssignee(task.assignee);
    setTaskDueDate(task.dueDate);
    setTaskError('');
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      setTaskError('Task title is required');
      return;
    }
    if (!project) return;

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        priority: taskPriority,
        assignee: taskAssignee,
        dueDate: taskDueDate,
      });
      success('Task updated successfully.');
    } else {
      createTask({
        projectId: project.id,
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        status: 'todo',
        priority: taskPriority,
        assignee: taskAssignee,
        dueDate: taskDueDate,
      });
      success('Task added to project.');
    }
    setIsTaskModalOpen(false);
  };

  const projectTasks = useMemo(() => {
    return tasks
      .filter(t => t.projectId === id)
      .filter(t => (taskStatusFilter === 'all' ? true : t.status === taskStatusFilter))
      .sort((a, b) => {
        if (taskSort === 'priority') {
          const rank = { critical: 4, high: 3, medium: 2, low: 1 };
          return rank[b.priority] - rank[a.priority];
        }
        if (taskSort === 'dueDate') {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [tasks, id, taskStatusFilter, taskSort]);

  // Related workflows
  const relatedWorkflows = useMemo(() => {
    return workflows.filter(w => w.projectId === id || (project?.relatedWorkflowIds && project.relatedWorkflowIds.includes(w.id)));
  }, [workflows, id, project]);

  // Related activity
  const projectActivity = useMemo(() => {
    return activity.filter(a => a.targetId === id || (a.targetType === 'task' && tasks.some(t => t.id === a.targetId && t.projectId === id)));
  }, [activity, id, tasks]);

  if (!project) {
    return (
      <div className="text-center py-16 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-nexus-text">Project Not Found</h2>
        <p className="text-xs text-nexus-text-muted">The requested initiative does not exist or has been deleted.</p>
        <Button variant="primary" size="sm" onClick={() => navigate('/projects')}>
          Return to Projects
        </Button>
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.projectId === id && t.status === 'done').length;
  const totalProjectTasks = tasks.filter(t => t.projectId === id).length;
  const taskProgressPct = totalProjectTasks > 0 ? Math.round((completedCount / totalProjectTasks) * 100) : project.progress;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-nexus-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/projects')}
            className="p-1.5 text-nexus-text-muted hover:text-nexus-text hover:bg-nexus-elevated rounded-lg transition-colors"
            aria-label="Back to projects"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-indigo-400">{project.id.toUpperCase()}</span>
              <Badge
                size="sm"
                variant={project.status === 'Active' ? 'emerald' : project.status === 'Planning' ? 'indigo' : 'amber'}
                dot={project.status === 'Active'}
              >
                {project.status}
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-nexus-text mt-0.5">
              {project.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Edit3 className="w-4 h-4" />}
            onClick={() => setIsEditProjectOpen(true)}
          >
            Edit Project
          </Button>
          <Button
            size="sm"
            variant="danger"
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={() => setIsDeleteProjectOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Grid: Overview & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Card */}
          <div className="bg-nexus-surface border border-nexus-border rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-nexus-text">Project Overview</h2>
            <p className="text-xs sm:text-sm text-nexus-text-muted leading-relaxed">
              {project.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-nexus-border">
              <div>
                <span className="text-[11px] text-nexus-text-dim block">Project Owner</span>
                <span className="text-xs font-semibold text-nexus-text mt-0.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  {project.owner}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-nexus-text-dim block">Target Due Date</span>
                <span className="text-xs font-semibold text-nexus-text mt-0.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  {project.dueDate}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-nexus-text-dim block">Priority Level</span>
                <span className="text-xs font-semibold text-nexus-text mt-0.5 capitalize">
                  {project.priority}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-nexus-text-dim block">Tasks Resolved</span>
                <span className="text-xs font-semibold text-nexus-text mt-0.5">
                  {completedCount} / {totalProjectTasks}
                </span>
              </div>
            </div>

            {/* Progress Gauge */}
            <div className="pt-2">
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-nexus-text-muted">Task Completion Velocity</span>
                <span className="text-nexus-text font-mono">{taskProgressPct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-nexus-base border border-nexus-border overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${taskProgressPct}%` }}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {project.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-nexus-base border border-nexus-border text-nexus-text-muted"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Task Manager Module */}
          <div className="bg-nexus-surface border border-nexus-border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-nexus-text flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  Engineering Tasks & Milestones
                </h2>
                <p className="text-xs text-nexus-text-muted mt-0.5">
                  Actionable requirements, bugs, and deployment checks
                </p>
              </div>

              <Button
                size="sm"
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={openCreateTask}
              >
                Add Task
              </Button>
            </div>

            {/* Filter and Sort bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-nexus-border">
              <div className="flex items-center gap-1">
                {(['all', 'todo', 'in_progress', 'review', 'done'] as const).map(statusKey => (
                  <button
                    key={statusKey}
                    onClick={() => setTaskStatusFilter(statusKey)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${
                      taskStatusFilter === statusKey
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-nexus-text-dim hover:text-nexus-text'
                    }`}
                  >
                    {statusKey.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <select
                value={taskSort}
                onChange={e => setTaskSort(e.target.value as any)}
                className="px-2.5 py-1 rounded-lg bg-nexus-base border border-nexus-border text-xs text-nexus-text focus:outline-none"
              >
                <option value="created">Sort: Created Date</option>
                <option value="priority">Sort: Priority</option>
                <option value="dueDate">Sort: Due Date</option>
              </select>
            </div>

            {/* Tasks List */}
            {projectTasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-nexus-text-muted border border-dashed border-nexus-border rounded-xl">
                No tasks found for this status filter. Click "Add Task" to create one.
              </div>
            ) : (
              <div className="space-y-2">
                {projectTasks.map(task => {
                  const isDone = task.status === 'done';

                  return (
                    <div
                      key={task.id}
                      className={`flex items-start justify-between p-3 rounded-xl border transition-all ${
                        isDone
                          ? 'bg-nexus-base/40 border-nexus-border/60 opacity-70'
                          : 'bg-nexus-elevated/40 border-nexus-border hover:border-nexus-border-bright'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <button
                          onClick={() => toggleTaskStatus(task.id)}
                          className="mt-0.5 text-nexus-text-muted hover:text-emerald-400 transition-colors"
                          aria-label={isDone ? 'Mark todo' : 'Mark done'}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-medium ${isDone ? 'line-through text-nexus-text-dim' : 'text-nexus-text'}`}>
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-[11px] text-nexus-text-dim mt-0.5 line-clamp-1">{task.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-nexus-text-dim">
                            <span className="capitalize px-1.5 py-0.2 rounded bg-nexus-base border border-nexus-border">
                              {task.status.replace('_', ' ')}
                            </span>
                            <span className={`capitalize font-semibold ${
                              task.priority === 'critical' ? 'text-rose-400' : task.priority === 'high' ? 'text-amber-400' : 'text-nexus-text-dim'
                            }`}>
                              {task.priority}
                            </span>
                            <span>Assignee: {task.assignee}</span>
                            <span>Due: {task.dueDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          onClick={() => openEditTask(task)}
                          className="p-1 text-nexus-text-dim hover:text-nexus-text rounded hover:bg-nexus-elevated"
                          title="Edit task"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setTaskToDelete(task)}
                          className="p-1 text-nexus-text-dim hover:text-rose-400 rounded hover:bg-rose-500/10"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Related Workflows & Project Activity */}
        <div className="space-y-6">
          {/* Related AI Workflows */}
          <div className="bg-nexus-surface border border-nexus-border rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-nexus-text flex items-center gap-2">
                <GitFork className="w-4 h-4 text-violet-400" />
                Related AI Workflows
              </h2>
              <span className="text-[11px] font-mono text-nexus-text-dim">{relatedWorkflows.length} linked</span>
            </div>

            {relatedWorkflows.length === 0 ? (
              <p className="text-xs text-nexus-text-muted">No workflows associated with this project yet.</p>
            ) : (
              <div className="space-y-2.5">
                {relatedWorkflows.map(wf => (
                  <div
                    key={wf.id}
                    onClick={() => navigate(`/workflows/${wf.id}`)}
                    className="p-3 rounded-xl bg-nexus-base border border-nexus-border hover:border-nexus-border-bright cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-nexus-text truncate">{wf.name}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">{wf.successRate}%</span>
                    </div>
                    <p className="text-[11px] text-nexus-text-dim line-clamp-1 mt-1">{wf.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-nexus-text-dim mt-2 pt-2 border-t border-nexus-border">
                      <span>{wf.steps.length} steps</span>
                      <span className="capitalize">{wf.trigger} trigger</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Project Activity History */}
          <div className="bg-nexus-surface border border-nexus-border rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-nexus-text flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Initiative History
            </h2>

            {projectActivity.length === 0 ? (
              <p className="text-xs text-nexus-text-muted">No recent activity logged for this project.</p>
            ) : (
              <div className="space-y-3">
                {projectActivity.slice(0, 5).map(act => (
                  <div key={act.id} className="text-xs flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-medium text-nexus-text">{act.title}</p>
                      <p className="text-[11px] text-nexus-text-dim mt-0.5">{act.description}</p>
                      <span className="text-[10px] text-nexus-text-dim">{act.actor.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Create / Edit Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title={taskToEdit ? 'Edit Task' : 'Add Project Task'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveTask} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-nexus-text mb-1">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              placeholder="e.g. Implement OWASP Top 10 security verification"
              className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border text-xs sm:text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {taskError && <p className="text-xs text-rose-400 mt-1">{taskError}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-nexus-text mb-1">Description</label>
            <textarea
              rows={2}
              value={taskDesc}
              onChange={e => setTaskDesc(e.target.value)}
              placeholder="Details, acceptance criteria..."
              className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border text-xs sm:text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-nexus-text mb-1">Priority</label>
              <select
                value={taskPriority}
                onChange={e => setTaskPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border text-xs text-nexus-text focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-nexus-text mb-1">Assignee</label>
              <select
                value={taskAssignee}
                onChange={e => setTaskAssignee(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border text-xs text-nexus-text focus:outline-none"
              >
                {teamMembers.map(m => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-nexus-text mb-1">Due Date</label>
            <input
              type="date"
              value={taskDueDate}
              onChange={e => setTaskDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border text-xs text-nexus-text focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-nexus-border mt-4">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Task Delete Confirmation */}
      <ConfirmDialog
        isOpen={taskToDelete !== null}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (taskToDelete) {
            deleteTask(taskToDelete.id);
            success('Task removed');
            setTaskToDelete(null);
          }
        }}
        title="Delete Task"
        message={`Delete task "${taskToDelete?.title}"?`}
        confirmText="Delete"
        isDestructive={true}
      />

      {/* Project Edit Modal */}
      <ProjectFormModal
        isOpen={isEditProjectOpen}
        onClose={() => setIsEditProjectOpen(false)}
        projectToEdit={project}
      />

      {/* Project Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteProjectOpen}
        onClose={() => setIsDeleteProjectOpen(false)}
        onConfirm={() => {
          deleteProject(project.id);
          success('Project Deleted');
          navigate('/projects');
        }}
        title="Permanently Delete Project?"
        message={`Are you sure you want to delete "${project.name}"? This cannot be undone.`}
        confirmText="Delete Project"
        isDestructive={true}
      />
    </div>
  );
};
