import React from 'react';
import Card from './Card';
import Button from './Button';

export default function Modal({ isOpen, onClose, title, children, footer, size = 'md' }) {
  if (!isOpen) return null;

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const sizes = {
    sm: '400px',
    md: '600px',
    lg: '800px',
  };

  const modalStyle = {
    width: '100%',
    maxWidth: sizes[size],
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-lg)',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <Card style={modalStyle} noPadding onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: 'var(--spacing-6)', borderBottom: '1px solid var(--color-border)' }} className="flex justify-between items-center">
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--color-text-secondary)' }}
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 'var(--spacing-6)', overflowY: 'auto' }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{ padding: 'var(--spacing-6)', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-muted)' }}>
            {footer}
          </div>
        )}
      </Card>
    </div>
  );
}
