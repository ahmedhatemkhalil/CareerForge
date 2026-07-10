import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import AuthLayout from './components/layout/AuthLayout'
import ProtectedRoute from './components/common/ProtectedRoute'
import Landing from './pages/Landing/Landing'
import Analyze from './pages/Analyze/Analyze'
import MyCv from './pages/cv/cv'
import Interview from './pages/Interview/Interview'
import NewInterview from './pages/Interview/NewInterview'
import LiveInterview from './pages/Interview/LiveInterview'
import InterviewResult from './pages/Interview/InterviewResult'
import Roadmap from './pages/Roadmap/Roadmap'
import Dashboard from './pages/Dashboard/Dashboard'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import ForgotPassword from './pages/Login/ForgotPassword'
import ResetPassword from './pages/Login/ResetPassword'
import EmailVerification from './pages/Login/EmailVerification'
import VerifyNotice from './pages/Register/verify-notice'
import Profile from './pages/Profile/Profile'
import NewAnalysis from './pages/Analyze/NewAnalysis'
import AnalysisResults from './pages/Analyze/AnalysisResults'
import GoogleCallback from './pages/Login/GoogleCallback'
import NewRoadmap from './pages/Roadmap/NewRoadmap'
import RoadmapResults from './pages/Roadmap/RoadmapResults'
import PaymentSuccess from './pages/Payment/PaymentSuccess'
import Pricing from './pages/Pricing/Pricing'
import GuestRoute from './components/common/GuestRoute'
import EmailHistory from './pages/Email/EmailHistory'
import NewEmail from './pages/Email/NewEmail'
import EmailResult from './pages/Email/EmailResult'

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password/:token" element={<ResetPassword />} />
            <Route path="verify-email/:token" element={<EmailVerification />} />
            <Route path="register" element={<Register />} />
            <Route path="verify-notice" element={<VerifyNotice />} />
          </Route>
        </Route>

 <Route path="oauth/callback" element={<GoogleCallback />} />


        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="analyze" element={<Analyze />} />
            <Route path="cv" element={<MyCv />} />
            <Route path="interview" element={<Interview />} />
            <Route path="new-interview" element={<NewInterview />} />
            <Route path="live-interview/:sessionId" element={<LiveInterview />} />
            <Route path="interview/:sessionId/result" element={<InterviewResult />} /> 
            <Route path="roadmap" element={<Roadmap />} />
            <Route path="roadmap/result/:id" element={<RoadmapResults />} />
            <Route path="new-roadmap" element={<NewRoadmap />} />
            <Route path="analyze/results/:id" element={<AnalysisResults />} />
            <Route path="new-analysis" element={<NewAnalysis />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="email" element={<EmailHistory />} />
            <Route path="email/new" element={<NewEmail />} />
            <Route path="email/:id" element={<EmailResult />} />
          </Route>
        </Route>
        <Route path="payment/success" element={<PaymentSuccess />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

    </BrowserRouter>
  )
}

export default AppRouter
