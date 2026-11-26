import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export type Wilaya = { code: number; name_ar: string }

export function useWilayas() {
  const [wilayas, setWilayas] = useState<Wilaya[]>([])

  useEffect(() => {
    supabase
      .from('wilayas')
      .select('code, name_ar')
      .order('code')
      .then(({ data }) => setWilayas((data as Wilaya[] | null) ?? []))
  }, [])

  return wilayas
}