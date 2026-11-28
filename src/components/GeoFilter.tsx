import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { inputCls } from '../ui/styles'

interface Wilaya {
  code: string | number
  name_ar: string
}
interface Commune {
  code: string | number
  name_ar: string
}

interface Props {
  wilaya: string
  commune: string
  onChange: (wilaya: string, commune: string) => void
  placeholder?: string
}

export default function GeoFilter({ wilaya, commune, onChange, placeholder = 'الكل' }: Props) {
  const [wilayas, setWilayas] = useState<Wilaya[]>([])
  const [loaded, setLoaded] = useState<{ code: string | number; list: Commune[] } | null>(null)

  useEffect(() => {
    let cancelled = false
    void supabase
      .from('wilayas')
      .select('code,name_ar')
      .order('code')
      .then(({ data }) => {
        if (!cancelled) setWilayas((data ?? []) as Wilaya[])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const selectedCode = wilayas.find((w) => w.name_ar === wilaya)?.code

  useEffect(() => {
    if (selectedCode === undefined) return
    let cancelled = false
    void supabase
      .from('communes')
      .select('code,name_ar')
      .eq('wilaya_code', selectedCode)
      .order('name_ar')
      .then(({ data }) => {
        if (!cancelled) setLoaded({ code: selectedCode, list: (data ?? []) as Commune[] })
      })
    return () => {
      cancelled = true
    }
  }, [selectedCode])

  const communes =
    selectedCode !== undefined && loaded?.code === selectedCode ? loaded.list : []

  return (
    <>
      <select
        className={inputCls}
        value={wilaya}
        onChange={(e) => onChange(e.target.value, '')}
      >
        <option value="">{placeholder} (الولاية)</option>
        {wilayas.map((w) => (
          <option key={String(w.code)} value={w.name_ar}>
            {w.name_ar}
          </option>
        ))}
      </select>

      <select
        className={inputCls}
        value={commune}
        disabled={!wilaya}
        onChange={(e) => onChange(wilaya, e.target.value)}
      >
        <option value="">{placeholder} (البلدية)</option>
        {communes.map((c) => (
          <option key={String(c.code)} value={c.name_ar}>
            {c.name_ar}
          </option>
        ))}
      </select>
    </>
  )
}