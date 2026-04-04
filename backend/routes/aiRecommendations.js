const express = require('express');
const router = express.Router();
const { getAiRecommendations } = require('../controllers/aiRecommendationsController');

router.post('/', getAiRecommendations);

module.exports = router;