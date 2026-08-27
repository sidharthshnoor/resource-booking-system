import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await register(formData);
      navigate('/app/dashboard'); // Newly registered users are USER by default
    } catch (err) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--spacing-6)', textAlign: 'center' }}>
        <h3 style={{ margin: 0 }}>Create a new account</h3>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-2)', fontSize: '0.875rem' }}>
          Fill out the form below to get started
        </p>
      </div>

      {error && (
        <div style={{ padding: 'var(--spacing-3)', backgroundColor: 'var(--color-status-rejected-bg)', color: 'var(--color-status-rejected-text)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-4)', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input 
          label="Full Name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          required
        />

        <Input 
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="john@example.com"
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
            Create Account
          </Button>
        </div>
      </form>

      <div style={{ marginTop: 'var(--spacing-6)', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
        Already have an account? <Link to="/login" style={{ fontWeight: '500' }}>Sign in here</Link>
      </div>
    </div>
  );
}
