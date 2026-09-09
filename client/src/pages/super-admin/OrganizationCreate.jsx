import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, CheckCircle2, Eye, EyeOff, Info, LockKeyhole, Mail, Shield, Sparkles } from 'lucide-react';
import superAdminService from '../../services/superAdmin.service';
import Button from '../../components/ui/Button';

// Reuses the same PasswordField pattern as AdminSettings → Add Admin flow
function PasswordField({ label, name, value, onChange, visible, onToggle, placeholder }) {
  return (
    <label style={{ display: 'block', marginBottom: '14px', color: '#405571', fontSize: '.75rem', fontWeight: 600 }}>
      {label}
      <div className="settings-password-field" style={{ marginTop: '6px' }}>
        <input
          name={name}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          autoComplete="new-password"
          className="settings-input-field"
          style={{
            display: 'block',
            width: '100%',
            padding: '9px 39px 9px 12px',
            border: '1px solid #d5dfeb',
            borderRadius: '6px',
            outline: 'none',
            color: '#203552',
            background: 'white',
            font: 'inherit',
            fontSize: '.8rem',
            boxSizing: 'border-box'
          }}
        />
        <LockKeyhole className="settings-password-icon" size={17} aria-hidden="true" />
        <button
          type="button"
          className="settings-password-toggle"
          onClick={onToggle}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </label>
  );
}

export default function OrganizationCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmAdminPassword: ''
  });
  const [passwordVisibility, setPasswordVisibility] = useState({ password: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'name') {
      const generatedSlug = value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const shouldGenerateSlug = !formData.slug || formData.slug === formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      setFormData((current) => ({ ...current, name: value, ...(shouldGenerateSlug ? { slug: generatedSlug } : {}) }));
    } else {
      setFormData((current) => ({ ...current, [name]: value }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.slug.trim() || !formData.adminName.trim() || !formData.adminEmail.trim()) {
      return setError('Complete all required fields.');
    }
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      return setError('Slug can only contain lowercase letters, numbers, and hyphens.');
    }
    if (!formData.adminPassword) {
      return setError('Temporary password is required.');
    }
    if (formData.adminPassword.length < 8) {
      return setError('Temporary password must be at least 8 characters long.');
    }
    if (formData.adminPassword !== formData.confirmAdminPassword) {
      return setError('Passwords do not match. Please confirm the temporary password correctly.');
    }

    setLoading(true);
    try {
      // Send adminPassword; confirmAdminPassword is client-side only and never sent
      const { name, slug, logo, adminName, adminEmail, adminPassword } = formData;
      const response = await superAdminService.createOrganization({ name, slug, logo, adminName, adminEmail, adminPassword });
      navigate(`/super-admin/organizations/${response.organization.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create organization.');
    } finally {
      setLoading(false);
    }
  };

  return <div className="organization-create-page">
    <div className="create-page-header"><div><Link to="/super-admin/organizations" className="create-back"><ArrowLeft size={17} /> Back to Organizations</Link><h1>New Organization</h1><p>Register a new tenant on the platform.</p></div></div>
    {error && <div className="create-error">{error}</div>}
    <div className="create-layout"><form className="create-form-card" onSubmit={handleSubmit}><section className="create-section"><div className="create-section-heading"><div className="create-icon blue"><Building2 size={20} /></div><div><h2>Organization Information</h2><p>Provide the basic details for the new organization.</p></div></div><label>Organization Name *<input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Acme Corporation" required /><small>This will be the display name for the organization.</small></label><label>URL Slug *<div className="create-slug-input"><span>/org/</span><input name="slug" value={formData.slug} onChange={handleChange} placeholder="acme-corporation" required /></div><small>Only lowercase letters, numbers, and hyphens. This will be used in the organization URL.</small></label><label>Logo URL (Optional)<input type="url" name="logo" value={formData.logo} onChange={handleChange} placeholder="https://example.com/logo.png" /><small>A URL to the organization's logo.</small></label></section><section className="create-section"><div className="create-section-heading"><div className="create-icon violet"><Shield size={20} /></div><div><h2>Administrator Information</h2><p>An initial administrator account will be created with a temporary password that must be changed on first login.</p></div></div><div className="create-admin-grid"><label>Admin Name *<input name="adminName" value={formData.adminName} onChange={handleChange} placeholder="e.g. Jane Doe" required /><small>Full name of the organization administrator.</small></label><label>Admin Email *<input type="email" name="adminEmail" value={formData.adminEmail} onChange={handleChange} placeholder="admin@acme.com" required /><small>The administrator will use this email to log in.</small></label></div><div className="create-admin-grid" style={{ marginTop: '14px' }}>
      <PasswordField
        label="Temporary Password *"
        name="adminPassword"
        value={formData.adminPassword}
        onChange={handleChange}
        visible={passwordVisibility.password}
        onToggle={() => setPasswordVisibility(prev => ({ ...prev, password: !prev.password }))}
        placeholder="Enter temporary password"
      />
      <PasswordField
        label="Confirm Temporary Password *"
        name="confirmAdminPassword"
        value={formData.confirmAdminPassword}
        onChange={handleChange}
        visible={passwordVisibility.confirm}
        onToggle={() => setPasswordVisibility(prev => ({ ...prev, confirm: !prev.confirm }))}
        placeholder="Confirm temporary password"
      />
    </div><div className="create-next-steps"><Info size={18} /><div><strong>What happens next?</strong><ol><li>The organization will be created.</li><li>An administrator account will be provisioned with the temporary password you set.</li><li>The administrator must change the password on first login.</li></ol></div></div></section><div className="create-actions"><Link to="/super-admin/organizations" className="create-cancel">Cancel</Link><Button type="submit" isLoading={loading}><Building2 size={16} /> Create Organization</Button></div></form><aside className="create-aside"><div className="create-info-card"><div className="create-icon blue"><Info size={19} /></div><h2>About Organizations</h2><p>Organizations are independent tenants on the RBS platform. Each organization has its own users, resources, and bookings. Data is isolated within each organization.</p></div><div className="create-info-card"><div className="create-icon green"><Sparkles size={19} /></div><h2>Slug Guidelines</h2><ul><li>Use lowercase letters (a-z)</li><li>Numbers (0-9) are allowed</li><li>Hyphens (-) are allowed</li><li>Keep it short and memorable</li></ul></div><div className="create-info-card"><div className="create-icon violet"><Mail size={19} /></div><h2>Administrator Access</h2><p>The initial administrator will have full access to manage users, resources, bookings, and settings for this organization.</p></div></aside></div><footer className="create-footer"><span>© 2026 RBS Enterprise. All rights reserved.</span><span>Resource Booking System&nbsp; | &nbsp;Platform Administration</span></footer>
  </div>;
}
