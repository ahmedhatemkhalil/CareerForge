import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

import AnalysisDetailsTabs from './components/AnalysisDetailsTabs'
import AnalysisResultsCard from './components/AnalysisResultsCard'
import { getAnalysisById } from '../../services/analysisService'

const AnalysisResults = () => {
  const { id } = useParams()
  const location = useLocation()
  const [analysis, setAnalysis] = useState(location.state?.analysis ?? null)
  const [loading, setLoading] = useState(!location.state?.analysis)

  useEffect(() => {
    if (location.state?.analysis) return

    const loadAnalysis = async () => {
      try {
        const data = await getAnalysisById(id)
        setAnalysis(data)
      } catch (error) {
        console.error('Failed to load analysis:', error)
        toast.error(
          error.response?.data?.message || 'Failed to load analysis results.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadAnalysis()
  }, [id, location.state?.analysis])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-4 text-center">
        <p className="text-muted-foreground">Analysis not found.</p>
        <Link
          to="/analyze"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to analyses
        </Link>
      </div>
    )
  }

  const roleTitle = location.state?.jobTitle ?? analysis.jobId?.title
  const cvFileName = location.state?.cvFileName ?? analysis.cvId?.fileName
  const jobDescription =
    location.state?.jobDescription ?? analysis.jobId?.descriptionText

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 pb-2 sm:space-y-6 sm:pb-0">
      <Link
        to="/analyze"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to analyses
      </Link>

      <AnalysisResultsCard
        score={analysis.matchScore}
        roleTitle={roleTitle}
        cvFileName={cvFileName}
        jobDescription={jobDescription}
      />

      <AnalysisDetailsTabs
        strengths={analysis.strengths}
        weaknesses={analysis.weaknesses}
        skillGaps={analysis.skillGaps}
        matchedJobs={analysis.matchedJobs}
        recommendedActions={analysis.recommendedActions}
        improvedSuggestions={analysis.improvedSuggestions}
      />
    </div>
  )
}

export default AnalysisResults
