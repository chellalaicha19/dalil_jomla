import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getPortfolio, savePortfolio } from '../../lib/portfolios'
import { DURATIONS, DURATION_LABELS } from '../../types/portfolio'
import { btnPrimary, inputCls } from '../../ui/styles'

export default function PortfolioForm() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [prices, setPrices] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    let cancelled = false
    getPortfolio(id)
      .then((p) => {
        if (cancelled) return
        setName(p.name)
        setDescription(p.description ?? '')
        setIsActive(p.is_active)
        const map: Record<number, string> = {}
        for (const pr of p.portfolio_prices) map[pr.months] = String(pr.price_da)
        setPrices(map)
      })
      .catch(() => {
        if (!cancelled) setError('تعذّر تحميل الحقيبة.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const cleanName = name.trim()
    if (cleanName.length < 3) {
      setError('اسم الحقيبة قصير جدًا (3 أحرف على الأقل).')
      return
    }

    const parsed: Record<number, number | null> = {}
    let filled = 0
    for (const m of DURATIONS) {
      const raw = (prices[m] ?? '').trim()
      if (raw === '') {
        parsed[m] = null
        continue
      }
      const n = Number(raw)
      if (!Number.isInteger(n) || n <= 0) {
        setError(`السعر غير صالح لمدة: ${DURATION_LABELS[m]}`)
        return
      }
      parsed[m] = n
      filled++
    }

    if (isActive && filled === 0) {
      setError('لا يمكن نشر حقيبة بدون سعر واحد على الأقل.')
      return
    }

    setSaving(true)
    try {
      await savePortfolio(
        id ?? null,
        {
          name: cleanName,
          description: description.trim() === '' ? null : description.trim(),
          is_active: isActive,
        },
        parsed,
      )
      navigate('/admin/portfolios')
    } catch {
      setError('تعذّر الحفظ. تحقق من الاتصال وحاول مرة أخرى.')
      setSaving(false)
    }
  }

  if (loading) return <p className="p-4 text-navy/60">جارٍ التحميل…</p>

  return (
    <div className="mx-auto max-w-xl p-4">
      <Link to="/admin/portfolios" className="text-sm text-brand">
        ← العودة إلى الحقائب
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold text-navy">
        {id ? 'تعديل الحقيبة' : 'حقيبة جديدة'}
      </h1>

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-semibold text-navy">اسم الحقيبة</label>
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: حقيبة محلات الهواتف والصيانة"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-navy">الوصف</label>
          <textarea
            className={inputCls}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="ماذا تضم هذه الحقيبة؟ ولمن تناسب؟"
          />
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-navy">
            الأسعار (دج) — اترك الخانة فارغة إذا لم تُعرض هذه المدة
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {DURATIONS.map((m) => (
              <div key={m}>
                <label className="mb-1 block text-xs text-navy/70">{DURATION_LABELS[m]}</label>
                <input
                  className={inputCls}
                  dir="ltr"
                  inputMode="numeric"
                  placeholder="0"
                  value={prices[m] ?? ''}
                  onChange={(e) =>
                    setPrices((prev) => ({ ...prev, [m]: e.target.value.replace(/\D/g, '') }))
                  }
                />
              </div>
            ))}
          </div>
        </fieldset>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="size-5 accent-[#0a7a4b]"
          />
          <span className="text-sm text-navy">منشورة (ظاهرة للتجار)</span>
        </label>

        {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <button type="submit" disabled={saving} className={btnPrimary}>
          {saving ? 'جارٍ الحفظ…' : 'حفظ'}
        </button>
      </form>
    </div>
  )
}