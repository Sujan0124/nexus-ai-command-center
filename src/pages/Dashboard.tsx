import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderKanban, 
  GitFork, 
  CheckCircle2, 
  Zap, 
  Clock, 
  Percent, 
  ArrowRight, 
  SlidersHorizontal, 
  Filter,
  Activity,
  Play,
  ArrowUp,
  ArrowDown,
  GripVertical,
  RotateCcw
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { MetricCard } from '../components/charts/MetricCard';
import { TimeSeriesChart } from '../components/charts/TimeSeriesChart';
import { DonutChart } from '../components/charts/DonutChart';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    projects, 
    workflows, 
    tasks, 
    activity, 
    settings, 
    updateDashboardWidgets 
  } = useAppData();

  const [activityFilter, setActivityFilter] = useState<'all' | 'workflows' | 'projects' | 'tasks'>('all');
  const [showWidgetModal, setShowWidgetModal] = useState(false);

  // Draggable / Reorderable widget layout state with persistence
  const [widgetOrder, setWidgetOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nexus_dashboard_order');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['kpiCards', 'executionsChart', 'workflowTypes', 'recentProjects', 'activityFeed'];
  });

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= widgetOrder.length) return;
    const next = [...widgetOrder];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setWidgetOrder(next);
    try {
      localStorage.setItem('nexus_dashboard_order', JSON.stringify(next));
    } catch {}
  };

  const resetWidgetOrder = () => {
    const defaultOrder = ['kpiCards', 'executionsChart', 'workflowTypes', 'recentProjects', 'activityFeed'];
    setWidgetOrder(defaultOrder);
    try {
      localStorage.removeItem('nexus_dashboard_order');
    } catch {}
  };

  // Time contextual greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  // Deterministic KPI aggregations derived from actual data
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'Active').length;
  const totalWorkflows = workflows.length;
  const activeWorkflows = workflows.filter(w => w.status === 'active').length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;

  const totalExecutions = workflows.reduce((acc, w) => acc + w.executionCount, 0);
  const avgSuccessRate = totalWorkflows > 0 
    ? Number((workflows.reduce((acc, w) => acc + w.successRate, 0) / totalWorkflows).toFixed(1))
    : 100;

  // Estimated hours saved: total executions * avg duration saved per automation (~45s per run)
  const estimatedHoursSaved = Math.round((totalExecutions * 45) / 3600);

  // Time series data (deterministic daily executions for last 14 days)
  const executionChartData = [
    { date: 'Oct 11', value: 1840, secondaryValue: 1620 },
    { date: 'Oct 12', value: 1950, secondaryValue: 1710 },
    { date: 'Oct 13', value: 2100, secondaryValue: 1850 },
    { date: 'Oct 14', value: 2020, secondaryValue: 1900 },
    { date: 'Oct 15', value: 2450, secondaryValue: 2150 },
    { date: 'Oct 16', value: 2380, secondaryValue: 2200 },
    { date: 'Oct 17', value: 2120, secondaryValue: 1980 },
    { date: 'Oct 18', value: 2600, secondaryValue: 2300 },
    { date: 'Oct 19', value: 2750, secondaryValue: 2410 },
    { date: 'Oct 20', value: 2900, secondaryValue: 2520 },
    { date: 'Oct 21', value: 2840, secondaryValue: 2610 },
    { date: 'Oct 22', value: 3150, secondaryValue: 2750 },
    { date: 'Oct 23', value: 3400, secondaryValue: 2900 },
    { date: 'Oct 24', value: 3620, secondaryValue: 3050 },
  ];

  // Workflow Trigger Breakdown for Donut Chart
  const webhookCount = workflows.filter(w => w.trigger === 'webhook').length;
  const scheduledCount = workflows.filter(w => w.trigger === 'scheduled').length;
  const eventCount = workflows.filter(w => w.trigger === 'event').length;
  const manualCount = workflows.filter(w => w.trigger === 'manual').length;

  const triggerDonutData = [
    { label: 'Webhook Triggers', value: webhookCount, color: '#6366F1' },
    { label: 'Scheduled Cron', value: scheduledCount, color: '#06B6D4' },
    { label: 'Event Streams', value: eventCount, color: '#10B981' },
    { label: 'Manual Execution', value: manualCount, color: '#F59E0B' },
  ];

  // Filtered recent activity
  const filteredActivity = activity.filter(a => {
    if (activityFilter === 'workflows') return a.type.includes('workflow');
    if (activityFilter === 'projects') return a.type.includes('project');
    if (activityFilter === 'tasks') return a.type.includes('task');
    return true;
  }).slice(0, 6);

  const widgets = settings.dashboardWidgets;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-nexus-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-nexus-text">
              {greeting}, {user?.name.split(' ')[0] || 'Architect'}
            </h1>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {user?.workspaceName || 'Command Core'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-nexus-text-muted mt-1">
            {todayFormatted} · All {activeWorkflows} autonomous agent pipelines operating nominally.
          </p>
        </div>

        {/* Dashboard Customization Action */}
        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<SlidersHorizontal className="w-4 h-4 text-nexus-text-dim" />}
            onClick={() => setShowWidgetModal(true)}
          >
            Customize Layout
          </Button>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Play className="w-4 h-4" />}
            onClick={() => navigate('/workflows')}
          >
            Run Pipeline
          </Button>
        </div>
      </div>

      {/* Dynamic Widget Grid arranged by persisted widgetOrder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {widgetOrder.map(widgetKey => {
          if (widgetKey === 'kpiCards' && widgets.kpiCards) {
            return (
              <div key="kpiCards" className="lg:col-span-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  <MetricCard
                    title="Active Projects"
                    value={`${activeProjects} / ${totalProjects}`}
                    change={12.5}
                    trend="up"
                    icon={<FolderKanban className="w-4 h-4" />}
                    tooltip="Ratio of active initiatives to total managed repositories"
                    sparklineData={[3, 4, 4, 5, 5, 6, 7, 7, 8]}
                    accentColor="cyan"
                  />
                  <MetricCard
                    title="Active Pipelines"
                    value={activeWorkflows}
                    change={8.3}
                    trend="up"
                    icon={<GitFork className="w-4 h-4" />}
                    tooltip="Real-time multi-step AI orchestrations in active state"
                    sparklineData={[8, 9, 9, 10, 10, 11, 11, 12, 12]}
                    accentColor="indigo"
                  />
                  <MetricCard
                    title="Completed Tasks"
                    value={`${completedTasks} / ${totalTasks}`}
                    change={18.2}
                    trend="up"
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    tooltip="Engineering checklist and milestone tasks resolved"
                    sparklineData={[12, 14, 15, 18, 19, 21, 22, 23, 24]}
                    accentColor="emerald"
                  />
                  <MetricCard
                    title="Total Executions"
                    value={totalExecutions > 1000 ? `${(totalExecutions / 1000).toFixed(1)}k` : totalExecutions}
                    change={24.1}
                    trend="up"
                    icon={<Zap className="w-4 h-4" />}
                    tooltip="Aggregated local and scheduled workflow trigger dispatches"
                    sparklineData={[18, 20, 22, 25, 27, 28, 30, 31, 33]}
                    accentColor="indigo"
                  />
                  <MetricCard
                    title="Time Saved"
                    value={`${estimatedHoursSaved}h`}
                    change={15.0}
                    trend="up"
                    icon={<Clock className="w-4 h-4" />}
                    tooltip="Estimated manual engineering overhead reclaimed by automated pipelines"
                    sparklineData={[280, 300, 320, 345, 370, 390, 405, 418]}
                    accentColor="amber"
                  />
                  <MetricCard
                    title="Success Rate"
                    value={`${avgSuccessRate}%`}
                    change={0.4}
                    trend="up"
                    icon={<Percent className="w-4 h-4" />}
                    tooltip="Percentage of executions with zero uncaught fatal exceptions"
                    sparklineData={[96, 97, 97, 98, 98, 98, 99, 99, 99]}
                    accentColor="emerald"
                  />
                </div>
              </div>
            );
          }

          if (widgetKey === 'executionsChart' && widgets.executionsChart) {
            return (
              <div key="executionsChart" className="lg:col-span-2 bg-nexus-surface border border-nexus-border rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-semibold text-nexus-text">Pipeline Execution Velocity</h2>
                    <p className="text-xs text-nexus-text-muted mt-0.5">
                      Daily automated runs compared to trailing 14-day baseline
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/analytics')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                  >
                    <span>Full Analytics</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <TimeSeriesChart
                  data={executionChartData}
                  primaryLabel="Current 14 Days"
                  secondaryLabel="Previous Period"
                  unit="runs"
                  color="#6366F1"
                />
              </div>
            );
          }

          if (widgetKey === 'workflowTypes' && widgets.workflowTypes) {
            return (
              <div key="workflowTypes" className="bg-nexus-surface border border-nexus-border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-base font-semibold text-nexus-text">Trigger Architecture</h2>
                    <span className="text-[11px] font-mono text-nexus-text-dim">{totalWorkflows} total</span>
                  </div>
                  <p className="text-xs text-nexus-text-muted mb-4">
                    Distribution of pipeline trigger dispatch mechanisms
                  </p>
                </div>
                <div className="my-auto py-2">
                  <DonutChart data={triggerDonutData} centerLabel="Pipelines" size={170} />
                </div>
                <div className="pt-4 border-t border-nexus-border text-center">
                  <button
                    onClick={() => navigate('/workflows')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Manage all pipelines →
                  </button>
                </div>
              </div>
            );
          }

          if (widgetKey === 'recentProjects' && widgets.recentProjects) {
            return (
              <div key="recentProjects" className="lg:col-span-2 bg-nexus-surface border border-nexus-border rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-semibold text-nexus-text">Active Engineering Initiatives</h2>
                    <p className="text-xs text-nexus-text-muted mt-0.5">
                      High-priority engineering projects and milestone completion
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/projects')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                  >
                    <span>View all ({totalProjects})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-nexus-border">
                  {projects.slice(0, 4).map(project => {
                    const isCritical = project.priority === 'critical';
                    const isHigh = project.priority === 'high';

                    return (
                      <div
                        key={project.id}
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-nexus-elevated/40 p-2 rounded-xl cursor-pointer transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-nexus-text truncate hover:text-indigo-400 transition-colors">
                              {project.name}
                            </span>
                            <Badge
                              size="sm"
                              variant={
                                project.status === 'Active'
                                  ? 'emerald'
                                  : project.status === 'Planning'
                                  ? 'indigo'
                                  : project.status === 'Paused'
                                  ? 'amber'
                                  : 'slate'
                              }
                              dot={project.status === 'Active'}
                            >
                              {project.status}
                            </Badge>
                            {isCritical && (
                              <Badge size="sm" variant="rose">Critical</Badge>
                            )}
                            {isHigh && (
                              <Badge size="sm" variant="amber">High</Badge>
                            )}
                          </div>
                          <p className="text-xs text-nexus-text-muted line-clamp-1 mt-1">
                            {project.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-nexus-text-dim">
                            <span>Lead: <strong className="text-nexus-text-muted">{project.owner}</strong></span>
                            <span>Due: <strong className="text-nexus-text-muted">{project.dueDate}</strong></span>
                          </div>
                        </div>

                        {/* Progress indicator */}
                        <div className="sm:w-36 shrink-0 flex flex-col sm:items-end">
                          <div className="flex items-center justify-between sm:justify-end gap-2 w-full text-xs font-semibold text-nexus-text">
                            <span className="text-[11px] text-nexus-text-dim sm:hidden">Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-nexus-base border border-nexus-border overflow-hidden mt-1.5">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                project.progress === 100
                                  ? 'bg-emerald-400'
                                  : project.progress > 70
                                  ? 'bg-indigo-500'
                                  : 'bg-cyan-500'
                              }`}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          if (widgetKey === 'activityFeed' && widgets.activityFeed) {
            return (
              <div key="activityFeed" className="bg-nexus-surface border border-nexus-border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <h2 className="text-base font-semibold text-nexus-text">System Activity</h2>
                    </div>
                    <button
                      onClick={() => navigate('/activity')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      View all →
                    </button>
                  </div>

                  {/* Activity Filter Chips */}
                  <div className="flex items-center gap-1.5 my-3">
                    {(['all', 'workflows', 'projects', 'tasks'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setActivityFilter(f)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors capitalize ${
                          activityFilter === f
                            ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-nexus-base text-nexus-text-dim hover:text-nexus-text'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  {/* Feed List */}
                  <div className="space-y-3 mt-3">
                    {filteredActivity.map(event => (
                      <div key={event.id} className="flex items-start gap-2.5 text-xs">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-nexus-text line-clamp-1">{event.title}</p>
                          <p className="text-[11px] text-nexus-text-dim line-clamp-1 mt-0.5">{event.description}</p>
                          <span className="text-[10px] text-nexus-text-dim">
                            {event.actor.name} · {event.timestamp.split('T')[1].slice(0, 5)} UTC
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* Widget Layout Customization Modal */}
      <Modal
        isOpen={showWidgetModal}
        onClose={() => setShowWidgetModal(false)}
        title="Customize Dashboard Layout"
        description="Choose which metric modules and data visualizations to display on your command center."
        maxWidth="md"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-nexus-text-dim pb-1">
            <span>Arrange Order & Visibility</span>
            <button
              type="button"
              onClick={resetWidgetOrder}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Default Order</span>
            </button>
          </div>

          {widgetOrder.map((key, idx) => {
            const metaMap: Record<string, { label: string; desc: string }> = {
              kpiCards: { label: 'Executive KPI Cards', desc: 'Active projects, pipelines, executions, and time saved' },
              executionsChart: { label: 'Pipeline Velocity Chart', desc: '14-day time series tracking execution volume' },
              workflowTypes: { label: 'Trigger Architecture Donut', desc: 'Categorical breakdown of webhook, cron, and event triggers' },
              recentProjects: { label: 'Engineering Projects Feed', desc: 'List of high-priority initiatives with progress gauges' },
              activityFeed: { label: 'Live System Activity Feed', desc: 'Chronological timeline of system events and completions' },
            };
            const meta = metaMap[key] || { label: key, desc: '' };
            const isChecked = widgets[key as keyof typeof widgets];

            return (
              <div
                key={key}
                className="flex items-center justify-between p-3 rounded-xl bg-nexus-base border border-nexus-border hover:border-nexus-border-bright transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <GripVertical className="w-4 h-4 text-nexus-text-dim shrink-0 cursor-grab" />
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={e => updateDashboardWidgets({ [key]: e.target.checked })}
                    className="rounded bg-nexus-surface border-nexus-border text-indigo-600 focus:ring-indigo-500 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-nexus-text">{meta.label}</p>
                    <p className="text-[11px] text-nexus-text-dim truncate">{meta.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveWidget(idx, 'up')}
                    className="p-1 text-nexus-text-dim hover:text-nexus-text disabled:opacity-20 rounded hover:bg-nexus-elevated"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === widgetOrder.length - 1}
                    onClick={() => moveWidget(idx, 'down')}
                    className="p-1 text-nexus-text-dim hover:text-nexus-text disabled:opacity-20 rounded hover:bg-nexus-elevated"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-4 border-t border-nexus-border mt-4">
          <Button size="sm" variant="primary" onClick={() => setShowWidgetModal(false)}>
            Apply & Save Layout
          </Button>
        </div>
      </Modal>
    </div>
  );
};
