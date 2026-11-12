import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const API_URL = 'https://taskverse-platform.onrender.com';
const socket = io(API_URL);

const DashboardLayout = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([
    { _id: '1', title: 'Complete Frontend Integration', description: 'Connect React dashboard with Vite and backend APIs.', status: 'In Progress', priority: 'High' },
    { _id: '2', title: 'Setup MongoDB Models', description: 'Create Mongoose schemas for users, communities, and tasks.', status: 'Completed', priority: 'Medium' }
  ]);
  
  const [tribes, setTribes] = useState([]);
  const [newTribeName, setNewTribeName] = useState('');
  const [newTribeDesc, setNewTribeDesc] = useState('');
  const [newTribeCategory, setNewTribeCategory] = useState('');

  // Chat States
  const [room, setRoom] = useState('General Tribe');
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageList, setMessageList] = useState([]);

  // Profile Settings States
  const [profileName, setProfileName] = useState(user ? user.name : '');
  const [profileEmail, setProfileEmail] = useState(user ? user.email : '');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (activeTab === 'communities') {
      fetchTribes();
    }
  }, [activeTab]);

  useEffect(() => {
    socket.emit('join_room', room);

    const handleReceiveMessage = (data) => {
      // Agent/Author ka message duplicate na ho isliye condition
      if (data.author !== (user ? user.name : 'savant jha!')) {
        setMessageList((list) => [...list, data]);
      }
    };

    socket.off('receive_message');
    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [room, user]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (currentMessage.trim() !== '') {
      const messageData = {
        room: room,
        author: user ? user.name : 'savant jha!',
        message: currentMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // 1. Server par emit karo
      await socket.emit('send_message', messageData);

      // 2. Apni khud ki screen par turant message dikhane ke liye
      setMessageList((list) => [...list, messageData]);

      // 3. Input box khali kar do
      setCurrentMessage('');
    }
  };

  const fetchTribes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tribes`);
      const data = await res.json();
      setTribes(data);
    } catch (err) {
      console.error('Error fetching tribes:', err);
    }
  };

  const handleCreateTribe = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/tribes/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTribeName, description: newTribeDesc, category: newTribeCategory })
      });
      if (res.ok) {
        setNewTribeName('');
        setNewTribeDesc('');
        setNewTribeCategory('');
        fetchTribes();
      }
    } catch (err) {
      console.error('Error creating tribe:', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const userId = user ? (user._id || user.id) : '';

    if (!userId) {
      alert('User ID missing! Please login again.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/update/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName, email: profileEmail })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage('Profile updated successfully!');

        const updatedUserData = {
          ...user,
          name: data.user.name,
          email: data.user.email
        };

        localStorage.setItem('user', JSON.stringify(updatedUserData));

        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert(data.error || 'Update failed');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Server error while updating profile');
    }
  };
  
  const handleStatusToggle = (taskId) => {
    setTasks(tasks.map(task => {
      if (task._id === taskId) {
        const nextStatus = task.status === 'Pending' ? 'In Progress' : task.status === 'In Progress' ? 'Completed' : 'Pending';
        return { ...task, status: nextStatus };
      }
      return task;
    }));
  };

  return (
    <div style={styles.container}>
      {/* Left Sidebar */}
      <aside style={styles.sidebar}>
        <div>
          {/* Logo & Tagline */}
          <div style={styles.logoArea}>
            <h1 style={styles.logoText}>TaskVerse</h1>
            <span style={styles.tierBadge}>Work • Learn • Grow</span>
          </div>

          {/* Navigation Links */}
          <nav style={styles.navLinks}>
            <button 
              style={activeTab === 'tasks' ? { ...styles.navButton, ...styles.activeButton } : styles.navButton}
              onClick={() => setActiveTab('tasks')}
            >
              Task Board
            </button>
            <button 
              style={activeTab === 'communities' ? { ...styles.navButton, ...styles.activeButton } : styles.navButton}
              onClick={() => setActiveTab('communities')}
            >
              Communities
            </button>
            <button 
              style={activeTab === 'chat' ? { ...styles.navButton, ...styles.activeButton } : styles.navButton}
              onClick={() => setActiveTab('chat')}
            >
              Live Chat Room
            </button>
          </nav>
        </div>

        {/* Bottom Section: Account Settings & Logout */}
        <div style={styles.bottomNavArea}>
          <button 
            style={activeTab === 'settings' ? { ...styles.settingsButton, ...styles.activeSettings } : styles.settingsButton}
            onClick={() => setActiveTab('settings')}
          >
            Account Settings
          </button>
          <button style={styles.logoutButton} onClick={onLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={styles.mainContent}>
        <header style={styles.header}>
          <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
            Welcome back, <span style={{ color: '#facc15' }}>{user ? user.name : 'savant jha!'}</span>
          </h3>
          <span style={styles.userRole}>Role: Developer / Employee</span>
        </header>

        <div style={styles.contentBody}>
          {activeTab === 'tasks' && (
            <div>
              <h2 style={{ fontSize: '26px', fontWeight: 'bold', margin: '0 0 5px 0' }}>Assigned Tasks & Workbook</h2>
              <p style={{ color: '#a78bfa', marginBottom: '25px', fontSize: '15px' }}>Manage your daily assignments and update progress status.</p>
              
              <div style={styles.taskList}>
                {tasks.map(task => (
                  <div 
                    key={task._id} 
                    style={{ 
                      ...styles.taskCard, 
                      borderLeft: task.priority === 'High' ? '4px solid #ff4b72' : '4px solid #00f2fe'
                    }}
                  >
                    <div>
                      <h3 style={{ margin: '0 0 6px 0', color: '#ffffff', fontSize: '20px', fontWeight: 'bold' }}>{task.title}</h3>
                      <p style={{ margin: '0 0 12px 0', color: '#c4b5fd', fontSize: '14px' }}>{task.description}</p>
                      <span style={{ 
                        fontSize: '12px', 
                        padding: '4px 10px', 
                        borderRadius: '6px', 
                        backgroundColor: task.priority === 'High' ? '#ff4b72' : '#00e676',
                        color: '#fff',
                        fontWeight: 'bold'
                      }}>
                        {task.priority} Priority
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: 'bold',
                        color: task.status === 'Completed' ? '#00e676' : task.status === 'In Progress' ? '#facc15' : '#ff4b72'
                      }}>
                        {task.status}
                      </span>
                      <button 
                        style={styles.gradientButton}
                        onClick={() => handleStatusToggle(task._id)}
                      >
                        Change Status
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'communities' && (
            <div>
              <h2 style={{ fontSize: '26px', fontWeight: 'bold', margin: '0 0 5px 0' }}>Communities</h2>
              <p style={{ color: '#a78bfa', marginBottom: '25px', fontSize: '15px' }}>Explore remote worker communities or create your own tribe.</p>
              
              <form onSubmit={handleCreateTribe} style={styles.tribeForm}>
                <h4 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>Create New Community</h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input 
                    type="text" 
                    placeholder="Community Name" 
                    value={newTribeName} 
                    onChange={(e) => setNewTribeName(e.target.value)} 
                    style={styles.input} 
                    required 
                  />
                  <input 
                    type="text" 
                    placeholder="Category (e.g. FullStack)" 
                    value={newTribeCategory} 
                    onChange={(e) => setNewTribeCategory(e.target.value)} 
                    style={styles.input} 
                    required 
                  />
                </div>
                <textarea 
                  placeholder="Short Description" 
                  value={newTribeDesc} 
                  onChange={(e) => setNewTribeDesc(e.target.value)} 
                  style={{ ...styles.input, width: '100%', resize: 'vertical' }} 
                  required 
                />
                <button type="submit" style={{ ...styles.gradientButton, width: '160px' }}>Add Community</button>
              </form>

              <div style={styles.taskList}>
                {tribes.length === 0 ? (
                  <p style={{ color: '#a78bfa' }}>No communities found yet. Create one above!</p>
                ) : (
                  tribes.map(tribe => (
                    <div key={tribe._id} style={styles.taskCard}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', color: '#ffffff', fontSize: '18px' }}>{tribe.name}</h4>
                        <p style={{ margin: '0 0 10px 0', color: '#c4b5fd', fontSize: '14px' }}>{tribe.description}</p>
                        <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px', backgroundColor: '#7c3aed', color: '#fff' }}>
                          {tribe.category}
                        </span>
                      </div>
                      <span style={{ fontSize: '14px', color: '#00f2fe', fontWeight: 'bold' }}>
                        {tribe.membersCount} Members
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '75vh' }}>
              <h2 style={{ fontSize: '26px', fontWeight: 'bold', margin: '0 0 5px 0' }}>Live Chat Room ({room})</h2>
              <p style={{ color: '#a78bfa', marginBottom: '15px' }}>Chat in real-time with remote peers and developers.</p>
              
              <div style={styles.chatContainer}>
                <div style={styles.messageWindow}>
                  {messageList.length === 0 ? (
                    <p style={{ color: '#a78bfa', textAlign: 'center', marginTop: '50px' }}>No messages yet. Say hello to start the conversation!</p>
                  ) : (
                    messageList.map((msg, index) => (
                      <div key={index} style={{ marginBottom: '12px', textAlign: msg.author === (user ? user.name : 'savant jha!') ? 'right' : 'left' }}>
                        <div style={{ 
                          display: 'inline-block', 
                          padding: '10px 16px', 
                          borderRadius: '12px', 
                          backgroundColor: msg.author === (user ? user.name : 'savant jha!') ? '#ff4081' : '#2a155c', 
                          maxWidth: '70%', 
                          textAlign: 'left',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                        }}>
                          <small style={{ display: 'block', fontSize: '11px', color: '#f1f5f9', marginBottom: '3px', fontWeight: 'bold' }}>{msg.author}</small>
                          <span style={{ fontSize: '14px', color: '#fff' }}>{msg.message}</span>
                          <span style={{ display: 'block', fontSize: '10px', color: '#ddd', marginTop: '3px', textAlign: 'right' }}>{msg.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    style={{ ...styles.input, flex: 1 }}
                  />
                  <button type="submit" style={styles.gradientButton}>Send</button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 style={{ fontSize: '26px', fontWeight: 'bold', margin: '0 0 5px 0' }}>Account Settings</h2>
              <p style={{ color: '#a78bfa', marginBottom: '25px', fontSize: '15px' }}>Manage your profile preferences and workspace details.</p>
              
              <div style={{ ...styles.taskCard, flexDirection: 'column', alignItems: 'flex-start', gap: '18px', maxWidth: '600px' }}>
                <h4 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>Edit Profile</h4>
                {successMessage && <p style={{ color: '#00e676', fontSize: '14px', margin: 0 }}>{successMessage}</p>}
                
                <form onSubmit={handleUpdateProfile} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#c4b5fd', marginBottom: '6px' }}>Full Name</label>
                    <input 
                      type="text" 
                      value={profileName} 
                      onChange={(e) => setProfileName(e.target.value)} 
                      style={{ ...styles.input, width: '100%' }} 
                      required 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#c4b5fd', marginBottom: '6px' }}>Email Address</label>
                    <input 
                      type="email" 
                      value={profileEmail} 
                      onChange={(e) => setProfileEmail(e.target.value)} 
                      style={{ ...styles.input, width: '100%' }} 
                      required 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#c4b5fd', marginBottom: '6px' }}>Workspace Tier</label>
                    <input 
                      type="text" 
                      value={user ? user.tier : 'FreeMember'} 
                      disabled 
                      style={{ ...styles.input, width: '100%', backgroundColor: '#210d4f', cursor: 'not-allowed', color: '#8b5cf6' }} 
                    />
                  </div>
                  <button type="submit" style={{ ...styles.gradientButton, marginTop: '8px' }}>Save Changes</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Neon Purple / TaskVerse Theme Styles matching screenshot
const styles = {
  container: { display: 'flex', height: '100vh', backgroundColor: '#0b051d', color: '#ffffff', fontFamily: 'Inter, sans-serif' },
  sidebar: { width: '270px', backgroundColor: '#140933', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 18px', borderRight: '1px solid #281452' },
  logoArea: { marginBottom: '32px' },
  logoText: { fontSize: '28px', fontWeight: '800', color: '#ff4081', margin: '0 0 6px 0', letterSpacing: '0.5px' },
  tierBadge: { fontSize: '12px', backgroundColor: '#261254', color: '#e0e7ff', padding: '4px 10px', borderRadius: '12px', border: '1px solid #3c1e7a', display: 'inline-block' },
  navLinks: { display: 'flex', flexDirection: 'column', gap: '12px' },
  navButton: { padding: '14px 18px', backgroundColor: 'transparent', color: '#c4b5fd', border: 'none', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', fontSize: '16px', fontWeight: '600', transition: 'all 0.2s' },
  activeButton: { background: 'linear-[#ff5252]', backgroundColor: '#ff4081', color: '#ffffff', boxShadow: '0 4px 15px rgba(255, 64, 129, 0.4)' },
  bottomNavArea: { borderTop: '1px solid #281452', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' },
  settingsButton: { padding: '12px 16px', backgroundColor: '#210d4f', color: '#c4b5fd', border: '1px solid #3b1c78', borderRadius: '10px', textAlign: 'left', cursor: 'pointer', fontSize: '15px', fontWeight: '600' },
  activeSettings: { borderColor: '#ff4081', color: '#ffffff', backgroundColor: '#2e126b' },
  logoutButton: { width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#ff4081', border: '1px solid #ff4081', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' },
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' },
  header: { padding: '22px 35px', borderBottom: '1px solid #281452', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#140933' },
  userRole: { fontSize: '14px', padding: '6px 14px', borderRadius: '20px', border: '1px solid #8b5cf6', color: '#f472b6', backgroundColor: '#250f52', fontWeight: 'bold' },
  contentBody: { padding: '35px' },
  taskList: { display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '15px' },
  taskCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1a0c43', padding: '22px', borderRadius: '16px', border: '1px solid #2d1663', boxShadow: '0 8px 20px rgba(0,0,0,0.3)' },
  gradientButton: { padding: '10px 20px', background: 'linear-gradient(90deg, #a855f7 0%, #ec4899 100%)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)' },
  tribeForm: { backgroundColor: '#1a0c43', padding: '22px', borderRadius: '16px', border: '1px solid #2d1663', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '25px' },
  input: { padding: '12px', borderRadius: '10px', border: '1px solid #3d1c80', backgroundColor: '#0b051d', color: '#fff', fontSize: '14px', outline: 'none' },
  chatContainer: { display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: '#1a0c43', border: '1px solid #2d1663', borderRadius: '16px', padding: '22px' },
  messageWindow: { flex: 1, overflowY: 'auto', paddingRight: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }
};

export default DashboardLayout;