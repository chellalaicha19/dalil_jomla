import { useState } from 'react'
import type { FormEvent } from 'react'
import GeoFilter from '../../components/GeoFilter'
import { addContact, normalizePhone } from '../../lib/contacts'
import { btnPrimary, inputCls } from '../../ui/styles'

interface Props {
  portfolioId: string
  onAdded: () => void
  onClose: () => void
}

export default function ContactForm({ portfolioId, onAdded, onClose }: Props) {
  const [shopName, setShopName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [phone, setPhone] = useState('')
  const [phone2, setPhone2] = useState('')
  const [wilaya, setWilaya] = useState('')
  const [commune, setCommune] = useState('')
  const [address, setAddress] = useState('')
  const [mapsUrl, setMapsUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setOk('')

    if (shopName.trim().length < 2) return setError('اسم المحل مطلوب.')

    const p1 = normalizePhone(phone)
    if (!p1) return setError('رقم الهاتف غير صالح (مثال: 0550 12 34 56).')

    let p2: string | null = null
    if (phone2.trim() !== '') {
      p2 = normalizePhone(phone2)
      if (!p2) return setError('رقم الهاتف الثاني غير صالح.')
    }

    if (!wilaya || !commune) return setError('اختر الولاية والبلدية.')

    const url = mapsUrl.trim()
    if (url !== '' && !/^https?:\/\//i.test(url)) {
      return setError('رابط الخريطة يجب أن يبدأ بـ http أو https.')
    }

    setSaving(true)
    try {
      await addContact(portfolioId, {
        shop_name: shopName.trim(),
        owner_name: ownerName.trim() || null,
        phone: p1,
        phone2: p2,
        wilaya,
        commune,
        address: address.trim() || null,
        maps_url: url || null,
        notes: notes.trim() || null,
      })
      // keep wilaya/commune to speed up entering several shops in the same area
      setShopName('')
      setOwnerName('')
      setPhone('')
      setPhone2('')
      setAddress('')
      setMapsUrl('')
      setNotes('')
      setOk('تمت الإضافة ✓')
      onAdded()
    } catch (err) {
      if (err instanceof Error && err.message === 'DUPLICATE') {
        setError('هذا الرقم موجود مسبقًا في هذه الحقيبة.')
      } else {
        setError('تعذّرت الإضافة. حاول مرة أخرى.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="mb-6 space-y-3 rounded-2xl bg-white p-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-navy">إضافة محل</h2>
        <button type="button" onClick={onClose} className="text-sm text-navy/60">
          إغلاق
        </button>
      </div>

      <input className={inputCls} placeholder="اسم المحل *" value={shopName} onChange={(e) => setShopName(e.target.value)} />
      <input className={inputCls} placeholder="اسم المسؤول" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <input className={inputCls} dir="ltr" inputMode="tel" placeholder="الهاتف * 0550 12 34 56" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input className={inputCls} dir="ltr" inputMode="tel" placeholder="هاتف ثانٍ" value={phone2} onChange={(e) => setPhone2(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <GeoFilter wilaya={wilaya} commune={commune} placeholder="اختر" onChange={(w, c) => { setWilaya(w); setCommune(c) }} />
      </div>
      <input className={inputCls} placeholder="العنوان (نص)" value={address} onChange={(e) => setAddress(e.target.value)} />
      <input className={inputCls} dir="ltr" placeholder="رابط الخريطة (Google Maps)" value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} />
      <textarea className={inputCls} rows={2} placeholder="ملاحظات" value={notes} onChange={(e) => setNotes(e.target.value)} />

      {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {ok && <div className="rounded-xl bg-brand/10 p-3 text-sm text-brand">{ok}</div>}

      <button type="submit" disabled={saving} className={btnPrimary}>
        {saving ? 'جارٍ الحفظ…' : 'إضافة المحل'}
      </button>
    </form>
  )
}