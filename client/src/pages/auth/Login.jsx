import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const user = await login(formData);
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/app/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--spacing-6)', textAlign: 'center' }}>
        <h3 style={{ margin: 0 }}>Sign in to your account</h3>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-2)', fontSize: '0.875rem' }}>
          Enter your email and password to access the system
        </p>
      </div>

      {error && (
        <div style={{ padding: 'var(--spacing-3)', backgroundColor: 'var(--color-status-rejected-bg)', color: 'var(--color-status-rejected-text)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-4)', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input 
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="admin@rbs.com"
          required
        />
        
        <Input 
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
        />

        <div style={{ marginTop: 'var(--spacing-2)' }}>
          <Button type="submit" fullWidth isLoading={loading}>
            Sign In
          </Button>
        </div>
      </form>

      <div style={{ marginTop: 'var(--spacing-6)', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
        Don't have an account? <Link to="/register" style={{ fontWeight: '500' }}>Register here</Link>
      </div>
      
      <div style={{ marginTop: 'var(--spacing-6)', padding: 'var(--spacing-4)', backgroundColor: 'var(--color-surface-muted)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
        <p style={{ marginBottom: '4px' }}><strong>Demo Accounts:</strong></p>
        <p style={{ margin: 0 }}>Admin: admin@rbs.com / admin123</p>
        <p style={{ margin: 0 }}>User: user@rbs.com / user123</p>
      </div>
    </div>
  );
}
