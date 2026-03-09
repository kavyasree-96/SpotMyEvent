const express = require('express');
const cors    = require('cors');
const app     = express();
const PORT    = 5000;

const SERP_API_KEY = process.env.SERP_API_KEY || 'YOUR_SERPAPI_KEY_HERE';
const GEOAPIFY_KEY = process.env.GEOAPIFY_KEY || 'a2f49a32cf0d495a9f009259882f0b29';

app.use(cors());
app.use(express.json());

/* ── Static events ── */
const events = [
  { id:1, title:"Tech Meetup",   lat:12.9716, lng:77.5946, category:"Tech"  },
  { id:2, title:"Music Concert", lat:12.9352, lng:77.6245, category:"Music" },
  { id:3, title:"Art Gallery",   lat:12.9611, lng:77.6387, category:"Art"   },
];

app.get('/api/events', (req, res) => res.json(events));

app.post('/api/events', (req, res) => {
  const { title, lat, lng, category } = req.body;
  if (!title || lat === undefined || lng === undefined || !category) {
    res.status(400).json({ error: 'Missing required fields' }); return;
  }
  const parsedLat = Number(lat), parsedLng = Number(lng);
  if (isNaN(parsedLat) || isNaN(parsedLng)) {
    res.status(400).json({ error: 'lat and lng must be numbers' }); return;
  }
  const newId    = events.length ? Math.max(...events.map(e => e.id)) + 1 : 1;
  const newEvent = { id: newId, title, lat: parsedLat, lng: parsedLng, category };
  events.push(newEvent);
  res.status(201).json(newEvent);
});

/* ── Autocomplete ── */
app.get('/api/autocomplete', async (req, res) => {
  const { text } = req.query;
  if (!text || text.trim().length < 2) return res.json({ suggestions: [] });
  try {
    const url  = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&limit=6&apiKey=${GEOAPIFY_KEY}`;
    const r    = await fetch(url);
    const data = await r.json();
    const suggestions = (data.features || []).map(f => ({
      label: f.properties.formatted,
      lat:   f.geometry.coordinates[1],
      lng:   f.geometry.coordinates[0],
    }));
    res.json({ suggestions });
  } catch (err) {
    console.error('Autocomplete error:', err);
    res.json({ suggestions: [] });
  }
});

/* ── Geocode helper ── */
async function geocodeAddress(address) {
  try {
    const url  = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&limit=1&apiKey=${GEOAPIFY_KEY}`;
    const r    = await fetch(url);
    const data = await r.json();
    if (data.features?.length > 0) {
      const [lng, lat] = data.features[0].geometry.coordinates;
      return { lat, lng };
    }
  } catch (_) {}
  return null;
}

/* ── SerpAPI events ── */
app.get('/api/search-events', async (req, res) => {
  const { location, query } = req.query;
  if (!location) return res.status(400).json({ error: 'location param required' });

  // Extract just the city from a full address like "Shivajinagar, Bengaluru, Karnataka, India"
  // SerpAPI works best with short city names, not full formatted addresses
  const parts = location.split(',').map(p => p.trim());
  const city  = parts.length >= 2 ? parts[1] : parts[0]; // e.g. "Bengaluru"

  const q = query
    ? `${query} in ${city}`
    : `Things to do in ${city}`;

  const url = new URL('https://serpapi.com/search');
  url.searchParams.set('engine',  'google_events');
  url.searchParams.set('q',        q);
  url.searchParams.set('hl',      'en');
  url.searchParams.set('gl',      'us'); // 'us' gives most results globally
  url.searchParams.set('api_key',  SERP_API_KEY);

  console.log('SerpAPI query:', q);

  try {
    const response = await fetch(url.toString());
    const data     = await response.json();

    console.log('SerpAPI response keys:', Object.keys(data));
    console.log('events_results count:', data.events_results?.length ?? 0);

    if (data.error) {
      console.error('SerpAPI error:', data.error);
      return res.status(500).json({ error: data.error });
    }

    const raw = (data.events_results || []).slice(0, 10).map(ev => ({
      title:       ev.title,
      date:        ev.date?.start_date || ev.date?.when || null,
      address:     Array.isArray(ev.address) ? ev.address.join(', ') : (ev.address || null),
      link:        ev.link        || null,
      thumbnail:   ev.thumbnail   || null,
      description: ev.description || null,
      venue:       ev.venue?.name || null,
    }));

    const results = await Promise.all(
      raw.map(async (ev) => {
        if (!ev.address) return { ...ev, lat: null, lng: null };
        const coords = await geocodeAddress(ev.address);
        return { ...ev, lat: coords?.lat ?? null, lng: coords?.lng ?? null };
      })
    );

    res.json({ location, query: q, results });
  } catch (err) {
    console.error('SerpAPI fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.listen(PORT, () => console.log(`✅ Backend running at http://localhost:${PORT}`));