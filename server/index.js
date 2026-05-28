const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

// Load .env from the server directory regardless of cwd
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ── API routes ────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const interviewRoutes = require('./routes/interview');
app.use('/api/interview', interviewRoutes);

const answerRoutes = require('./routes/answer');
app.use('/api/interview/answer', answerRoutes);

// ── Serve React build in production ──────────────────────────────────────

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// ── Start ─────────────────────────────────────────────────────────────────

const start = async () => {
  if (process.env.MONGO_URI) {
    try {
      await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 3000 });
      console.log('Connected to MongoDB');
    } catch (err) {
      console.warn('MongoDB connection failed:', err.message);
    }
  } else {
    console.warn('MONGO_URI not set — skipping DB connection');
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start();
