import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import SortableHeader from '../components/SortableHeader';
import StarRating from '../components/StarRating';
import { api } from '../api/client';
import {
  Users,
  Store,
  Star,
  Plus,
  Search,
  Filter,
  Check,
  AlertCircle,
  Building,
  UserCheck
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [activeTab, setActiveTab] = useState('stores'); // 'stores' | 'users'

  // Stores table state
  const [stores, setStores] = useState([]);
  const [storeSearch, setStoreSearch] = useState('');
  const [storeSortBy, setStoreSortBy] = useState('name');
  const [storeSortOrder, setStoreSortOrder] = useState('asc');

  // Users table state
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userSortBy, setUserSortBy] = useState('name');
  const [userSortOrder, setUserSortOrder] = useState('asc');

  // Modal states
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // Form states for Add Store
  const [storeForm, setStoreForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [storeError, setStoreError] = useState('');
  const [storeSubmitting, setStoreSubmitting] = useState(false);

  // Form states for Add User
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'USER'
  });
  const [userError, setUserError] = useState('');
  const [userFieldErrors, setUserFieldErrors] = useState({});
  const [userSubmitting, setUserSubmitting] = useState(false);

  const [loading, setLoading] = useState(false);

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      if (res.success) setStats(res.stats);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    }
  };

  // Fetch Stores List
  const fetchStores = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        search: storeSearch,
        sortBy: storeSortBy,
        sortOrder: storeSortOrder
      });
      const res = await api.get(`/admin/stores?${params.toString()}`);
      if (res.success) setStores(res.stores);
    } catch (err) {
      console.error('Error fetching stores:', err);
    }
  }, [storeSearch, storeSortBy, storeSortOrder]);

  // Fetch Users List
  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        search: userSearch,
        role: userRoleFilter,
        sortBy: userSortBy,
        sortOrder: userSortOrder
      });
      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.success) setUsers(res.users);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, [userSearch, userRoleFilter, userSortBy, userSortOrder]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'stores') {
      fetchStores();
    } else {
      fetchUsers();
    }
  }, [activeTab, fetchStores, fetchUsers]);

  // Handle store sorting
  const handleStoreSort = (field) => {
    if (storeSortBy === field) {
      setStoreSortOrder(storeSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setStoreSortBy(field);
      setStoreSortOrder('asc');
    }
  };

  // Handle user sorting
  const handleUserSort = (field) => {
    if (userSortBy === field) {
      setUserSortOrder(userSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setUserSortBy(field);
      setUserSortOrder('asc');
    }
  };

  // Submit Add Store
  const handleAddStoreSubmit = async (e) => {
    e.preventDefault();
    setStoreError('');
    setStoreSubmitting(true);

    try {
      await api.post('/admin/stores', {
        name: storeForm.name.trim(),
        email: storeForm.email.trim(),
        address: storeForm.address.trim(),
        ownerId: storeForm.ownerId ? Number(storeForm.ownerId) : null
      });
      setIsAddStoreOpen(false);
      setStoreForm({ name: '', email: '', address: '', ownerId: '' });
      fetchStores();
      fetchStats();
    } catch (err) {
      const detailed = err.errors ? Object.values(err.errors).join(' ') : null;
      setStoreError(detailed || err.message || 'Failed to create store.');
    } finally {
      setStoreSubmitting(false);
    }
  };

  // Quick helper to fill a compliant user
  const handleFillSampleUser = () => {
    setUserForm({
      name: 'Alexander Harrison Montgomery',
      email: `alex_${Math.floor(Math.random() * 8999 + 1000)}@storerating.com`,
      role: 'STORE_OWNER',
      password: 'SecurePass@2026',
      address: '742 Evergreen Terrace, Administrative Block 4'
    });
    setUserFieldErrors({});
    setUserError('');
  };

  // Submit Add User
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setUserError('');
    setUserFieldErrors({});

    const trimmedName = userForm.name.trim();
    const errors = {};

    if (trimmedName.length < 20 || trimmedName.length > 60) {
      errors.name = 'Name must be between 20 and 60 characters long.';
    }
    if (userForm.password.length < 8 || userForm.password.length > 16) {
      errors.password = 'Password must be between 8 and 16 characters long.';
    } else if (!/[A-Z]/.test(userForm.password)) {
      errors.password = 'Password must include at least one uppercase letter.';
    } else if (!/[^A-Za-z0-9\s]/.test(userForm.password)) {
      errors.password = 'Password must include at least one special character (!@#$...).';
    }

    if (Object.keys(errors).length > 0) {
      setUserFieldErrors(errors);
      setUserError(Object.values(errors).join(' '));
      return;
    }

    setUserSubmitting(true);

    try {
      await api.post('/admin/users', {
        name: trimmedName,
        email: userForm.email.trim(),
        address: userForm.address.trim(),
        password: userForm.password,
        role: userForm.role
      });
      setIsAddUserOpen(false);
      setUserForm({ name: '', email: '', address: '', password: '', role: 'USER' });
      fetchUsers();
      fetchStats();
    } catch (err) {
      const detailed = err.errors ? Object.values(err.errors).join(' ') : null;
      setUserError(detailed || err.message || 'Failed to create user.');
      if (err.errors) {
        setUserFieldErrors(err.errors);
      }
    } finally {
      setUserSubmitting(false);
    }
  };

  // Store Owners list for dropdown in Add Store
  const availableStoreOwners = users.filter((u) => u.role === 'STORE_OWNER');

  return (
    <>
      <Navbar />

      <main className="container">
        {/* Metric Summary Counters */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#ede9fe', color: '#6d28d9' }}>
              <Users size={26} />
            </div>
            <div>
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-label">Total Registered Users</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
              <Building size={26} />
            </div>
            <div>
              <div className="stat-value">{stats.totalStores}</div>
              <div className="stat-label">Total Stores on Platform</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Star size={26} />
            </div>
            <div>
              <div className="stat-value">{stats.totalRatings}</div>
              <div className="stat-label">Submitted Ratings</div>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '8px', background: '#e2e8f0', padding: '4px', borderRadius: '10px' }}>
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'stores' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none' }}
              onClick={() => setActiveTab('stores')}
            >
              <Store size={15} /> Stores Listing ({stores.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none' }}
              onClick={() => setActiveTab('users')}
            >
              <Users size={15} /> Users Listing ({users.length})
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setUserError('');
                setIsAddUserOpen(true);
              }}
            >
              <Plus size={16} /> Add User
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setStoreError('');
                fetchUsers(); // ensure store owners dropdown is loaded
                setIsAddStoreOpen(true);
              }}
            >
              <Plus size={16} /> Add Store
            </button>
          </div>
        </div>

        {/* STORES TAB VIEW */}
        {activeTab === 'stores' && (
          <div className="card">
            <div className="filter-bar">
              <div className="search-input-wrap">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter stores by Name, Email, or Address..."
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <SortableHeader label="Store Name" field="name" currentSort={storeSortBy} currentOrder={storeSortOrder} onSort={handleStoreSort} />
                    <SortableHeader label="Email" field="email" currentSort={storeSortBy} currentOrder={storeSortOrder} onSort={handleStoreSort} />
                    <SortableHeader label="Address" field="address" currentSort={storeSortBy} currentOrder={storeSortOrder} onSort={handleStoreSort} />
                    <SortableHeader label="Overall Rating" field="rating" currentSort={storeSortBy} currentOrder={storeSortOrder} onSort={handleStoreSort} />
                    <SortableHeader label="Total Reviews" field="total_ratings" currentSort={storeSortBy} currentOrder={storeSortOrder} onSort={handleStoreSort} />
                  </tr>
                </thead>
                <tbody>
                  {stores.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                        No stores found matching your query.
                      </td>
                    </tr>
                  ) : (
                    stores.map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                        <td style={{ color: '#475569' }}>{s.email}</td>
                        <td style={{ color: '#475569', maxWidth: '300px' }}>{s.address}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <StarRating rating={s.rating} size={15} showValue />
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: '#334155' }}>{s.totalRatings}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* USERS TAB VIEW */}
        {activeTab === 'users' && (
          <div className="card">
            <div className="filter-bar">
              <div className="search-input-wrap">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter users by Name, Email, Address, or Role..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>

              <div style={{ minWidth: '180px' }}>
                <select
                  className="form-select"
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="ADMIN">System Administrator</option>
                  <option value="USER">Normal User</option>
                  <option value="STORE_OWNER">Store Owner</option>
                </select>
              </div>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <SortableHeader label="Name" field="name" currentSort={userSortBy} currentOrder={userSortOrder} onSort={handleUserSort} />
                    <SortableHeader label="Email" field="email" currentSort={userSortBy} currentOrder={userSortOrder} onSort={handleUserSort} />
                    <SortableHeader label="Address" field="address" currentSort={userSortBy} currentOrder={userSortOrder} onSort={handleUserSort} />
                    <SortableHeader label="Role" field="role" currentSort={userSortBy} currentOrder={userSortOrder} onSort={handleUserSort} />
                    <SortableHeader label="Store Owner Rating" field="rating" currentSort={userSortBy} currentOrder={userSortOrder} onSort={handleUserSort} />
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                        No users found matching your query.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                        <td style={{ color: '#475569' }}>{u.email}</td>
                        <td style={{ color: '#475569', maxWidth: '300px' }}>{u.address}</td>
                        <td>
                          {u.role === 'ADMIN' && <span className="badge badge-admin">Admin</span>}
                          {u.role === 'STORE_OWNER' && <span className="badge badge-owner">Store Owner</span>}
                          {u.role === 'USER' && <span className="badge badge-user">User</span>}
                        </td>
                        <td>
                          {u.role === 'STORE_OWNER' ? (
                            u.rating !== null ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <StarRating rating={u.rating} size={14} showValue />
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({u.storeName})</span>
                              </div>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.825rem' }}>No ratings yet</span>
                            )
                          ) : (
                            <span style={{ color: '#cbd5e1' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ADD STORE MODAL */}
      <Modal isOpen={isAddStoreOpen} onClose={() => setIsAddStoreOpen(false)} title="Register New Store">
        <form onSubmit={handleAddStoreSubmit}>
          {storeError && (
            <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.875rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <AlertCircle size={18} />
              <span>{storeError}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Store Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Blue Bottle Coffee"
              value={storeForm.name}
              onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
              required
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contact Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="store@example.com"
              value={storeForm.email}
              onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Street address, unit, city, state"
              value={storeForm.address}
              onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
              required
              maxLength={400}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assign Store Owner (Optional)</label>
            <select
              className="form-select"
              value={storeForm.ownerId}
              onChange={(e) => setStoreForm({ ...storeForm, ownerId: e.target.value })}
            >
              <option value="">No owner assigned</option>
              {availableStoreOwners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.email})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddStoreOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={storeSubmitting}>
              {storeSubmitting ? 'Adding...' : 'Create Store'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ADD USER MODAL */}
      <Modal isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} title="Create New Platform User">
        <form onSubmit={handleAddUserSubmit}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.775rem', padding: '4px 10px', color: '#4f46e5' }}
              onClick={handleFillSampleUser}
            >
              Fill Sample Compliant User
            </button>
          </div>

          {userError && (
            <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.875rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <AlertCircle size={18} />
              <span>{userError}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Christopher Montgomery Vance"
              value={userForm.name}
              onChange={(e) => {
                setUserForm({ ...userForm, name: e.target.value });
                if (userFieldErrors.name) setUserFieldErrors({ ...userFieldErrors, name: null });
              }}
              required
            />
            <div className="form-hint">
              <span>Min 20, Max 60 characters</span>
              <span style={{ color: userForm.name.length >= 20 && userForm.name.length <= 60 ? '#059669' : '#ef4444' }}>
                {userForm.name.length} / 60
              </span>
            </div>
            {userFieldErrors.name && (
              <div style={{ color: '#ef4444', fontSize: '0.825rem', marginTop: '4px' }}>
                {userFieldErrors.name}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="user@example.com"
              value={userForm.email}
              onChange={(e) => {
                setUserForm({ ...userForm, email: e.target.value });
                if (userFieldErrors.email) setUserFieldErrors({ ...userFieldErrors, email: null });
              }}
              required
            />
            {userFieldErrors.email && (
              <div style={{ color: '#ef4444', fontSize: '0.825rem', marginTop: '4px' }}>
                {userFieldErrors.email}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              className="form-select"
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
            >
              <option value="USER">Normal User</option>
              <option value="ADMIN">System Administrator</option>
              <option value="STORE_OWNER">Store Owner</option>
            </select>
            {userFieldErrors.role && (
              <div style={{ color: '#ef4444', fontSize: '0.825rem', marginTop: '4px' }}>
                {userFieldErrors.role}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="8-16 chars, 1 uppercase, 1 special char"
              maxLength={16}
              value={userForm.password}
              onChange={(e) => {
                setUserForm({ ...userForm, password: e.target.value });
                if (userFieldErrors.password) setUserFieldErrors({ ...userFieldErrors, password: null });
              }}
              required
            />
            <div className="form-hint" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem' }}>
                <span style={{ color: userForm.password.length >= 8 && userForm.password.length <= 16 ? '#059669' : '#64748b' }}>
                  {userForm.password.length >= 8 && userForm.password.length <= 16 ? '✓ 8-16 chars' : '• 8-16 chars'}
                </span>
                <span style={{ color: /[A-Z]/.test(userForm.password) ? '#059669' : '#64748b' }}>
                  {/[A-Z]/.test(userForm.password) ? '✓ 1 Uppercase' : '• 1 Uppercase'}
                </span>
                <span style={{ color: /[^A-Za-z0-9\s]/.test(userForm.password) ? '#059669' : '#64748b' }}>
                  {/[^A-Za-z0-9\s]/.test(userForm.password) ? '✓ 1 Special' : '• 1 Special'}
                </span>
              </div>
              <span style={{ color: userForm.password.length >= 8 && userForm.password.length <= 16 ? '#059669' : '#ef4444' }}>
                {userForm.password.length} / 16
              </span>
            </div>
            {userFieldErrors.password && (
              <div style={{ color: '#ef4444', fontSize: '0.825rem', marginTop: '4px' }}>
                {userFieldErrors.password}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Residential or business address"
              value={userForm.address}
              onChange={(e) => {
                setUserForm({ ...userForm, address: e.target.value });
                if (userFieldErrors.address) setUserFieldErrors({ ...userFieldErrors, address: null });
              }}
              required
              maxLength={400}
            />
            {userFieldErrors.address && (
              <div style={{ color: '#ef4444', fontSize: '0.825rem', marginTop: '4px' }}>
                {userFieldErrors.address}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddUserOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={userSubmitting}>
              {userSubmitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
