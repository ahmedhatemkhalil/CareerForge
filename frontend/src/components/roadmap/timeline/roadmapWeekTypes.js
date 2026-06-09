/**
 * @typedef {Object} RoadmapWeekResource
 * @property {string} title
 * @property {string} href
 */

/**
 * @typedef {Object} RoadmapWeek
 * @property {string} id
 * @property {number} weekNumber
 * @property {string} title
 * @property {'completed' | 'current' | 'upcoming'} status
 * @property {string[]} tasks
 * @property {RoadmapWeekResource[]} resources
 */

/** @type {RoadmapWeek[]} */
export const SAMPLE_WEEKLY_ROADMAP_WEEKS = [
  {
    id: "week-1",
    weekNumber: 1,
    title: "Foundation: React Advanced Patterns",
    status: "completed",
    tasks: [
      "Review hooks dependency rules",
      "Build a small compound-components demo",
    ],
    resources: [
      {
        title: "React docs — Thinking in React",
        href: "https://react.dev/learn/thinking-in-react",
      },
    ],
  },
  {
    id: "week-2",
    weekNumber: 2,
    title: "State & data fetching patterns",
    status: "completed",
    tasks: ["Compare TanStack Query vs SWR", "Add optimistic updates to one screen"],
    resources: [
      {
        title: "TanStack Query — Overview",
        href: "https://tanstack.com/query/latest",
      },
    ],
  },
  {
    id: "week-3",
    weekNumber: 3,
    title: "Performance & rendering",
    status: "completed",
    tasks: ["Profile one slow route with React DevTools", "Memoization checklist"],
    resources: [
      {
        title: "React — useMemo",
        href: "https://react.dev/reference/react/useMemo",
      },
    ],
  },
  {
    id: "week-4",
    weekNumber: 4,
    title: "Testing & quality",
    status: "completed",
    tasks: ["Add RTL tests for a form", "CI gate for lint + unit tests"],
    resources: [
      {
        title: "Testing Library — Guiding Principles",
        href: "https://testing-library.com/docs/guiding-principles",
      },
    ],
  },
  {
    id: "week-5",
    weekNumber: 5,
    title: "Cloud & CI/CD foundations",
    status: "completed",
    tasks: [
      "Study AWS Lambda + CI/CD tutorial",
      "Deploy a static preview branch from GitHub Actions",
    ],
    resources: [
      {
        title: "AWS Lambda — Getting started",
        href: "https://docs.aws.amazon.com/lambda/latest/dg/getting-started.html",
      },
    ],
  },
  {
    id: "week-6",
    weekNumber: 6,
    title: "System design for frontend",
    status: "current",
    tasks: [
      "Read through a public system design primer",
      "Sketch architecture for your portfolio app",
    ],
    resources: [
      {
        title: "System Design Primer",
        href: "https://github.com/donnemartin/system-design-primer",
      },
    ],
  },
  {
    id: "week-7",
    weekNumber: 7,
    title: "Leadership & communication",
    status: "upcoming",
    tasks: ["Draft a tech proposal template", "Run a mock 1:1 feedback session"],
    resources: [
      {
        title: "StaffEng — Technical strategy",
        href: "https://staffeng.com/guides/technical-strategy",
      },
    ],
  },
]
