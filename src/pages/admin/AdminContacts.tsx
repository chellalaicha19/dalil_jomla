import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import GeoFilter from '../../components/GeoFilter'
import { PAGE_SIZE, deleteContacts, formatPhone, listContacts } from '../../lib/contacts'
import { getPortfolio } from '../../lib/portfolios'
import type { Contact } from '../../types/contact'
import { inputCls } from '../../ui/styles'
import ContactForm from './ContactForm'

const fmt = new Intl.NumberFormat('en-US')

export default function AdminContacts() {
  const { id: portfolioId = '' } = useParams()

  const [portfolioName, setPortfolioName] = useState('')
  const [wilaya, setWilaya] = useState('')
  const [commune, setCommune] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState<Contact[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showForm, setShowForm] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  // portfolio name for the header
  useEffect(() => {
    if (!portfolioId) return
    getPortfolio(portfolioId)
      .then((p) => setPortfolioName(p.name))
      .catch(() => setPortfolioName(''))
  }, [portfolioId])

  // debounce the search box
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  // load the current page
  useEffect(() => {
    if (!portfolioId) return
    let cancelled = false
    setLoading(true)
    listContacts({ portfolioId, wilaya, commune, search, page })
      .then(({ rows: r, total: t }) => {
        if (cancelled) return
        if (r.length === 0 && page > 1) {
          setPage(page - 1) // we deleted the last rows of the last page
          return
        }
        setRows(r)
        setTotal(t)
        setSelected(new Set())
        setError('')
      })
      .catch(() => {
        if (!cancelled) setError('تعذّر تحميل المحلات.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [portfolioId, wilaya, commune, search, page, reloadKey])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id))

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)))
  }

  async function remove(ids: string[], message: string) {
    if (!window.confirm(message)) return
    try {
      await deleteContacts(ids)
      setReloadKey((k) => k + 1)
    } catch {
      setError('تعذّر الحذف.')
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-4">
      <Link to="/admin/portfolios" className="text-sm text-brand">
        ← العودة إلى الحقائب
      </Link>

      <div className="mb-4 mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">{portfolioName || 'المحلات'}</h1>
          <p className="text-sm text-navy/60">
            <bdi className="font-bold">{fmt.format(total)}</bdi> محل
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white"
        >
          + إضافة محل
        </button>
      </div>

      {showForm && (
        <ContactForm
          portfolioId={portfolioId}
          onAdded={() => setReloadKey((k) => k + 1)}
          onClose={() => setShowForm(false)}
        />
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <input
          className={inputCls}
          placeholder="بحث: اسم المحل، المسؤول، الهاتف"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <GeoFilter
          wilaya={wilaya}
          commune={commune}
          onChange={(w, c) => {
            setWilaya(w)
            setCommune(c)
            setPage(1)
          }}
        />
      </div>

      {selected.size > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-xl bg-red-50 p-3">
          <span className="text-sm text-red-700">
            تم تحديد <bdi className="font-bold">{selected.size}</bdi> محل
          </span>
          <button
            type="button"
            onClick={() =>
              void remove([...selected], `حذف ${selected.size} محل نهائيًا؟ لا يمكن التراجع.`)
            }
            className="rounded-lg bg-red-600 px-3 py-1 text-sm font-semibold text-white"
          >
            حذف المحدد
          </button>
        </div>
      )}

      {error && <div className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-start text-sm">
          <thead className="bg-soft text-navy">
            <tr>
              <th className="p-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="size-4 accent-[#0a7a4b]"
                />
              </th>
              <th className="p-3 text-start">المحل</th>
              <th className="p-3 text-start">المسؤول</th>
              <th className="p-3 text-start">الهاتف</th>
              <th className="p-3 text-start">الولاية / البلدية</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-navy/60">
                  جارٍ التحميل…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-navy/60">
                  لا توجد محلات.
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((c) => (
                <tr key={c.id} className="border-t border-navy/10">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggleOne(c.id)}
                      className="size-4 accent-[#0a7a4b]"
                    />
                  </td>
                  <td className="p-3 font-semibold text-navy">{c.shop_name}</td>
                  <td className="p-3 text-navy/80">{c.owner_name ?? '—'}</td>
                  <td className="p-3">
                    <bdi dir="ltr">{formatPhone(c.phone)}</bdi>
                    {c.phone2 && (
                      <div className="text-xs text-navy/60">
                        <bdi dir="ltr">{formatPhone(c.phone2)}</bdi>
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-navy/80">
                    {c.wilaya ?? '—'} / {c.commune ?? '—'}
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => void remove([c.id], `حذف «${c.shop_name}» نهائيًا؟`)}
                      className="text-sm text-red-600"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          disabled={page <= 1 || loading}
          onClick={() => setPage((p) => p - 1)}
          className="rounded-lg border border-navy/20 px-4 py-2 text-sm disabled:opacity-40"
        >
          السابق
        </button>
        <span className="text-sm text-navy/70">
          صفحة <bdi>{page}</bdi> من <bdi>{totalPages}</bdi>
        </span>
        <button
          type="button"
          disabled={page >= totalPages || loading}
          onClick={() => setPage((p) => p + 1)}
          className="rounded-lg border border-navy/20 px-4 py-2 text-sm disabled:opacity-40"
        >
          التالي
        </button>
      </div>
    </div>
  )
}