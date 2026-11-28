import { Link } from 'react-router-dom'
export default function AdminHome() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">لوحة الإدارة</h1>
      <Link to="/admin/portfolios" className="text-brand underline">إدارة الحقائب</Link>
    </main>
  )
}