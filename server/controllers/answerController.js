const { GoogleGenAI } = require('@google/genai');
const Session = require('../models/Session');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SCORE_LABEL = (score) => {
  if (score <= 3) return 'Weak';
  if (score <= 6) return 'Decent';
  if (score <= 8) return 'Strong';
  return 'Excellent';
};

const SYSTEM_PROMPT = `You are a senior technical interviewer evaluating a candidate's answer to an interview question.
You will be given the job description for context, the interview question, and the candidate's answer.

Evaluate the answer and respond ONLY with a valid JSON object — no markdown, no code fences, no explanation.

Format:
{
  "score": <integer 1-10>,
  "scoreLabel": "<Weak|Decent|Strong|Excellent>",
  "feedback": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "idealAnswer": "<what a strong answer would include>"
}

Score guide: 1-3 Weak, 4-6 Decent, 7-8 Strong, 9-10 Excellent.
Be honest, specific, and constructive. Tailor your evaluation to the role described in the job description.`;

async function evaluateAnswer(req, res) {
  const { sessionId, questionId, question, answer } = req.body;

  if (!question || typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ error: 'question is required' });
  }
  if (!answer || typeof answer !== 'string' || !answer.trim()) {
    return res.status(400).json({ error: 'answer is required' });
  }

  let jobDescription = '';
  let session = null;

  if (sessionId) {
    try {
      session = await Session.findById(sessionId);
      if (session) jobDescription = session.jobDescription;
    } catch (err) {
      console.warn('Could not fetch session:', err.message);
    }
  }

  const userPrompt = [
    jobDescription ? `Job Description:\n${jobDescription}` : '',
    `Interview Question:\n${question.trim()}`,
    `Candidate's Answer:\n${answer.trim()}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  let rawText;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: { systemInstruction: SYSTEM_PROMPT },
    });
    rawText = response.text;
  } catch (err) {
    console.error('Gemini API error:', err.message);
    return res.status(502).json({ error: 'Failed to contact AI service' });
  }

  const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error('JSON parse failed. Raw response:', rawText);
    return res.status(500).json({ error: 'AI returned invalid JSON' });
  }

  const score = Math.min(10, Math.max(1, Math.round(parsed.score)));
  const evaluation = {
    score,
    scoreLabel: SCORE_LABEL(score),
    feedback: parsed.feedback || '',
    strengths: parsed.strengths || [],
    improvements: parsed.improvements || [],
    idealAnswer: parsed.idealAnswer || '',
  };

  if (session) {
    try {
      await Session.findByIdAndUpdate(sessionId, {
        $push: {
          answers: {
            questionId: Number(questionId) || 0,
            question: question.trim(),
            userAnswer: answer.trim(),
            ...evaluation,
          },
        },
      });
    } catch (err) {
      console.warn('MongoDB update skipped:', err.message);
    }
  }

  return res.json(evaluation);
}

module.exports = { evaluateAnswer };
