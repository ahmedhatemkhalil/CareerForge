# CareerForge

**AI-powered career development platform** that helps job seekers analyze their CV against job descriptions, practice mock interviews, build personalized learning roadmaps, and manage their career journey in one place.



---

## Overview

CareerForge is a full-stack graduation project built as a **monorepo**. Users upload a CV, compare it to a target job, get AI-driven skill-gap analysis, generate weekly learning roadmaps, run live AI mock interviews, and access tools like cover letters and subscription billing.

The platform is deployed on **Railway** with separate services for the user app, admin panel, API, and AI workflows.

---

## Features

- **CV Management** — Upload and store resumes (PDF/DOCX)
- **Job Description Analysis** — Match CV to a job with score, strengths, weaknesses, and skill gaps
- **AI Mock Interviews** — Live voice/text interviews with per-question feedback and hiring recommendation
- **Career Roadmaps** — Personalized weekly learning plans with real resource links (YouTube, Udemy, MDN, MaharaTech, etc.)
- **Cover Letters & Emails** — AI-assisted application documents
- **Authentication** — Email/password, Google OAuth, email verification, OTP password reset
- **Subscriptions** — Free and Pro plans via Stripe
- **Admin Panel** — User management, analytics, and platform oversight

---

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | React, Vite, Tailwind CSS, Zustand, React Router |
| **Admin** | Angular 19, nginx |
| **Backend** | Node.js, Express, MongoDB, Mongoose, JWT |
| **AI** | Langflow 1.9, Google Gemini, Serper (search) |
| **Storage** | MongoDB Atlas, Cloudinary |
| **Payments** | Stripe |
| **Email** | SendGrid (production), Gmail SMTP (local) |
| **Deployment** | Railway, Docker, nginx |

---
