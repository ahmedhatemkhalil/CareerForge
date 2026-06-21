export const getFirstName = (name) => {
  if (!name) return 'there'
  return name.trim().split(/\s+/)[0]
}

export const getFormattedDate = (date = new Date()) => {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
  const fullDate = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return { dayName, fullDate }
}

export const formatAnalysisDate = (isoDate) => {
  if (!isoDate) return 'Unknown date'
  const dateOnly = String(isoDate).split('T')[0]
  return new Date(`${dateOnly}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const parseAnalysesResponse = (analysesRes) => {
  const analyses = analysesRes?.data || []

  return analyses.map((analysis) => ({
    _id: analysis._id,
    jobTitle: analysis.jobId?.title || 'Targeted Job Role',
    matchScore: Number(analysis.matchScore) || 0,
    fileName: analysis.cvId?.fileName || 'Uploaded_Resume.pdf',
    analysisDate: formatAnalysisDate(analysis.createdAt),
    createdAt: analysis.createdAt,
  }))
}

export const countAnalysesThisMonth = (analyses = []) => {
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()

  return analyses.filter((analysis) => {
    const createdAt = new Date(analysis.createdAt)
    return createdAt.getMonth() === month && createdAt.getFullYear() === year
  }).length
}

export const countInterviewsThisWeek = (interviews = []) => {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  return interviews.filter((interview) => {
    const date = new Date(interview.completed_at || interview.interviewDate)
    return date >= startOfWeek
  }).length
}

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

export const formatInterviewScore = (score) => {
  const value = Number(score) || 0
  return (value / 10).toFixed(1)
}

export const getInterviewScoreStyles = (score) => getScoreStyles(score).badge

export const getRoadmapProgressColor = (progress, status) => {
  if (status === 'completed' || progress === 100) {
    return 'var(--status-success)'; 
  }
  if (progress < 50) {
    return 'var(--status-warning)'; 
  }
  return 'var(--brand-primary)'; 
}