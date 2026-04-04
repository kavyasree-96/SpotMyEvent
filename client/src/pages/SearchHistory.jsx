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

  // Robust date parsing: compares year/month/day numerically (no timezone issues)
  function getEventStatus(dateString) {
    if (!dateString) return { badge: 'History', isExpired: false };

    let year, month, day;

    // 1. Try native Date parsing (handles ISO, "Month Day, Year", "Day Month Year")
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
      year = d.getFullYear();
      month = d.getMonth();
      day = d.getDate();
    } else {
      // 2. Manual parsing for formats that Date() may misinterpret
      const monthMap = {
        january:0, february:1, march:2, april:3, may:4, june:5,
        july:6, august:7, september:8, october:9, november:10, december:11,
        jan:0, feb:1, mar:2, apr:3, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11
      };

      // Try "Month Day, Year" (e.g., "April 28, 2026" or "Jul 16, 2026")
      let match = dateString.match(/([A-Za-z]+)\s+(\d+),\s+(\d{4})/i);
      if (match) {
        const monthName = match[1].toLowerCase();
        month = monthMap[monthName];
        day = parseInt(match[2]);
        year = parseInt(match[3]);
      } else {
        // Try "Day Month Year" (e.g., "28 April 2026" or "16 July 2026")
        match = dateString.match(/(\d+)\s+([A-Za-z]+)\s+(\d{4})/i);
        if (match) {
          day = parseInt(match[1]);
          const monthName = match[2].toLowerCase();
          month = monthMap[monthName];
          year = parseInt(match[3]);
        }
      }
    }

    if (year === undefined || month === undefined || day === undefined) {
      console.warn('Could not parse date:', dateString);
      return { badge: 'History', isExpired: false };
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    let isExpired = false;
    if (year < currentYear) isExpired = true;
    else if (year === currentYear && month < currentMonth) isExpired = true;
    else if (year === currentYear && month === currentMonth && day < currentDay) isExpired = true;

    const badge = isExpired ? 'Expired' : 'Upcoming';
    return { badge, isExpired };
  }

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
            {(entry.results || []).map((event, i) => {
              const { badge: statusBadge, isExpired } = getEventStatus(event.date);
              return (
                <div key={i} style={{ minWidth: '240px', maxWidth: '240px' }}>
                  <EventCard
                    title={event.title}
                    subtitle={event.venue}
                    date={event.date}
                    location={event.address}
                    description={event.description}
                    thumbnail={event.thumbnail}
                    badge={statusBadge}
                    actionLabel="View"
                    onAction={() => window.open(event.link, '_blank')}
                    isExpired={isExpired}
                    index={i}
                    compact={true}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}