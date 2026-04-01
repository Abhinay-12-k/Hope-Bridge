import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from './LoadingSpinner'
import { ShieldAlert } from 'lucide-react'

export default function PrivateRoute() {
  const { user, isAdmin, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  
  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold text-primary mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            Your account does not have active administrative privileges. Contact a superadmin if you believe this is an error.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-primary text-white py-3 rounded-xl font-medium"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    )
  }

  return <Outlet />
}
