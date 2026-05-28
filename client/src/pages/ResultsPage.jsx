import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getSessionSummary, startSession } from '../api/index';
import { getScoreStyle, getOverallLabel } from '../constants';

// ── Score circle ──────────────────────────────────────────────────────────

function ScoreCircle({ targetScore }) {
  const [display, setDisplay] = useState(0);
  const [progress, setProgress] = useState(0);
  const r = 80;
  const circ = 2 * Math.PI * r;
  const style = getScoreStyle(targetScore);

  useEffect(() => {
    if (!targetScore) return;
    let frame = 0;
    const total = 60;
    const id = setInterval(() => {
      frame++;
      const t = frame / total;
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(+(targetScore * eased).toFixed(1));
      setProgress(eased);
      if (frame >= total) clearInterval(id);
    }, 25);
    return () => clearInterval(id);
  }, [targetScore]);

  const dashOffset = circ - progress * (targetScore / 10) * circ;

  return (
    <div className="relative w-44 h-44 mx-auto">
      <svg className="w-full h-full" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
        <circle
          cx="100" cy="100" r={r} fill="none"
          stroke={style.ring} strokeWidth="12"
          strokeDasharray={circ} strokeDashoffset={dashOffset}
          strokeLinecap="round" transform="rotate(-90 100 100)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-5xl font-black tabular-nums ${style.text}`}>{display.toFixed(1)}</span>
        <span className="text-xs text-gray-500 mt-1">out of 10</span>
      </div>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] animate-pulse">
      <div className="max-w-3xl mx-auto px-6 py-16 flex flex-col items-center gap-8">
        {/* Score circle placeholder */}
        <div className="w-44 h-44 rounded-full bg-white/5" />
        {/* Label pill */}
        <div className="w-48 h-8 rounded-full bg-white/5" />
        {/* Job title */}
        <div className="w-56 h-5 rounded bg-white/5" />
        {/* Stats chips */}
        <div className="flex gap-3 flex-wrap justify-center">
          <div className="w-40 h-10 rounded-full bg-white/5" />
          <div className="w-36 h-10 rounded-full bg-white/5" />
        </div>
        {/* Strongest / Weakest cards */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div className="h-36 rounded-2xl bg-white/5" />
          <div className="h-36 rounded-2xl bg-white/5" />
        </div>
        {/* Accordion rows */}
        <div className="w-full rounded-2xl overflow-hidden border border-white/5 flex flex-col gap-px">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-white/5" />
          ))}
        </div>
        {/* Action buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3">
          <div className="flex-1 h-12 rounded-xl bg-white/5" />
          <div className="flex-1 h-12 rounded-xl bg-white/5" />
          <div className="w-32 h-12 rounded-xl bg-white/5" />
        </div>
      </div>
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────────────────

function ErrorState({ onRetry }) {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2">Couldn't load your results.</h2>
        <p className="text-gray-400 text-sm max-w-sm">
          Something went wrong fetching your session. Check your connection and try again.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white font-semibold transition-all duration-200 shadow-lg shadow-blue-500/25 hover:-translate-y-0.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all duration-200"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}

// ── Accordion item ────────────────────────────────────────────────────────

function AccordionItem({ answer, index, isOpen, onToggle }) {
  const contentRef = useRef(null);
  const style = getScoreStyle(answer.score);

  return (
    <div className="border-b border-white/10 last:border-none">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-white/3 transition-colors group"
      >
        <span className="text-gray-600 text-sm w-5 flex-shrink-0 font-mono">{index + 1}</span>
        <span className="flex-1 text-sm text-gray-300 line-clamp-1 group-hover:text-white transition-colors min-w-0">
          {answer.question}
        </span>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border flex-shrink-0 ${style.pill}`}>
          {answer.score}/10
        </span>
        <svg
          className={`w-4 h-4 text-gray-600 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? `${contentRef.current?.scrollHeight ?? 1000}px` : '0px' }}
      >
        <div ref={contentRef} className="px-6 pb-6 space-y-4 border-t border-white/5 pt-4">
          {/* User's answer */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Your Answer</p>
            <p className="text-sm text-gray-300 leading-relaxed bg-white/3 rounded-xl px-4 py-3">
              {answer.userAnswer}
            </p>
          </div>

          {/* Feedback */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Feedback</p>
            <p className="text-sm text-gray-300 leading-relaxed">{answer.feedback}</p>
          </div>

          {/* Ideal answer */}
          {answer.idealAnswer && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-2">Ideal Answer</p>
              <p className="text-sm text-gray-300 leading-relaxed bg-blue-500/5 border border-blue-500/15 rounded-xl px-4 py-3">
                {answer.idealAnswer}
              </p>
            </div>
          )}

          {/* Strengths + improvements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-2">Strengths</p>
              <ul className="space-y-1.5">
                {answer.strengths?.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                    <svg className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-2">To Improve</p>
              <ul className="space-y-1.5">
                {answer.improvements?.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                    <svg className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Answer card (strongest / weakest) ────────────────────────────────────

function AnswerCard({ answer, label, borderColor, badgeColor }) {
  const style = getScoreStyle(answer.score);
  return (
    <div className={`rounded-2xl bg-white/5 border ${borderColor} p-5 flex flex-col gap-3`}>
      <p className={`text-xs font-semibold uppercase tracking-widest ${badgeColor}`}>{label}</p>
      <p className="text-sm text-gray-200 leading-snug line-clamp-3">{answer.question}</p>
      <div className={`inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full text-sm font-bold border ${style.pill}`}>
        {answer.score} / 10 · {answer.scoreLabel}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);
  const [copied, setCopied] = useState(false);
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);

  useEffect(() => {
    document.title = 'MockShot — Your Results';
  }, []);

  const loadData = useCallback(() => {
    // Use router state summary if available (works without MongoDB)
    if (state?.summary) {
      setData(state.summary);
      setLoading(false);
      setError(false);
      setTimeout(() => setCardsVisible(true), 400);
      return;
    }

    // Fallback: fetch from API (requires MongoDB + valid sessionId)
    if (!sessionId || sessionId === 'local') {
      navigate('/', { replace: true });
      return;
    }

    setLoading(true);
    setError(false);
    getSessionSummary(sessionId)
      .then((d) => {
        setData(d);
        setTimeout(() => setCardsVisible(true), 400);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [sessionId, state, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handlePracticeAgain() {
    if (!data?.jobDescription) return;
    setPracticeLoading(true);
    try {
      const result = await startSession(data.jobDescription);
      navigate('/interview', {
        state: {
          sessionId: result.sessionId,
          jobTitle: result.jobTitle,
          questions: result.questions,
          jobDescription: data.jobDescription,
        },
      });
    } catch {
      setPracticeLoading(false);
    }
  }

  function handleCopy() {
    if (!data) return;
    const lines = [
      `MockShot Results — ${data.jobTitle}`,
      `Overall Score: ${data.overallScore} / 10 (${data.overallLabel})`,
      '',
      ...data.answers.map((a, i) => `Q${i + 1}: ${a.score}/10 — ${a.question}`),
      '',
      'Practiced on MockShot',
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  if (loading) return <Skeleton />;
  if (error) return <ErrorState onRetry={loadData} />;
  if (!data) return null;

  const heroStyle = getScoreStyle(data.overallScore);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative px-6 py-16 flex flex-col items-center text-center overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-72 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: heroStyle.ring }} />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-5 max-w-lg mx-auto w-full">
          <ScoreCircle targetScore={data.overallScore} />

          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${heroStyle.pill}`}>
            {getOverallLabel(data.overallLabel)}
          </div>

          <div>
            <p className="text-gray-400 text-sm mb-1">Practiced for</p>
            <h1 className="text-2xl font-bold text-white">{data.jobTitle}</h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {data.answeredQuestions} Questions Answered
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Avg Score: {data.overallScore} / 10
            </div>
          </div>
        </div>
      </section>

      {/* ── Strongest / Weakest ───────────────────────────────────────── */}
      {data.strongestAnswer && data.weakestAnswer && (
        <section className={`px-6 max-w-3xl mx-auto mb-10 transition-all duration-700 ease-out ${cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnswerCard
              answer={data.strongestAnswer}
              label="Your Strongest Answer"
              borderColor="border-emerald-500/30"
              badgeColor="text-emerald-400"
            />
            <AnswerCard
              answer={data.weakestAnswer}
              label="Needs Most Work"
              borderColor="border-red-500/30"
              badgeColor="text-red-400"
            />
          </div>
        </section>
      )}

      {/* ── Full Breakdown ────────────────────────────────────────────── */}
      <section className="px-6 max-w-3xl mx-auto mb-10">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-4">Full Breakdown</h2>
        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          {data.answers.map((answer, i) => (
            <AccordionItem
              key={i}
              answer={answer}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </section>

      {/* ── Action buttons ────────────────────────────────────────────── */}
      <section className="px-6 max-w-3xl mx-auto pb-20">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handlePracticeAgain}
            disabled={practiceLoading || !data.jobDescription}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white font-semibold transition-all duration-200 shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {practiceLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Practice Again with Same JD
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all duration-200 hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Start New Interview
          </button>

          <button
            onClick={handleCopy}
            className={[
              'flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5',
              copied
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10',
            ].join(' ')}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Summary
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}
