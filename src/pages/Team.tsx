import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  Edit2, 
  Mail, 
  ShieldCheck, 
  Shield, 
  Check, 
  Info,
  Building
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { TeamMember, TeamRole } from '../types';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';

export const Team: React.FC = () => {
  const { teamMembers, inviteMember, updateMemberRole, removeMember } = useAppData();
  const { success, error: toastError } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Invite Modal
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('Member');
  const [inviteDept, setInviteDept] = useState('Machine Learning');
  const [inviteError, setInviteError] = useState('');

  // Role Edit Modal
  const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null);
  const [newRole, setNewRole] = useState<TeamRole>('Member');

  // Remove confirmation
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);

  const filteredMembers = useMemo(() => {
    return teamMembers.filter(m => {
      const matchesSearch = 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [teamMembers, searchQuery, roleFilter]);

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      setInviteError('Name and email are required');
      return;
    }
    if (!inviteEmail.includes('@')) {
      setInviteError('Enter a valid email address');
      return;
    }

    inviteMember(inviteName.trim(), inviteEmail.trim(), inviteRole, inviteDept.trim());
    success('Member Provisioned', `${inviteName} was added to the workspace as ${inviteRole}.`);
    setIsInviteOpen(false);
    setInviteName('');
    setInviteEmail('');
    setInviteError('');
  };

  const handleRoleUpdate = () => {
    if (memberToEdit) {
      updateMemberRole(memberToEdit.id, newRole);
      success('Role Updated', `${memberToEdit.name} is now a ${newRole}.`);
      setMemberToEdit(null);
    }
  };

  const handleRemoveConfirm = () => {
    if (memberToRemove) {
      if (memberToRemove.role === 'Owner') {
        toastError('Cannot Remove Owner', 'The workspace Owner cannot be removed.');
        setMemberToRemove(null);
        return;
      }
      removeMember(memberToRemove.id);
      success('Member Removed', `${memberToRemove.name} was removed from the workspace.`);
      setMemberToRemove(null);
    }
  };

  const getRoleBadge = (role: TeamRole) => {
    switch (role) {
      case 'Owner': return <Badge variant="indigo" size="sm">Owner</Badge>;
      case 'Admin': return <Badge variant="cyan" size="sm">Admin</Badge>;
      case 'Member': return <Badge variant="emerald" size="sm">Member</Badge>;
      case 'Viewer': return <Badge variant="slate" size="sm">Viewer</Badge>;
      default: return <Badge variant="slate" size="sm">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-nexus-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-nexus-text">
            Team & Workspace Access
          </h1>
          <p className="text-xs sm:text-sm text-nexus-text-muted mt-1">
            Manage engineering contributors, fine-grained access roles, and audit permissions.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsInviteOpen(true)}
        >
          Invite Contributor
        </Button>
      </div>

      {/* Role Guide Notice */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        {[
          { role: 'Owner', desc: 'Full workspace authority, billing, team provisioning & destructive actions' },
          { role: 'Admin', desc: 'Can create/modify all pipelines, projects, and manage team membership' },
          { role: 'Member', desc: 'Can build workflows, edit assigned projects, and trigger manual runs' },
          { role: 'Viewer', desc: 'Read-only access to metrics, dashboards, and audit telemetry logs' },
        ].map(r => (
          <div key={r.role} className="p-3 rounded-xl bg-nexus-surface border border-nexus-border">
            <span className="font-semibold text-nexus-text block mb-1">{r.role}</span>
            <p className="text-[11px] text-nexus-text-dim leading-relaxed">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-nexus-text-dim" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search team members by name, email, department..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-nexus-surface border border-nexus-border text-xs sm:text-sm text-nexus-text placeholder-nexus-text-dim focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-nexus-surface border border-nexus-border text-xs text-nexus-text focus:outline-none"
        >
          <option value="ALL">All Roles</option>
          <option value="Owner">Owner</option>
          <option value="Admin">Admin</option>
          <option value="Member">Member</option>
          <option value="Viewer">Viewer</option>
        </select>
      </div>

      {/* Team Member Cards / Table */}
      {filteredMembers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title="No team members match search"
          description="Try clearing search filters or invite a new collaborator."
          actionText="Invite Member"
          onAction={() => setIsInviteOpen(true)}
        />
      ) : (
        <div className="bg-nexus-surface border border-nexus-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-nexus-base border-b border-nexus-border text-nexus-text-dim uppercase font-mono tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-medium">Member</th>
                  <th className="py-3.5 px-4 font-medium">Role</th>
                  <th className="py-3.5 px-4 font-medium">Department</th>
                  <th className="py-3.5 px-4 font-medium">Joined Date</th>
                  <th className="py-3.5 px-4 font-medium">Last Active</th>
                  <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nexus-border text-nexus-text">
                {filteredMembers.map(member => (
                  <tr key={member.id} className="hover:bg-nexus-elevated/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-8 h-8 rounded-xl object-cover border border-nexus-border shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-nexus-text truncate">{member.name}</p>
                          <p className="text-[11px] text-nexus-text-dim truncate">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getRoleBadge(member.role)}</td>
                    <td className="py-3 px-4 text-nexus-text-muted">{member.department}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-nexus-text-dim">{member.joinedAt}</td>
                    <td className="py-3 px-4 text-nexus-text-muted">{member.lastActive}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setMemberToEdit(member);
                            setNewRole(member.role);
                          }}
                          className="p-1.5 text-nexus-text-dim hover:text-nexus-text hover:bg-nexus-elevated rounded-lg transition-colors"
                          title="Change role"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {member.role !== 'Owner' && (
                          <button
                            onClick={() => setMemberToRemove(member)}
                            className="p-1.5 text-nexus-text-dim hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Remove member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite New Contributor"
        description="Demo invitation flow: immediately provisions simulated access credentials."
        maxWidth="md"
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-nexus-text mb-1">
              Full Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={inviteName}
              onChange={e => setInviteName(e.target.value)}
              placeholder="e.g. Rachel Foster"
              className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border text-xs sm:text-sm text-nexus-text focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-nexus-text mb-1">
              Email Address <span className="text-rose-400">*</span>
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="rachel.foster@nexus-ai.internal"
              className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border text-xs sm:text-sm text-nexus-text focus:outline-none"
            />
            {inviteError && <p className="text-xs text-rose-400 mt-1">{inviteError}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-nexus-text mb-1">Assigned Role</label>
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value as TeamRole)}
                className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border text-xs text-nexus-text focus:outline-none"
              >
                <option value="Admin">Admin</option>
                <option value="Member">Member</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-nexus-text mb-1">Department</label>
              <input
                type="text"
                value={inviteDept}
                onChange={e => setInviteDept(e.target.value)}
                placeholder="Platform Engineering"
                className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border text-xs text-nexus-text focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-left text-[11px] text-nexus-text-muted flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              Simulated Invitation Notice: No external SMTP network packets are transmitted. Member profile is provisioned locally into workspace state.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-nexus-border">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit">
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Role Change Modal */}
      {memberToEdit && (
        <Modal
          isOpen={true}
          onClose={() => setMemberToEdit(null)}
          title={`Edit Role: ${memberToEdit.name}`}
          maxWidth="sm"
        >
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-nexus-text mb-1">Select Access Role</label>
            <select
              value={newRole}
              onChange={e => setNewRole(e.target.value as TeamRole)}
              className="w-full px-3 py-2 rounded-xl bg-nexus-base border border-nexus-border text-xs text-nexus-text focus:outline-none"
            >
              <option value="Owner">Owner</option>
              <option value="Admin">Admin</option>
              <option value="Member">Member</option>
              <option value="Viewer">Viewer</option>
            </select>

            <div className="flex justify-end gap-2 pt-3 border-t border-nexus-border">
              <Button size="sm" variant="outline" onClick={() => setMemberToEdit(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleRoleUpdate}>
                Update Role
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Remove Confirmation */}
      <ConfirmDialog
        isOpen={memberToRemove !== null}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveConfirm}
        title="Remove Team Member?"
        message={`Are you sure you want to remove ${memberToRemove?.name} (${memberToRemove?.email}) from the workspace?`}
        confirmText="Remove Member"
        isDestructive={true}
      />
    </div>
  );
};
