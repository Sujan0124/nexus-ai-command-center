import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderKanban, 
  Search, 
  Plus, 
  LayoutGrid, 
  List, 
  Trash2, 
  Edit3, 
  Calendar, 
  User, 
  Tag, 
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { Project, ProjectStatus } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ProjectFormModal } from '../components/projects/ProjectFormModal';
import { useToast } from '../context/ToastContext';

export const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { projects, deleteProject, teamMembers } = useAppData();
  const { success } = useToast();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [ownerFilter, setOwnerFilter] = useState<string>('ALL');
  const [tagFilter, setTagFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'dueDate' | 'created'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    projects.forEach(p => p.tags.forEach(t => set.add(t)));
    return Array.from(set);
  }, [projects]);

  // Filter & Sort
  const filteredProjects = useMemo(() => {
    return projects
      .filter(p => {
        const matchesQuery = 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
        const matchesOwner = ownerFilter === 'ALL' || p.owner === ownerFilter;
        const matchesTag = tagFilter === 'ALL' || p.tags.includes(tagFilter);

        return matchesQuery && matchesStatus && matchesOwner && matchesTag;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
        else if (sortBy === 'progress') cmp = a.progress - b.progress;
        else if (sortBy === 'dueDate') cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        else if (sortBy === 'created') cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

        return sortOrder === 'asc' ? cmp : -cmp;
      });
  }, [projects, searchQuery, statusFilter, ownerFilter, tagFilter, sortBy, sortOrder]);

  const handleDeleteConfirm = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      success('Project Deleted', `"${projectToDelete.name}" was permanently removed.`);
      setProjectToDelete(null);
    }
  };

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'Active': return <Badge variant="emerald" dot>Active</Badge>;
      case 'Planning': return <Badge variant="indigo">Planning</Badge>;
      case 'Paused': return <Badge variant="amber">Paused</Badge>;
      case 'Completed': return <Badge variant="cyan">Completed</Badge>;
      case 'Archived': return <Badge variant="slate">Archived</Badge>;
      default: return <Badge variant="slate">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-nexus-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-nexus-text">
            Project Initiatives
          </h1>
          <p className="text-xs sm:text-sm text-nexus-text-muted mt-1">
            Track engineering projects, milestone checklists, and associated AI workflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-xl bg-nexus-surface border border-nexus-border p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-nexus-elevated text-nexus-text shadow-sm' : 'text-nexus-text-dim hover:text-nexus-text'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'list' ? 'bg-nexus-elevated text-nexus-text shadow-sm' : 'text-nexus-text-dim hover:text-nexus-text'
              }`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateOpen(true)}
          >
            Create Project
          </Button>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-nexus-text-dim" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, tags, description..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-nexus-surface border border-nexus-border text-xs sm:text-sm text-nexus-text placeholder-nexus-text-dim focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-nexus-surface border border-nexus-border text-xs text-nexus-text focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Planning">Planning</option>
          <option value="Paused">Paused</option>
          <option value="Completed">Completed</option>
          <option value="Archived">Archived</option>
        </select>

        {/* Owner Filter */}
        <select
          value={ownerFilter}
          onChange={e => setOwnerFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-nexus-surface border border-nexus-border text-xs text-nexus-text focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="ALL">All Owners</option>
          {teamMembers.map(m => (
            <option key={m.id} value={m.name}>
              {m.name}
            </option>
          ))}
        </select>

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="flex-1 px-3 py-2 rounded-xl bg-nexus-surface border border-nexus-border text-xs text-nexus-text focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="created">Sort by: Date Created</option>
            <option value="progress">Sort by: Progress</option>
            <option value="name">Sort by: Name</option>
            <option value="dueDate">Sort by: Due Date</option>
          </select>
          <button
            onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
            className="p-2 rounded-xl bg-nexus-surface border border-nexus-border text-nexus-text-muted hover:text-nexus-text"
            title={`Toggle order (${sortOrder})`}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Projects Display */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="w-6 h-6" />}
          title="No projects match your filter"
          description="Try clearing search filters or create a new initiative."
          actionText="Create Project"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map(project => (
            <div
              key={project.id}
              className="group bg-nexus-surface border border-nexus-border hover:border-nexus-border-bright rounded-2xl p-5 shadow-sm hover:shadow-nexus-card transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-xs font-mono text-indigo-400">
                    {project.id.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-1">
                    {getStatusBadge(project.status)}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setProjectToEdit(project);
                      }}
                      className="p-1 text-nexus-text-dim hover:text-nexus-text rounded-md hover:bg-nexus-elevated transition-colors ml-1"
                      title="Edit project"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setProjectToDelete(project);
                      }}
                      className="p-1 text-nexus-text-dim hover:text-rose-400 rounded-md hover:bg-rose-500/10 transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="text-base font-semibold text-nexus-text group-hover:text-indigo-300 cursor-pointer transition-colors line-clamp-1"
                >
                  {project.name}
                </h3>
                <p className="text-xs text-nexus-text-muted mt-1.5 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {project.tags.map(tag => (
                    <span
                      key={tag}
                      onClick={() => setTagFilter(tag)}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-nexus-base border border-nexus-border text-nexus-text-dim hover:text-nexus-text cursor-pointer transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 mt-4 border-t border-nexus-border space-y-3">
                <div className="flex items-center justify-between text-xs text-nexus-text-dim">
                  <span className="flex items-center gap-1.5 truncate">
                    <User className="w-3.5 h-3.5 text-nexus-text-muted" />
                    {project.owner}
                  </span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-nexus-text-muted" />
                    {project.dueDate}
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-nexus-text-dim text-[11px]">Milestone</span>
                    <span className="text-nexus-text">{project.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-nexus-base rounded-full border border-nexus-border overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
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
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-nexus-surface border border-nexus-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-nexus-base border-b border-nexus-border text-nexus-text-dim uppercase font-mono tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-medium">Project Name</th>
                  <th className="py-3.5 px-4 font-medium">Status</th>
                  <th className="py-3.5 px-4 font-medium">Priority</th>
                  <th className="py-3.5 px-4 font-medium">Lead</th>
                  <th className="py-3.5 px-4 font-medium">Progress</th>
                  <th className="py-3.5 px-4 font-medium">Due Date</th>
                  <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nexus-border text-nexus-text">
                {filteredProjects.map(project => (
                  <tr
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="hover:bg-nexus-elevated/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-nexus-text">
                      <div className="flex flex-col">
                        <span className="hover:text-indigo-400 transition-colors">{project.name}</span>
                        <span className="text-[11px] text-nexus-text-dim font-normal line-clamp-1">{project.description}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(project.status)}</td>
                    <td className="py-3 px-4">
                      <span className="capitalize font-medium">{project.priority}</span>
                    </td>
                    <td className="py-3 px-4 text-nexus-text-muted">{project.owner}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-nexus-base rounded-full border border-nexus-border overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-nexus-text-muted">{project.dueDate}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setProjectToEdit(project)}
                          className="p-1.5 text-nexus-text-dim hover:text-nexus-text hover:bg-nexus-elevated rounded-lg transition-colors"
                          title="Edit project"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setProjectToDelete(project)}
                          className="p-1.5 text-nexus-text-dim hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Project Form Modal (Create or Edit) */}
      <ProjectFormModal
        isOpen={isCreateOpen || projectToEdit !== null}
        onClose={() => {
          setIsCreateOpen(false);
          setProjectToEdit(null);
        }}
        projectToEdit={projectToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={projectToDelete !== null}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Project Initiative?"
        message={`Are you sure you want to permanently delete "${projectToDelete?.name}"? All associated task checklists and milestones will be removed.`}
        confirmText="Delete Project"
        isDestructive={true}
      />
    </div>
  );
};
