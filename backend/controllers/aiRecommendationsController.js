const { fetchAiRecommendations } = require('../services/serpApiAiService');

const getAiRecommendations = async (req, res) => {
  const { interest, city } = req.body;

  if (!interest || interest.trim() === '') {
    return res.status(400).json({ success: false, error: 'Interest field is required' });
  }

  try {
    const results = await fetchAiRecommendations(interest.trim(), city || null);
    res.json({ success: true, results });
  } catch (error) {
    console.error('AI recommendations error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to get recommendations' });
  }
};

module.exports = { getAiRecommendations };