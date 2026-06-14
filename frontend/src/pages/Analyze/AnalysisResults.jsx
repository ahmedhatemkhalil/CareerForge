import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import AnalysisDetailsTabs from './components/AnalysisDetailsTabs'
import AnalysisResultsCard from './components/AnalysisResultsCard'

const MOCK_ANALYSIS = {
  score: 82,
  roleTitle: 'Frontend Developer',
  cvFileName: 'Elaf_Saad_Resume_2026.pdf',
  jobDescription: `We are looking for a Frontend Developer to join our product team.

Responsibilities:
• Build responsive web applications with React and modern CSS
• Collaborate with designers and backend engineers
• Write clean, maintainable, and well-tested code
• Optimize applications for performance and accessibility

Requirements:
• 2+ years of experience with React
• Strong knowledge of HTML, CSS, and JavaScript
• Experience with REST APIs and state management
• Familiarity with Git and agile workflows

Nice to have:
• TypeScript experience
• UI/UX sensibility
• Experience with Tailwind CSS`,
  strengths: [
    'Strong proficiency in React.js, demonstrated through multiple projects (CareerForge, Roundhay, Multi-Step Form, Todo App).',
    'Solid understanding of core web technologies: JavaScript (ES6+), HTML5, CSS3, and modern CSS frameworks like Tailwind CSS.',
    'Proven ability to integrate REST APIs for dynamic data fetching and user interaction (CareerForge, Roundhay).',
    'Experience with state management libraries (Zustand) and routing (React Router v7).',
    'Practical experience in building full-stack applications with the MERN stack, indicating a broader understanding of web development.',
  ],
  weaknesses: [
    "Does not meet the '2+ years of experience' requirement, as the candidate is currently an intern.",
    "Lack of quantitative metrics or impact statements for project achievements (e.g., 'reduced load time by X%', 'handled Y concurrent users').",
    'Limited demonstration of advanced React patterns or performance optimization techniques beyond course titles.',
    'No explicit mention of testing methodologies (unit, integration) for front-end or back-end code.',
  ],
  skillGaps: [
    'System Design',
    'GraphQL',
    'Node.js / Backend',
    'AWS Solutions Architect',
    'Docker & Kubernetes',
    'Team Leadership',
  ],
  matchedJobs: [
    {
      title: 'Senior Frontend Engineer',
      company: 'Stripe',
      location: 'Remote',
      matchScore: 84,
      url: 'https://ng.indeed.com/q-react-internship-jobs.html',
      _id: '6a2de374e5dd65011b147aa3',
    },
    {
      title: 'Frontend Developer',
      company: 'Vercel',
      location: 'San Francisco, CA',
      matchScore: 91,
      url: 'https://www.indeed.com/viewjob?jk=ecd161a27faa35f1',
      _id: '6a2de374e5dd65011b147aa4',
    },
    {
      title: 'React Developer',
      company: 'Shopify',
      location: 'Remote',
      matchScore: 76,
      url: 'https://www.indeed.com/viewjob?jk=2acf8956ab8631a8',
      _id: '6a2de374e5dd65011b147aa5',
    },
    {
      title: 'UI Engineer',
      company: 'Notion',
      location: 'New York, NY',
      matchScore: 79,
      url: 'https://www.linkedin.com/jobs/view/frontend-web-developer-remote-at-hire-feed-4425166564',
      _id: '6a2de374e5dd65011b147aa6',
    },
  ],
  recommendedActions: [
    'Clearly articulate the duration and specific responsibilities/achievements of the MERN Full Stack Intern role, even if it is ongoing.',
    "Quantify project outcomes with specific metrics (e.g., 'Improved user engagement by X%', 'Optimized API response times by Y%').",
    'Detail the specific challenges overcome and solutions implemented in projects, especially for backend components in MERN.',
    "Consider adding a section for 'Key Achievements' to highlight impactful contributions.",
  ],
  improvedSuggestions: [
    {
      original: 'MERN Full Stack Intern',
      improved: 'Full-Stack Software Engineer Intern (MERN Stack)',
      _id: '6a2de374e5dd65011b147aa7',
    },
    {
      original: 'Building full-stack web applications with the MERN stack...',
      improved:
        'Developed and deployed full-stack web applications using the MERN stack, gaining hands-on experience in database design, API development, and front-end implementation within an intensive industry training program.',
      _id: '6a2de374e5dd65011b147aa8',
    },
    {
      original: 'AI-powered platform that analyzes uploaded CVs...',
      improved:
        'Architected and developed CareerForge, an AI-powered platform leveraging Generative AI for comprehensive CV analysis, skill gap identification, and personalized learning roadmaps, including automated mock interview generation.',
      _id: '6a2de374e5dd65011b147aa9',
    },
    {
      original: 'Developed an intuitive multi-step form with dynamic validation...',
      improved:
        'Engineered a user-friendly multi-step form with dynamic validation and optimized navigation, significantly enhancing user experience and reducing input errors.',
      _id: '6a2de374e5dd65011b147aaa',
    },
    {
      original:
        'Movie & TV discovery app with TMDB API integration, user authentication, and a persistent wishlist synced to a REST backend.',
      improved:
        'Designed and implemented Roundhay, a responsive Movie & TV discovery application featuring TMDB API integration, robust user authentication, and a persistent wishlist synchronized with a RESTful backend.',
      _id: '6a2de374e5dd65011b147aab',
    },
  ],
}

const AnalysisResults = () => {
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
        score={MOCK_ANALYSIS.score}
        roleTitle={MOCK_ANALYSIS.roleTitle}
        cvFileName={MOCK_ANALYSIS.cvFileName}
        jobDescription={MOCK_ANALYSIS.jobDescription}
      />

      <AnalysisDetailsTabs
        strengths={MOCK_ANALYSIS.strengths}
        weaknesses={MOCK_ANALYSIS.weaknesses}
        skillGaps={MOCK_ANALYSIS.skillGaps}
        matchedJobs={MOCK_ANALYSIS.matchedJobs}
        recommendedActions={MOCK_ANALYSIS.recommendedActions}
        improvedSuggestions={MOCK_ANALYSIS.improvedSuggestions}
      />
    </div>
  )
}

export default AnalysisResults
