const express = require('express');
const router = express.Router();
const { getTrendingEvents } = require('../controllers/trendingEventsController');

router.get('/', getTrendingEvents);

module.exports = router;