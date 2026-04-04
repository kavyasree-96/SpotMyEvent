const fetch = require('node-fetch');

const SERP_API_KEY = process.env.SERP_API_KEY;

// ── TRENDING EVENTS using Google Events API ──
async function fetchTrendingEvents(city = null) {
  if (!SERP_API_KEY) {
    console.warn('SERP_API_KEY not set — returning mock data');
    return getMockTrendingEvents();
  }

  const url = new URL('https://serpapi.com/search');
  url.searchParams.set('engine',  'google_events');
  url.searchParams.set('q',       `events OR concerts OR festivals OR exhibitions in ${city}`);
  url.searchParams.set('hl',      'en');
  url.searchParams.set('gl',      'in');
  url.searchParams.set('api_key', SERP_API_KEY);

  try {
    const response = await fetch(url.toString());
    const data     = await response.json();

    if (data.error) throw new Error(data.error);

    const events = (data.events_results || []).slice(0, 12).map(ev => ({
      title:     ev.title       || 'Untitled Event',
      link:      ev.link        || '#',
      source:    ev.venue?.name || 'Unknown Venue',
      date:      ev.date?.start_date || ev.date?.when || 'Date TBA',
      thumbnail: ev.thumbnail   || null,
      snippet:   ev.description || 'No description available.',
      address:   Array.isArray(ev.address)
                   ? ev.address.join(', ')
                   : (ev.address || ''),
    }));

    return events.length > 0 ? events : getMockTrendingEvents();
  } catch (err) {
    console.error('SerpAPI Events error:', err.message);
    return getMockTrendingEvents();
  }
}

function getMockTrendingEvents() {
  return [
    {
      title:     'Bangalore Music Festival 2025',
      link:      '#',
      source:    'Palace Grounds',
      date:      'Jun 15, 2025',
      thumbnail: null,
      snippet:   'A grand celebration of music featuring artists from across India.',
      address:   'Palace Grounds, Bangalore',
    },
    {
      title:     'Tech Summit Bangalore',
      link:      '#',
      source:    'Nimhans Convention Centre',
      date:      'Jun 20, 2025',
      thumbnail: null,
      snippet:   'Annual technology conference with talks from industry leaders.',
      address:   'Nimhans Convention Centre, Bangalore',
    },
    {
      title:     'Cubbon Park Art Exhibition',
      link:      '#',
      source:    'Cubbon Park',
      date:      'Jun 22, 2025',
      thumbnail: null,
      snippet:   'Open-air art exhibition featuring contemporary local artists.',
      address:   'Cubbon Park, Bangalore',
    },
    {
      title:     'Comedy Night — Koramangala',
      link:      '#',
      source:    'The Comedy Factory',
      date:      'Jun 28, 2025',
      thumbnail: null,
      snippet:   'Stand-up comedy show with performances by top city comedians.',
      address:   'The Comedy Factory, Koramangala',
    },
  ];
}

module.exports = { fetchTrendingEvents };