const Session = require('../models/Session');

const SCORE_LABEL = (score) => {
  if (score <= 3) return 'Weak';
  if (score <= 6) return 'Decent';
  if (score <= 8) return 'Strong';
  return 'Excellent';
};

async function getSessionSummary(req, res) {
  const { sessionId } = req.params;

  if (!sessionId || !sessionId.trim()) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  let session;
  try {
    session = await Session.findById(sessionId);
  } catch (err) {
    return res.status(500).json({ error: 'Database error: ' + err.message });
  }

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const { answers = [] } = session;
  const totalQuestions = session.questions.length;
  const answeredQuestions = answers.length;

  let overallScore = 0;
  let overallLabel = 'N/A';
  let strongestAnswer = null;
  let weakestAnswer = null;

  if (answers.length > 0) {
    const total = answers.reduce((sum, a) => sum + a.score, 0);
    overallScore = Math.round((total / answers.length) * 10) / 10;
    overallLabel = SCORE_LABEL(overallScore);

    strongestAnswer = answers.reduce((best, a) => (a.score > best.score ? a : best), answers[0]);
    weakestAnswer = answers.reduce((worst, a) => (a.score < worst.score ? a : worst), answers[0]);
  }

  return res.json({
    sessionId: session._id,
    jobTitle: session.jobTitle,
    jobDescription: session.jobDescription,
    overallScore,
    overallLabel,
    totalQuestions,
    answeredQuestions,
    strongestAnswer,
    weakestAnswer,
    answers,
  });
}

module.exports = { getSessionSummary };
