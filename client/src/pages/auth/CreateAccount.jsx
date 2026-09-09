import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, useParams } from 'react-router-dom';
import { Lock, User, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import authService from '../../services/auth.service';
import Button from '../../components/ui/Button';

export default function CreateAccount() {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams();
  const loginPath = slug ? `/org/${slug}/login` : '/login';
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing invitation token.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setError('Invalid or missing invitation token.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.createAccount({ token, name, password });
      setSuccess('Your account has been created successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-form-wrap" style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={32} />
          </div>
        </div>
        
        <h2 className="login-title" style={{ marginBottom: '0.5rem' }}>Account Created Successfully</h2>
        <p className="login-subtitle" style={{ marginBottom: '2rem' }}>
          {success}
        </p>
        
        <Button onClick={() => navigate(loginPath)} fullWidth className="login-submit-button">
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="login-form-wrap">
      <div className="login-header-block">
        <h2 className="login-title">Create Account</h2>
        <p className="login-subtitle">Set up your profile and password to get started.</p>
      </div>

      {error && (
        <div className="login-error-banner" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="login-form">
        <div className="login-field-group">
          <label htmlFor="name" className="login-label">Full Name</label>
          <div className="login-input-shell">
            <span className="login-input-icon" aria-hidden="true">
              <User size={18} />
            </span>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="login-input"
              required
            />
          </div>
        </div>

        <div className="login-field-group">
          <label htmlFor="password" className="login-label">Password</label>
          <div className="login-input-shell login-password-shell">
            <span className="login-input-icon" aria-hidden="true">
              <Lock size={18} />
            </span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="login-input"
              required
            />
            <button
              type="button"
              className="login-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="login-field-group">
          <label htmlFor="confirmPassword" className="login-label">Confirm Password</label>
          <div className="login-input-shell login-password-shell">
            <span className="login-input-icon" aria-hidden="true">
              <Lock size={18} />
            </span>
            <input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="login-input"
              required
            />
            <button
              type="button"
              className="login-password-toggle"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          <strong>Password requirements:</strong>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem', marginBottom: 0 }}>
            <li>Minimum 8 characters</li>
          </ul>
        </div>

        <div className="login-form-actions">
          <Button type="submit" fullWidth isLoading={loading} className="login-submit-button" disabled={!!error && !token}>
            <span>Create Account</span>
            <ArrowRight size={18} />
          </Button>
        </div>
      </form>
    </div>
  );
}
