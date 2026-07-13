import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { UserDataProvider } from './context/UserDataContext'
import Layout from './components/layout/Layout'
import LoadingScreen from './components/ui/LoadingScreen'

const Login        = lazy(() => import('./pages/auth/Login'))
const Register     = lazy(() => import('./pages/auth/Register'))
const Dashboard    = lazy(() => import('./pages/Dashboard'))
const Expenses     = lazy(() => import('./pages/Expenses'))
const Budgets      = lazy(() => import('./pages/Budgets'))
const Goals        = lazy(() => import('./pages/Goals'))
const Wallet       = lazy(() => import('./pages/Wallet'))
const Analytics    = lazy(() => import('./pages/Analytics'))
const SocialImpact = lazy(() => import('./pages/SocialImpact'))
const AICoach      = lazy(() => import('./pages/AICoach'))
const Profile      = lazy(() => import('./pages/Profile'))
const AdminPanel   = lazy(() => import('./pages/AdminPanel'))
const FinancialJourney = lazy(() => import('./pages/FinancialJourney'))
const StudentMode      = lazy(() => import('./pages/StudentMode'))

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user)   return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user)    return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/"         element={<Navigate to="/dashboard" replace />} />
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="dashboard"     element={<Dashboard />} />
          <Route path="expenses"      element={<Expenses />} />
          <Route path="budgets"       element={<Budgets />} />
          <Route path="goals"         element={<Goals />} />
          <Route path="wallet"        element={<Wallet />} />
          <Route path="analytics"     element={<Analytics />} />
          <Route path="social-impact" element={<SocialImpact />} />
          <Route path="ai-coach"      element={<AICoach />} />
          <Route path="profile"       element={<Profile />} />
          <Route path="admin"         element={<AdminPanel />} />
          <Route path="journey"       element={<FinancialJourney />} />
          <Route path="student"       element={<StudentMode />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <UserDataProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1C1C1E',
                  color: '#F5F5F7',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '14px',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: '500',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                  padding: '14px 18px',
                },
                success: { iconTheme: { primary: '#30D158', secondary: '#1C1C1E' } },
                error:   { iconTheme: { primary: '#FF453A', secondary: '#1C1C1E' } },
              }}
            />
          </UserDataProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
