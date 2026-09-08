import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Building2, CheckCircle2, ChevronRight, CircleAlert, Eye, MoreVertical, Users, XCircle } from 'lucide-react';
import superAdminService from '../../services/superAdmin.service';
import Button from '../../components/ui/Button';

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function StatusBadge({ status }) {
  const active = status === 'ACTIVE';
  return <span className={`dashboard-status ${active ? 'is-active' : 'is-deactivated'}`}><span />{status}</span>;
}

function MetricCard({ icon: Icon, label, value, tone }) {
  return <div className={`dashboard-metric dashboard-metric-${tone}`}><div className="dashboard-metric-icon"><Icon size={22} /></div><div><p>{label}</p><strong>{value}</strong></div></div>;
}

export default function GlobalDashboard() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openMenu, setOpenMenu] = useState(null);
  const [deleteModalOrg, setDeleteModalOrg] = useState(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await superAdminService.getOrganizations();
      setOrganizations(response.organizations || []);
      setError('');
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrganizations(); }, []);

  const totals = useMemo(() => organizations.reduce((summary, organization) => ({
    users: summary.users + (organization.counts?.users || 0),
    active: summary.active + (organization.status === 'ACTIVE' ? 1 : 0),
    deactivated: summary.deactivated + (organization.status === 'DEACTIVATED' ? 1 : 0)
  }), { users: 0, active: 0, deactivated: 0 }), [organizations]);

  const totalOrganizations = organizations.length;
  const activePercentage = totalOrganizations ? Math.round((totals.active / totalOrganizations) * 100) : 0;
  const deactivatedPercentage = totalOrganizations ? 100 - activePercentage : 0;
  const recentOrganizations = organizations.slice(0, 5);

  const toggleStatus = async (organization) => {
    if (organization.slug === 'default') return alert('Cannot deactivate the default organization.');
    try {
      await superAdminService.updateOrganizationStatus(organization.id, organization.status === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE');
      setOpenMenu(null);
      fetchOrganizations();
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
      fetchOrganizations();
    } catch (err) { setDeleteError(err.message || 'Failed to delete organization'); }
    finally { setDeleteLoading(false); }
  };

  return <div className="global-dashboard">
    <div className="dashboard-page-header"><div><p className="dashboard-eyebrow">PLATFORM OVERVIEW</p><h1>Welcome to RBS Global</h1><p>Manage and monitor all tenant organizations on the platform.</p></div><div className="dashboard-date"><strong>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</strong><span>Global platform overview</span></div></div>
    {error && <div className="dashboard-error"><AlertTriangle size={20} /> {error}</div>}
    <section className="dashboard-metrics" aria-label="Global metrics"><MetricCard icon={Building2} label="Total Organizations" value={totalOrganizations} tone="blue" /><MetricCard icon={CheckCircle2} label="Active Organizations" value={totals.active} tone="green" /><MetricCard icon={XCircle} label="Deactivated Organizations" value={totals.deactivated} tone="red" /><MetricCard icon={Users} label="Total Users" value={totals.users} tone="violet" /></section>

    <section className="dashboard-middle-grid">
      <div className="dashboard-card status-card"><div className="dashboard-card-header"><div><h2>Organization Status</h2><p>Overview of tenant organization status</p></div><span className="dashboard-filter-label">All Organizations</span></div><div className="status-content"><div className="status-donut" style={{ '--active-percent': `${activePercentage}%` }}><div><strong>{totalOrganizations}</strong><span>Total</span></div></div><div className="status-legend"><div><span className="legend-dot active" /><strong>Active</strong><b>{totals.active}</b><em>{activePercentage}%</em></div><div><span className="legend-dot deactivated" /><strong>Deactivated</strong><b>{totals.deactivated}</b><em>{deactivatedPercentage}%</em></div></div></div></div>
      <div className="dashboard-card activity-card"><div className="dashboard-card-header"><div><h2>Recent Activity</h2><p>Latest platform activity across organizations</p></div></div><div className="dashboard-empty-state"><CircleAlert size={25} /><strong>No recent activity available.</strong><span>The current platform API does not provide an activity feed.</span></div></div>
    </section>

    <section className="dashboard-card recent-orgs-card"><div className="dashboard-card-header"><div><h2>Recent Organizations</h2><p>Latest organizations added to the platform</p></div><Link to="/super-admin/organizations" className="dashboard-view-all">View All Organizations <ChevronRight size={15} /></Link></div><div className="dashboard-table-scroll"><table className="dashboard-table"><thead><tr><th>Name</th><th>Slug</th><th>Status</th><th>Users</th><th>Resources</th><th>Bookings</th><th>Created At</th><th>Actions</th></tr></thead><tbody>{loading ? <tr><td colSpan="8" className="dashboard-empty-row">Loading organizations...</td></tr> : recentOrganizations.map((organization) => <tr key={organization.id}><td><div className="dashboard-org-name"><span>{organization.name.charAt(0).toUpperCase()}</span><strong>{organization.name}</strong></div></td><td className="dashboard-slug">{organization.slug}</td><td><StatusBadge status={organization.status} /></td><td>{organization.counts?.users || 0}</td><td>{organization.counts?.resources || 0}</td><td>{organization.counts?.bookings || 0}</td><td className="dashboard-date-cell">{formatDate(organization.created_at)}</td><td><div className="dashboard-action-wrap"><button className="dashboard-menu-button" aria-label={`Actions for ${organization.name}`} onClick={() => setOpenMenu(openMenu === organization.id ? null : organization.id)}><MoreVertical size={17} /></button>{openMenu === organization.id && <div className="dashboard-actions-menu"><Link to={`/super-admin/organizations/${organization.id}`} onClick={() => setOpenMenu(null)}><Eye size={14} /> View</Link><button disabled={organization.slug === 'default'} onClick={() => toggleStatus(organization)}>{organization.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</button><button className="danger" disabled={organization.slug === 'default'} onClick={() => { setDeleteModalOrg(organization); setOpenMenu(null); }}>Delete</button></div>}</div></td></tr>)}{!loading && recentOrganizations.length === 0 && <tr><td colSpan="8" className="dashboard-empty-row">No organizations available.</td></tr>}</tbody></table></div></section>

    <footer className="dashboard-footer"><span>© 2026 RBS Enterprise. All rights reserved.</span><span>Resource Booking System&nbsp; | &nbsp;Platform Administration</span></footer>
    {deleteModalOrg && <div className="dashboard-modal-backdrop"><div className="dashboard-delete-modal"><div className="dashboard-modal-title"><AlertTriangle size={22} /><h2>Delete Organization?</h2></div><p>This will permanently delete <strong>{deleteModalOrg.name}</strong> and all associated tenant data.</p><div className="dashboard-delete-warning">This action <strong>cannot be undone</strong>.</div><label>Type <strong>"{deleteModalOrg.name}"</strong> to confirm deletion.<input value={deleteConfirmName} onChange={(event) => setDeleteConfirmName(event.target.value)} placeholder={deleteModalOrg.name} /></label>{deleteError && <div className="dashboard-error">{deleteError}</div>}<div className="dashboard-modal-actions"><Button variant="secondary" onClick={() => { setDeleteModalOrg(null); setDeleteConfirmName(''); setDeleteError(''); }} disabled={deleteLoading}>Cancel</Button><Button variant="danger" onClick={handleDelete} disabled={deleteConfirmName !== deleteModalOrg.name || deleteLoading} isLoading={deleteLoading}>Delete Organization</Button></div></div></div>}
  </div>;
}
