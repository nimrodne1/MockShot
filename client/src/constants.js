export function getScoreLabel(score) {
  if (score <= 3) return 'Weak';
  if (score <= 6) return 'Decent';
  if (score <= 8) return 'Strong';
  return 'Excellent';
}

export function getOverallLabel(label) {
  const map = {
    Weak: 'Needs Improvement',
    Decent: 'Decent Performance',
    Strong: 'Strong Performance',
    Excellent: 'Excellent Performance',
  };
  return map[label] ?? label;
}

export function getScoreStyle(score) {
  if (score <= 3)
    return { ring: '#ef4444', text: 'text-red-400', pill: 'bg-red-500/15 text-red-400 border-red-500/30' };
  if (score <= 6)
    return { ring: '#f59e0b', text: 'text-amber-400', pill: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
  if (score <= 8)
    return { ring: '#3b82f6', text: 'text-blue-400', pill: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
  return { ring: '#10b981', text: 'text-emerald-400', pill: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
}
