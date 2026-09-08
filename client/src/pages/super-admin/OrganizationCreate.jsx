import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, CheckCircle2, Info, Mail, Shield, Sparkles } from 'lucide-react';
import superAdminService from '../../services/superAdmin.service';
import Button from '../../components/ui/Button';

export default function OrganizationCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', slug: '', logo: '', adminName: '', adminEmail: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'name') {
      const generatedSlug = value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      const shouldGenerateSlug = !formData.slug || formData.slug === formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      setFormData((current) => ({ ...current, name: value, ...(shouldGenerateSlug ? { slug: generatedSlug } : {}) }));
    } else setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim() || !formData.adminName.trim() || !formData.adminEmail.trim()) return setError('Complete all required fields.');
    if (!/^[a-z0-9-]+$/.test(formData.slug)) return setError('Slug can only contain lowercase letters, numbers, and hyphens.');
    setLoading(true); setError('');
    try { const response = await superAdminService.createOrganization(formData); navigate(`/super-admin/organizations/${response.organization.id}`); }
    catch (err) { setError(err.message || 'Failed to create organization.'); }
    finally { setLoading(false); }
  };

  return <div className="organization-create-page">
    <div className="create-page-header"><div><Link to="/super-admin/organizations" className="create-back"><ArrowLeft size={17} /> Back to Organizations</Link><h1>New Organization</h1><p>Register a new tenant on the platform.</p></div></div>
    {error && <div className="create-error">{error}</div>}
    <div className="create-layout"><form className="create-form-card" onSubmit={handleSubmit}><section className="create-section"><div className="create-section-heading"><div className="create-icon blue"><Building2 size={20} /></div><div><h2>Organization Information</h2><p>Provide the basic details for the new organization.</p></div></div><label>Organization Name *<input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Acme Corporation" required /><small>This will be the display name for the organization.</small></label><label>URL Slug *<div className="create-slug-input"><span>/org/</span><input name="slug" value={formData.slug} onChange={handleChange} placeholder="acme-corporation" required /></div><small>Only lowercase letters, numbers, and hyphens. This will be used in the organization URL.</small></label><label>Logo URL (Optional)<input type="url" name="logo" value={formData.logo} onChange={handleChange} placeholder="https://example.com/logo.png" /><small>A URL to the organization's logo.</small></label></section><section className="create-section"><div className="create-section-heading"><div className="create-icon violet"><Shield size={20} /></div><div><h2>Administrator Information</h2><p>An initial administrator account will be created and sent an invitation.</p></div></div><div className="create-admin-grid"><label>Admin Name *<input name="adminName" value={formData.adminName} onChange={handleChange} placeholder="e.g. Jane Doe" required /><small>Full name of the organization administrator.</small></label><label>Admin Email *<input type="email" name="adminEmail" value={formData.adminEmail} onChange={handleChange} placeholder="admin@acme.com" required /><small>An invitation email will be sent to this address.</small></label></div><div className="create-next-steps"><Info size={18} /><div><strong>What happens next?</strong><ol><li>The organization will be created.</li><li>An administrator account will be provisioned securely.</li><li>An invitation will be sent to the provided email address.</li></ol></div></div></section><div className="create-actions"><Link to="/super-admin/organizations" className="create-cancel">Cancel</Link><Button type="submit" isLoading={loading}><Building2 size={16} /> Create Organization</Button></div></form><aside className="create-aside"><div className="create-info-card"><div className="create-icon blue"><Info size={19} /></div><h2>About Organizations</h2><p>Organizations are independent tenants on the RBS platform. Each organization has its own users, resources, and bookings. Data is isolated within each organization.</p></div><div className="create-info-card"><div className="create-icon green"><Sparkles size={19} /></div><h2>Slug Guidelines</h2><ul><li>Use lowercase letters (a-z)</li><li>Numbers (0-9) are allowed</li><li>Hyphens (-) are allowed</li><li>Keep it short and memorable</li></ul></div><div className="create-info-card"><div className="create-icon violet"><Mail size={19} /></div><h2>Administrator Access</h2><p>The initial administrator will have full access to manage users, resources, bookings, and settings for this organization.</p></div></aside></div><footer className="create-footer"><span>© 2026 RBS Enterprise. All rights reserved.</span><span>Resource Booking System&nbsp; | &nbsp;Platform Administration</span></footer>
  </div>;
}
