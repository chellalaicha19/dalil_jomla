import { useAuth } from '../auth/useAuth'
import { useState } from 'react'
import { GeoSelect, type GeoValue } from '../components/GeoSelect'
import { Navigate } from 'react-router-dom'

export default function Home() {
  const { profile } = useAuth()

  // Still loading auth / profile
  if (!profile) {
    return (
      <main className="mx-auto max-w-md p-6">
        <p className="text-sm text-slate-500">جارٍ التحميل…</p>
      </main>
    )
  }

  if (profile.role === 'admin') {
    return <Navigate to="/admin/portfolios" replace />
  }

  return <TraderHome />
}

function TraderHome() {
  const { profile, signOut } = useAuth()
  const [geo, setGeo] = useState<GeoValue>({ wilaya: '', commune: '' })

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">مرحباً {profile?.full_name}</h1>
      <p className="mt-2 text-sm text-slate-500">
        {profile?.wilaya} · تاجر جملة
      </p>
      <button
        onClick={signOut}
        className="mt-6 rounded-xl bg-navy px-5 py-2 text-white"
      >
        تسجيل الخروج
      </button>
      <div className="mt-6 space-y-3">
        <GeoSelect
          value={geo}
          onChange={setGeo}
          wilayaPlaceholder="كل الولايات"
          communePlaceholder="كل البلديات"
        />
        <p className="text-sm">
          {geo.wilaya} / {geo.commune}
        </p>
      </div>
    </main>
  )
}