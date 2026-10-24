import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Search, 
  Filter, 
  GitFork, 
  FolderKanban, 
  CheckCircle2, 
  Users, 
  Settings, 
  Calendar,
  User
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { ActivityEventType } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';

export const Activity: React.FC = () => {
  const { activity, teamMembers } = useAppData();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [actorFilter, setActorFilter] = useState<string>('ALL');
  const [pageSize, setPageSize] = useState<number>(15);

  const filteredEvents = useMemo(() => {
    return activity.filter(event => {
      const matchesSearch = 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.actor.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === 'ALL' || event.type === typeFilter;
      const matchesActor = actorFilter === 'ALL' || event.actor.name === actorFilter;

      return matchesSearch && matchesType && matchesActor;
    });
  }, [activity, searchQuery, typeFilter, actorFilter]);

  const visibleEvents = filteredEvents.slice(0, pageSize);

  const getEventIcon = (type: ActivityEventType) => {
    switch (type) {
      case 'workflow_executed':
      case 'workflow_created':
      case 'workflow_failed':
        return <GitFork className="w-4 h-4 text-violet-400" />;
      case 'project_created':
      case 'project_updated':
        return <FolderKanban className="w-4 h-4 text-cyan-400" />;
      case 'task_completed':
      case 'task_created':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'team_member_added':
        return <Users className="w-4 h-4 text-blue-400" />;
      case 'settings_updated':
        return <Settings className="w-4 h-4 text-amber-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-nexus-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-nexus-text">
            Audit Trail & Activity Log
          </h1>
          <p className="text-xs sm:text-sm text-nexus-text-muted mt-1">
            Complete chronological event stream of pipeline runs, code commits, and project updates.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-nexus-text-dim" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search events, keywords, actors..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-nexus-surface border border-nexus-border text-xs sm:text-sm text-nexus-text placeholder-nexus-text-dim focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-nexus-surface border border-nexus-border text-xs text-nexus-text focus:outline-none"
        >
          <option value="ALL">All Event Types</option>
          <option value="workflow_executed">Workflow Executed</option>
          <option value="project_created">Project Created</option>
          <option value="project_updated">Project Updated</option>
          <option value="task_completed">Task Completed</option>
          <option value="task_created">Task Created</option>
          <option value="team_member_added">Team Member Added</option>
          <option value="settings_updated">Settings Updated</option>
        </select>

        <select
          value={actorFilter}
          onChange={e => setActorFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-nexus-surface border border-nexus-border text-xs text-nexus-text focus:outline-none"
        >
          <option value="ALL">All Actors</option>
          <option value="System Daemon">System Daemon</option>
          {teamMembers.map(m => (
            <option key={m.id} value={m.name}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {/* Timeline Stream */}
      {visibleEvents.length === 0 ? (
        <EmptyState
          icon={<Clock className="w-6 h-6" />}
          title="No events match your criteria"
          description="Try resetting search filters to view the complete history."
        />
      ) : (
        <div className="bg-nexus-surface border border-nexus-border rounded-2xl p-5 shadow-sm space-y-6">
          <div className="relative pl-6 sm:pl-8 border-l border-nexus-border space-y-6">
            {visibleEvents.map(event => (
              <div key={event.id} className="relative group">
                {/* Timeline node circle */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-6 h-6 rounded-full bg-nexus-surface border-2 border-indigo-500 flex items-center justify-center text-indigo-400 shadow-sm">
                  {getEventIcon(event.type)}
                </div>

                <div className="p-3.5 rounded-xl bg-nexus-base border border-nexus-border group-hover:border-nexus-border-bright transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <h3 className="text-xs sm:text-sm font-semibold text-nexus-text">
                      {event.title}
                    </h3>
                    <span className="text-[11px] font-mono text-nexus-text-dim">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-nexus-text-muted leading-relaxed">
                    {event.description}
                  </p>

                  <div className="mt-2.5 flex items-center gap-2 text-[11px] text-nexus-text-dim">
                    <span className="flex items-center gap-1 font-medium text-nexus-text-muted">
                      <User className="w-3 h-3 text-indigo-400" />
                      {event.actor.name} ({event.actor.role})
                    </span>
                    <span>•</span>
                    <span className="capitalize font-mono px-2 py-0.5 rounded bg-nexus-elevated border border-nexus-border/60">
                      {event.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {filteredEvents.length > pageSize && (
            <div className="text-center pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPageSize(prev => prev + 15)}
              >
                Load Older Activity ({filteredEvents.length - pageSize} remaining)
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
