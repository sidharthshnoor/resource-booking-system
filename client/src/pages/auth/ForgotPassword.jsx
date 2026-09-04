import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import authService from '../../services/auth.service';
import Button from '../../components/ui/Button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authService.forgotPassword(email);
      setSuccess(res.message || 'If an account exists for this email, a password reset link has been sent.');
      setCooldown(60); // Start 1-minute visual cooldown
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await authService.resendReset(email);
      setSuccess(res.message || 'If an account exists for this email, a password reset link has been sent.');
      setCooldown(60);
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (success) {
    return (
      <div className="login-form-wrap" style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={32} />
          </div>
        </div>
        
        <h2 className="login-title" style={{ marginBottom: '0.5rem' }}>Check your email</h2>
        <p className="login-subtitle" style={{ marginBottom: '2rem' }}>
          {success}
        </p>
        
        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1rem', fontWeight: 500 }}>
            Didn't receive the email?
          </p>
          
          <Button 
            onClick={handleResend} 
            disabled={cooldown > 0 || loading} 
            fullWidth 
            className="login-secondary-button"
          >
            {loading ? 'Sending...' : cooldown > 0 ? `Resend available in: ${formatTime(cooldown)}` : 'Resend Email'}
          </Button>
        </div>

        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="login-form-wrap">
      <div className="login-header-block">
        <h2 className="login-title">Forgot Password</h2>
        <p className="login-subtitle">Enter your email address to receive a password reset link.</p>
      </div>

      {error && (
        <div className="login-error-banner" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="login-form">
        <div className="login-field-group">
          <label htmlFor="email" className="login-label">Email Address</label>
          <div className="login-input-shell">
            <span className="login-input-icon" aria-hidden="true">
              <Mail size={18} />
            </span>
            <input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="login-input"
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div className="login-form-actions" style={{ marginTop: '1.5rem' }}>
          <Button type="submit" fullWidth isLoading={loading} className="login-submit-button">
            <span>Send Reset Link</span>
            <ArrowRight size={18} />
          </Button>
        </div>
      </form>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Login
        </Link>
      </div>
    </div>
  );
}
