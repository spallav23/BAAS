import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getCurrentUser } from './store/slices/authSlice'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout/Layout'
import Landing from './pages/Landing/Landing'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import VerifyEmail from './pages/Auth/VerifyEmail'
import ForgotPassword from './pages/Auth/ForgotPassword'
import Dashboard from './pages/Dashboard/Dashboard'
import Clusters from './pages/Clusters/Clusters'
import ClusterDetail from './pages/Clusters/ClusterDetail'
import Documents from './pages/Documents/Documents'
import Profile from './pages/Profile/Profile'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, accessToken } = useSelector((state) => state.auth)

  useEffect(() => {
    if (accessToken && !isAuthenticated) {
      dispatch(getCurrentUser())
    }
  }, [dispatch, accessToken, isAuthenticated])

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Landing />}
      />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
      />
      <Route
        path="/verify-email"
        element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <VerifyEmail />
        }
      />
      <Route
        path="/forgot-password"
        element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <ForgotPassword />
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="clusters" element={<Clusters />} />
        <Route path="clusters/:clusterId" element={<ClusterDetail />} />
        <Route path="documents" element={<Documents />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* 404 */}
      <Route
        path="*"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" />
          ) : (
            <Navigate to="/" />
          )
        }
      />
    </Routes>
  )
}

export default App

