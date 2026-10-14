import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import StarRating from '../components/StarRating';
import SortableHeader from '../components/SortableHeader';
import { api } from '../api/client';
import {
  Store,
  Search,
  Star,
  MapPin,
  Mail,
  Edit3,
  CheckCircle,
  AlertCircle,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';

export default function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Rating Modal state
  const [ratingModalStore, setRatingModalStore] = useState(null);
  const [selectedRating, setSelectedRating] = useState(5);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const fetchStores = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        search,
        sortBy,
        sortOrder
      });
      const res = await api.get(`/stores?${params.toString()}`);
      if (res.success) setStores(res.stores);
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    }
  }, [search, sortBy, sortOrder]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const openRatingModal = (store) => {
    setRatingModalStore(store);
    setSelectedRating(store.userSubmittedRating || 5);
    setRatingError('');
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!ratingModalStore) return;

    setRatingError('');
    setSubmittingRating(true);

    try {
      const res = await api.post(`/ratings/${ratingModalStore.id}`, {
        rating: Number(selectedRating)
      });

      // Update local state optimistically
      setStores((prev) =>
        prev.map((s) => {
          if (s.id === ratingModalStore.id) {
            return {
              ...s,
              overallRating: res.overallRating,
              totalRatings: res.totalRatings,
              userSubmittedRating: res.userRating
            };
          }
          return s;
        })
      );

      setRatingModalStore(null);
      setToastMessage(res.message || 'Rating recorded successfully!');
      setTimeout(() => setToastMessage(''), 3500);
    } catch (err) {
      setRatingError(err.message || 'Failed to submit rating.');
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="container">
        {/* Header Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Explore Registered Stores</h1>
            <p style={{ color: '#64748b', fontSize: '0.925rem' }}>
              Browse local verified businesses, review community ratings, and share your feedback.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#e2e8f0', padding: '4px', borderRadius: '8px' }}>
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none', padding: '6px 10px' }}
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
            >
              <LayoutGrid size={16} /> Grid
            </button>
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none', padding: '6px 10px' }}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <TableIcon size={16} /> Table
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {toastMessage && (
          <div style={{ backgroundColor: '#d1fae5', color: '#047857', padding: '12px 18px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', display: 'flex', gap: '8px', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <CheckCircle size={18} />
            <span style={{ fontWeight: 600 }}>{toastMessage}</span>
          </div>
        )}

        {/* Search and Sort Toolbar */}
        <div className="filter-bar" style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <div className="search-input-wrap">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="Search stores by Name or Address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Sort By:</span>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="name">Store Name</option>
              <option value="address">Address</option>
              <option value="overall_rating">Overall Rating</option>
              <option value="user_rating">Your Rating</option>
            </select>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              title="Toggle Ascending / Descending"
            >
              {sortOrder === 'asc' ? '▲ Ascending' : '▼ Descending'}
            </button>
          </div>
        </div>

        {/* GRID VIEW */}
        {viewMode === 'grid' && (
          <div className="stores-grid">
            {stores.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                <Store size={36} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
                <h3>No Stores Found</h3>
                <p style={{ fontSize: '0.9rem' }}>Try clearing your search query or check back later.</p>
              </div>
            ) : (
              stores.map((store) => (
                <div key={store.id} className="store-card">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                        {store.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fef3c7', padding: '3px 8px', borderRadius: '6px' }}>
                        <Star size={14} fill="#f59e0b" color="#f59e0b" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#b45309' }}>
                          {store.overallRating > 0 ? store.overallRating.toFixed(1) : 'New'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#64748b', fontSize: '0.85rem', marginBottom: '8px' }}>
                      <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#94a3b8' }} />
                      <span>{store.address}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem', marginBottom: '18px' }}>
                      <Mail size={16} style={{ flexShrink: 0, color: '#94a3b8' }} />
                      <span>{store.email}</span>
                    </div>
                  </div>

                  <div style={{ paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>
                        Your Rating
                      </div>
                      {store.userSubmittedRating ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <StarRating rating={store.userSubmittedRating} size={15} />
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669', marginLeft: '4px' }}>
                            ({store.userSubmittedRating} ★)
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                          Not rated yet
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className={`btn btn-sm ${store.userSubmittedRating ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => openRatingModal(store)}
                    >
                      <Edit3 size={14} />
                      <span>{store.userSubmittedRating ? 'Modify' : 'Rate Store'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TABLE VIEW */}
        {viewMode === 'table' && (
          <div className="card">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <SortableHeader label="Store Name" field="name" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortableHeader label="Address" field="address" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortableHeader label="Overall Rating" field="overall_rating" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <SortableHeader label="Your Rating" field="user_rating" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort} />
                    <th style={{ textAlign: 'right' }}>Action</th>
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
                        <td style={{ color: '#475569', maxWidth: '300px' }}>{s.address}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <StarRating rating={s.overallRating} size={15} showValue />
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>({s.totalRatings})</span>
                          </div>
                        </td>
                        <td>
                          {s.userSubmittedRating ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <StarRating rating={s.userSubmittedRating} size={14} />
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669' }}>
                                {s.userSubmittedRating} ★
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>None</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className={`btn btn-sm ${s.userSubmittedRating ? 'btn-secondary' : 'btn-primary'}`}
                            onClick={() => openRatingModal(s)}
                            style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                          >
                            <Edit3 size={13} />
                            <span>{s.userSubmittedRating ? 'Modify' : 'Rate'}</span>
                          </button>
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

      {/* SUBMIT / MODIFY RATING MODAL */}
      <Modal
        isOpen={!!ratingModalStore}
        onClose={() => setRatingModalStore(null)}
        title={ratingModalStore?.userSubmittedRating ? `Modify Rating for ${ratingModalStore.name}` : `Submit Rating for ${ratingModalStore?.name}`}
        maxWidth="460px"
      >
        <form onSubmit={handleRatingSubmit}>
          {ratingError && (
            <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.875rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <AlertCircle size={18} />
              <span>{ratingError}</span>
            </div>
          )}

          <div style={{ textAlign: 'center', padding: '16px 0 24px' }}>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
              Select a score from 1 to 5 stars:
            </p>

            <div style={{ display: 'inline-flex', padding: '8px 16px', background: '#f8fafc', borderRadius: '30px', border: '1px solid #e2e8f0' }}>
              <StarRating
                rating={selectedRating}
                interactive
                onRate={(val) => setSelectedRating(val)}
                size={34}
              />
            </div>

            <div style={{ marginTop: '12px', fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>
              {selectedRating} Star{selectedRating > 1 ? 's' : ''}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setRatingModalStore(null)}
              disabled={submittingRating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submittingRating}
            >
              {submittingRating ? 'Saving...' : (ratingModalStore?.userSubmittedRating ? 'Update Rating' : 'Submit Rating')}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
