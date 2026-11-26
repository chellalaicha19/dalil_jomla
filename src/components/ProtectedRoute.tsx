import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

type Props = { role?: 'admin'; allowIncomplete?: boolean }

export function ProtectedRoute({ role, allowIncomplete }: Props) {
  const { session, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        جاري التحميل...
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  const incomplete = !profile?.phone || !profile?.wilaya
  if (incomplete && !allowIncomplete) {
    return <Navigate to="/complete-profile" replace />
  }

  if (role === 'admin' && profile?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}