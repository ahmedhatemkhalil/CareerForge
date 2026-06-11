import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import AuthLayout from './components/layout/AuthLayout'
import ProtectedRoute from './components/common/ProtectedRoute'
import Landing from './pages/Landing/Landing'
import Analyze from './pages/Analyze/Analyze'
import Interview from './pages/Interview/Interview'
import Roadmap from './pages/Roadmap/Roadmap'
import Dashboard from './pages/Dashboard/Dashboard'
import Profile from './pages/Profile/Profile'
import Login from './pages/Login/login'
import Register from './pages/Register/Register'
import ForgotPassword from './pages/Login/ForgotPassword'
import ResetPassword from './pages/Login/ResetPassword'
import EmailVerification from './pages/Login/EmailVerification'
import GithubCallback from './pages/Login/GithubCallback'
import GoogleCallback from './pages/Login/GoogleCallback'
import VerifyNotice from './pages/Register/verify-notice'

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
         <Route element={<AuthLayout />}>
         <Route path="login" element={<Login />} />
         <Route path="/auth/callback" element={<GoogleCallback />} />
          <Route path="forgot-password" element={<ForgotPassword />}/>
          <Route path="reset-password/:token" element={<ResetPassword />}/>
          <Route path="verify-email/:token" element={<EmailVerification />}/>
          <Route path="register" element={<Register />} />
          <Route path="/verify-notice" element={<VerifyNotice />}
/>
          <Route
  path="/oauth/github/callback"
  element={<GithubCallback />}
/>
          <Route element={<ProtectedRoute />}>
           </Route>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
         
            <Route path="analyze" element={<Analyze />} />
            <Route path="interview" element={<Interview />} />
            <Route path="roadmap" element={<Roadmap />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
