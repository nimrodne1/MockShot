const express = require('express');
const { analyzeJobDescription } = require('../controllers/interviewController');
const { getSessionSummary } = require('../controllers/summaryController');

const router = express.Router();

router.post('/start', analyzeJobDescription);
router.get('/summary/:sessionId', getSessionSummary);

module.exports = router;
