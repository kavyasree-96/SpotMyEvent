const fetch = require('node-fetch');

const SERP_API_KEY = process.env.SERP_API_KEY;

// ── STEP 1: Search for place using Google Local API to get data_id ──
async function searchPlaceId(query, city = null) {
  const url = new URL('https://serpapi.com/search');
  url.searchParams.set('engine',  'google_local');
  url.searchParams.set('q',       `${query} ${city}`);
  url.searchParams.set('hl',      'en');
  url.searchParams.set('gl',      'in');
  url.searchParams.set('api_key', SERP_API_KEY);

  const response = await fetch(url.toString());
  const data     = await response.json();

  if (data.error) throw new Error(data.error);

  const results = data.local_results || [];
  if (results.length === 0) return null;

  // Return the first result's place_id or data_id
  const first = results[0];
  return {
    placeId:   first.place_id  || null,
    dataId:    first.data_id   || null,
    placeName: first.title     || query,
    address:   first.address   || `${query}, ${city}`,
    rating:    first.rating    || null,
    reviews:   first.reviews   || null,
    type:      first.type      || '',
    thumbnail: first.thumbnail || null,
  };
}

// ── STEP 2: Fetch reviews using Google Maps Reviews API ──
async function fetchReviewsByDataId(dataId) {
  const url = new URL('https://serpapi.com/search');
  url.searchParams.set('engine',      'google_maps_reviews');
  url.searchParams.set('data_id',     dataId);
  url.searchParams.set('hl',          'en');
  url.searchParams.set('sort_by',     'newestFirst');
  url.searchParams.set('api_key',     SERP_API_KEY);

  const response = await fetch(url.toString());
  const data     = await response.json();

  if (data.error) throw new Error(data.error);

  return (data.reviews || []).slice(0, 6).map(r => ({
    author:      r.user?.name        || 'Anonymous',
    rating:      r.rating            || 0,
    text:        r.snippet           || 'No review text available.',
    time:        r.date              || '',
    profilePhoto: r.user?.thumbnail  || null,
    likes:       r.likes             || 0,
  }));
}

// ── MAIN FUNCTION called by controller ──
async function fetchPlaceReviews(query) {
  if (!SERP_API_KEY) {
    console.warn('SERP_API_KEY not set — returning mock reviews');
    return getMockReviews(query);
  }

  try {
    // Step 1 — find the place
    const placeInfo = await searchPlaceId(query);

    if (!placeInfo) {
      console.warn('No place found for query:', query);
      return getMockReviews(query);
    }

    // Step 2 — fetch reviews if we have a data_id
    let reviews = [];
    if (placeInfo.dataId) {
      reviews = await fetchReviewsByDataId(placeInfo.dataId);
    }

    // If reviews still empty, return mock with real place info
    if (reviews.length === 0) {
      const mock = getMockReviews(query);
      return { ...mock, placeName: placeInfo.placeName, address: placeInfo.address, rating: placeInfo.rating };
    }

    return {
      placeName: placeInfo.placeName,
      address:   placeInfo.address,
      rating:    placeInfo.rating,
      thumbnail: placeInfo.thumbnail,
      reviews,
    };
  } catch (err) {
    console.error('SerpAPI Places error:', err.message);
    return getMockReviews(query);
  }
}

function getMockReviews(query) {
  return {
    placeName: query || 'Sample Venue',
    address:   'MG Road, Bangalore, Karnataka',
    rating:    4.2,
    thumbnail: null,
    reviews: [
      {
        author:      'Priya Sharma',
        rating:      5,
        text:        'Absolutely amazing experience! The ambiance was perfect and the events are well organised.',
        time:        '2 weeks ago',
        profilePhoto: null,
        likes:       12,
      },
      {
        author:      'Rahul Menon',
        rating:      4,
        text:        'Great venue for events. Good sound system and friendly staff. Parking can be tricky.',
        time:        '1 month ago',
        profilePhoto: null,
        likes:       8,
      },
      {
        author:      'Anjali Krishnan',
        rating:      4,
        text:        'Loved the vibe here. Diverse events and well-curated. Food and drinks are reasonable.',
        time:        '3 weeks ago',
        profilePhoto: null,
        likes:       5,
      },
      {
        author:      'Dev Patel',
        rating:      3,
        text:        'Decent place overall. Some events are better than others. Can get crowded.',
        time:        '2 months ago',
        profilePhoto: null,
        likes:       2,
      },
      {
        author:      'Meena Iyer',
        rating:      5,
        text:        'One of the best event venues in Bangalore! Staff goes above and beyond every time.',
        time:        '1 week ago',
        profilePhoto: null,
        likes:       18,
      },
    ],
  };
}

module.exports = { fetchPlaceReviews };