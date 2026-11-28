import { supabase } from './supabase'
import type { Contact, NewContactInput } from '../types/contact'

export const PAGE_SIZE = 50

/** Returns the phone as 0XXXXXXXXX, or null if it is not a valid Algerian number. */
export function normalizePhone(raw: string): string | null {
  let d = raw
    .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x0660))
    .replace(/[\s.\-()]/g, '')
  if (d.startsWith('+213')) d = '0' + d.slice(4)
  else if (d.startsWith('00213')) d = '0' + d.slice(5)
  else if (d.startsWith('213') && d.length === 12) d = '0' + d.slice(3)
  if (/^0[567]\d{8}$/.test(d)) return d // mobile
  if (/^0[2349]\d{7}$/.test(d)) return d // landline
  return null
}

export function formatPhone(p: string): string {
  if (p.length === 10) return `${p.slice(0, 4)} ${p.slice(4, 6)} ${p.slice(6, 8)} ${p.slice(8)}`
  return p
}

export interface ContactFilters {
  portfolioId: string
  wilaya: string
  commune: string
  search: string
  page: number
}

export async function listContacts(f: ContactFilters): Promise<{ rows: Contact[]; total: number }> {
  const from = (f.page - 1) * PAGE_SIZE

  let q = supabase
    .from('contacts')
    .select('*', { count: 'exact' })
    .eq('portfolio_id', f.portfolioId)

  if (f.wilaya) q = q.eq('wilaya', f.wilaya)
  if (f.commune) q = q.eq('commune', f.commune)

  // remove characters that would break the PostgREST or() syntax
  const term = f.search.trim().replace(/[%,()*\\]/g, ' ').trim()
  if (term) {
    const text = `%${term}%`
    const digits = `%${term.replace(/\s/g, '')}%`
    q = q.or(
      `shop_name.ilike.${text},owner_name.ilike.${text},phone.ilike.${digits},phone2.ilike.${digits}`,
    )
  }

  const { data, count, error } = await q
    .order('shop_name')
    .order('id')
    .range(from, from + PAGE_SIZE - 1)

  if (error) throw error
  return { rows: (data ?? []) as Contact[], total: count ?? 0 }
}

export async function addContact(portfolioId: string, input: NewContactInput) {
  const { error } = await supabase.from('contacts').insert({ portfolio_id: portfolioId, ...input })
  if (error) {
    if (error.code === '23505') throw new Error('DUPLICATE')
    throw error
  }
}

export async function deleteContacts(ids: string[]) {
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50)
    const { error } = await supabase.from('contacts').delete().in('id', chunk)
    if (error) throw error
  }
}