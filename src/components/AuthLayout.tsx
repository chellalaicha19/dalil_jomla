import type { ReactNode } from 'react'

export function AuthLayout({ title, subtitle, children }: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-8">
      <div className="mb-6 flex items-center justify-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-xl font-bold text-white">
          د
        </div>
        <div>
          <div className="text-xl font-bold">دليل جملة</div>
          <div className="text-xs text-slate-500">سوق الجملة الجزائري</div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        <div className="mt-5">{children}</div>
      </div>
    </main>
  )
}