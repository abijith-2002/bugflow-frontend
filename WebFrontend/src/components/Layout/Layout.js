import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { 
  Bug, 
  Home, 
  FolderOpen, 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User
} from 'lucide-react';
import './Layout.css';

// PUBLIC_INTERFACE
const Layout = ({ children }) => {
  /**
   * Main layout component with navigation and header
   * @param {Object} props - Component props
   * @param {React.ReactNode} props.children - Page content to render
   * @returns {JSX.Element} Layout component
   */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Projects', href: '/projects', icon: FolderOpen },
    { name: 'Bugs', href: '/bugs', icon: Bug },
    { name: 'Notifications', href: '/notifications', icon: Bell, badge: unreadCount },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Bug className="logo-icon" size={32} />
            <span className="logo-text">BugFlow</span>
          </div>
          <button 
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                <span>{item.name}</span>
                {item.badge > 0 && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <button
              className="menu-button"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="page-title">
              {navigation.find(item => item.href === location.pathname)?.name || 'BugFlow'}
            </h1>
          </div>

          <div className="header-right">
            {/* Notifications */}
            <Link to="/notifications" className="notification-button">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </Link>

            {/* User Menu */}
            <div className="user-menu">
              <button
                className="user-button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              >
                <User size={20} />
                <span>{user?.email}</span>
              </button>

              {profileMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <div className="user-name">{user?.email}</div>
                    <div className="user-role">{user?.role}</div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item">
                    <Settings size={16} />
                    Settings
                  </button>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          {children}
        </main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Close profile menu when clicking outside */}
      {profileMenuOpen && (
        <div 
          className="dropdown-overlay"
          onClick={() => setProfileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
