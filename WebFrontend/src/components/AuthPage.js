import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';

// PUBLIC_INTERFACE
function AuthPage({ onAuthSuccess }) {
  const [currentView, setCurrentView] = useState('login');

  // PUBLIC_INTERFACE
  const handleAuthSuccess = (response) => {
    console.log('Authentication successful:', response.user);
    
    if (onAuthSuccess) {
      onAuthSuccess(response);
    }
  };

  // PUBLIC_INTERFACE
  const switchToSignup = () => {
    setCurrentView('signup');
  };

  // PUBLIC_INTERFACE
  const switchToLogin = () => {
    setCurrentView('login');
  };

  return (
    <>
      {currentView === 'login' ? (
        <Login
          onSuccess={handleAuthSuccess}
          onSwitchToSignup={switchToSignup}
        />
      ) : (
        <Signup
          onSuccess={handleAuthSuccess}
          onSwitchToLogin={switchToLogin}
        />
      )}
    </>
  );
}

export default AuthPage;
