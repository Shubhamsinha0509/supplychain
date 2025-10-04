import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { UserProvider } from './contexts/UserContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import CreateBatch from './pages/CreateBatch'
import Analytics from './pages/Analytics'
import QualityReports from './pages/QualityReports'
import BatchDetails from './pages/BatchDetails'
import Scan from './pages/Scan'
import Pricing from './pages/Pricing'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'

function App() {
  return (
    <UserProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/new" element={
              <ProtectedRoute>
                <CreateBatch />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/reports" element={
              <ProtectedRoute>
                <QualityReports />
              </ProtectedRoute>
            } />
            <Route path="/batch/:id" element={
              <ProtectedRoute>
                <BatchDetails />
              </ProtectedRoute>
            } />
            <Route path="/scan" element={
              <ProtectedRoute>
                <Scan />
              </ProtectedRoute>
            } />
            <Route path="/pricing" element={
              <ProtectedRoute>
                <Pricing />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </UserProvider>
  )
}

export default App
