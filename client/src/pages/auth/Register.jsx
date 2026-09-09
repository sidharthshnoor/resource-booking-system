import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrganization } from '../../context/OrganizationContext';
import Button from '../../components/ui/Button';

export default function Register() {
  const { register } = useAuth();
  const { organization } = useOrganization();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!agreeTerms) {
      setError('You must agree to the Terms & Conditions and Privacy Policy');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        organizationSlug: organization.slug
      });
      navigate(`/org/${organization.slug}/app/dashboard`);
    } catch (err) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-form-wrap">
      <div className="register-header-block">
        <h2 className="register-title">Create an account</h2>
        <p className="register-subtitle">Fill out the form below to get started</p>
      </div>

      {error && (
        <div className="register-error-banner" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="register-form">
        <div className="login-field-group">
          <label htmlFor="name" className="login-label">Full Name</label>
          <div className="login-input-shell">
            <span className="login-input-icon" aria-hidden="true">
              <User size={18} />
            </span>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="login-input"
              autoComplete="name"
              required
            />
          </div>
        </div>

        <div className="login-field-group">
          <label htmlFor="register-email" className="login-label">Email Address</label>
          <div className="login-input-shell">
            <span className="login-input-icon" aria-hidden="true">
              <Mail size={18} />
            </span>
            <input
              id="register-email"
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
          <label htmlFor="register-password" className="login-label">Password</label>
          <div className="login-input-shell login-password-shell">
            <span className="login-input-icon" aria-hidden="true">
              <Lock size={18} />
            </span>
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className="login-input"
              autoComplete="new-password"
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

        <div className="login-field-group">
          <label htmlFor="confirm-password" className="login-label">Confirm Password</label>
          <div className="login-input-shell login-password-shell">
            <span className="login-input-icon" aria-hidden="true">
              <Lock size={18} />
            </span>
            <input
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className="login-input"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="login-password-toggle"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="login-options flex items-center" style={{ marginTop: '-4px', marginBottom: '8px' }}>
          <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.85rem', color: '#4b5563' }}>
            <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="custom-checkbox" style={{ width: '16px', height: '16px', accentColor: '#006a61' }} />
            <span>I agree to the <a href="#" style={{ color: '#006a61', textDecoration: 'none' }}>Terms & Conditions</a> and <a href="#" style={{ color: '#006a61', textDecoration: 'none' }}>Privacy Policy</a></span>
          </label>
        </div>

        <div className="register-form-actions">
          <Button type="submit" fullWidth isLoading={loading} className="login-submit-button">
            <ArrowRight size={18} />
            <span>Create Account</span>
          </Button>
        </div>
      </form>

      <div className="login-divider"><span>or</span></div>

      <div className="register-account-link">
        Already have an account? <Link to={`/org/${organization.slug}/login`}>Sign in here</Link>
      </div>
    </div>
  );
}
