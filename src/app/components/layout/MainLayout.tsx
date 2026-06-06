// MainLayout Component - Wrapper with Sidebar + Content
import React from 'react';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * MainLayout
 * Combines Sidebar + main content area
 * Used by all authenticated pages
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
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
