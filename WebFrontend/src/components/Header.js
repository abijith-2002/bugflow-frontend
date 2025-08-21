import React, { useState } from 'react';

// PUBLIC_INTERFACE
const Header = ({ activeNavItem, setActiveNavItem }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navItems = ['Home', 'Analytics', 'Projects', 'Settings'];

  // PUBLIC_INTERFACE
  const handleNavClick = (item) => {
    setActiveNavItem(item);
  };

  // PUBLIC_INTERFACE
  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-logo">BugFlow Dashboard</h1>
      </div>

      <nav className="header-nav">
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item} className="nav-item-container">
              <button
                className={`nav-item ${activeNavItem === item ? 'active' : ''}`}
                onClick={() => handleNavClick(item)}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="header-right">
        <div className="user-profile" onClick={toggleProfile}>
          <div className="user-avatar">
            <span>JD</span>
          </div>
          <svg 
            className={`dropdown-arrow ${isProfileOpen ? 'open' : ''}`}
            width="12" 
            height="12" 
            viewBox="0 0 12 12" 
            fill="none"
          >
            <path 
              d="M3 4.5L6 7.5L9 4.5" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          {isProfileOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-item">Profile</div>
              <div className="dropdown-item">Settings</div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item">Sign Out</div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
