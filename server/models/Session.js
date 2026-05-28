const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  type: { type: String, enum: ['technical', 'behavioral', 'motivation'], required: true },
  question: { type: String, required: true },
});

const answerSchema = new mongoose.Schema({
  questionId: { type: Number, required: true },
  question: { type: String, required: true },
  userAnswer: { type: String, required: true },
  score: { type: Number, required: true },
  scoreLabel: { type: String, required: true },
  feedback: { type: String, required: true },
  strengths: [String],
  improvements: [String],
  idealAnswer: { type: String, required: true },
});

const sessionSchema = new mongoose.Schema({
  jobDescription: { type: String, required: true },
  jobTitle: { type: String, default: '' },
  questions: [questionSchema],
  answers: [answerSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Session', sessionSchema);
