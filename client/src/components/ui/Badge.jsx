import React from 'react';

export default function Badge({ status, className = '' }) {
  const upperStatus = String(status).toUpperCase();
  
  // Base style from Stitch design
  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: 'var(--radius-pill)',
  };

  let colors = {};
  
  switch(upperStatus) {
    case 'PENDING':
      colors = {
        backgroundColor: 'var(--color-status-pending-bg)',
        color: 'var(--color-status-pending-text)'
      };
      break;
    case 'APPROVED':
    case 'AVAILABLE':
    case 'ACTIVE':
      colors = {
        backgroundColor: 'var(--color-status-approved-bg)',
        color: 'var(--color-status-approved-text)'
      };
      break;
    case 'REJECTED':
    case 'MAINTENANCE':
    case 'INACTIVE':
      colors = {
        backgroundColor: 'var(--color-status-rejected-bg)',
        color: 'var(--color-status-rejected-text)'
      };
      break;
    case 'CANCELLED':
      colors = {
        backgroundColor: 'var(--color-status-cancelled-bg)',
        color: 'var(--color-status-cancelled-text)'
      };
      break;
    case 'COMPLETED':
    case 'DONE':
      colors = {
        backgroundColor: 'var(--color-surface-muted)',
        color: 'var(--color-text-placeholder)'
      };
      break;
    default:
      colors = {
        backgroundColor: 'var(--color-border)',
        color: 'var(--color-text-primary)'
      };
  }

  return (
    <span style={{ ...style, ...colors }} className={`text-label-sm ${className}`}>
      {upperStatus}
    </span>
  );
}
