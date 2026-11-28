import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import CompleteProfile from './pages/CompleteProfile'
import Home from './pages/Home'
import AdminPortfolios from './pages/admin/AdminPortfolios'
import PortfolioForm from './pages/admin/PortfolioForm'
import AdminContacts from './pages/admin/AdminContacts'

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
        <Route path="/admin" element={<Navigate to="/admin/portfolios" replace />} />
        <Route path="/admin/portfolios" element={<AdminPortfolios />} />
        <Route path="/admin/portfolios/new" element={<PortfolioForm />} />
        <Route path="/admin/portfolios/:id" element={<PortfolioForm />} />
        <Route path="/admin/portfolios/:id/contacts" element={<AdminContacts />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}