import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import InterviewPage from './pages/InterviewPage';
import ResultsPage from './pages/ResultsPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/results/:sessionId" element={<ResultsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
