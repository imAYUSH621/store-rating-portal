import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Star, LogOut, KeyRound, Shield, Store, User } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const getRoleBadge = () => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="badge badge-admin">
            <Shield size={12} /> System Admin
          </span>
        );
      case 'STORE_OWNER':
        return (
          <span className="badge badge-owner">
            <Store size={12} /> Store Owner
          </span>
        );
      default:
        return (
          <span className="badge badge-user">
            <User size={12} /> User
          </span>
        );
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="nav-brand">
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
              <Star size={20} fill="#f59e0b" />
            </div>
            <span>StoreRating<span style={{ color: '#4f46e5' }}>.io</span></span>
          </div>

          {user && (
            <div className="nav-user">
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                  {user.name}
                </span>
                <div style={{ marginTop: '2px' }}>{getRoleBadge()}</div>
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsPasswordModalOpen(true)}
                title="Change Password"
              >
                <KeyRound size={15} />
                <span>Password</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={logout}
                title="Log Out"
                style={{ color: '#ef4444' }}
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
}
