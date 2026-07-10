import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Mic, TrendingUp } from 'lucide-react'

import useAuthStore from '@/stores/authStore'
import { getAllAnalyses } from '@/services/analysisService'
import { interviewService } from '@/services/interviewService'
import { getAllRoadmaps } from '@/services/roadmapService'
import {
  countAnalysesThisMonth,
  countInterviewsThisWeek,
  countRoadmapsThisMonth,
  getFirstName,
  getFormattedDate,
  parseAnalysesResponse,
} from '@/utils/helpers'
import { loadCurrentUser } from '@/utils/userProfile'
import RecentRoadmaps from './components/RecentRoadmaps'
import RecentCvAnalyses from './components/RecentCvAnalyses'
import RecentInterviews from './components/RecentInterviews'
import StatCard from './components/StatCard'

const Dashboard = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [analyses, setAnalyses] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [interviews, setInterviews] = useState([])
  const [interviewTotal, setInterviewTotal] = useState(0)
  const [interviewsLoading, setInterviewsLoading] = useState(true)
  const [roadmaps, setRoadmaps] = useState([])
  const [roadmapsLoading, setRoadmapsLoading] = useState(true)

  useEffect(() => {
    if (!user) loadCurrentUser().catch(() => {})
  }, [user])

  useEffect(() => {
    getAllAnalyses()
      .then((response) => {
        const parsed = parseAnalysesResponse(response)
        setAnalyses(parsed)
        setTotal(response?.results ?? parsed.length)
      })
      .catch(() => {
        setAnalyses([])
        setTotal(0)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    interviewService
      .getAllInterviews()
      .then(({ data, count }) => {
        setInterviews(data)
        setInterviewTotal(count)
      })
      .catch(() => {
        setInterviews([])
        setInterviewTotal(0)
      })
      .finally(() => setInterviewsLoading(false))
  }, [])

  useEffect(() => {
    getAllRoadmaps()
      .then((data) => {
        setRoadmaps(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        setRoadmaps([])
      })
      .finally(() => setRoadmapsLoading(false))
  }, [])

  const recentRoadmaps = useMemo(
    () =>
      [...roadmaps]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 3),
    [roadmaps],
  )

  const roadmapsThisMonth = useMemo(
    () => countRoadmapsThisMonth(roadmaps),
    [roadmaps],
  )

  const recentAnalyses = useMemo(
    () =>
      [...analyses]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3),
    [analyses],
  )

  const analysesThisMonth = useMemo(
    () => countAnalysesThisMonth(analyses),
    [analyses],
  )

  const interviewsThisWeek = useMemo(
    () => countInterviewsThisWeek(interviews),
    [interviews],
  )

  const recentInterviews = useMemo(
    () =>
      [...interviews]
        .sort(
          (a, b) =>
            new Date(b.completed_at || b.interviewDate) -
            new Date(a.completed_at || a.interviewDate),
        )
        .slice(0, 3),
    [interviews],
  )

  const { dayName, fullDate } = getFormattedDate()
  const firstName = getFirstName(user?.name)

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Here&apos;s your career progress overview
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-sm text-muted-foreground">{dayName}</p>
          <p className="text-sm font-bold text-foreground">{fullDate}</p>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        <StatCard
          icon={BarChart3}
          iconBgClassName="bg-secondary"
          iconClassName="text-primary"
          value={total}
          label="Total CV Analyses"
          sublabel={
            analysesThisMonth > 0
              ? `+${analysesThisMonth} this month`
              : 'No new analyses this month'
          }
          sublabelClassName="text-primary"
          onDoubleClick={() => navigate('/analyze')}
          loading={loading}
        />

        <StatCard
          icon={Mic}
          iconBgClassName="bg-secondary"
          iconClassName="text-primary"
          value={interviewTotal}
          label="Interview Sessions"
          sublabel={
            interviewsThisWeek > 0
              ? `+${interviewsThisWeek} this week`
              : 'No new interviews this week'
          }
          sublabelClassName="text-primary"
          onDoubleClick={() => navigate('/interview')}
          loading={interviewsLoading}
        />

        <StatCard
          icon={TrendingUp}
          iconBgClassName="bg-emerald-50"
          iconClassName="text-emerald-500"
          value={roadmaps.length}
          label="Total Roadmaps"
          sublabel={
            roadmapsThisMonth > 0
              ? `+${roadmapsThisMonth} this month`
              : 'No new roadmaps this month'
          }
          sublabelClassName="text-emerald-500"
          onDoubleClick={() => navigate('/roadmap')}
          loading={roadmapsLoading}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <RecentCvAnalyses
          analyses={recentAnalyses}
          loading={loading}
          onOpenAnalysis={(id) => navigate(`/analyze/results/${id}`)}
          onViewAll={() => navigate('/analyze')}
        />
        <RecentInterviews
          interviews={recentInterviews}
          loading={interviewsLoading}
          onOpenInterview={(id) => {
            const session = recentInterviews.find(
              (item) => (item._id ?? item.id) === id,
            )
            if (session?.status?.toLowerCase() === 'completed') {
              navigate(`/interview/${id}/result`)
              return
            }
          }}
          onViewAll={() => navigate('/interview')}
        />
        <RecentRoadmaps
          roadmaps={recentRoadmaps}
          loading={roadmapsLoading}
          onOpenRoadmap={(id) => navigate(`/roadmap/result/${id}`)}
          onViewAll={() => navigate('/roadmap')}
        />
      </section>
    </div>
  )
}

export default Dashboard
