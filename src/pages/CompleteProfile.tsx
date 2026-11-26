import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/useAuth'
import { useWilayas } from '../hooks/useWilayas'
import { AuthLayout } from '../components/AuthLayout'
import { isValidMobile, normalizePhone } from '../lib/phone'
import { btnPrimary, inputCls } from '../ui/styles'

export default function CompleteProfile() {
  const { session, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const wilayas = useWilayas()

  const [phone, setPhone] = useState('')
  const [wilaya, setWilaya] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const cleanPhone = normalizePhone(phone)
    if (!isValidMobile(cleanPhone)) {
      setError('رقم الهاتف غير صحيح (مثال: 0550123456)')
      return
    }
    if (!session) return
    setBusy(true)
    const { error } = await supabase
      .from('profiles')
      .update({ phone: cleanPhone, wilaya })
      .eq('id', session.user.id)
    if (error) {
      setBusy(false)
      setError('حدث خطأ، حاول مرة أخرى')
      return
    }
    await refreshProfile()
    navigate('/', { replace: true })
  }

  return (
    <AuthLayout title="أكمل بياناتك" subtitle="نحتاج رقم هاتفك وولايتك للمتابعة">
      <form onSubmit={onSubmit} className="space-y-3">
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
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={busy} className={btnPrimary}>
          {busy ? 'جاري الحفظ...' : 'متابعة'}
        </button>
      </form>
    </AuthLayout>
  )
}