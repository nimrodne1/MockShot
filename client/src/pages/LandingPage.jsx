import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startSession } from '../api/index';

// ── Icons ──────────────────────────────────────────────────────────────────

function IconClipboard() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

function IconMic() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 3a4 4 0 014 4v4a4 4 0 01-8 0V7a4 4 0 014-4z" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function IconSpinner() {
  return (
    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Step card ──────────────────────────────────────────────────────────────

function StepCard({ number, icon, title, description }) {
  return (
    <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/40 transition-colors duration-300">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/15 text-blue-400 mb-5">
        {icon}
      </div>
      <span className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-2">
        Step {number}
      </span>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    document.title = 'MockShot — AI Mock Interviewer';
  }, []);

  function scrollToInput() {
    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFieldError('');
    setApiError('');

    if (!jobDescription.trim()) {
      setFieldError('Please paste a job description before continuing.');
      inputRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      const data = await startSession(jobDescription);
      navigate('/interview', {
        state: {
          sessionId: data.sessionId,
          jobTitle: data.jobTitle,
          questions: data.questions,
          jobDescription,
        },
      });
    } catch (err) {
      setApiError(
        err?.response?.data?.error ||
          'Something went wrong generating your questions. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white scroll-smooth">

      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 bg-[#0a0f1e]/80 backdrop-blur-md border-b border-white/5">
        <span className="text-xl font-bold tracking-tight text-white">
          Mock<span className="text-blue-400">Shot</span>
        </span>
        <span className="text-sm text-gray-400 hidden sm:block">
          AI-powered interview practice
        </span>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-screen px-6 pt-16">
        {/* Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium tracking-wide mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Powered by Gemini AI
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6">
            Ace your next
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-400">
              interview
            </span>
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl mx-auto">
            Paste a job description. Get AI-powered interview questions.
            Practice your answers. Get real feedback.
          </p>

          <button
            onClick={scrollToInput}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white font-semibold text-lg transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-400/35 hover:-translate-y-0.5"
          >
            Start Practicing
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-600 text-xs animate-bounce">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How it works</h2>
          <p className="text-gray-400">Three steps to a better interview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StepCard
            number={1}
            icon={<IconClipboard />}
            title="Paste the job description"
            description="Copy any job posting and paste it in. Our AI reads the role, the stack, and the expectations."
          />
          <StepCard
            number={2}
            icon={<IconMic />}
            title="Answer 5 tailored questions"
            description="Get 2 technical, 2 behavioral, and 1 motivation question — all generated from your specific job description."
          />
          <StepCard
            number={3}
            icon={<IconStar />}
            title="Get your score & feedback"
            description="Receive a score from 1–10, detailed strengths and improvements, and an ideal answer for each question."
          />
        </div>
      </section>

      {/* ── Input section ────────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 pb-32 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to practice?</h2>
          <p className="text-gray-400">Paste the job description below and we'll handle the rest.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="jd" className="text-sm font-medium text-gray-300">
              Job Description <span className="text-blue-400">*</span>
            </label>
            <textarea
              id="jd"
              ref={inputRef}
              rows={12}
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                if (fieldError) setFieldError('');
              }}
              placeholder="Paste the job description here..."
              className={[
                'w-full rounded-xl bg-white/5 border px-5 py-4 text-white placeholder-gray-600',
                'text-sm leading-relaxed resize-none outline-none',
                'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200',
                fieldError ? 'border-red-500' : 'border-white/10',
              ].join(' ')}
            />
            {fieldError && (
              <p className="text-sm text-red-400 flex items-center gap-1.5">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {fieldError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={[
              'flex items-center justify-center gap-3 w-full py-4 rounded-xl font-semibold text-lg',
              'transition-all duration-200',
              loading
                ? 'bg-blue-500/50 cursor-not-allowed text-white/70'
                : 'bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-400/35 hover:-translate-y-0.5',
            ].join(' ')}
          >
            {loading ? (
              <>
                <IconSpinner />
                Generating questions…
              </>
            ) : (
              'Generate My Interview'
            )}
          </button>

          {apiError && (
            <div className="flex items-start justify-between gap-3 px-5 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {apiError}
              </div>
              <button
                type="submit"
                className="text-xs underline underline-offset-2 flex-shrink-0 hover:text-red-300 transition-colors"
              >
                Retry
              </button>
            </div>
          )}
        </form>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 text-center py-8 text-gray-600 text-sm">
        MockShot © {new Date().getFullYear()} · Built with Gemini AI
      </footer>
    </div>
  );
}
