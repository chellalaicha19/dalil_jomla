import { useAuth } from '../auth/useAuth'

export default function Home() {
  const { profile, signOut } = useAuth()
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">مرحباً {profile?.full_name}</h1>
      <p className="mt-2 text-sm text-slate-500">
        {profile?.wilaya} · {profile?.role === 'admin' ? 'مشرف' : 'تاجر جملة'}
      </p>
      <button onClick={signOut} className="mt-6 rounded-xl bg-navy px-5 py-2 text-white">
        تسجيل الخروج
      </button>
    </main>
  )
}