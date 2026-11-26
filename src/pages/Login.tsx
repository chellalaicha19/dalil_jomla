import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/useAuth'
import { AuthLayout } from '../components/AuthLayout'
import { GoogleButton } from '../components/GoogleButton'
import { authErrorMessage } from '../lib/authErrors'
import { btnPrimary, inputCls } from '../ui/styles'

export default function Login() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (session) return <Navigate to={from} replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) setError(authErrorMessage(error.message))
    else navigate(from, { replace: true })
  }

  return (
    <AuthLayout title="تسجيل الدخول" subtitle="مرحباً بعودتك إلى دليل جملة">
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email" dir="ltr" required placeholder="البريد الإلكتروني"
          className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password" dir="ltr" required placeholder="كلمة المرور"
          className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={busy} className={btnPrimary}>
          {busy ? 'جاري الدخول...' : 'دخول'}
        </button>
      </form>

      <div className="my-4 text-center text-xs text-slate-400">أو</div>
      <GoogleButton />

      <p className="mt-5 text-center text-sm text-slate-600">
        ليس لديك حساب؟{' '}
        <Link to="/signup" className="font-semibold text-brand">إنشاء حساب</Link>
      </p>
    </AuthLayout>
  )
}