import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/common/ProtectedRoute'
import Landing from './pages/Landing/Landing'
import Analyze from './pages/Analyze/Analyze'
import Interview from './pages/Interview/Interview'
import Roadmap from './pages/Roadmap/Roadmap'
import Dashboard from './pages/Dashboard/Dashboard'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="analyze" element={<Analyze />} />
            <Route path="interview" element={<Interview />} />
            <Route path="roadmap" element={<Roadmap />} />
            <Route path="dashboard" element={<Dashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
