import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import api from '../../services/api';

export default function LegacyLoginRedirect() {
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleContinue = async (e) => {
    e.preventDefault();
    const cleanSlug = slug.trim().toLowerCase();
    
    if (!cleanSlug) return;
    
    setLoading(true);
    setError('');

    try {
      const res = await api.get(`/organizations/by-slug/${cleanSlug}`);
      if (res.organization.status === 'DEACTIVATED') {
        setError('This organization has been deactivated.');
      } else {
        navigate(`/org/${cleanSlug}/login`);
      }
    } catch (err) {
      if (err.status === 404) {
        setError('Organization not found. Please check your code.');
      } else {
        setError('Failed to verify organization. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel is-login">
        <main className="auth-form-panel">
          <div className="auth-form-shell">
            <div className="login-form-wrap">
              <div className="login-header-block">
                <h2 className="text-xl font-bold text-primary-700 mb-2">Platform Login</h2>
                <h2 className="login-title">Welcome Back</h2>
                <p className="login-subtitle">Enter your organization code to continue</p>
              </div>
              
              {error && (
                <div className="login-error-banner" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleContinue} className="login-form mt-6">
                <div className="login-field-group">
                  <label htmlFor="slug" className="login-label">Organization Code</label>
                  <div className="login-input-shell">
                    <span className="login-input-icon" aria-hidden="true">
                      <Building2 size={18} />
                    </span>
                    <input
                      id="slug"
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="e.g. abc-college"
                      className="login-input"
                      required
                    />
                  </div>
                </div>
                
                <div className="login-form-actions mt-6">
                  <Button type="submit" fullWidth isLoading={loading} className="login-submit-button">
                    <ArrowRight size={18} />
                    <span>Continue to Login</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </main>

        <aside className="auth-visual-panel" aria-label="Brand panel">
          <div className="auth-visual-panel-inner">
            <h1 className="auth-brand-title">RBS Platform</h1>
            <p className="auth-brand-subtitle">Resource Booking System</p>
            <div className="auth-brand-divider" aria-hidden="true" />
            <p className="auth-brand-tagline">
              Streamline your resource management and booking experience
            </p>
          </div>
          <div className="auth-brand-footer">© 2026 RBS Enterprise. All rights reserved.</div>
        </aside>
      </div>
    </div>
  );
}
