import { useMemo } from "react"
import { useNavigate } from "react-router-dom"

import { RoadmapDetailToolbar } from "@/components/roadmap/RoadmapDetailToolbar"
import { RoadmapOverallProgressSection } from "@/components/roadmap/RoadmapOverallProgressSection"
import { RoadmapSkillGapsSection } from "@/components/roadmap/RoadmapSkillGapsSection"
import { RoadmapSummaryCard } from "@/components/roadmap/RoadmapSummaryCard"
import { WeeklyRoadmapTimeline } from "@/components/roadmap/timeline"

const DEFAULT_SKILL_GAPS = [
  "Advanced React patterns (Context, HOCs, Custom Hooks)",
  "System design and architecture",
  "Cloud infrastructure (AWS/Azure)",
]


function formatRoadmapDate(d = new Date()) {
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

const RoadmapResult = () => {
  const navigate = useNavigate()

  const fromRole = "Frontend Developer"
  const toRole = "Tech Lead"
  const hoursPerWeek =  10

  const dateLabel = useMemo(() => formatRoadmapDate(), [])

  return (
    <div className="mx-auto max-w-3xl space-y-5 py-2 sm:space-y-6 sm:py-6">
      <RoadmapDetailToolbar
        onBack={() => navigate("/roadmap")}
        onNewRoadmap={() => navigate("/roadmap")}
      />

      <RoadmapSummaryCard
        fromRole={fromRole}
        toRole={toRole}
        timelineLabel="3–5 months"
        dateLabel={dateLabel}
        hoursPerWeek={hoursPerWeek}
      />

      <RoadmapOverallProgressSection value={10} max={100} />

      <RoadmapSkillGapsSection items={DEFAULT_SKILL_GAPS} />

      <WeeklyRoadmapTimeline />
    </div>
  )
}

export default RoadmapResult
