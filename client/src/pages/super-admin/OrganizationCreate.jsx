import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import superAdminService from '../../services/superAdmin.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { ArrowLeft, Building2 } from 'lucide-react';

export default function OrganizationCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', slug: '', logo: '', adminName: '', adminEmail: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Auto-generate slug from name if slug hasn't been manually edited
    if (name === 'name' && (!formData.slug || formData.slug === formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''))) {
       const autoSlug = value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
       setFormData(prev => ({ ...prev, name: value, slug: autoSlug }));
    } else {
       setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      setError('Name and slug are required.');
      return;
    }
    if (!formData.adminName || !formData.adminEmail) {
      setError('Admin name and email are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await superAdminService.createOrganization(formData);
      navigate(`/super-admin/organizations/${res.organization.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <Link to="/super-admin/organizations" className="mr-4 text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">New Organization</h1>
          <p className="text-slate-500">Register a new tenant on the platform</p>
        </div>
      </div>

      <Card>
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Organization Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
              placeholder="e.g. Acme Corp"
              required
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-slate-700 mb-1">
              URL Slug *
            </label>
            <div className="flex rounded-lg shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm">
                /org/
              </span>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="flex-1 min-w-0 block w-full px-4 py-2 rounded-none rounded-r-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                placeholder="acme-corp"
                required
              />
            </div>
            <p className="mt-1 text-sm text-slate-500">Only lowercase letters, numbers, and hyphens.</p>
          </div>

          <div>
            <label htmlFor="logo" className="block text-sm font-medium text-slate-700 mb-1">
              Logo URL (Optional)
            </label>
            <input
              type="url"
              id="logo"
              name="logo"
              value={formData.logo}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="pt-6 border-t border-slate-200 mt-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Administrator Details</h3>
            <p className="text-sm text-slate-500 mb-4">An initial administrator account will be created and sent an invitation.</p>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="adminName" className="block text-sm font-medium text-slate-700 mb-1">
                  Admin Name *
                </label>
                <input
                  type="text"
                  id="adminName"
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                  placeholder="e.g. Jane Doe"
                  required
                />
              </div>

              <div>
                <label htmlFor="adminEmail" className="block text-sm font-medium text-slate-700 mb-1">
                  Admin Email *
                </label>
                <input
                  type="email"
                  id="adminEmail"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                  placeholder="jane@example.com"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link to="/super-admin/organizations">
              <Button type="button" variant="secondary">Cancel</Button>
            </Link>
            <Button type="submit" isLoading={loading}>
              <Building2 size={18} className="mr-2" />
              Create Organization
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
