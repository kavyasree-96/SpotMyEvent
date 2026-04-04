const express = require('express');
const fetch = require('node-fetch');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// GET /api/events/search?city=Bangalore&query=music
router.get('/search', protect, async (req, res) => {
  const { city, query = '' } = req.query;
  if (!city) return res.status(400).json({ error: 'City is required' });

  const searchQuery = query ? `${query} events in ${city}` : `events in ${city}`;
  const apiKey = process.env.SERP_API_KEY;

  if (!apiKey) {
    return res.json(getMockEvents(city, query));
  }

  const url = `https://serpapi.com/search.json?engine=google_events&q=${encodeURIComponent(searchQuery)}&hl=en&gl=in&api_key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) throw new Error(data.error);

    const events = (data.events_results || []).slice(0, 12).map(ev => ({
      title: ev.title,
      link: ev.link,
      source: ev.venue?.name || '',
      date: ev.date?.start_date || ev.date?.when || 'Date TBA',
      thumbnail: ev.thumbnail || null,
      snippet: ev.description || '',
      address: Array.isArray(ev.address) ? ev.address.join(', ') : (ev.address || ''),
      coordinates: ev.place_id ? null : null, // we could enrich with Geoapify later
    }));

    // Optionally save search history to DB (handled by frontend after receiving)
    res.json({ results: events });
  } catch (err) {
    console.error(err);
    res.json({ results: getMockEvents(city, query) });
  }
});

function getMockEvents(city, query) {
  return [
    { title: `${city} Music Fest`, source: 'City Arena', date: '2025-06-20', snippet: `Great ${query} event`, address: `${city} Center`, link: '#', thumbnail: null },
    { title: `${city} Food Carnival`, source: 'Expo Grounds', date: '2025-06-25', snippet: 'Tasty bites', address: `${city} Downtown`, link: '#', thumbnail: null },
  ];
}

module.exports = router;