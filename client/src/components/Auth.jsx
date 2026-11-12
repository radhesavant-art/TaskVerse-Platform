
import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://taskverse-platform.onrender.com';

const Auth = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Signup password match check
    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    const endpoint = isLogin
      ? `${API_URL}/api/auth/login`
      : `${API_URL}/api/auth/register`;
    const payload = isLogin ? { email, password } : { name, email, password };

    console.log("Hitting endpoint:", endpoint);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      if (isLogin) {
        onLoginSuccess(data.user);
      } else {
        alert('Registration successful! Please login now.');
        setIsLogin(true);
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <span style={styles.brandText}>TaskVerse</span>
        <h2 style={styles.title}>
          {isLogin ? 'Welcome Back to TaskVerse' : 'Create an Account'}
        </h2>
        <p style={styles.subtitle}>
          {isLogin ? 'Login to access your workspace' : 'Sign up to get started'}
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
              required
            />
          )}

          <button type="submit" style={styles.button}>
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <p style={styles.switchText}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <span style={styles.link} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#0c051d',
    fontFamily: 'Inter, sans-serif'
  },
  card: {
    backgroundColor: '#190a38',
    padding: '40px 35px',
    borderRadius: '24px',
    boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
    width: '100%',
    maxWidth: '430px',
    border: '1px solid #2e155c',
    boxSizing: 'border-box'
  },
  brandText: {
    color: '#ff9800',
    fontWeight: '800',
    fontSize: '18px',
    display: 'block',
    marginBottom: '8px',
    letterSpacing: '0.5px'
  },
  title: {
    margin: '0 0 6px 0',
    fontSize: '28px',
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: '1.2'
  },
  subtitle: {
    margin: '0 0 25px 0',
    fontSize: '14px',
    color: '#a78bfa'
  },
  error: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    color: '#f87171',
    border: '1px solid #ef4444',
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '13px',
    marginBottom: '18px',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1px solid #3b1c73',
    backgroundColor: '#100629',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(90deg, #ff7e40 0%, #ff3b81 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '8px',
    boxShadow: '0 6px 20px rgba(255, 59, 129, 0.35)'
  },
  switchText: {
    textAlign: 'center',
    marginTop: '22px',
    fontSize: '14px',
    color: '#a78bfa',
    marginBottom: 0
  },
  link: {
    color: '#ff9800',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};

export default Auth;