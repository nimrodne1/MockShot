import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { submitAnswer } from '../api/index';
import { getScoreStyle } from '../constants';

// ── Timer ─────────────────────────────────────────────────────────────────

function useTimer() {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  const start = useCallback(() => {
    clearInterval(intervalRef.current);
    setSeconds(0);
    intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }, []);

  const stop = useCallback(() => clearInterval(intervalRef.current), []);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return { seconds, start, stop };
}

function formatTime(s) {
  const m = String(Math.floor(s / 60)).padStart(2, '0');
  const sec = String(s % 60).padStart(2, '0');
  return `${m}:${sec}`;
}

// ── Type badge ────────────────────────────────────────────────────────────

const TYPE_STYLES = {
  technical: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  behavioral: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  motivation: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

function TypeBadge({ type }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest border ${TYPE_STYLES[type] ?? TYPE_STYLES.technical}`}>
      {type}
    </span>
  );
}

// ── Feedback skeleton (shown while evaluating) ────────────────────────────

function FeedbackSkeleton() {
  return (
    <div className="mt-6 animate-pulse">
      <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="flex items-center gap-4 px-6 py-5 border-b border-white/10">
          <div className="w-32 h-16 rounded-xl bg-white/10 flex-shrink-0" />
          <div className="flex-1 space-y-2.5">
            <div className="h-3 bg-white/10 rounded w-full" />
            <div className="h-3 bg-white/10 rounded w-4/5" />
            <div className="h-3 bg-white/10 rounded w-3/5" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          {[0, 1].map((i) => (
            <div key={i} className="px-6 py-5 space-y-2">
              <div className="h-2.5 bg-white/10 rounded w-1/3 mb-3" />
              <div className="h-2 bg-white/10 rounded w-full" />
              <div className="h-2 bg-white/10 rounded w-3/4" />
              <div className="h-2 bg-white/10 rounded w-5/6" />
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-white/10">
          <div className="h-3 bg-white/10 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

// ── Feedback panel ────────────────────────────────────────────────────────

function FeedbackPanel({ feedback, onNext, isLast }) {
  const [idealOpen, setIdealOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const style = getScoreStyle(feedback.score);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`mt-6 transition-all duration-500 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
        {/* Score */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 px-6 py-5 border-b border-white/10">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border flex-shrink-0 ${style.pill}`}>
            <span className="text-4xl font-black">{feedback.score}</span>
            <span className="text-lg font-semibold">{feedback.scoreLabel}</span>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{feedback.feedback}</p>
        </div>

        {/* Strengths + improvements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          <div className="px-6 py-5">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3">What you did well</h4>
            <ul className="space-y-2">
              {feedback.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <svg className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="px-6 py-5">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-3">What to improve</h4>
            <ul className="space-y-2">
              {feedback.improvements.map((imp, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <svg className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  {imp}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Ideal answer */}
        <div className="border-t border-white/10">
          <button
            onClick={() => setIdealOpen((o) => !o)}
            className="w-full flex items-center justify-between px-6 py-4 text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            <span>Ideal Answer</span>
            <svg className={`w-4 h-4 transition-transform duration-300 ${idealOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${idealOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <p className="px-6 pb-5 text-sm text-gray-300 leading-relaxed border-t border-white/5 pt-4">{feedback.idealAnswer}</p>
          </div>
        </div>

        {/* Next */}
        <div className="px-6 py-5 border-t border-white/10 flex justify-end">
          <button
            onClick={onNext}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white font-semibold transition-all duration-200 shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 active:translate-y-0"
          >
            {isLast ? 'See My Results' : 'Next Question'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Session expired screen ────────────────────────────────────────────────

function SessionExpired({ onGoHome }) {
  useEffect(() => { document.title = 'MockShot — Session Expired'; }, []);
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col items-center justify-center px-6 text-center gap-6">
      <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
        <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <div>
        <h1 className="text-2xl font-bold mb-2">Session Expired</h1>
        <p className="text-gray-400 text-sm max-w-xs">This interview session is no longer available. Please start a new one.</p>
      </div>
      <button
        onClick={onGoHome}
        className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold transition-all duration-200 hover:-translate-y-0.5"
      >
        Back to Home
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────

export default function InterviewPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const { sessionId, jobTitle, questions, jobDescription } = state ?? {};

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [fieldError, setFieldError] = useState('');
  const [apiError, setApiError] = useState('');
  const [submittedAnswers, setSubmittedAnswers] = useState([]);

  const textareaRef = useRef(null);
  const feedbackRef = useRef(null);
  const timer = useTimer();

  useEffect(() => { document.title = 'MockShot — Interview in Progress'; }, []);

  // Warn on page refresh / tab close during interview
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // Start timer + focus textarea on new question
  useEffect(() => {
    if (!questions?.length) return;
    timer.start();
    setTimeout(() => textareaRef.current?.focus(), 50);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, questions]);

  // Smooth scroll to feedback after it appears
  useEffect(() => {
    if (!feedback) return;
    setTimeout(() => feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
  }, [feedback]);

  // Auto-grow textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.max(180, ta.scrollHeight) + 'px';
  }, [answer]);

  if (!questions || questions.length === 0) {
    return <SessionExpired onGoHome={() => navigate('/', { replace: true })} />;
  }

  const question = questions[currentIndex];
  const total = questions.length;
  const progress = Math.round((currentIndex / total) * 100);
  const isLast = currentIndex === total - 1;

  const timerColor = timer.seconds >= 240 ? 'text-red-400' : timer.seconds >= 120 ? 'text-amber-400' : 'text-gray-400';

  async function handleSubmit(e) {
    e.preventDefault();
    setFieldError('');
    setApiError('');

    if (!answer.trim()) {
      setFieldError('Please write an answer before submitting.');
      textareaRef.current?.focus();
      return;
    }

    setIsLoading(true);
    timer.stop();

    try {
      const result = await submitAnswer(sessionId, question.id, question.question, answer.trim());
      setFeedback(result);
      setSubmittedAnswers((prev) => [
        ...prev,
        { questionId: question.id, question: question.question, userAnswer: answer.trim(), ...result },
      ]);
    } catch (err) {
      // Answer is preserved in state — user can retry
      setApiError(
        err?.response?.data?.error ||
          "We couldn't evaluate your answer. Your answer is saved — try submitting again."
      );
      timer.start();
    } finally {
      setIsLoading(false);
    }
  }

  function handleNext() {
    if (isLast) {
      const allAnswers = submittedAnswers;
      const scores = allAnswers.map((a) => a.score);
      const avg = scores.length
        ? Math.round((scores.reduce((s, n) => s + n, 0) / scores.length) * 10) / 10
        : 0;
      const labelFn = (s) => s <= 3 ? 'Weak' : s <= 6 ? 'Decent' : s <= 8 ? 'Strong' : 'Excellent';
      const summary = {
        sessionId, jobTitle, jobDescription: jobDescription ?? '',
        overallScore: avg, overallLabel: labelFn(avg),
        totalQuestions: questions.length, answeredQuestions: allAnswers.length,
        strongestAnswer: allAnswers.reduce((b, a) => a.score > b.score ? a : b, allAnswers[0]),
        weakestAnswer: allAnswers.reduce((b, a) => a.score < b.score ? a : b, allAnswers[0]),
        answers: allAnswers,
      };
      navigate(`/results/${sessionId ?? 'local'}`, { state: { summary } });
      return;
    }
    setCurrentIndex((i) => i + 1);
    setAnswer('');
    setFeedback(null);
    setFieldError('');
    setApiError('');
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col">

      {/* ── Progress bar ──────────────────────────────────────────────── */}
      <div className="h-1 bg-white/5 flex-shrink-0">
        <div className="h-full bg-blue-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 md:px-10 h-14 border-b border-white/5 gap-3 flex-shrink-0">
        <span className="text-lg font-bold tracking-tight flex-shrink-0">
          Mock<span className="text-blue-400">Shot</span>
        </span>
        <span className="text-sm font-medium text-gray-300 truncate text-center flex-1 min-w-0">
          {jobTitle || 'Interview'}
        </span>
        <span className="text-sm text-gray-500 flex-shrink-0 whitespace-nowrap">
          Q <span className="text-white font-semibold">{currentIndex + 1}</span>
          <span className="text-gray-600"> / </span>
          <span className="text-white font-semibold">{total}</span>
        </span>
      </header>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <main className="flex-1 px-4 md:px-10 py-8 max-w-3xl mx-auto w-full">

        {/* Question card */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <TypeBadge type={question.type} />
            <span className="text-xs text-gray-600 ml-auto">#{question.id}</span>
          </div>
          <p className="text-lg md:text-2xl font-semibold leading-snug text-white">{question.question}</p>
        </div>

        {/* Answer form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                if (fieldError) setFieldError('');
                if (apiError) setApiError('');
              }}
              disabled={!!feedback || isLoading}
              placeholder="Type your answer here... take your time."
              className={[
                'w-full rounded-xl bg-white/5 border px-4 md:px-5 py-4 text-white placeholder-gray-600',
                'text-sm leading-relaxed resize-none outline-none',
                'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                fieldError ? 'border-red-500' : 'border-white/10',
              ].join(' ')}
              style={{ minHeight: '180px' }}
            />
            <span className="absolute bottom-3 right-4 text-xs text-gray-600 pointer-events-none">
              {answer.length} characters
            </span>
          </div>

          {fieldError && (
            <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {fieldError}
            </p>
          )}

          {apiError && (
            <div className="mt-3 flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="flex-1">{apiError}</span>
            </div>
          )}

          {/* Timer + submit row */}
          <div className="flex items-center justify-between mt-4">
            <div className={`flex items-center gap-2 text-sm font-mono ${timerColor} transition-colors duration-300`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatTime(timer.seconds)}
            </div>

            {!feedback && (
              <button
                type="submit"
                disabled={isLoading}
                className={[
                  'inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200',
                  isLoading
                    ? 'bg-blue-500/50 cursor-not-allowed text-white/70'
                    : 'bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white shadow-lg shadow-blue-500/25 hover:-translate-y-0.5',
                ].join(' ')}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Evaluating…
                  </>
                ) : (
                  'Submit Answer'
                )}
              </button>
            )}
          </div>
        </form>

        {/* Feedback skeleton while loading */}
        {isLoading && <FeedbackSkeleton />}

        {/* Feedback panel */}
        <div ref={feedbackRef}>
          {feedback && <FeedbackPanel feedback={feedback} onNext={handleNext} isLast={isLast} />}
        </div>
      </main>
    </div>
  );
}
