import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE } from '../config';
import EventCard from '../components/EventCard';

export default function SearchHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchHistory();
  }, [user, navigate]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/user/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Reverse to show most recent first
      setHistory([...res.data].reverse());
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>Error: {error}</div>;
  if (history.length === 0) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '50px' }}>No search history yet. Go to Home and search for events.</div>;

  return (
    <div style={{ background: '#000', minHeight: '100vh', padding: '40px 24px' }}>
      <h1 style={{ color: '#fff', marginBottom: '32px' }}>My Search History</h1>
      {history.map((entry, idx) => (
        <div key={idx} style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <h2 style={{ color: '#F8CB2E', margin: 0 }}>{entry.city}</h2>
            {entry.query && <span style={{ color: '#aaa', fontSize: '0.9rem' }}>🔍 {entry.query}</span>}
            <span style={{ color: '#666', fontSize: '0.75rem' }}>{new Date(entry.timestamp).toLocaleString()}</span>
          </div>
          <div style={{
            display: 'flex',
            overflowX: 'auto',
            gap: '16px',
            paddingBottom: '12px',
            scrollbarWidth: 'thin'
          }}>
            {(entry.results || []).map((event, i) => (
              <div key={i} style={{ minWidth: '240px', maxWidth: '240px' }}>
                <EventCard
                  title={event.title}
                  subtitle={event.venue}
                  date={event.date}
                  location={event.address}
                  description={event.description}
                  thumbnail={event.thumbnail}
                  badge="History"
                  actionLabel="View"
                  onAction={() => window.open(event.link, '_blank')}
                  index={i}
                  compact={true}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}