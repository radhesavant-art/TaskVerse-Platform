import React, { useState } from 'react';
import Auth from './components/Auth';
import DashboardLayout from './components/DashboardLayout';

function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div>
      {!user ? (
        <Auth onLoginSuccess={(userData) => setUser(userData)} />
      ) : (
        <DashboardLayout user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;