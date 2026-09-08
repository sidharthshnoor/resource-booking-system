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
      <div className="reset-auth-page">
        <div className="reset-auth-card reset-success-card">
          <div className="reset-brand"><strong>RBS Platform</strong><span>Resource Booking System</span></div>
          <div className="reset-success-icon">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="reset-title">Password Changed Successfully</h2>
          <p className="reset-subtitle">{success}</p>
          <Button onClick={() => navigate('/login')} fullWidth className="reset-submit-button">Go to Login</Button>
        </div>
      </div>
    );
  }

  const isExpired = timeLeft === 0;

  return (
    <div className="reset-auth-page">
      <div className="reset-auth-card">
        <div className="reset-brand"><strong>RBS Platform</strong><span>Resource Booking System</span></div>
        <div className="reset-header">
          <h1 className="reset-title">Reset Password</h1>
          <p className="reset-subtitle">Create a new password for your account.</p>
        </div>

        {!isExpired && (
          <div className="reset-countdown">
            <span>Link expires in</span>
            <strong>{formatTime(timeLeft)}</strong>
          </div>
        )}

        {isExpired ? (
          <div className="reset-expired">
            <h2>Reset link expired</h2>
            <p>This password reset link is no longer valid.</p>
            <Button onClick={() => navigate('/forgot-password')} fullWidth className="reset-secondary-button">
              Request New Reset Link
            </Button>
          </div>
        ) : (
          <>
            {error && <div className="reset-error" role="alert">{error}</div>}

            <form onSubmit={handleSubmit} className="reset-form">
              <div className="reset-field">
                <label htmlFor="password">New Password</label>
                <div className="reset-input-wrap">
                  <Lock size={17} aria-hidden="true" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                  <button type="button" className="reset-visibility" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div className="reset-field">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="reset-input-wrap">
                  <Lock size={17} aria-hidden="true" />
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                  <button type="button" className="reset-visibility" onClick={() => setShowConfirm(!showConfirm)} aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div className="reset-requirements"><strong>Password requirements</strong><span>Minimum 8 characters</span></div>
              <Button type="submit" fullWidth isLoading={loading} className="reset-submit-button"><span>Create New Password</span><ArrowRight size={17} /></Button>
            </form>
          </>
        )}

        <Link to="/login" className="reset-back-link">Back to Login</Link>
      </div>
    </div>
  );
}
