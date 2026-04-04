const { fetchPlaceReviews } = require('../services/serpApiPlacesService');

const getPlaceReviews = async (req, res) => {
  const { query } = req.query;

  if (!query || query.trim() === '') {
    return res.status(400).json({ success: false, error: 'Query parameter is required' });
  }

  try {
    const data = await fetchPlaceReviews(query.trim());
    res.json({ success: true, ...data });
  } catch (error) {
    console.error('Place reviews error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch place reviews' });
  }
};

module.exports = { getPlaceReviews };