import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Star, UserPlus, AlertCircle, Check } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  // Live rule evaluations
  const nameTrimmed = name.trim();
  const isNameValid = nameTrimmed.length >= 20 && nameTrimmed.length <= 60;
  const isAddressValid = address.trim().length > 0 && address.trim().length <= 400;

  const hasLength = password.length >= 8 && password.length <= 16;
  const hasUpper = /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9\s]/.test(password);
  const isPasswordValid = hasLength && hasUpper && hasSpecial;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setFieldErrors({});

    const errors = {};
    if (!isNameValid) {
      errors.name = 'Name must be between 20 and 60 characters long per requirement.';
    }
    if (!isAddressValid) {
      errors.address = 'Address is required and must not exceed 400 characters.';
    }
    if (!isPasswordValid) {
      errors.password = 'Password does not satisfy required complexity rules.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await signup({
        name: nameTrimmed,
        email: email.trim(),
        address: address.trim(),
        password
      });
      navigate('/stores');
    } catch (err) {
      if (err.errors) {
        setFieldErrors(err.errors);
      }
      setGeneralError(err.message || 'Failed to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  // Test helper to fill a sample compliant user
  const handleFillSample = () => {
    setName('Benjamin Arthur Bartholomew');
    setEmail(`benjamin_${Math.floor(Math.random() * 8999 + 1000)}@example.com`);
    setAddress('450 Kensington High Street, Flat 12, London, W8 7NX');
    setPassword('SecurePass@2026');
    setFieldErrors({});
    setGeneralError('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#4f46e5', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', marginBottom: '12px' }}>
            <Star size={28} fill="#f59e0b" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Create Your Account</h1>
          <p style={{ color: '#64748b', fontSize: '0.925rem', marginTop: '4px' }}>
            Join the platform to browse stores and submit verified ratings
          </p>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          {generalError && (
            <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', marginBottom: '18px', fontSize: '0.875rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <AlertCircle size={18} />
              <span>{generalError}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleFillSample}
              style={{ fontSize: '0.75rem' }}
            >
              Fill Sample Valid Data
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className={`form-input ${fieldErrors.name ? 'has-error' : ''}`}
                placeholder="e.g. Alexander Bartholomew Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <div className="form-hint">
                <span style={{ color: isNameValid ? '#059669' : '#94a3b8' }}>
                  Requirement: Min 20, Max 60 characters
                </span>
                <span style={{ fontWeight: 600, color: name.length < 20 || name.length > 60 ? '#ef4444' : '#059669' }}>
                  {name.length} / 60
                </span>
              </div>
              {fieldErrors.name && <span className="form-error">{fieldErrors.name}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className={`form-input ${fieldErrors.email ? 'has-error' : ''}`}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {fieldErrors.email && <span className="form-error">{fieldErrors.email}</span>}
            </div>

            {/* Address */}
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea
                className={`form-textarea ${fieldErrors.address ? 'has-error' : ''}`}
                rows={2}
                placeholder="Street address, apartment, city, state, zip"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                maxLength={400}
                required
              />
              <div className="form-hint">
                <span>Maximum 400 characters</span>
                <span>{address.length} / 400</span>
              </div>
              {fieldErrors.address && <span className="form-error">{fieldErrors.address}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className={`form-input ${fieldErrors.password ? 'has-error' : ''}`}
                placeholder="8 to 16 characters"
                maxLength={16}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {fieldErrors.password && <span className="form-error">{fieldErrors.password}</span>}

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

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '12px' }}
              disabled={loading || !isNameValid || !isPasswordValid}
            >
              <UserPlus size={18} />
              <span>{loading ? 'Registering...' : 'Complete Sign Up'}</span>
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.875rem', color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
