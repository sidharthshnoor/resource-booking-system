import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import authService from '../../services/auth.service';
import Button from '../../components/ui/Button';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing password reset token.');
      setTimeLeft(0);
      return;
    }

    if (success) return; // Stop timer on success

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [token, success]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (timeLeft === 0) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Password requirements: Min 8 chars, at least one uppercase, lowercase, number, special char.
    // The backend only strictly requires 8 chars in our implementation
    // Enforce 8 chars on the backend.
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.resetPassword({ token, password });
      setSuccess('Your password has been updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
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
        
        <h2 className="login-title" style={{ marginBottom: '0.5rem' }}>Password Changed Successfully</h2>
        <p className="login-subtitle" style={{ marginBottom: '2rem' }}>
          {success}
        </p>
        
        <Button onClick={() => navigate('/login')} fullWidth className="login-submit-button">
          Go to Login
        </Button>
      </div>
    );
  }

  const isExpired = timeLeft === 0;

  return (
    <div className="login-form-wrap">
      <div className="login-header-block">
        <h2 className="login-title">Reset Password</h2>
        <p className="login-subtitle">Create a new password for your account.</p>
      </div>

      {!isExpired && (
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Link expires in:</span>
          <span style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 700, fontFamily: 'monospace' }}>
            {formatTime(timeLeft)}
          </span>
        </div>
      )}

      {isExpired ? (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1.5rem', borderRadius: '0.5rem', textAlign: 'center', marginBottom: '2rem' }}>
          <h3 style={{ color: '#b91c1c', fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Reset link expired.</h3>
          <p style={{ color: '#991b1b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            This password reset link is no longer valid.
          </p>
          <Button onClick={() => navigate('/forgot-password')} fullWidth style={{ background: 'white', color: '#b91c1c', border: '1px solid #fca5a5' }}>
            Request New Reset Link
          </Button>
        </div>
      ) : (
        <>
          {error && (
            <div className="login-error-banner" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field-group">
              <label htmlFor="password" className="login-label">New Password</label>
              <div className="login-input-shell login-password-shell">
                <span className="login-input-icon" aria-hidden="true">
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
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
                  placeholder="Confirm new password"
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
              <Button type="submit" fullWidth isLoading={loading} className="login-submit-button">
                <span>Create New Password</span>
                <ArrowRight size={18} />
              </Button>
            </div>
          </form>
        </>
      )}
      
      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <Link to="/login" style={{ color: '#64748b', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }}>
          Back to Login
        </Link>
      </div>
    </div>
  );
}
