import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import SortableHeader from '../components/SortableHeader';
import { api } from '../api/client';
import {
  Store,
  Star,
  Users,
  Search,
  MapPin,
  Mail,
  AlertCircle
} from 'lucide-react';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchDashboard = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        search,
        sortBy,
        sortOrder
      });
      const res = await api.get(`/owner/dashboard?${params.toString()}`);
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load owner dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, sortOrder]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <Navbar />

      <main className="container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
            Loading store performance dashboard...
          </div>
        ) : !data || !data.hasStore ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px', maxWidth: '600px', margin: '40px auto' }}>
            <AlertCircle size={40} style={{ color: '#f59e0b', marginBottom: '14px' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
              No Store Assigned Yet
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.925rem' }}>
              Your account is registered as a Store Owner, but a System Administrator has not assigned a store to your profile yet.
            </p>
          </div>
        ) : (
          <>
            {/* Store Banner Overview */}
            <div className="card" style={{ marginBottom: '28px', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', borderLeft: '5px solid #4f46e5' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Store size={20} />
                    </div>
                    <h1 style={{ fontSize: '1.65rem', fontWeight: 800 }}>{data.store.name}</h1>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#64748b', fontSize: '0.875rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin size={15} /> {data.store.address}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Mail size={15} /> {data.store.email}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ textAlign: 'center', padding: '12px 20px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>
                      Average Rating
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <StarRating rating={data.averageRating} size={18} />
                      <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#b45309' }}>
                        {data.averageRating ? data.averageRating.toFixed(2) : '0.0'}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', padding: '12px 20px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>
                      Total Reviews
                    </div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
                      {data.totalRatings}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Raters Table Card */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Customer Reviews & Ratings</h2>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    Detailed log of users who have submitted ratings for your store
                  </p>
                </div>

                <div className="search-input-wrap" style={{ maxWidth: '320px' }}>
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search by customer name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <SortableHeader label="Customer Name" field="name" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                      <SortableHeader label="Email Address" field="email" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                      <SortableHeader label="Location / Address" field="address" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                      <SortableHeader label="Rating Submitted" field="rating" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                      <SortableHeader label="Date" field="date" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    </tr>
                  </thead>
                  <tbody>
                    {data.raters.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                          No customer ratings recorded yet.
                        </td>
                      </tr>
                    ) : (
                      data.raters.map((r) => (
                        <tr key={r.userId}>
                          <td style={{ fontWeight: 600 }}>{r.userName}</td>
                          <td style={{ color: '#475569' }}>{r.userEmail}</td>
                          <td style={{ color: '#475569', maxWidth: '280px' }}>{r.userAddress}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <StarRating rating={r.rating} size={15} />
                              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b' }}>
                                ({r.rating} ★)
                              </span>
                            </div>
                          </td>
                          <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                            {formatDate(r.modifiedAt || r.submittedAt)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
