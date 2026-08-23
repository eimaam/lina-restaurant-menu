import React, { useState, useEffect } from 'react';
import { Plus, UserPlus, KeyRound, CheckCircle2, XCircle, Trash2, Shield, User } from 'lucide-react';
import { adminApi } from '../lib/api';
import { Button, Input, Modal, Badge, toast } from '@lina/ui';
import { UserRole, type UserResponse } from '@lina/types';

export const StaffManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Create User Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: UserRole.Staff,
  });

  // Reset Password Modal State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<UserResponse | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.password) return;

    try {
      await adminApi.createUser(createForm);
      toast.success('Staff user account created successfully.');
      setCreateModalOpen(false);
      setCreateForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: UserRole.Staff,
      });
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create user account.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser || !newPassword) return;

    try {
      await adminApi.resetPassword(targetUser._id || targetUser.id || '', newPassword);
      toast.success(`Password reset successfully for ${targetUser.name}.`);
      setResetModalOpen(false);
      setNewPassword('');
    } catch (err: any) {
      toast.error('Failed to reset password.');
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      await adminApi.toggleUserStatus(userId);
      toast.success('Account status updated.');
      loadUsers();
    } catch (err) {
      toast.error('Failed to update account status.');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${userName}"?`)) return;
    try {
      await adminApi.deleteUser(userId);
      toast.success('User account deleted.');
      loadUsers();
    } catch (err) {
      toast.error('Failed to delete user.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-on-surface">
            Staff & Personnel Management
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Administer floor staff, cashiers, kitchen accounts and password credentials
          </p>
        </div>

        <Button
          onClick={() => setCreateModalOpen(true)}
          variant="gold"
          size="sm"
          icon={<UserPlus size={14} />}
        >
          Create Staff User
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant overflow-hidden shadow-card">
        {loading ? (
          <div className="p-12 text-center text-xs text-on-surface-variant">Loading user accounts...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-xs text-on-surface-variant">No user accounts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low border-b border-outline-variant text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Staff Member</th>
                  <th className="py-3.5 px-4">Contact Phone</th>
                  <th className="py-3.5 px-4">Assigned Role</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {users.map((u) => {
                  const uid = u._id || u.id || '';
                  const isAdmin = u.role === UserRole.Admin;
                  return (
                    <tr key={uid} className="hover:bg-surface-container/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-xs text-on-surface">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-on-surface">{u.name}</div>
                            <div className="text-[11px] text-on-surface-variant">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-on-surface-variant">
                        {u.phone || '—'}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant={isAdmin ? 'primary' : 'neutral'} size="sm">
                          {isAdmin ? (
                            <span className="flex items-center gap-1">
                              <Shield size={11} /> Super Admin
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <User size={11} /> Floor Staff
                            </span>
                          )}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(uid)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                            u.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {u.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          <span>{u.isActive ? 'Active' : 'Disabled'}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setTargetUser(u);
                              setResetModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all"
                            title="Reset Password"
                          >
                            <KeyRound size={15} />
                          </button>

                          <button
                            onClick={() => handleDeleteUser(uid, u.name)}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/40 transition-all"
                            title="Delete User"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create Staff Modal ── */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Personnel Account"
        width={480}
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="e.g. Joy Okafor"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            required
          />

          <Input
            label="Email Address *"
            type="email"
            placeholder="e.g. staff1@linarestaurant.com"
            value={createForm.email}
            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
            required
          />

          <Input
            label="Phone Number"
            placeholder="e.g. 08012345678"
            value={createForm.phone}
            onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
          />

          <Input
            label="Initial Password *"
            type="password"
            placeholder="At least 6 characters"
            value={createForm.password}
            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Account Role *
            </label>
            <select
              value={createForm.role}
              onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as any })}
              className="w-full bg-surface-container-low text-xs rounded-xl p-3 border border-outline-variant focus:outline-none focus:border-primary font-medium"
            >
              <option value={UserRole.Staff}>Staff (Orders & Stock Toggles)</option>
              <option value={UserRole.Admin}>Admin (Full Access & User Management)</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold">
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Reset Password Modal ── */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title={`Reset Password: ${targetUser?.name}`}
        width={420}
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <p className="text-xs text-on-surface-variant">
            Enter a new password for {targetUser?.email}. They will be able to log in immediately.
          </p>

          <Input
            label="New Password *"
            type="password"
            placeholder="At least 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setResetModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold">
              Confirm Reset
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
