import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from './LoadingSpinner'

export default function PrivateRoute() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  return user ? <Outlet /> : <Navigate to="/admin/login" replace />
}
