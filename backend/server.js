require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { protect } = require('./middleware/authMiddleware');
const fetch = require('node-fetch');
const User = require('./models/User');

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// ---------- Test Route ----------
app.get('/api/test', (req, res) => res.json({ message: 'Backend is alive' }));

// ---------- Public Routes ----------
app.use('/api/auth', require('./routes/auth'));

// ---------- Protected Routes ----------
app.use('/api/search-history', protect, require('./routes/searchHistory'));
app.use('/api/trending-events', protect, require('./routes/trendingEvents'));
app.use('/api/ai-recommendations', protect, require('./routes/aiRecommendations'));

// ---------- Helper: Geocode ----------
async function geocodeAddress(address) {
  if (!process.env.GEOAPIFY_KEY) return null;
  try {
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&limit=1&apiKey=${process.env.GEOAPIFY_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.features?.length) {
      const [lng, lat] = data.features[0].geometry.coordinates;
      return { lat, lng };
    }
  } catch (err) {
    console.error('Geocoding error:', err.message);
  }
  return null;
}

// ---------- Helper: Save Search History ----------
async function saveSearchHistory(userId, city, query, results) {
  console.log(`📝 Saving history for user ${userId}, city=${city}, results=${results.length}`);
  try {
    const update = {
      $push: {
        searchHistory: {
          $each: [{ city, query, timestamp: new Date(), results: results.slice(0, 10) }],
          $slice: -20,
        },
      },
    };
    const updated = await User.findByIdAndUpdate(userId, update, { new: true });
    console.log(`✅ History saved. Now ${updated.searchHistory?.length || 0} entries.`);
    return true;
  } catch (err) {
    console.error('❌ Save error:', err);
    return false;
  }
}

// ---------- Mock events (fallback) ----------
function getMockEvents(city) {
  return [
    {
      title: `${city} Music Festival`,
      date: '2025-07-15',
      address: `${city} Downtown`,
      link: '#',
      thumbnail: null,
      description: `A vibrant music festival in ${city}.`,
      venue: 'City Arena',
      lat: null,
      lng: null,
    },
  ];
}

// ---------- Event Search (with geocoding) ----------
const SERP_API_KEY = process.env.SERP_API_KEY;

app.get('/api/events/search', protect, async (req, res) => {
  const { city, query = '' } = req.query;
  console.log(`🔍 Search: user=${req.user._id}, city=${city}, query=${query}`);

  if (!city) return res.status(400).json({ error: 'City required' });

  let events = [];
  let error = null;

  if (!SERP_API_KEY) {
    events = getMockEvents(city);
  } else {
    const searchQuery = query ? `${query} events in ${city}` : `events in ${city}`;
    const url = new URL('https://serpapi.com/search');
    url.searchParams.set('engine', 'google_events');
    url.searchParams.set('q', searchQuery);
    url.searchParams.set('hl', 'en');
    url.searchParams.set('gl', 'in');
    url.searchParams.set('api_key', SERP_API_KEY);

    try {
      const response = await fetch(url.toString());
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Map raw events
      const rawEvents = (data.events_results || []).slice(0, 12).map(ev => ({
        title: ev.title || 'Untitled',
        date: ev.date?.start_date || ev.date?.when || 'TBA',
        address: Array.isArray(ev.address) ? ev.address.join(', ') : (ev.address || ''),
        link: ev.link || '#',
        thumbnail: ev.thumbnail || null,
        description: ev.description || '',
        venue: ev.venue?.name || '',
      }));

      // Geocode each event to get lat/lng
      events = await Promise.all(rawEvents.map(async (ev) => {
        if (ev.address) {
          const coords = await geocodeAddress(ev.address);
          return { ...ev, lat: coords?.lat || null, lng: coords?.lng || null };
        }
        return { ...ev, lat: null, lng: null };
      }));
    } catch (err) {
      console.error('SerpAPI error:', err.message);
      events = getMockEvents(city);
      error = 'Using mock data';
    }
  }

  // Save history (with coordinates)
  await saveSearchHistory(req.user._id, city, query, events);

  res.json({ results: events, error });
});

// ---------- Get user history ----------
app.get('/api/user/history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('searchHistory');
    res.json(user.searchHistory || []);
  } catch (err) {
    console.error('History fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});