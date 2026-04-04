const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const router = express.Router();

// Save a search (city, query, results)
router.post('/', protect, async (req, res) => {
  const { city, query, results } = req.body;
  const user = await User.findById(req.user._id);
  user.searchHistory.unshift({ city, query, results, timestamp: new Date() });
  // Keep last 20 searches
  if (user.searchHistory.length > 20) user.searchHistory.pop();
  await user.save();
  res.status(201).json({ message: 'Search saved' });
});

// Get user's search history
router.get('/', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('searchHistory');
  res.json(user.searchHistory);
});

module.exports = router;