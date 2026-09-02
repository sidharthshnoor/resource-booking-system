import React from 'react';
import { Building2, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';

export default function AdminSettings() {
  const { user } = useAuth();
  return <div className="flex flex-col gap-6"><div><h1 style={{ marginBottom: 'var(--spacing-2)' }}>Settings</h1><p style={{ color: 'var(--color-text-secondary)' }}>Review account and organization details.</p></div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-6)' }}><Card><UserRound size={20} color="var(--color-secondary)" /><h3 style={{ margin: '12px 0 6px' }}>Account</h3><p style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>Signed-in administrator profile.</p><div><strong>{user?.name}</strong><div style={{ color: 'var(--color-text-secondary)' }}>{user?.email}</div><div className="text-label-sm" style={{ marginTop: 12 }}>{user?.role}</div></div></Card><Card><Building2 size={20} color="var(--color-secondary)" /><h3 style={{ margin: '12px 0 6px' }}>Organization</h3><p style={{ color: 'var(--color-text-secondary)' }}>Organization preferences are not configured in the current application.</p></Card></div></div>;
}