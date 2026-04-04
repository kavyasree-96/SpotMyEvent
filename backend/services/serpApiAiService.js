const fetch = require('node-fetch');

const SERP_API_KEY = process.env.SERP_API_KEY;

// ── AI RECOMMENDATIONS using Google Events API with user interest as query ──
async function fetchAiRecommendations(interest, city = null) {
  if (!SERP_API_KEY) {
    console.warn('SERP_API_KEY not set — returning mock recommendations');
    return getMockRecommendations(interest);
  }

  // First try Google Events engine with interest as query
  const eventsUrl = new URL('https://serpapi.com/search');
  eventsUrl.searchParams.set('engine',  'google_events');
  eventsUrl.searchParams.set('q',       `${interest} events in ${city}`);
  eventsUrl.searchParams.set('hl',      'en');
  eventsUrl.searchParams.set('gl',      'in');
  eventsUrl.searchParams.set('api_key', SERP_API_KEY);

  try {
    const response = await fetch(eventsUrl.toString());
    const data     = await response.json();

    if (data.error) throw new Error(data.error);

    const events = (data.events_results || []).slice(0, 6).map(ev => ({
      title:       ev.title       || 'Untitled Event',
      description: ev.description || `A great ${interest} event happening in ${city}.`,
      location:    Array.isArray(ev.address)
                     ? ev.address.join(', ')
                     : (ev.address || city),
      date:        ev.date?.start_date || ev.date?.when || 'Date TBA',
      category:    interest,
      link:        ev.link      || null,
      thumbnail:   ev.thumbnail || null,
      venue:       ev.venue?.name || '',
    }));

    return events.length > 0 ? events : getMockRecommendations(interest);
  } catch (err) {
    console.error('SerpAPI AI Recommendations error:', err.message);
    return getMockRecommendations(interest);
  }
}

function getMockRecommendations(interest) {
  return [
    {
      title:       `${interest} Night at Indiranagar`,
      description: `A curated evening experience tailored for people who love ${interest}.`,
      location:    'Indiranagar Social, Bangalore',
      date:        'Jun 18, 2025',
      category:    interest,
      link:        null,
      thumbnail:   null,
      venue:       'Indiranagar Social',
    },
    {
      title:       'Sunset Rooftop Gathering',
      description: `Perfect for those who enjoy ${interest}. Rooftop meetup with music and food.`,
      location:    'The Rooftop, MG Road, Bangalore',
      date:        'Jun 21, 2025',
      category:    interest,
      link:        null,
      thumbnail:   null,
      venue:       'The Rooftop',
    },
    {
      title:       'Weekend Workshop — Explore Your Passion',
      description: `Hands-on workshop inspired by your interest in ${interest}.`,
      location:    'Jaaga Creative Space, Shivajinagar',
      date:        'Jun 25, 2025',
      category:    interest,
      link:        null,
      thumbnail:   null,
      venue:       'Jaaga Creative Space',
    },
    {
      title:       'Cultural Evening at Chowdiah Hall',
      description: 'Rich cultural programme with classical and contemporary performances.',
      location:    'Chowdiah Memorial Hall, Malleshwaram',
      date:        'Jul 1, 2025',
      category:    interest,
      link:        null,
      thumbnail:   null,
      venue:       'Chowdiah Memorial Hall',
    },
    {
      title:       'Open Mic & Community Night',
      description: `Share your love for ${interest} at an open mic welcoming all expression.`,
      location:    'Toit Brewpub, Koramangala',
      date:        'Jul 5, 2025',
      category:    interest,
      link:        null,
      thumbnail:   null,
      venue:       'Toit Brewpub',
    },
  ];
}

module.exports = { fetchAiRecommendations };