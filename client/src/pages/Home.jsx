import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CityAutocomplete from '../components/CityAutocomplete';
import EventCard from '../components/EventCard';
import axios from 'axios';
import { API_BASE } from '../config';

export default function Home() {
  const [cityName, setCityName] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const handlePlaceSelect = (place) => {
    setCityName(place.city);
    if (place.city) searchEvents(place.city, '');
  };

  const searchEvents = async (city, query) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/events/search`, {
        params: { city, query },
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(res.data.results || []);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch events.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!cityName) {
      alert('Select a city first');
      return;
    }
    searchEvents(cityName, searchQuery);
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh', paddingBottom: '60px' }}>
      <section style={{ padding: '60px 24px 40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, color: '#fff' }}>Discover Events Near You</h1>
        <p style={{ color: '#aaa', marginBottom: '32px' }}>Search by city – get trending events, save your history, and explore.</p>
        <div style={{ maxWidth: '600px', margin: '0 auto 20px' }}>
          <CityAutocomplete onPlaceSelect={handlePlaceSelect} />
        </div>
        <form onSubmit={handleFormSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="e.g., music, tech, food (optional)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, padding: '12px 18px', borderRadius: '40px', border: '1px solid #333', background: '#111', color: '#fff' }}
            />
            <button type="submit" style={{ background: '#F8CB2E', border: 'none', padding: '0 28px', borderRadius: '40px', fontWeight: 'bold', cursor: 'pointer' }}>
              Search
            </button>
          </div>
        </form>
      </section>

      {loading && <p style={{ textAlign: 'center', color: '#ccc' }}>Loading events...</p>}
      {!loading && events.length > 0 && (
        <section style={{ padding: '0 24px' }}>
          <h2 style={{ color: '#fff', marginBottom: '24px' }}>Events in {cityName}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {events.map((event, idx) => (
              <EventCard
                key={idx}
                title={event.title}
                subtitle={event.venue}
                date={event.date}
                location={event.address}
                description={event.description}
                thumbnail={event.thumbnail}
                badge="Event"
                actionLabel="Details"
                onAction={() => window.open(event.link, '_blank')}
                index={idx}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}