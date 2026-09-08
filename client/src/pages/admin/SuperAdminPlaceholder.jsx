import React from 'react';

export default function SuperAdminPlaceholder() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-900 text-white p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">Super Admin Portal</h1>
        <p className="text-gray-400 text-lg">
          The global management interface is currently under development. This route remains separate from standard tenant organizations.
        </p>
      </div>
    </div>
  );
}
