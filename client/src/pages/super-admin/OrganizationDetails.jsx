import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import superAdminService from '../../services/superAdmin.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { ArrowLeft, UserPlus, AlertTriangle, ShieldCheck, Users, Shield, Monitor, Calendar } from 'lucide-react';

export default function OrganizationDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [adminForm, setAdminForm] = useState({ name: '', email: '' });
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await superAdminService.getOrganization(id);
      setData(res);
    } catch (err) {
      setError('Failed to load organization details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const toggleStatus = async () => {
    if (data.organization.slug === 'default') {
      alert("Cannot deactivate the default organization.");
      return;
    }
    const newStatus = data.organization.status === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';
    try {
      await superAdminService.updateOrganizationStatus(id, newStatus);
      fetchDetails(); // Refresh
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleAdminProvision = async (e) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminError('');
    setAdminSuccess('');

    try {
      const res = await superAdminService.provisionAdmin(id, adminForm);
      setAdminSuccess(res.message);
      setAdminForm({ name: '', email: '' });
      fetchDetails(); // Refresh to hide form and show new admin
    } catch (err) {
      setAdminError(err.message || 'Failed to provision admin');
    } finally {
      setAdminLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading details...</div>;
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center">
        <AlertTriangle size={20} className="mr-2" />
        {error || 'Organization not found'}
      </div>
    );
  }

  const { organization, admins } = data;
  const hasAdmin = admins && admins.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/super-admin/organizations" className="mr-4 text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{organization.name}</h1>
            <p className="text-slate-500 font-mono">/org/{organization.slug}</p>
          </div>
        </div>
        <div>
          <Button 
            variant={organization.status === 'ACTIVE' ? 'danger' : 'primary'}
            onClick={toggleStatus}
            disabled={organization.slug === 'default'}
          >
            {organization.status === 'ACTIVE' ? 'Deactivate Organization' : 'Activate Organization'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="flex items-center p-4">
          <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-4">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Users</p>
            <p className="text-2xl font-bold text-slate-800">{data.counts?.users || 0}</p>
          </div>
        </Card>
        
        <Card className="flex items-center p-4">
          <div className="w-12 h-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-4">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Admins</p>
            <p className="text-2xl font-bold text-slate-800">{data.counts?.admins || 0}</p>
          </div>
        </Card>

        <Card className="flex items-center p-4">
          <div className="w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-4">
            <Monitor size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Resources</p>
            <p className="text-2xl font-bold text-slate-800">{data.counts?.resources || 0}</p>
          </div>
        </Card>

        <Card className="flex items-center p-4">
          <div className="w-12 h-12 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mr-4">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Bookings</p>
            <p className="text-2xl font-bold text-slate-800">{data.counts?.bookings || 0}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="h-full">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Profile</h3>
            <div className="space-y-4">
              {organization.logo && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">Logo</p>
                  <img src={organization.logo} alt="Logo" className="w-24 h-24 rounded object-contain border border-slate-200" />
                </div>
              )}
              <div>
                <p className="text-sm text-slate-500 mb-1">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  organization.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {organization.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Created</p>
                <p className="text-slate-800">{new Date(organization.created_at).toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={20} className="text-slate-700" />
              <h3 className="text-lg font-bold text-slate-800">Administrators</h3>
            </div>
            
            {hasAdmin ? (
              <div className="space-y-4">
                {admins.map(admin => (
                  <div key={admin.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                      <p className="font-semibold text-slate-800">{admin.name}</p>
                      <p className="text-sm text-slate-500">{admin.email}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Organization Admin
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-amber-50 text-amber-800 p-4 rounded-lg mb-6 border border-amber-200">
                <div className="flex mb-2">
                  <AlertTriangle size={20} className="mr-2 flex-shrink-0" />
                  <p className="font-medium">No Administrators Found</p>
                </div>
                <p className="text-sm ml-7">This organization has no administrators. You should provision the first administrator so they can manage the tenant.</p>
              </div>
            )}
          </Card>

          {!hasAdmin && organization.status === 'ACTIVE' && (
            <Card>
              <h3 className="text-lg font-bold text-slate-800 mb-4">Provision First Admin</h3>
              <p className="text-sm text-slate-600 mb-6">
                This will create an administrator account and send them a password setup email. They will be granted full access to this organization.
              </p>

              {adminError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
                  {adminError}
                </div>
              )}
              
              {adminSuccess && (
                <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm font-medium">
                  {adminSuccess}
                </div>
              )}

              <form onSubmit={handleAdminProvision} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="adminName" className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      id="adminName"
                      value={adminForm.name}
                      onChange={e => setAdminForm({...adminForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-sky-500 focus:border-sky-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="adminEmail" className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      id="adminEmail"
                      value={adminForm.email}
                      onChange={e => setAdminForm({...adminForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-sky-500 focus:border-sky-500 outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" isLoading={adminLoading}>
                    <UserPlus size={18} className="mr-2" />
                    Provision Admin
                  </Button>
                </div>
              </form>
            </Card>
          )}
          
          {!hasAdmin && organization.status !== 'ACTIVE' && (
             <div className="p-4 text-center text-slate-500 border border-dashed border-slate-300 rounded-lg">
                Activate the organization to provision administrators.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
