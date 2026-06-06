// Sidebar Component - Main navigation (sticky left side)
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, useIsAdmin } from '@/hooks/useAuth';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Store', icon: '🎮' },
  { path: '/library', label: 'My Library', icon: '📚' },
  { path: '/categories', label: 'Categories', icon: '🏷️' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

const ADMIN_NAV_ITEMS: NavItem[] = [
  { path: '/admin', label: 'Dashboard', icon: '📊', adminOnly: true },
  { path: '/admin/games', label: 'Games', icon: '🎮', adminOnly: true },
  { path: '/admin/users', label: 'Users', icon: '👥', adminOnly: true },
  { path: '/admin/audit', label: 'Audit Log', icon: '📝', adminOnly: true },
];

/**
 * Sidebar Component
 * Sticky left navigation bar with user menu
 * Responsive - collapses on mobile
 */
export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isAdmin = useIsAdmin();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const visibleItems = isAdmin ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS] : NAV_ITEMS;

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-bg-secondary/95 backdrop-blur-md border-r border-neon-purple/20 transition-all duration-300 z-40 ${
          isExpanded ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-neon-purple/10">
          <div
            className={`flex items-center gap-2 transition-opacity ${
              isExpanded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span className="text-2xl">🎮</span>
            <h1 className="text-lg font-bold text-neon-glow">AQ Hub</h1>
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-neon-purple/20 rounded-lg transition-colors text-neon-cyan"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '◀' : '▶'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-2 space-y-1">
          {visibleItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-neon-purple/30 text-neon-purple border border-neon-purple/50 shadow-lg shadow-neon-purple/20'
                  : 'text-text-secondary hover:bg-neon-purple/10 hover:text-neon-cyan'
              }`}
              title={!isExpanded ? item.label : ''}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {isExpanded && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="px-2 py-4">
          <div className="glass-divider"></div>
        </div>

        {/* User Profile Section */}
        {user && (
          <div className="p-4 space-y-3 border-t border-neon-purple/10">
            {/* User Info */}
            <div
              className="relative"
              onMouseEnter={() => setShowUserMenu(true)}
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <button className="w-full flex items-center gap-3 p-2 hover:bg-neon-purple/10 rounded-lg transition-colors group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center text-sm font-bold">
                  {user.username[0].toUpperCase()}
                </div>
                {isExpanded && (
                  <div className="flex-1 text-left">
                    <p className="text-xs font-semibold text-text-primary truncate">
                      {user.username}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {isAdmin ? '👑 Admin' : 'User'}
                    </p>
                  </div>
                )}
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && isExpanded && (
                <div className="absolute bottom-full left-2 right-2 mb-2 bg-bg-tertiary/95 backdrop-blur-md border border-neon-purple/30 rounded-lg overflow-hidden shadow-lg">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm hover:bg-neon-purple/20 text-text-secondary hover:text-neon-cyan transition-colors"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm hover:bg-neon-purple/20 text-text-secondary hover:text-neon-cyan transition-colors"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-red-500/20 text-red-400 transition-colors border-t border-neon-purple/10"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            {isExpanded && (
              <div className="text-xs text-text-tertiary space-y-1">
                <div>Downloaded: <span className="text-neon-cyan">12 games</span></div>
                <div>Wishlist: <span className="text-neon-pink">5 games</span></div>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="fixed bottom-6 left-6 p-3 bg-neon-purple/20 backdrop-blur-md border border-neon-purple/40 rounded-full text-neon-cyan hover:bg-neon-purple/30 transition-colors md:hidden z-40"
        title="Toggle Sidebar"
      >
        {isExpanded ? '◀' : '▶'}
      </button>
    </>
  );
};
