import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Building2, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CircleAlert, Eye, MoreVertical, Plus, Search, Users, XCircle } from 'lucide-react';
import superAdminService from '../../services/superAdmin.service';
import Button from '../../components/ui/Button';

const emptyFilters = { search: '', status: 'ALL', sort: 'created' };

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function StatusBadge({ status }) {
  const active = status === 'ACTIVE';
  return <span className={`org-status ${active ? 'is-active' : 'is-deactivated'}`}><span />{status}</span>;
}

function MetricCard({ icon: Icon, label, value, tone }) {
  return <div className={`org-metric org-metric-${tone}`}><div className="org-metric-icon"><Icon size={22} /></div><div><p>{label}</p><strong>{value}</strong></div></div>;
}

export default function OrganizationsList() {
  const [organizations, setOrganizations] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openMenu, setOpenMenu] = useState(null);
  const [deleteModalOrg, setDeleteModalOrg] = useState(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchOrgs = async () => {
    try {
      setLoading(true);
      const response = await superAdminService.getOrganizations();
      setOrganizations(response.organizations || []);
      setError('');
    } catch (err) {
      setError('Failed to load organizations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
    const handleGlobalSearch = (event) => setFilters((current) => ({ ...current, search: event.detail }));
    window.addEventListener('super-admin-search', handleGlobalSearch);
    return () => window.removeEventListener('super-admin-search', handleGlobalSearch);
  }, []);

  const filteredOrganizations = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return organizations.filter((organization) => {
      const matchesSearch = !query || [organization.name, organization.slug].some((field) => field?.toLowerCase().includes(query));
      return matchesSearch && (filters.status === 'ALL' || organization.status === filters.status);
    }).sort((left, right) => {
      if (filters.sort === 'name') return left.name.localeCompare(right.name);
      if (filters.sort === 'users') return (right.counts?.users || 0) - (left.counts?.users || 0);
      return new Date(right.created_at) - new Date(left.created_at);
    });
  }, [filters, organizations]);

  const totals = organizations.reduce((summary, organization) => ({
    users: summary.users + (organization.counts?.users || 0),
    active: summary.active + (organization.status === 'ACTIVE' ? 1 : 0),
    deactivated: summary.deactivated + (organization.status === 'DEACTIVATED' ? 1 : 0)
  }), { users: 0, active: 0, deactivated: 0 });

  const toggleStatus = async (organization) => {
    if (organization.slug === 'default') return alert('Cannot deactivate the default organization.');
    try {
      await superAdminService.updateOrganizationStatus(organization.id, organization.status === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE');
      setOpenMenu(null);
      fetchOrgs();
    } catch (err) { alert(err.message || 'Failed to update status'); }
  };

  const handleDelete = async () => {
    if (!deleteModalOrg) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await superAdminService.deleteOrganization(deleteModalOrg.id);
      setDeleteModalOrg(null);
      setDeleteConfirmName('');
      fetchOrgs();
    } catch (err) { setDeleteError(err.message || 'Failed to delete organization'); }
    finally { setDeleteLoading(false); }
  };

  return <div className="organizations-page">
    <div className="org-page-header"><div><p className="org-eyebrow">PLATFORM DIRECTORY</p><h1>Organizations</h1><p>Manage all tenant organizations on the platform.</p></div><Link to="/super-admin/organizations/new" className="org-new-button"><Plus size={18} /> New Organization</Link></div>
    {error && <div className="org-error"><AlertTriangle size={20} /> {error}</div>}
    <section className="org-metrics" aria-label="Organization metrics"><MetricCard icon={Building2} label="Total Organizations" value={organizations.length} tone="blue" /><MetricCard icon={CheckCircle2} label="Active Organizations" value={totals.active} tone="green" /><MetricCard icon={XCircle} label="Deactivated Organizations" value={totals.deactivated} tone="red" /><MetricCard icon={Users} label="Total Users (All Orgs)" value={totals.users} tone="violet" /></section>
    <section className="org-table-card">
      <div className="org-filter-row"><label className="org-search-input"><Search size={17} /><input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search by name, slug, or keyword..." /></label><label className="org-filter-field"><span>Status</span><span className="org-select-wrap"><select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="ALL">All Statuses</option><option value="ACTIVE">Active</option><option value="DEACTIVATED">Deactivated</option></select><ChevronDown size={15} /></span></label><label className="org-filter-field"><span>Sort By</span><span className="org-select-wrap"><select value={filters.sort} onChange={(event) => setFilters({ ...filters, sort: event.target.value })}><option value="created">Recently Created</option><option value="name">Name</option><option value="users">Most Users</option></select><ChevronDown size={15} /></span></label><button type="button" className="org-clear-button" onClick={() => setFilters(emptyFilters)}>Clear Filters</button></div>
      <div className="org-table-scroll"><table className="org-table"><thead><tr><th>#</th><th>Name</th><th>Slug</th><th>Status</th><th>Users</th><th>Resources</th><th>Bookings</th><th>Created At</th><th>Actions</th></tr></thead><tbody>{loading ? <tr><td colSpan="9" className="org-empty">Loading organizations...</td></tr> : filteredOrganizations.map((organization, index) => <tr key={organization.id}><td className="org-index">{index + 1}</td><td><div className="org-name-cell">{organization.logo ? <img src={organization.logo} alt="" /> : <span className="org-avatar">{organization.name.charAt(0).toUpperCase()}</span>}<strong>{organization.name}</strong></div></td><td className="org-slug">{organization.slug}</td><td><StatusBadge status={organization.status} /></td><td>{organization.counts?.users || 0}</td><td>{organization.counts?.resources || 0}</td><td>{organization.counts?.bookings || 0}</td><td className="org-date">{formatDate(organization.created_at)}</td><td><div className="org-actions"><Link to={`/super-admin/organizations/${organization.id}`} className="org-view-button"><Eye size={15} /> View</Link><div className="org-menu-wrap"><button className="org-icon-button" onClick={() => setOpenMenu(openMenu === organization.id ? null : organization.id)} aria-label={`Actions for ${organization.name}`}><MoreVertical size={18} /></button>{openMenu === organization.id && <div className="org-actions-menu"><Link to={`/super-admin/organizations/${organization.id}`} onClick={() => setOpenMenu(null)}>View</Link><button disabled={organization.slug === 'default'} onClick={() => toggleStatus(organization)}>{organization.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</button><button className="danger" disabled={organization.slug === 'default'} onClick={() => { setDeleteModalOrg(organization); setOpenMenu(null); }}>Delete</button></div>}</div></div></td></tr>)}{!loading && filteredOrganizations.length === 0 && <tr><td colSpan="9" className="org-empty">No organizations match the current filters.</td></tr>}</tbody></table></div>
      <div className="org-pagination"><span>Showing {filteredOrganizations.length ? 1 : 0} to {filteredOrganizations.length} of {filteredOrganizations.length} organizations</span><div><button disabled aria-label="Previous page"><ChevronLeft size={17} /></button><button className="current-page">1</button><button disabled aria-label="Next page"><ChevronRight size={17} /></button></div></div>
    </section>
    <section className="org-about"><div className="org-about-icon"><CircleAlert size={18} /></div><div><h2>About Organizations</h2><p>Organizations are independent tenants on the RBS platform. Each organization has its own users, resources, and bookings.</p></div></section>
    <footer className="org-footer"><span>© 2026 RBS Enterprise. All rights reserved.</span><span>Resource Booking System&nbsp; | &nbsp;Platform Administration</span></footer>
    {deleteModalOrg && <div className="org-modal-backdrop"><div className="org-delete-modal"><div className="org-modal-title"><AlertTriangle size={22} /><h2>Delete Organization?</h2></div><p>This will permanently delete <strong>{deleteModalOrg.name}</strong> and all associated users, resources, bookings, invitations, and tenant data.</p><div className="org-delete-warning">This action <strong>cannot be undone</strong>.</div><label>Type <strong>"{deleteModalOrg.name}"</strong> to confirm deletion.<input value={deleteConfirmName} onChange={(event) => setDeleteConfirmName(event.target.value)} placeholder={deleteModalOrg.name} /></label>{deleteError && <div className="org-error">{deleteError}</div>}<div className="org-modal-actions"><Button variant="secondary" onClick={() => { setDeleteModalOrg(null); setDeleteConfirmName(''); setDeleteError(''); }} disabled={deleteLoading}>Cancel</Button><Button variant="danger" onClick={handleDelete} disabled={deleteConfirmName !== deleteModalOrg.name || deleteLoading} isLoading={deleteLoading}>Delete Organization</Button></div></div></div>}
  </div>;
}
