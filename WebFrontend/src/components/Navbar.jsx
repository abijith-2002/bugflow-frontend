import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      alert('Error signing out');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="brand">BugFlow</Link>
        {user && (
          <>
            <NavLink to="/" end>Dashboard</NavLink>
            <NavLink to="/projects">Projects</NavLink>
            <NavLink to="/bugs">Bugs</NavLink>
            <NavLink to="/report">Report</NavLink>
            <NavLink to="/notifications">Notifications</NavLink>
          </>
        )}
      </div>
      <div className="navbar-right">
        {!user ? (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/signup">Sign Up</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/account">{user.email}</NavLink>
            <button className="btn" onClick={handleSignOut}>Sign Out</button>
          </>
        )}
      </div>
    </nav>
  );
}
