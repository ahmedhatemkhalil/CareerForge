import { useState } from "react"
import { Map } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

const inputClass =
  "flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring "

const Roadmap = () => {
  const navigate = useNavigate()
  const [currentRole, setCurrentRole] = useState("")
  const [targetRole, setTargetRole] = useState("")
  const [hoursPerWeek, setHoursPerWeek] = useState(10)

  const handleGenerate = () => {
    navigate("/roadmap/result", {
    })
  }
  return (
    <div className=" py-2 mx-auto max-w-6xl sm:py-6">
      <header className="mb-8 sm:mb-10">
        <h1
          className="text-3xl font-bold tracking-tight bg-clip-text text-transparent sm:text-4xl"
          style={{ backgroundImage: "var(--gradient-brand)" }}>
          Career Roadmap
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Get a personalized learning path to your dream role
        </p>
      </header>

      <div className="rounded-xl border space-y-4 border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
          <div className="space-y-2">
            <label
              htmlFor="current-role"
              className="text-sm font-medium text-foreground">
              Current Role
            </label>
            <input
              id="current-role"
              type="text"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              placeholder="e.g. Intern"
              className={inputClass}
              autoComplete="organization-title"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="target-role"
              className="text-sm font-medium text-foreground">
              Target Role
            </label>
            <input
              id="target-role"
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Tech Lead"
              className={inputClass}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <p className="text-sm text-foreground">
            Hours per week you can dedicate:{" "}
            <span className="font-semibold text-foreground">
              {hoursPerWeek} hours
            </span>
          </p>
          <Slider
            min={5}
            max={40}
            step={1}
            value={[hoursPerWeek]}
            onValueChange={(v) => setHoursPerWeek(v[0])}
          />
          <div className="flex justify-between px-0.5 text-xs text-muted-foreground">
            <span>5 hrs</span>
            <span>20 hrs</span>
            <span>40 hrs</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          className={cn(
            "mt-6 inline-flex cursor-pointer h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium text-white shadow-sm outline-none select-none",
            "hover:opacity-90 focus-visible:ring-[3px] focus-visible:ring-sidebar-ring/40 active:translate-y-px",
            "disabled:pointer-events-none disabled:opacity-50"
          )}
          style={{ backgroundImage: "var(--gradient-brand)" }}>
          <Map className="size-4 shrink-0" aria-hidden />
          Generate Roadmap
        </button>
      </div>
    </div>
  )
}

export default Roadmap
