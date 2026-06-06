// AdminLayout Component - Wrapper for admin pages
import React from 'react';
import { Sidebar } from './Sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * AdminLayout
 * Admin-specific layout with sidebar
 */
export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 transition-all duration-300">
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  );
};
