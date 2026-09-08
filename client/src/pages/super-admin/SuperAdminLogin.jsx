
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = await login({ email: formData.email, password: formData.password });
      
      if (user.role === "SUPER_ADMIN") {
        navigate("/super-admin/organizations");
      } else {
        setError("Unauthorized: Super Admin access required.");
      }
    } catch (err) {
      setError(err.message || "Invalid credentials");
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
                <h2 className="text-xl font-bold text-primary-700 mb-2">Platform Administration</h2>
                <h2 className="login-title">Welcome Back</h2>
                <p className="login-subtitle">Sign in to your platform administration account</p>
              </div>

              {error && (
                <div className="login-error-banner" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="login-form mt-6">
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
                      autoComplete="username"
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
                      type={showPassword ? "text" : "password"}
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
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="login-form-actions mt-6">
                  <Button type="submit" fullWidth isLoading={loading} className="login-submit-button">
                    <ArrowRight size={18} />
                    <span>Sign In to Platform</span>
                  </Button>
                </div>
              </form>

              <div className="mt-8 text-center">
                 <a href="/" className="text-sm text-primary-600 hover:text-primary-700 hover:underline">
                   &larr; Return to main site
                 </a>
              </div>
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

