import React from 'react';

// Using inline styles mapped to our CSS variables from styles.css
export default function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  fullWidth = false, 
  isLoading = false,
  ...props 
}) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius-md)',
    fontWeight: '500',
    fontSize: '0.875rem',
    cursor: isLoading || props.disabled ? 'not-allowed' : 'pointer',
    opacity: isLoading || props.disabled ? 0.6 : 1,
    border: '1px solid transparent',
    transition: 'all 0.2s ease',
    width: fullWidth ? '100%' : 'auto',
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-text-inverse)',
      boxShadow: 'var(--shadow-sm)'
    },
    secondary: {
      backgroundColor: 'transparent',
      border: '1px solid var(--color-border)',
      color: 'var(--color-primary)'
    },
    danger: {
      backgroundColor: 'var(--color-status-rejected-text)',
      color: 'var(--color-text-inverse)'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-text-secondary)'
    }
  };

  const style = { ...baseStyles, ...variants[variant] };

  return (
    <button style={style} className={className} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? 'Loading...' : children}
    </button>
  );
}
