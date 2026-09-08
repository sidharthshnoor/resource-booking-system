import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import superAdminService from '../../services/superAdmin.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Plus, Settings, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function OrganizationsList() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [deleteModalOrg, setDeleteModalOrg] = useState(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchOrgs = async () => {
    try {
      setLoading(true);
      const res = await superAdminService.getOrganizations();
      setOrganizations(res.organizations);
    } catch (err) {
      setError('Failed to load organizations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const toggleStatus = async (org) => {
    if (org.slug === 'default') {
      alert("Cannot deactivate the default organization.");
      return;
    }
    const newStatus = org.status === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';
    try {
      await superAdminService.updateOrganizationStatus(org.id, newStatus);
      fetchOrgs(); // Refresh
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteModalOrg) return;
    
    setDeleteLoading(true);
    setDeleteError('');
    
    try {
      await superAdminService.deleteOrganization(deleteModalOrg.id);
      setDeleteModalOrg(null);
      setDeleteConfirmName('');
      fetchOrgs(); // Refresh
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete organization');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Organizations</h1>
          <p className="text-slate-500">Manage all tenant organizations on the platform.</p>
        </div>
        <Link to="/super-admin/organizations/new">
          <Button>
            <Plus size={18} className="mr-2" />
            New Organization
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center">
          <AlertTriangle size={20} className="mr-2" />
          {error}
        </div>
      )}

      <Card>
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading organizations...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-4 font-semibold text-slate-600">Name</th>
                  <th className="py-3 px-4 font-semibold text-slate-600">Slug</th>
                  <th className="py-3 px-4 font-semibold text-slate-600">Status</th>
                  <th className="py-3 px-4 font-semibold text-slate-600">Created At</th>
                  <th className="py-3 px-4 text-right font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <tr key={org.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {org.logo ? (
                          <img src={org.logo} alt="Logo" className="w-8 h-8 rounded object-contain border border-slate-200" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-sky-100 flex items-center justify-center text-sky-600 font-bold">
                            {org.name.charAt(0)}
                          </div>
                        )}
                        <span className="font-medium text-slate-800">{org.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-sm">{org.slug}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        org.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {org.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-sm">
                      {new Date(org.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link to={`/super-admin/organizations/${org.id}`}>
                        <Button variant="secondary" size="sm">
                          View
                        </Button>
                      </Link>
                      <Button 
                        variant={org.status === 'ACTIVE' ? 'danger' : 'primary'} 
                        size="sm"
                        onClick={() => toggleStatus(org)}
                        disabled={org.slug === 'default'}
                      >
                        {org.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteModalOrg(org)}
                        disabled={org.slug === 'default'}
                        className="ml-2"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
                {organizations.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-500">
                      No organizations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {deleteModalOrg && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle size={24} />
              <h3 className="text-xl font-bold">Delete Organization?</h3>
            </div>
            
            <p className="text-slate-600 mb-4">
              This will permanently delete <span className="font-bold text-slate-800">{deleteModalOrg.name}</span> and all associated:
            </p>
            <ul className="list-disc pl-5 text-slate-600 mb-6 space-y-1">
              <li>Users</li>
              <li>Resources</li>
              <li>Bookings</li>
              <li>Invitations and related tenant data</li>
            </ul>
            
            <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm mb-6 border border-red-100">
              This action <strong>cannot be undone</strong>.
            </div>

            {deleteError && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
                {deleteError}
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="confirmName" className="block text-sm font-medium text-slate-700 mb-2">
                Type <strong>"{deleteModalOrg.name}"</strong> to confirm deletion.
              </label>
              <input
                type="text"
                id="confirmName"
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-red-500 focus:border-red-500 outline-none"
                placeholder={deleteModalOrg.name}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="secondary" 
                onClick={() => {
                  setDeleteModalOrg(null);
                  setDeleteConfirmName('');
                  setDeleteError('');
                }}
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={handleDelete}
                disabled={deleteConfirmName !== deleteModalOrg.name || deleteLoading}
                isLoading={deleteLoading}
              >
                Delete Organization
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
