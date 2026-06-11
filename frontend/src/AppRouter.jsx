import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import AuthLayout from './components/layout/AuthLayout'
import ProtectedRoute from './components/common/ProtectedRoute'
import Landing from './pages/Landing/Landing'
import Analyze from './pages/Analyze/Analyze'
import Interview from './pages/Interview/Interview'
import Roadmap from './pages/Roadmap/Roadmap'
import RoadmapResult from './pages/Roadmap/RoadmapResult'
import Dashboard from './pages/Dashboard/Dashboard'
import Login from './pages/Login/login'
import Register from './pages/Register/Register'
import ForgotPassword from './pages/Login/ForgotPassword'
import ResetPassword from './pages/Login/ResetPassword'
import EmailVerification from './pages/Login/EmailVerification'

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

         <Route element={<AuthLayout />}>
         <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />}/>
          <Route path="reset-password/:token" element={<ResetPassword />}/>
          <Route path="verify-email/:token" element={<EmailVerification />}/>
          <Route path="register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
           </Route>
        <Route path="/" element={<Layout />}>
         
            <Route path="analyze" element={<Analyze />} />
            <Route path="interview" element={<Interview />} />
            <Route path="roadmap" element={<Roadmap />} />
            <Route path="roadmap/result" element={<RoadmapResult />} />
            <Route path="dashboard" element={<Dashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
