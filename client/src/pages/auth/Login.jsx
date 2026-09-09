import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrganization } from '../../context/OrganizationContext';
import Button from '../../components/ui/Button';

export default function Login() {
  const { login } = useAuth();
  const { organization } = useOrganization();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = { ...formData, organizationSlug: organization.slug };
      const user = await login(payload);
      if (user.role === 'SUPER_ADMIN') {
        navigate('/super-admin/dashboard');
      } else if (user.role === 'ADMIN' && user.must_change_password) {
        navigate(`/org/${organization.slug}/admin/settings`);
      } else if (user.role === 'ADMIN') {
        navigate(`/org/${organization.slug}/admin/dashboard`);
      } else {
        navigate(`/org/${organization.slug}/app/dashboard`);
      }
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form-wrap">
      <div className="login-header-block">
        {organization?.logo ? (
          <img src={organization.logo} alt={organization.name} className="mx-auto h-12 mb-4 object-contain" />
        ) : (
          <h2 className="text-xl font-bold text-primary-700 mb-2">{organization?.name || 'Resource Booking'}</h2>
        )}
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Sign in to your account to continue</p>
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
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="login-input"
              autoComplete="email"
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="login-input"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="login-password-toggle"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="login-options flex items-center justify-between" style={{ marginTop: '-4px', marginBottom: '8px' }}>
          <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.85rem', color: '#4b5563' }}>
            <input type="checkbox" className="custom-checkbox" style={{ width: '16px', height: '16px', accentColor: '#006a61' }} />
            Remember me
          </label>
          <Link to={`/org/${organization.slug}/forgot-password`} className="forgot-password-link" style={{ fontSize: '0.85rem', color: '#006a61', textDecoration: 'none' }}>Forgot password?</Link>
        </div>

        <div className="login-form-actions">
          <Button type="submit" fullWidth isLoading={loading} className="login-submit-button">
            <ArrowRight size={18} />
            <span>Sign In</span>
          </Button>
        </div>
      </form>

      <div className="login-divider"><span>or</span></div>

      <button
        type="button"
        className="login-secondary-button"
        onClick={() => navigate(`/org/${organization.slug}/register`)}
      >
        <UserPlus size={18} />
        <span>Create an account</span>
      </button>

      <div className="login-account-link">
        Don&apos;t have an account? <Link to={`/org/${organization.slug}/register`}>Register here</Link>
      </div>
    </div>
  );
}
