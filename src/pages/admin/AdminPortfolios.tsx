import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listPortfolios, setPortfolioActive } from '../../lib/portfolios'
import { DURATION_LABELS } from '../../types/portfolio'
import type { PortfolioWithMeta } from '../../types/portfolio'
import { btnPrimary } from '../../ui/styles'

const fmt = new Intl.NumberFormat('en-US')

export default function AdminPortfolios() {
  const [items, setItems] = useState<PortfolioWithMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError('')
      setItems(await listPortfolios())
    } catch {
      setError('تعذّر تحميل الحقائب. حاول مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function toggleActive(p: PortfolioWithMeta) {
    setBusyId(p.id)
    try {
      await setPortfolioActive(p.id, !p.is_active)
      await load()
    } catch {
      setError('تعذّر تغيير حالة الحقيبة.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">الحقائب التجارية</h1>
          <p className="text-sm text-navy/60">إدارة الحقائب وأسعارها</p>
        </div>
        <Link to="/admin/portfolios/new" className={`${btnPrimary} !w-auto px-4`}>
          + حقيبة جديدة
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {loading && <p className="text-navy/60">جارٍ التحميل…</p>}

      {!loading && items.length === 0 && !error && (
        <div className="rounded-2xl border-2 border-dashed border-navy/20 p-8 text-center text-navy/60">
          لا توجد حقائب بعد. أنشئ أول حقيبة.
        </div>
      )}

      <div className="space-y-4">
        {items.map((p) => {
          const count = p.contacts?.[0]?.count ?? 0
          const prices = [...p.portfolio_prices].sort((a, b) => a.months - b.months)
          return (
            <div key={p.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-bold text-navy">{p.name}</h2>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    p.is_active ? 'bg-brand/10 text-brand' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {p.is_active ? 'منشورة' : 'غير منشورة'}
                </span>
              </div>

              {p.description && (
                <p className="mt-2 text-sm text-navy/70">{p.description}</p>
              )}

              <p className="mt-3 text-sm text-navy/80">
                <bdi className="font-bold">{fmt.format(count)}</bdi> محل معتمد
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {prices.length === 0 && (
                  <span className="text-sm text-amber-600">لم تُحدَّد أسعار بعد</span>
                )}
                {prices.map((pr) => (
                  <span
                    key={pr.id}
                    className="rounded-lg bg-soft px-3 py-1 text-sm text-navy"
                  >
                    {DURATION_LABELS[pr.months] ?? `${pr.months} أشهر`}:{' '}
                    <bdi className="font-bold">{fmt.format(pr.price_da)}</bdi> دج
                  </span>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <Link
                  to={`/admin/portfolios/${p.id}`}
                  className="flex-1 rounded-xl bg-navy px-4 py-2 text-center text-sm font-semibold text-white"
                >
                  تعديل
                </Link>
                <Link
  to={`/admin/portfolios/${p.id}/contacts`}
  className="flex-1 rounded-xl bg-soft px-4 py-2 text-center text-sm font-semibold text-navy"
>
  المحلات
</Link>
                <button
                  type="button"
                  onClick={() => void toggleActive(p)}
                  disabled={busyId === p.id}
                  className="rounded-xl border border-navy/20 px-4 py-2 text-sm font-semibold text-navy disabled:opacity-50"
                >
                  {p.is_active ? 'إيقاف النشر' : 'نشر'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}