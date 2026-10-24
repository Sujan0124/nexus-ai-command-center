import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Project, ProjectStatus, Priority } from '../../types';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: Project | null;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  projectToEdit,
}) => {
  const { createProject, updateProject, teamMembers } = useAppData();
  const { user } = useAuth();
  const { success } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Active');
  const [priority, setPriority] = useState<Priority>('medium');
  const [owner, setOwner] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setDescription(projectToEdit.description);
      setStatus(projectToEdit.status);
      setPriority(projectToEdit.priority);
      setOwner(projectToEdit.owner);
      setTagsInput(projectToEdit.tags.join(', '));
      setDueDate(projectToEdit.dueDate);
      setErrors({});
    } else {
      setName('');
      setDescription('');
      setStatus('Active');
      setPriority('medium');
      setOwner(user?.name || teamMembers[0]?.name || 'Elena Rostova');
      setTagsInput('AI/ML, Core');
      setDueDate(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
      setErrors({});
    }
  }, [projectToEdit, isOpen, user, teamMembers]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Project name is required';
    if (!description.trim()) errs.description = 'Description is required';
    if (!dueDate) errs.dueDate = 'Due date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (projectToEdit) {
      updateProject(projectToEdit.id, {
        name: name.trim(),
        description: description.trim(),
        status,
        priority,
        owner,
        tags,
        dueDate,
      });
      success('Project updated successfully.');
    } else {
      createProject({
        name: name.trim(),
        description: description.trim(),
        status,
        priority,
        owner,
        tags,
        progress: 0,
        dueDate,
      });
      success('New project created successfully.');
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={projectToEdit ? 'Edit Project Details' : 'Create New Project'}
      description="Define project scope, operational tags, milestone timeline, and assigned team owner."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-nexus-text mb-1.5">
            Project Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Distributed Vector Memory Indexer"
            className={`w-full px-3.5 py-2 rounded-xl bg-nexus-base border text-sm text-nexus-text placeholder-nexus-text-dim focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
              errors.name ? 'border-rose-500' : 'border-nexus-border'
            }`}
          />
          {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-nexus-text mb-1.5">
            Description <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="High-level architecture objectives, dependencies, and deliverables..."
            className={`w-full px-3.5 py-2 rounded-xl bg-nexus-base border text-sm text-nexus-text placeholder-nexus-text-dim focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
              errors.description ? 'border-rose-500' : 'border-nexus-border'
            }`}
          />
          {errors.description && <p className="text-xs text-rose-400 mt-1">{errors.description}</p>}
        </div>

        {/* Status & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-nexus-text mb-1.5">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as ProjectStatus)}
              className="w-full px-3.5 py-2 rounded-xl bg-nexus-base border border-nexus-border text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Planning">Planning</option>
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
              <option value="Completed">Completed</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-nexus-text mb-1.5">Priority</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as Priority)}
              className="w-full px-3.5 py-2 rounded-xl bg-nexus-base border border-nexus-border text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Owner & Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-nexus-text mb-1.5">Owner</label>
            <select
              value={owner}
              onChange={e => setOwner(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-nexus-base border border-nexus-border text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {teamMembers.map(m => (
                <option key={m.id} value={m.name}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-nexus-text mb-1.5">
              Target Launch Due Date <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className={`w-full px-3.5 py-2 rounded-xl bg-nexus-base border text-sm text-nexus-text focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                errors.dueDate ? 'border-rose-500' : 'border-nexus-border'
              }`}
            />
            {errors.dueDate && <p className="text-xs text-rose-400 mt-1">{errors.dueDate}</p>}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-nexus-text mb-1.5">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            placeholder="DevSecOps, Kubernetes, AI/ML, Rust"
            className="w-full px-3.5 py-2 rounded-xl bg-nexus-base border border-nexus-border text-sm text-nexus-text placeholder-nexus-text-dim focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-nexus-border">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            {projectToEdit ? 'Save Changes' : 'Initialize Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
