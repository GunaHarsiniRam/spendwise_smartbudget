import { format, formatDistanceToNow, parseISO } from 'date-fns'

// ── Currency ──────────────────────────────────────────────
export const formatCurrency = (amount, currency = '₹') => {
  if (amount === null || amount === undefined) return `${currency}0`
  const num = parseFloat(amount)
  if (isNaN(num)) return `${currency}0`
  if (num >= 100000) return `${currency}${(num / 100000).toFixed(1)}L`
  if (num >= 1000)   return `${currency}${(num / 1000).toFixed(1)}K`
  return `${currency}${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export const formatCurrencyFull = (amount, currency = '₹') => {
  const num = parseFloat(amount) || 0
  return `${currency}${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ── Dates ─────────────────────────────────────────────────
export const formatDate = (date) => {
  if (!date) return 'N/A'
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date)
    return format(d, 'dd MMM yyyy')
  } catch { return 'N/A' }
}

export const formatDateTime = (date) => {
  if (!date) return 'N/A'
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date)
    return format(d, 'dd MMM yyyy, hh:mm a')
  } catch { return 'N/A' }
}

export const timeAgo = (date) => {
  if (!date) return 'N/A'
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date)
    return formatDistanceToNow(d, { addSuffix: true })
  } catch { return 'N/A' }
}

// ── Percentage ────────────────────────────────────────────
export const calcPercentage = (current, total) => {
  if (!total || total === 0) return 0
  return Math.min(Math.round((current / total) * 100), 100)
}

// ── Progress color ────────────────────────────────────────
export const getProgressColor = (pct) => {
  if (pct >= 90) return 'bg-rose-500'
  if (pct >= 70) return 'bg-amber-500'
  return 'bg-emerald-500'
}

// ── Health score meta ─────────────────────────────────────
export const getHealthScoreColor = (score) => {
  if (score >= 80) return { color: '#34d399', label: 'Excellent', bg: 'from-emerald-500 to-teal-400' }
  if (score >= 60) return { color: '#60a5fa', label: 'Good',      bg: 'from-primary-500 to-cyan-400' }
  if (score >= 40) return { color: '#fbbf24', label: 'Fair',      bg: 'from-amber-500 to-yellow-400' }
  return             { color: '#f87171',   label: 'Needs Work', bg: 'from-rose-500 to-red-400' }
}

// ── Category info (icon + colors) ────────────────────────
export const CATEGORIES = {
  Food:          { icon: '🍕', color: '#f97316', bg: 'bg-orange-500/10', text: 'text-orange-400' },
  Grocery:       { icon: '🛒', color: '#10b981', bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  Shopping:      { icon: '🛍️', color: '#a855f7', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  Entertainment: { icon: '🎬', color: '#ec4899', bg: 'bg-pink-500/10', text: 'text-pink-400' },
  Travel:        { icon: '✈️', color: '#0ea5e9', bg: 'bg-sky-500/10', text: 'text-sky-400' },
  Healthcare:    { icon: '🏥', color: '#f43f5e', bg: 'bg-rose-500/10', text: 'text-rose-400' },
  Bills:         { icon: '📄', color: '#64748b', bg: 'bg-slate-500/10', text: 'text-slate-400' },
  Education:     { icon: '📚', color: '#3b82f6', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  Others:        { icon: '📦', color: '#8b5cf6', bg: 'bg-violet-500/10', text: 'text-violet-400' },
}

export const getCategoryInfo = (category) => {
  return CATEGORIES[category] || CATEGORIES.Others
}

// ── Penalty calc ──────────────────────────────────────────
export const calculatePenalty = (budget, actual, rules) => {
  if (actual <= budget) return 0
  const overPct = ((actual - budget) / budget) * 100
  if (rules) {
    if (overPct >= 20) return rules.rule3 || 10
    if (overPct >= 10) return rules.rule2 || 5
    if (overPct >= 5)  return rules.rule1 || 1
  }
  if (overPct >= 20) return 10
  if (overPct >= 10) return 5
  if (overPct >= 5)  return 1
  return 0
}

// ── Avatar gradient ───────────────────────────────────────
export const getAvatarGradient = (name) => {
  const gradients = [
    'from-violet-500 to-purple-600',
    'from-sky-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-rose-500 to-pink-500',
    'from-amber-500 to-orange-500',
    'from-indigo-500 to-blue-500',
  ]
  return gradients[(name?.charCodeAt(0) || 0) % gradients.length]
}

// ── Month name ────────────────────────────────────────────
export const getMonthName = (idx) => {
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][idx] || ''
}

export const clamp = (v, mn, mx) => Math.min(Math.max(v, mn), mx)
