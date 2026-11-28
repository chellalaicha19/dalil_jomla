import { supabase } from './supabase'
import type {
  PortfolioInput,
  PortfolioWithMeta,
  PortfolioWithPrices,
} from '../types/portfolio'

export async function listPortfolios(): Promise<PortfolioWithMeta[]> {
  const { data, error } = await supabase
    .from('portfolios')
    .select('*, portfolio_prices(*), contacts(count)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as PortfolioWithMeta[]
}

export async function getPortfolio(id: string): Promise<PortfolioWithPrices> {
  const { data, error } = await supabase
    .from('portfolios')
    .select('*, portfolio_prices(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as PortfolioWithPrices
}

export async function setPortfolioActive(id: string, isActive: boolean) {
  const { error } = await supabase
    .from('portfolios')
    .update({ is_active: isActive })
    .eq('id', id)
  if (error) throw error
}

/**
 * Creates or updates a portfolio and its prices.
 * prices: months -> price in DA, or null when that duration is not offered.
 * Returns the portfolio id.
 */
export async function savePortfolio(
  id: string | null,
  input: PortfolioInput,
  prices: Record<number, number | null>,
): Promise<string> {
  let portfolioId = id

  if (portfolioId) {
    const { error } = await supabase
      .from('portfolios')
      .update(input)
      .eq('id', portfolioId)
    if (error) throw error
  } else {
    const { data, error } = await supabase
      .from('portfolios')
      .insert(input)
      .select('id')
      .single()
    if (error) throw error
    portfolioId = data.id as string
  }

  const toUpsert: { portfolio_id: string; months: number; price_da: number }[] = []
  const toDelete: number[] = []

  for (const [monthsStr, price] of Object.entries(prices)) {
    const months = Number(monthsStr)
    if (price === null) toDelete.push(months)
    else toUpsert.push({ portfolio_id: portfolioId, months, price_da: price })
  }

  if (toUpsert.length > 0) {
    const { error } = await supabase
      .from('portfolio_prices')
      .upsert(toUpsert, { onConflict: 'portfolio_id,months' })
    if (error) throw error
  }

  if (toDelete.length > 0) {
    const { error } = await supabase
      .from('portfolio_prices')
      .delete()
      .eq('portfolio_id', portfolioId)
      .in('months', toDelete)
    if (error) throw error
  }

  return portfolioId
}