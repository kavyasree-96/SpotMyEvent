const { fetchTrendingEvents } = require('../services/serpApiService');

const getTrendingEvents = async (req, res) => {
  const city = req.query.city || null;
  try {
    const events = await fetchTrendingEvents(city);
    res.json({ success: true, results: events });
  } catch (error) {
    console.error('Trending events error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch trending events' });
  }
};

module.exports = { getTrendingEvents };