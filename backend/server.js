require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const app     = express();
const PORT    = 5000;

const SERP_API_KEY = process.env.SERP_API_KEY || 'c50dff8cfaeb084b3ccb5aa8669906295e9cce070acf37afa4fa62e573d9a40c';
const GEOAPIFY_KEY = process.env.GEOAPIFY_KEY || 'a2f49a32cf0d495a9f009259882f0b29';

const DEFAULT_RADIUS = 20;
const MAX_RADIUS     = 50;

app.use(cors());
app.use(express.json());

/* ── Haversine distance (km) ── */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R    = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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

/* ── Search events with radius filtering ── */
// GET /api/search-events?location=Bangalore&radius=20&query=music&lat=12.97&lng=77.59
app.get('/api/search-events', async (req, res) => {
  const { location, query } = req.query;
  if (!location) return res.status(400).json({ error: 'location param required' });

  const radius = Math.min(parseInt(req.query.radius) || DEFAULT_RADIUS, MAX_RADIUS);

  // Use passed lat/lng from frontend if available (more accurate than re-geocoding)
  let centre;
  const passedLat = parseFloat(req.query.lat);
  const passedLng = parseFloat(req.query.lng);
  if (!isNaN(passedLat) && !isNaN(passedLng)) {
    centre = { lat: passedLat, lng: passedLng };
    console.log(`── using passed coords: ${centre.lat}, ${centre.lng}`);
  } else {
    centre = await geocodeAddress(location);
    if (!centre) return res.status(400).json({ error: 'Could not geocode location' });
  }

  // Extract best city name for SerpAPI
  // Handle formats like "Shivajinagar, Bengaluru, Karnataka, India" → "Bengaluru"
  // or "Bengaluru" → "Bengaluru"
  const parts = location.split(',').map(p => p.trim()).filter(Boolean);
  let city;
  if (parts.length === 1) {
    city = parts[0];
  } else if (parts.length === 2) {
    city = parts[0]; // "Bengaluru, India" → "Bengaluru"
  } else {
    // "Shivajinagar, Bengaluru, Karnataka, India" → take index 1 (city level)
    city = parts[1];
  }
  // Strip pin codes and extra numbers
  city = city.replace(/\d+/g, '').trim();

  const q = query ? `${query} in ${city}` : `Things to do in ${city}`;

  const url = new URL('https://serpapi.com/search');
  url.searchParams.set('engine',  'google_events');
  url.searchParams.set('q',        q);
  url.searchParams.set('hl',      'en');
  url.searchParams.set('gl',      'us');
  url.searchParams.set('api_key',  SERP_API_KEY);

  console.log(`\n── query: "${q}" | radius: ${radius}km | centre: ${centre.lat},${centre.lng}`);

  try {
    const response = await fetch(url.toString());
    const data     = await response.json();
    if (data.error) return res.status(500).json({ error: data.error });

    console.log(`── SerpAPI returned ${data.events_results?.length ?? 0} events`);

    const raw = (data.events_results || []).slice(0, 15).map(ev => ({
      title:       ev.title,
      date:        ev.date?.start_date || ev.date?.when || null,
      address:     Array.isArray(ev.address) ? ev.address.join(', ') : (ev.address || null),
      geocodeStr:  [ev.venue?.name, ...(Array.isArray(ev.address) ? ev.address : [])].filter(Boolean).join(', '),
      link:        ev.link        || null,
      thumbnail:   ev.thumbnail   || null,
      description: ev.description || null,
      venue:       ev.venue?.name || null,
    }));

    // Geocode each event and calculate distance from centre
    const withCoords = await Promise.all(
      raw.map(async (ev) => {
        const { geocodeStr, ...rest } = ev;
        if (!geocodeStr) return { ...rest, lat: null, lng: null, distance: null };
        const coords = await geocodeAddress(geocodeStr);
        if (!coords)    return { ...rest, lat: null, lng: null, distance: null };
        const distance = haversineDistance(centre.lat, centre.lng, coords.lat, coords.lng);
        return { ...rest, lat: coords.lat, lng: coords.lng, distance: +distance.toFixed(2) };
      })
    );

    // Filter by radius, sort nearest first, unknown distance goes to end
    const results = withCoords
      .filter(ev => ev.distance === null || ev.distance <= radius)
      .sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });

    // Deduplicate
    const seen    = new Set();
    const deduped = results.filter(ev => {
      const k = `${ev.title}__${ev.venue}`;
      if (seen.has(k)) return false;
      seen.add(k); return true;
    });

    console.log(`── after radius filter (${radius}km): ${deduped.length} events`);

    res.json({ location, centre, radius, query: q, total: deduped.length, results: deduped });
  } catch (err) {
    console.error('SerpAPI fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.listen(PORT, () => console.log(`✅ Backend running at http://localhost:${PORT}`));