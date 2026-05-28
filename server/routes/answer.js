const express = require('express');
const { evaluateAnswer } = require('../controllers/answerController');

const router = express.Router();

router.post('/', evaluateAnswer);

module.exports = router;
