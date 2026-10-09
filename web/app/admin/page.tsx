'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import {
  Users,
  UserPlus,
  Shield,
  Key,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Search,
  MoreVertical,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  Edit2,
  X,
  ExternalLink,
} from 'lucide-react';
import { formatDate, getRemainingDays } from '@/lib/utils';

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended' | 'expired';
  licenseKey: string;
  subscriptionExpiresAt: string;
  price?: string;
  notes?: string;
  createdAt: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isExtendOpen, setIsExtendOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  // Form states for creation
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createDurationDays, setCreateDurationDays] = useState('30');
  const [createCustomDate, setCreateCustomDate] = useState('');
  const [createPrice, setCreatePrice] = useState('$50');
  const [createNotes, setCreateNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states for extending
  const [extendDays, setExtendDays] = useState('30');
  const [extendCustomDate, setExtendCustomDate] = useState('');

  // Copy feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session && session.user.role !== 'admin') {
      router.push('/dashboard');
    } else if (session && session.user.role === 'admin') {
      fetchUsers();
    }
  }, [session, status, router]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload: any = {
        name: createName.trim(),
        email: createEmail.trim(),
        password: createPassword,
        price: createPrice,
        notes: createNotes,
      };

      if (createCustomDate) {
        payload.customExpiresAt = new Date(createCustomDate).toISOString();
      } else {
        payload.daysValid = parseInt(createDurationDays, 10);
      }

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to create user');
        setSubmitting(false);
        return;
      }

      setIsCreateOpen(false);
      // Reset form
      setCreateName('');
      setCreateEmail('');
      setCreatePassword('');
      setCreateCustomDate('');
      setCreateNotes('');
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExtendSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);

    try {
      const payload: any = { action: 'extend' };
      if (extendCustomDate) {
        payload.customExpiresAt = new Date(extendCustomDate).toISOString();
      } else {
        payload.addDays = parseInt(extendDays, 10);
      }

      const res = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsExtendOpen(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: UserRecord) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle-status', status: newStatus }),
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegenerateKey = async (user: UserRecord) => {
    if (!confirm(`Regenerate license key for ${user.name}? The old key will stop working immediately.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'regenerate-key' }),
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (user: UserRecord) => {
    if (!confirm(`Are you sure you want to permanently delete ${user.name} (${user.email})?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: 'DELETE',
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.licenseKey.toLowerCase().includes(searchTerm.toLowerCase());

    const { isExpired } = getRemainingDays(u.subscriptionExpiresAt);
    let matchStatus = true;
    if (statusFilter === 'active') matchStatus = u.status === 'active' && !isExpired;
    else if (statusFilter === 'expired') matchStatus = isExpired || u.status === 'expired';
    else if (statusFilter === 'suspended') matchStatus = u.status === 'suspended';

    return matchSearch && matchStatus;
  });

  // Calculate statistics
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => {
    const { isExpired } = getRemainingDays(u.subscriptionExpiresAt);
    return u.status === 'active' && !isExpired;
  }).length;
  const expiredUsers = users.filter((u) => getRemainingDays(u.subscriptionExpiresAt).isExpired).length;

  return (
    <>
      <Navbar />

      <main style={{ padding: '40px 0 80px 0' }}>
        <div className="container">
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '32px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700 }}>Admin License Manager</h1>
                <span className="badge badge-admin">Master Control</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Create customer accounts, set custom activation periods, and manage licenses.
              </p>
            </div>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="btn btn-primary btn-lg"
              style={{ gap: '8px' }}
            >
              <UserPlus size={18} />
              <span>Create / Activate Customer</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '32px',
            }}
          >
            <div className="glass-card" style={{ padding: '20px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Total Accounts
              </span>
              <div style={{ fontSize: '26px', fontWeight: 700, marginTop: '4px' }}>{totalUsers}</div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Active Subscribers
              </span>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#34d399', marginTop: '4px' }}>
                {activeUsers}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Expired Licenses
              </span>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#f87171', marginTop: '4px' }}>
                {expiredUsers}
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
              <input
                type="text"
                placeholder="Search by name, email, or key..."
                className="form-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '38px', height: '42px' }}
              />
              <Search
                size={16}
                color="#64748b"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {['all', 'active', 'expired', 'suspended'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`btn btn-sm ${statusFilter === filter ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>License Key</th>
                  <th>Status</th>
                  <th>Expiration Date</th>
                  <th>Remaining</th>
                  <th>Negotiated Price / Notes</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '36px' }}>
                      Loading accounts...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No customers found matching criteria. Click &quot;Create / Activate Customer&quot; above to add one.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const { days, isExpired } = getRemainingDays(u.subscriptionExpiresAt);
                    const isSuspended = u.status === 'suspended';

                    return (
                      <tr key={u._id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{u.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.email}</div>
                        </td>
                        <td>
                          <div
                            className="key-chip"
                            onClick={() => handleCopyKey(u.licenseKey)}
                            title="Click to copy license key"
                          >
                            <span>{u.licenseKey}</span>
                            {copiedKey === u.licenseKey ? (
                              <Check size={12} color="#10b981" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </div>
                        </td>
                        <td>
                          {isSuspended ? (
                            <span className="badge badge-suspended">Suspended</span>
                          ) : isExpired ? (
                            <span className="badge badge-expired">Expired</span>
                          ) : (
                            <span className="badge badge-active">Active</span>
                          )}
                        </td>
                        <td>{formatDate(u.subscriptionExpiresAt)}</td>
                        <td>
                          <span
                            style={{
                              fontWeight: 600,
                              color: isExpired || isSuspended ? '#f87171' : '#34d399',
                            }}
                          >
                            {isExpired ? '0 days' : `${days} days`}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500, color: '#fbbf24' }}>{u.price || '-'}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.notes || '-'}</div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setIsExtendOpen(true);
                              }}
                              className="btn btn-secondary btn-sm"
                              title="Extend subscription duration"
                            >
                              <Calendar size={13} />
                              <span>Extend</span>
                            </button>

                            <button
                              onClick={() => handleToggleStatus(u)}
                              className={`btn btn-sm ${isSuspended ? 'btn-accent' : 'btn-secondary'}`}
                              title={isSuspended ? 'Reactivate' : 'Suspend'}
                            >
                              {isSuspended ? 'Activate' : 'Suspend'}
                            </button>

                            <button
                              onClick={() => handleRegenerateKey(u)}
                              className="btn btn-secondary btn-sm"
                              title="Regenerate license key"
                            >
                              <RefreshCw size={13} />
                            </button>

                            {u.role !== 'admin' && (
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="btn btn-danger btn-sm"
                                title="Delete user"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* CREATE USER MODAL */}
      {isCreateOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Create & Activate Customer</h2>
              <button onClick={() => setIsCreateOpen(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>

            {errorMsg && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  fontSize: '13px',
                  marginBottom: '16px',
                }}
              >
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label>Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  className="form-input"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  className="form-input"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Temporary Password *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pass1234!"
                  className="form-input"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                />
              </div>

              {/* DURATION SELECTION */}
              <div className="form-group">
                <label>Activation Duration (Preset)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
                  {[
                    { label: '7 Days', val: '7' },
                    { label: '30 Days (1 Mo)', val: '30' },
                    { label: '90 Days (3 Mo)', val: '90' },
                    { label: '180 Days (6 Mo)', val: '180' },
                    { label: '365 Days (1 Yr)', val: '365' },
                    { label: 'Lifetime (10 Yr)', val: '3650' },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => {
                        setCreateDurationDays(p.val);
                        setCreateCustomDate('');
                      }}
                      className={`btn btn-sm ${
                        createDurationDays === p.val && !createCustomDate ? 'btn-primary' : 'btn-secondary'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Or Exact Expiry Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={createCustomDate}
                  onChange={(e) => setCreateCustomDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Negotiated Price (for your records)</label>
                <input
                  type="text"
                  placeholder="e.g. $50 or $120"
                  className="form-input"
                  value={createPrice}
                  onChange={(e) => setCreatePrice(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Internal Notes</label>
                <textarea
                  placeholder="e.g. Paid via PayPal, agreed on 1-month access"
                  className="form-textarea"
                  value={createNotes}
                  onChange={(e) => setCreateNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="btn btn-secondary full-width"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary full-width"
                >
                  {submitting ? 'Creating...' : 'Activate Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXTEND SUBSCRIPTION MODAL */}
      {isExtendOpen && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Extend Subscription: {selectedUser.name}</h2>
              <button onClick={() => setIsExtendOpen(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Current Expiry: <strong>{formatDate(selectedUser.subscriptionExpiresAt)}</strong>
            </p>

            <form onSubmit={handleExtendSubscription}>
              <div className="form-group">
                <label>Add Days (Preset)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
                  {[
                    { label: '+7 Days', val: '7' },
                    { label: '+30 Days', val: '30' },
                    { label: '+90 Days', val: '90' },
                    { label: '+180 Days', val: '180' },
                    { label: '+365 Days', val: '365' },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => {
                        setExtendDays(p.val);
                        setExtendCustomDate('');
                      }}
                      className={`btn btn-sm ${
                        extendDays === p.val && !extendCustomDate ? 'btn-primary' : 'btn-secondary'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Or Set Specific New Expiry Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={extendCustomDate}
                  onChange={(e) => setExtendCustomDate(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setIsExtendOpen(false)}
                  className="btn btn-secondary full-width"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary full-width"
                >
                  {submitting ? 'Updating...' : 'Save & Extend'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
