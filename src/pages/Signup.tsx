import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/useAuth'
import { useWilayas } from '../hooks/useWilayas'
import { AuthLayout } from '../components/AuthLayout'
import { GoogleButton } from '../components/GoogleButton'
import { authErrorMessage } from '../lib/authErrors'
import { isValidMobile, normalizePhone } from '../lib/phone'
import { btnPrimary, inputCls } from '../ui/styles'

export default function Signup() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const wilayas = useWilayas()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [wilaya, setWilaya] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  if (session) return <Navigate to="/" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const cleanPhone = normalizePhone(phone)
    if (!isValidMobile(cleanPhone)) {
      setError('رقم الهاتف غير صحيح (مثال: 0550123456)')
      return
    }
    if (password.length < 8) {
      setError('كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل')
      return
    }
    setBusy(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName.trim(), phone: cleanPhone, wilaya } },
    })
    setBusy(false)
    if (error) {
      setError(authErrorMessage(error.message))
    } else if (data.session) {
      navigate('/', { replace: true })
    } else {
      setInfo('تم إنشاء الحساب. تحقق من بريدك الإلكتروني لتأكيد الحساب.')
    }
  }

  return (
    <AuthLayout title="إنشاء حساب" subtitle="سجّل للاطلاع على حقائب العملاء">
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          required placeholder="الاسم الكامل" className={inputCls}
          value={fullName} onChange={(e) => setFullName(e.target.value)}
        />
        <input
          type="tel" dir="ltr" required placeholder="رقم الهاتف (05 / 06 / 07)"
          className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)}
        />
        <select
          required className={inputCls} value={wilaya}
          onChange={(e) => setWilaya(e.target.value)}
        >
          <option value="">اختر الولاية</option>
          {wilayas.map((w) => (
            <option key={w.code} value={w.name_ar}>
              {w.code} - {w.name_ar}
            </option>
          ))}
        </select>
        <input
          type="email" dir="ltr" required placeholder="البريد الإلكتروني"
          className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password" dir="ltr" required placeholder="كلمة المرور (8 أحرف على الأقل)"
          className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-brand">{info}</p>}
        <button type="submit" disabled={busy} className={btnPrimary}>
          {busy ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
        </button>
      </form>

      <div className="my-4 text-center text-xs text-slate-400">أو</div>
      <GoogleButton />

      <p className="mt-5 text-center text-sm text-slate-600">
        لديك حساب؟{' '}
        <Link to="/login" className="font-semibold text-brand">تسجيل الدخول</Link>
      </p>
    </AuthLayout>
  )
}