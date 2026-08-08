import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

// Protected Route Guard
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to the correct dashboard for the user's role instead of home
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />
    if (role === 'seller') return <Navigate to="/seller/dashboard" replace />
    return <Navigate to="/" replace />
  }

  return children
}

// Role-based Redirect component for the root path
export const RoleRedirect = () => {
  const { isAuthenticated, role } = useAuthStore()
  
  if (!isAuthenticated) return null
  
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />
  if (role === 'seller') return <Navigate to="/seller/dashboard" replace />
  
  return null
}
