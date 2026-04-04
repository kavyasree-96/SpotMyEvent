import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '20px', background: '#111', borderRadius: '16px' }}>
      <h2 style={{ color: '#fff', marginBottom: '24px' }}>Register</h2>
      {error && <div style={{ color: '#f87171', marginBottom: '16px' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #333', background: '#1a1a1a', color: '#fff' }}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #333', background: '#1a1a1a', color: '#fff' }}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #333', background: '#1a1a1a', color: '#fff' }}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{ width: '100%', padding: '12px', marginBottom: '24px', borderRadius: '8px', border: '1px solid #333', background: '#1a1a1a', color: '#fff' }}
          required
        />
        <button type="submit" style={{ width: '100%', padding: '12px', background: '#F8CB2E', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          Register
        </button>
      </form>
      <p style={{ color: '#aaa', marginTop: '16px', textAlign: 'center' }}>
        Already have an account? <Link to="/login" style={{ color: '#F8CB2E' }}>Login</Link>
      </p>
    </div>
  );
}