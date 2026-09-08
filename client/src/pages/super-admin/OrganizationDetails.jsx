import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Building2, CalendarDays, CheckCircle2, Edit3, Eye, Monitor, Plus, Shield, Trash2, Users, X, XCircle } from 'lucide-react';
import superAdminService from '../../services/superAdmin.service';
import Button from '../../components/ui/Button';

const emptyOrgForm = { name: '', slug: '', logo: '' };
const emptyAdminForm = { name: '', email: '', status: 'ACTIVE' };

function StatusBadge({ status }) {
  const active = status === 'ACTIVE';
  return <span className={`details-status ${active ? 'is-active' : 'is-deactivated'}`}><span />{status}</span>;
}

function Metric({ icon: Icon, label, value, tone }) {
  return <div className={`details-metric details-metric-${tone}`}><div><Icon size={21} /></div><section><p>{label}</p><strong>{value}</strong></section></div>;
}

function Modal({ title, children, onClose }) {
  return <div className="details-modal-backdrop"><div className="details-modal"><div className="details-modal-header"><h2>{title}</h2><button onClick={onClose} aria-label="Close"><X size={18} /></button></div>{children}</div></div>;
}

export default function OrganizationDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [modal, setModal] = useState(null);
  const [orgForm, setOrgForm] = useState(emptyOrgForm);
  const [adminForm, setAdminForm] = useState(emptyAdminForm);
  const [adminTarget, setAdminTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const response = await superAdminService.getOrganization(id);
      setData(response);
      setError('');
    } catch (err) { setError(err.message || 'Failed to load organization details.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDetails(); }, [id]);

  const closeModal = () => { if (!saving) { setModal(null); setModalError(''); } };
  const openOrgEdit = () => { setOrgForm({ name: data.organization.name, slug: data.organization.slug, logo: data.organization.logo || '' }); setModal('organization'); setModalError(''); };
  const openAdminAdd = () => { setAdminTarget(null); setAdminForm(emptyAdminForm); setModal('admin'); setModalError(''); };
  const openAdminEdit = (admin) => { setAdminTarget(admin); setAdminForm({ name: admin.name, email: admin.email, status: admin.status || 'ACTIVE' }); setModal('admin'); setModalError(''); };

  const toggleStatus = async () => {
    if (data.organization.slug === 'default') return alert('Cannot deactivate the default organization.');
    try { await superAdminService.updateOrganizationStatus(id, data.organization.status === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE'); setNotice('Organization status updated.'); fetchDetails(); }
    catch (err) { setError(err.message || 'Failed to update status.'); }
  };

  const saveOrganization = async (event) => {
    event.preventDefault();
    if (!orgForm.name.trim() || !orgForm.slug.trim()) return setModalError('Name and slug are required.');
    if (!/^[a-z0-9-]+$/.test(orgForm.slug)) return setModalError('Slug can only contain lowercase letters, numbers, and hyphens.');
    setSaving(true); setModalError('');
    try { await superAdminService.updateOrganization(id, orgForm); setModal(null); setNotice('Organization details updated.'); fetchDetails(); }
    catch (err) { setModalError(err.message || 'Unable to update organization.'); }
    finally { setSaving(false); }
  };

  const saveAdmin = async (event) => {
    event.preventDefault();
    if (!adminForm.name.trim() || !adminForm.email.trim()) return setModalError('Name and email are required.');
    setSaving(true); setModalError('');
    try {
      const response = adminTarget ? await superAdminService.updateAdmin(id, adminTarget.id, adminForm) : await superAdminService.provisionAdmin(id, adminForm);
      setModal(null); setAdminForm(emptyAdminForm); setNotice(response.message || 'Administrator saved.'); fetchDetails();
    } catch (err) { setModalError(err.message || 'Unable to save administrator.'); }
    finally { setSaving(false); }
  };

  const removeAdmin = async (admin) => {
    if (!window.confirm(`Remove administrator ${admin.name}? This action cannot be undone.`)) return;
    try { await superAdminService.deleteAdmin(id, admin.id); setNotice('Administrator removed.'); fetchDetails(); }
    catch (err) { setError(err.message || 'Unable to remove administrator.'); }
  };

  if (loading) return <div className="details-loading">Loading organization details...</div>;
  if (error || !data) return <div className="details-error"><AlertTriangle size={20} /> {error || 'Organization not found.'}</div>;

  const { organization, admins = [], counts = {} } = data;
  return <div className="organization-details-page">
    <div className="details-header"><div><Link to="/super-admin/organizations" className="details-back"><ArrowLeft size={16} /> Back to Organizations</Link><div className="details-title-row"><h1>{organization.name}</h1><StatusBadge status={organization.status} /></div><p className="details-slug">/org/{organization.slug}</p></div><div className="details-header-actions"><button className="details-secondary-button" onClick={openOrgEdit}><Edit3 size={15} /> Edit Details</button><button className={`details-status-button ${organization.status === 'ACTIVE' ? 'danger' : 'primary'}`} disabled={organization.slug === 'default'} onClick={toggleStatus}>{organization.status === 'ACTIVE' ? <XCircle size={15} /> : <CheckCircle2 size={15} />}{organization.status === 'ACTIVE' ? 'Deactivate Organization' : 'Activate Organization'}</button></div></div>
    {notice && <div className="details-notice"><CheckCircle2 size={17} /> {notice}<button onClick={() => setNotice('')} aria-label="Dismiss"><X size={15} /></button></div>}
    <section className="details-metrics"><Metric icon={Users} label="Total Users" value={counts.users || 0} tone="blue" /><Metric icon={Shield} label="Total Admins" value={counts.admins || 0} tone="violet" /><Metric icon={Monitor} label="Total Resources" value={counts.resources || 0} tone="green" /><Metric icon={CalendarDays} label="Total Bookings" value={counts.bookings || 0} tone="orange" /></section>
    <section className="details-main-grid"><div className="details-card organization-info-card"><div className="details-card-heading"><div className="details-card-icon blue"><Building2 size={19} /></div><div><h2>Organization Information</h2><p>Basic information about this organization.</p></div><button className="details-inline-edit" onClick={openOrgEdit}><Edit3 size={14} /> Edit Details</button></div><div className="details-info-list"><div><strong>Organization Name</strong><span>{organization.name}</span></div><div><strong>Organization Slug</strong><span>{organization.slug}</span></div><div><strong>Status</strong><span><StatusBadge status={organization.status} /></span></div><div><strong>Created At</strong><span>{new Date(organization.created_at).toLocaleString()}</span></div>{organization.logo && <div><strong>Logo</strong><img className="details-logo" src={organization.logo} alt={`${organization.name} logo`} /></div>}</div></div><div className="details-card details-about-card"><div className="details-card-heading"><div className="details-card-icon blue"><Eye size={19} /></div><div><h2>About This Organization</h2><p>Tenant information and data ownership.</p></div></div><p>This organization has its own users, resources, and bookings. All data is isolated within this tenant.</p></div></section>
    <section className="details-card administrators-card"><div className="details-card-heading"><div className="details-card-icon violet"><Shield size={19} /></div><div><h2>Administrators</h2><p>Users with administrator access to this organization.</p></div><button className="details-add-button" onClick={openAdminAdd}><Plus size={16} /> Add Administrator</button></div><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Added On</th><th>Actions</th></tr></thead><tbody>{admins.map((admin) => <tr key={admin.id}><td><div className="admin-name"><span>{admin.name.slice(0, 2).toUpperCase()}</span><strong>{admin.name}</strong></div></td><td>{admin.email}</td><td><span className="admin-role">{admin.role}</span></td><td><StatusBadge status={admin.status || 'ACTIVE'} /></td><td>{new Date(admin.created_at).toLocaleDateString()}</td><td><div className="admin-actions"><button onClick={() => openAdminEdit(admin)} title="Edit administrator"><Edit3 size={15} /></button><button className="remove" onClick={() => removeAdmin(admin)} title="Remove administrator"><Trash2 size={15} /></button></div></td></tr>)}{admins.length === 0 && <tr><td colSpan="6" className="admin-empty">No administrators found.</td></tr>}</tbody></table></div></section>
    <footer className="details-footer"><span>© 2026 RBS Enterprise. All rights reserved.</span><span>Resource Booking System&nbsp; | &nbsp;Platform Administration</span></footer>

    {modal === 'organization' && <Modal title="Edit Organization Details" onClose={closeModal}><form onSubmit={saveOrganization} className="details-form"><label>Organization Name<input value={orgForm.name} onChange={(event) => setOrgForm({ ...orgForm, name: event.target.value })} required /></label><label>URL Slug<div className="details-slug-input"><span>/org/</span><input value={orgForm.slug} onChange={(event) => setOrgForm({ ...orgForm, slug: event.target.value.toLowerCase() })} required /></div></label><label>Logo URL (Optional)<input type="url" value={orgForm.logo} onChange={(event) => setOrgForm({ ...orgForm, logo: event.target.value })} /></label>{modalError && <div className="details-modal-error">{modalError}</div>}<div className="details-modal-actions"><Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button><Button type="submit" isLoading={saving}>Save Details</Button></div></form></Modal>}
    {modal === 'admin' && <Modal title={adminTarget ? 'Edit Administrator' : 'Add Administrator'} onClose={closeModal}><form onSubmit={saveAdmin} className="details-form"><label>Admin Name<input value={adminForm.name} onChange={(event) => setAdminForm({ ...adminForm, name: event.target.value })} required /></label><label>Admin Email<input type="email" value={adminForm.email} onChange={(event) => setAdminForm({ ...adminForm, email: event.target.value })} required /></label>{adminTarget && <label>Status<select value={adminForm.status} onChange={(event) => setAdminForm({ ...adminForm, status: event.target.value })}><option value="ACTIVE">Active</option><option value="DEACTIVATED">Deactivated</option></select></label>}{!adminTarget && <p className="details-invite-note">A secure password setup invitation will be sent to this address.</p>}{modalError && <div className="details-modal-error">{modalError}</div>}<div className="details-modal-actions"><Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button><Button type="submit" isLoading={saving}>{adminTarget ? 'Save Administrator' : 'Send Invitation'}</Button></div></form></Modal>}
  </div>;
}
