import React, { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Check, AlertCircle } from 'lucide-react';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { changePassword } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password rules
  const hasLength = newPassword.length >= 8 && newPassword.length <= 16;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=[\]/\\]/.test(newPassword);
  const isMatch = newPassword === confirmPassword && newPassword.length > 0;
  const isValid = hasLength && hasUpper && hasSpecial && isMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isValid) {
      setError('Please ensure the new password fulfills all security requirements and matches confirmation.');
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword(oldPassword, newPassword);
      setSuccess(res.message || 'Password updated successfully!');
      setTimeout(() => {
        onClose();
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccess('');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Password">
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.875rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ backgroundColor: '#d1fae5', color: '#047857', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.875rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Check size={18} />
            <span>{success}</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Current Password</label>
          <input
            type="password"
            className="form-input"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Enter current password"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">New Password</label>
          <input
            type="password"
            className="form-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="8 to 16 characters"
            required
          />

          <div style={{ marginTop: '8px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ color: hasLength ? '#059669' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Check size={14} /> 8 - 16 characters
            </span>
            <span style={{ color: hasUpper ? '#059669' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Check size={14} /> At least one uppercase letter (A-Z)
            </span>
            <span style={{ color: hasSpecial ? '#059669' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Check size={14} /> At least one special character (!@#$%^&*...)
            </span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Confirm New Password</label>
          <input
            type="password"
            className="form-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            required
          />
          {confirmPassword && !isMatch && (
            <span className="form-error">Passwords do not match.</span>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '22px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!isValid || loading}>
            {loading ? 'Updating...' : 'Save New Password'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
