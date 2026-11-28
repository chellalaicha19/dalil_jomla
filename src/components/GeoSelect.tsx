import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useWilayas } from '../hooks/useWilayas'
import { inputCls } from '../ui/styles'

export type GeoValue = { wilaya: string; commune: string }

type Props = {
  value: GeoValue
  onChange: (value: GeoValue) => void
  wilayaPlaceholder?: string
  communePlaceholder?: string
  required?: boolean
}

export function GeoSelect({
  value,
  onChange,
  wilayaPlaceholder = 'اختر الولاية',
  communePlaceholder = 'اختر البلدية',
  required,
}: Props) {
  const wilayas = useWilayas()
  const [loaded, setLoaded] = useState<{ code: number; names: string[] } | null>(null)

  const wilayaCode = wilayas.find((w) => w.name_ar === value.wilaya)?.code

  useEffect(() => {
    if (wilayaCode === undefined) return
    let cancelled = false
    supabase
      .from('communes')
      .select('name_ar')
      .eq('wilaya_code', wilayaCode)
      .order('name_ar')
      .then(({ data }) => {
        if (cancelled) return
        const names = ((data as { name_ar: string }[] | null) ?? []).map((c) => c.name_ar)
        setLoaded({ code: wilayaCode, names })
      })
    return () => {
      cancelled = true
    }
  }, [wilayaCode])

  // Only show communes that belong to the currently selected wilaya
  const communes = loaded && loaded.code === wilayaCode ? loaded.names : []

  return (
    <>
      <select
        required={required}
        className={inputCls}
        value={value.wilaya}
        onChange={(e) => onChange({ wilaya: e.target.value, commune: '' })}
      >
        <option value="">{wilayaPlaceholder}</option>
        {wilayas.map((w) => (
          <option key={w.code} value={w.name_ar}>
            {w.code} - {w.name_ar}
          </option>
        ))}
      </select>

      <select
        required={required}
        disabled={!value.wilaya}
        className={inputCls}
        value={value.commune}
        onChange={(e) => onChange({ ...value, commune: e.target.value })}
      >
        <option value="">{communePlaceholder}</option>
        {communes.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </>
  )
}