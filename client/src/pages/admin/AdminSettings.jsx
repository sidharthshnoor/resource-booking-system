import React, { useState } from 'react';
import { Building2, CalendarDays, Check, Eye, EyeOff, LockKeyhole, Plus, ShieldCheck, UserRound, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrganization } from '../../context/OrganizationContext';
import authService from '../../services/auth.service';
import adminService from '../../services/admin.service';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';

const emptyPasswordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
const emptyAdminForm = { name: '', email: '', password: '', confirmPassword: '' };

function PasswordField({ label, name, value, onChange, visible, onToggle, autoComplete, placeholder }) {
  return (
    <div className="settings-password-field">
      <Input
        label={label}
        name={name}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required
        className="settings-input-field"
      />
      <LockKeyhole className="settings-password-icon" size={17} aria-hidden="true" />
      <button type="button" className="settings-password-toggle" onClick={onToggle} aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}>
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}

function DetailRow({ label, children }) {
  return <div className="settings-detail-row"><span>{label}</span><strong>{children}</strong></div>;
}

export default function AdminSettings() {
  const { user, updateUser } = useAuth();
  const { organization } = useOrganization();
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [passwordVisibility, setPasswordVisibility] = useState({ current: false, next: false, confirm: false });
  const [passwordError, setPasswordError] = useState('');
  const [passwordNotice, setPasswordNotice] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [adminForm, setAdminForm] = useState(emptyAdminForm);
  const [adminVisibility, setAdminVisibility] = useState({ password: false, confirm: false });
  const [adminError, setAdminError] = useState('');
  const [adminNotice, setAdminNotice] = useState('');
  const [adminSaving, setAdminSaving] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const updatePasswordField = (event) => {
    const { name, value } = event.target;
    setPasswordForm(previous => ({ ...previous, [name]: value }));
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordNotice('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation must match.');
      return;
    }
    setPasswordSaving(true);
    try {
      const response = await authService.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      updateUser(response.user);
      setPasswordForm(emptyPasswordForm);
      setPasswordNotice('Password updated successfully.');
    } catch (error) {
      setPasswordError(error.message || 'Unable to update password at this time.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const updateAdminField = (event) => {
    const { name, value } = event.target;
    setAdminForm(previous => ({ ...previous, [name]: value }));
  };

  const closeAdminModal = () => {
    if (!adminSaving) {
      setIsAdminModalOpen(false);
      setAdminNotice('');
    }
  };

  const handleAdminSubmit = async (event) => {
    event.preventDefault();
    setAdminError('');
    setAdminNotice('');
    if (adminForm.password !== adminForm.confirmPassword) {
      setAdminError('Temporary password and confirmation must match.');
      return;
    }
    setAdminSaving(true);
    try {
      const response = await adminService.createAdmin({ name: adminForm.name, email: adminForm.email, password: adminForm.password });
      setAdminForm(emptyAdminForm);
      setAdminNotice(response.message);
    } catch (error) {
      setAdminError(error.message || 'Unable to create admin account.');
    } finally {
      setAdminSaving(false);
    }
  };

  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not available';
  const organizationCreated = organization?.created_at ? new Date(organization.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not available';

  return (
    <div className="settings-page">
      <div className="settings-page-heading">
        <h1>Settings</h1>
        <p>Review account and organization details.</p>
      </div>

      {user?.must_change_password && (
        <div className="settings-required-notice" role="alert">
          <ShieldCheck size={20} />
          <div><strong>Password Update Required</strong><span>Your account was created with a temporary password. Please update your password before continuing.</span></div>
        </div>
      )}
      <div className="settings-summary-grid">
        <Card className="settings-card settings-summary-card">
          <div className="settings-card-header">
            <div className="settings-icon settings-icon-account"><UserRound size={20} /></div>
            <div><h2>Account</h2><p>Signed-in administrator profile.</p></div>
            <span className="settings-role-badge">{user?.role || 'ADMIN'}</span>
          </div>
          <div className="settings-detail-list">
            <DetailRow label="Full Name">{user?.name || 'Not available'}</DetailRow>
            <DetailRow label="Email Address">{user?.email || 'Not available'}</DetailRow>
            <DetailRow label="Role">{user?.role || 'Not available'}</DetailRow>
            <DetailRow label="Account Status"><span className="settings-status"><i />{user?.status === 'DEACTIVATED' ? 'Deactivated' : 'Active'}</span></DetailRow>
            <DetailRow label="Member Since"><span className="settings-date"><CalendarDays size={15} />{memberSince}</span></DetailRow>
          </div>
        </Card>

        <Card className="settings-card settings-summary-card">
          <div className="settings-card-header">
            <div className="settings-icon settings-icon-organization"><Building2 size={20} /></div>
            <div><h2>Organization</h2><p>Organization details and status.</p></div>
          </div>
          <div className="settings-detail-list">
            <DetailRow label="Organization Name">{organization?.name || 'Not available'}</DetailRow>
            <DetailRow label="Organization Code">{organization?.slug || 'Not available'}</DetailRow>
            <DetailRow label="Status"><span className="settings-status"><i />{organization?.status === 'DEACTIVATED' ? 'Deactivated' : 'Active'}</span></DetailRow>
            <DetailRow label="Created On"><span className="settings-date"><CalendarDays size={15} />{organizationCreated}</span></DetailRow>
          </div>
        </Card>
      </div>

      <Card className="settings-card settings-password-card">
        <div className="settings-section-heading"><div className="settings-icon settings-icon-password"><LockKeyhole size={21} /></div><div><h2>Change Password</h2><p>Update the password for your administrator account.</p></div></div>
        {passwordError && <div className="settings-inline-error" role="alert">{passwordError}</div>}
        {passwordNotice && <div className="settings-inline-success" role="status"><Check size={16} />{passwordNotice}</div>}
        <form onSubmit={handlePasswordSubmit}>
          <div className="settings-password-grid">
            <PasswordField label="Current Password" name="currentPassword" value={passwordForm.currentPassword} onChange={updatePasswordField} visible={passwordVisibility.current} onToggle={() => setPasswordVisibility(previous => ({ ...previous, current: !previous.current }))} autoComplete="current-password" placeholder="Enter current password" />
            <PasswordField label="New Password" name="newPassword" value={passwordForm.newPassword} onChange={updatePasswordField} visible={passwordVisibility.next} onToggle={() => setPasswordVisibility(previous => ({ ...previous, next: !previous.next }))} autoComplete="new-password" placeholder="Enter new password" />
            <PasswordField label="Confirm New Password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={updatePasswordField} visible={passwordVisibility.confirm} onToggle={() => setPasswordVisibility(previous => ({ ...previous, confirm: !previous.confirm }))} autoComplete="new-password" placeholder="Confirm new password" />
          </div>
          <div className="settings-password-footer"><div className="settings-requirements"><ShieldCheck size={21} /><div><strong>Password Requirements</strong><span><Check size={13} />At least 8 characters</span><span><Check size={13} />Use a unique password</span></div></div><div className="settings-form-actions"><Button type="button" variant="secondary" onClick={() => setPasswordForm(emptyPasswordForm)}>Reset</Button><Button type="submit" isLoading={passwordSaving}><LockKeyhole size={16} />Update Password</Button></div></div>
        </form>
      </Card>

      <Card className="settings-card settings-admin-card">
        <div className="settings-section-heading"><div className="settings-icon settings-icon-admin"><UserPlus size={21} /></div><div><h2>Add Admin</h2><p>Create another administrator for this organization.</p></div><Button type="button" className="settings-add-button" onClick={() => { setAdminError(''); setAdminNotice(''); setIsAdminModalOpen(true); }}><Plus size={17} />Add Admin</Button></div>
      </Card>

      <Modal isOpen={isAdminModalOpen} onClose={closeAdminModal} title="Add Administrator">
        <div className="settings-modal-intro">Create a new administrator account for this organization.</div>
        <form onSubmit={handleAdminSubmit} className="settings-admin-form">
          <Input label="Full Name *" name="name" value={adminForm.name} onChange={updateAdminField} autoComplete="name" placeholder="Enter full name" required />
          <Input label="Email Address *" name="email" type="email" value={adminForm.email} onChange={updateAdminField} autoComplete="email" placeholder="Enter email address" required />
          <div className="settings-modal-password-grid"><PasswordField label="Temporary Password *" name="password" value={adminForm.password} onChange={updateAdminField} visible={adminVisibility.password} onToggle={() => setAdminVisibility(previous => ({ ...previous, password: !previous.password }))} autoComplete="new-password" placeholder="Enter temporary password" /><PasswordField label="Confirm Password *" name="confirmPassword" value={adminForm.confirmPassword} onChange={updateAdminField} visible={adminVisibility.confirm} onToggle={() => setAdminVisibility(previous => ({ ...previous, confirm: !previous.confirm }))} autoComplete="new-password" placeholder="Confirm password" /></div>
          {adminError && <div className="settings-inline-error" role="alert">{adminError}</div>}
          {adminNotice && <div className="settings-modal-success" role="status"><Check size={16} />{adminNotice}</div>}
          <div className="settings-modal-actions"><Button type="button" variant="secondary" onClick={closeAdminModal}>Cancel</Button><Button type="submit" isLoading={adminSaving}>Create Admin</Button></div>
        </form>
      </Modal>
    </div>
  );
}
