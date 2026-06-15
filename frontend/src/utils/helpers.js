export const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0][0].toUpperCase()

  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export const getScoreStyles = (score) => {
  if (score === 0) {
    return {
      text: 'text-gray-400',
      stroke: '#e5e7eb',
      badge: 'bg-gray-100 text-gray-500 border-gray-200',
      label: 'No score',
    }
  }
  if (score >= 80) {
    return {
      text: 'text-emerald-500',
      stroke: '#10b981',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      label: 'Strong match',
    }
  }
  if (score >= 65) {
    return {
      text: 'text-amber-500',
      stroke: '#f59e0b',
      badge: 'bg-amber-50 text-amber-700 border-amber-100',
      label: 'Moderate match',
    }
  }
  return {
    text: 'text-rose-500',
    stroke: '#ef4444',
    badge: 'bg-rose-50 text-rose-700 border-rose-100',
    label: 'Low match',
  }
}

export const getScoreSummary = (score) => {
  if (score >= 90) {
    return 'Excellent match. Your CV aligns strongly with this role.'
  }
  if (score >= 75) {
    return 'Your CV is a strong match. A few targeted improvements could push this above 90.'
  }
  if (score >= 50) {
    return 'Moderate match. Focus on the highlighted gaps to improve your fit.'
  }
  return 'Limited match. Consider tailoring your CV or exploring other roles.'
}
