import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import AuthLayout from './components/layout/AuthLayout'
import ProtectedRoute from './components/common/ProtectedRoute'
import Landing from './pages/Landing/Landing'
import Analyze from './pages/Analyze/Analyze'
import MyCv from './pages/cv/CV'
import Interview from './pages/Interview/Interview'
import Roadmap from './pages/Roadmap/Roadmap'
import Dashboard from './pages/Dashboard/Dashboard'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import ForgotPassword from './pages/Login/ForgotPassword'
import ResetPassword from './pages/Login/ResetPassword'
import EmailVerification from './pages/Login/EmailVerification'
import GithubCallback from './pages/Login/GithubCallback'
import GoogleCallback from './pages/Login/GoogleCallback'
import VerifyNotice from './pages/Register/verify-notice'
import Profile from './pages/Profile/Profile'

const ConditionalLayout = () => {
  const token = localStorage.getItem('token')

  if (token) {
    return <Layout />
  }

  return <Outlet />
}

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ConditionalLayout />}>
          <Route index element={<Landing />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
          <Route path="verify-email/:token" element={<EmailVerification />} />
          <Route path="register" element={<Register />} />
          <Route path="verify-notice" element={<VerifyNotice />} />
        </Route>

        <Route path="auth/callback" element={<GoogleCallback />} />
        <Route path="oauth/github/callback" element={<GithubCallback />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="analyze" element={<Analyze />} />
            <Route path="cv" element={<MyCv />} />
            <Route path="interview" element={<Interview />} />
            <Route path="roadmap" element={<Roadmap />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
