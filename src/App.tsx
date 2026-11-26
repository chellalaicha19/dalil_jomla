import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import CompleteProfile from './pages/CompleteProfile'
import Home from './pages/Home'
import AdminHome from './pages/AdminHome'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<ProtectedRoute allowIncomplete />}>
        <Route path="/complete-profile" element={<CompleteProfile />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
      </Route>

      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin" element={<AdminHome />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}