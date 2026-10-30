import React, { useState, useEffect } from 'react';
import DashboardLayout from './components/DashboardLayout.jsx';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if token exists in localStorage on initial load
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  return (
    <div>
      {isAuthenticated ? (
        <DashboardLayout onLogout={handleLogout} />
      ) : (
        <div style={styles.loginScreen}>
          <h2>NicheLink - Login / Register</h2>
          <p>Please login to access your dashboard.</p>
          <button 
            style={styles.loginButton} 
            onClick={() => {
              localStorage.setItem('token', 'sample-token-123');
              setIsAuthenticated(true);
            }}
          >
            Simulate Login (Click to Test Dashboard)
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  loginScreen: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    fontFamily: 'Inter, sans-serif',
  },
  loginButton: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  }
};

export default App;