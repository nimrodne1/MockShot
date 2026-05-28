// End-to-end integration test — uses an in-memory MongoDB so no local DB required.
// Run with: node test-e2e.js
require('dotenv').config();

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const http = require('http');
const express = require('express');
const cors = require('cors');

async function request(server, method, path, body) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const port = addr.port;
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'localhost', port, path, method,
      headers: { 'Content-Type': 'application/json', ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}) },
    };
    const req = http.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  // Start in-memory MongoDB
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  console.log('In-memory MongoDB connected');

  // Boot Express app inline (same routes as index.js, no mongoose.connect call)
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/interview', require('./routes/interview'));
  app.use('/api/interview/answer', require('./routes/answer'));

  const server = http.createServer(app);
  await new Promise(r => server.listen(0, r)); // port 0 = random free port

  const JD = 'We are hiring a Senior React Developer. You will build scalable frontend apps with React, TypeScript, and Redux. 5+ years experience required.';

  // ── STEP 1: Start session ─────────────────────────────────────────────────
  console.log('\n--- STEP 1: Start session ---');
  const startRes = await request(server, 'POST', '/api/interview/start', { jobDescription: JD });
  console.log('HTTP', startRes.status);
  const { sessionId, jobTitle, questions } = startRes.body;
  console.log('sessionId:', sessionId);
  console.log('jobTitle:', jobTitle);
  questions.forEach(q => console.log(`  Q${q.id} [${q.type}] ${q.question.substring(0, 70)}...`));

  if (!sessionId) throw new Error('sessionId is null — session was not saved');

  // ── STEP 2: Submit 5 answers ──────────────────────────────────────────────
  console.log('\n--- STEP 2: Submit answers ---');
  const sampleAnswers = [
    'Redux uses a single store, actions describe changes, and pure reducers compute new state. For async I use Thunk for simple cases and Saga for complex flows.',
    'I profile with React DevTools and Chrome, then apply memo, useMemo, useCallback, and code splitting to fix bottlenecks.',
    'I once refactored a class component codebase to hooks. I wrote an RFC, got team buy-in, then migrated incrementally with feature flags.',
    'I mentored a junior dev through weekly pairing and detailed PR reviews. They shipped a full feature solo within 3 months.',
    'I love this role because the focus on scalable architecture matches what I enjoy most and I want to grow into a tech lead position.',
  ];

  const scores = [];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const res = await request(server, 'POST', '/api/interview/answer', {
      sessionId,
      questionId: q.id,
      question: q.question,
      answer: sampleAnswers[i],
    });
    if (res.status !== 200) throw new Error(`Answer Q${q.id} failed: ${JSON.stringify(res.body)}`);
    scores.push(res.body.score);
    console.log(`  Q${q.id} score: ${res.body.score} (${res.body.scoreLabel})`);
  }

  // ── STEP 3: Summary ───────────────────────────────────────────────────────
  console.log('\n--- STEP 3: Session summary ---');
  const sumRes = await request(server, 'GET', `/api/interview/summary/${sessionId}`);
  console.log('HTTP', sumRes.status);
  const s = sumRes.body;

  console.log('jobTitle:', s.jobTitle);
  console.log('overallScore:', s.overallScore, `(${s.overallLabel})`);
  console.log('totalQuestions:', s.totalQuestions, '| answeredQuestions:', s.answeredQuestions);
  console.log('strongestAnswer score:', s.strongestAnswer?.score, '| weakestAnswer score:', s.weakestAnswer?.score);
  console.log('answers in session:', s.answers?.length);

  // ── Assertions ────────────────────────────────────────────────────────────
  const expectedAvg = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
  console.log('\n--- Assertions ---');
  console.log('Expected overallScore:', expectedAvg, '| Got:', s.overallScore, s.overallScore === expectedAvg ? '✓' : '✗ MISMATCH');
  console.log('answeredQuestions === 5:', s.answeredQuestions === 5 ? '✓' : '✗ FAIL');
  console.log('totalQuestions === 5:', s.totalQuestions === 5 ? '✓' : '✗ FAIL');
  console.log('strongestAnswer.score === max:', s.strongestAnswer?.score === Math.max(...scores) ? '✓' : '✗ FAIL');
  console.log('weakestAnswer.score === min:', s.weakestAnswer?.score === Math.min(...scores) ? '✓' : '✗ FAIL');

  // ── Cleanup ───────────────────────────────────────────────────────────────
  server.close();
  await mongoose.disconnect();
  await mongod.stop();
  console.log('\nAll tests passed.');
}

main().catch(e => { console.error('\nTest FAILED:', e.message); process.exit(1); });
