const { GoogleGenAI } = require('@google/genai');
const Session = require('../models/Session');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are an expert technical interviewer. When given a job description, you analyze it and generate exactly 5 interview questions in this distribution:
- 2 technical questions (type: "technical")
- 2 behavioral questions (type: "behavioral")
- 1 motivation question about why the candidate wants this role (type: "motivation")

You also extract the job title from the description.

Respond ONLY with a valid JSON object. No markdown, no explanation, no code fences — just the raw JSON object.

Format:
{
  "jobTitle": "string",
  "questions": [
    { "id": 1, "type": "technical", "question": "string" },
    { "id": 2, "type": "technical", "question": "string" },
    { "id": 3, "type": "behavioral", "question": "string" },
    { "id": 4, "type": "behavioral", "question": "string" },
    { "id": 5, "type": "motivation", "question": "string" }
  ]
}`;

async function analyzeJobDescription(req, res) {
  const { jobDescription } = req.body;

  if (!jobDescription || typeof jobDescription !== 'string' || !jobDescription.trim()) {
    return res.status(400).json({ error: 'jobDescription is required' });
  }

  let rawText;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: `Analyze this job description and generate the 5 interview questions:\n\n${jobDescription.trim()}`,
      config: { systemInstruction: SYSTEM_PROMPT },
    });
    rawText = response.text;
  } catch (err) {
    console.error('Gemini API error:', err.message);
    return res.status(502).json({ error: 'Failed to contact AI service' });
  }

  // Strip markdown code fences if Gemini wraps the JSON anyway
  const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error('JSON parse failed. Raw response:', rawText);
    return res.status(502).json({ error: 'AI returned invalid JSON' });
  }

  const { jobTitle = '', questions = [] } = parsed;

  let sessionId = null;
  try {
    const session = await Session.create({ jobDescription, jobTitle, questions });
    sessionId = session._id;
  } catch (err) {
    console.warn('MongoDB save skipped:', err.message);
  }

  return res.json({ sessionId, jobTitle, questions });
}

module.exports = { analyzeJobDescription };
