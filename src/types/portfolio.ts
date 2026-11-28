export const DURATIONS = [1, 3, 6, 12] as const

export const DURATION_LABELS: Record<number, string> = {
  1: 'شهر واحد',
  3: '3 أشهر',
  6: '6 أشهر',
  12: 'سنة كاملة',
}

export interface PortfolioPrice {
  id: string
  portfolio_id: string
  months: number
  price_da: number
}

export interface Portfolio {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
}

export interface PortfolioWithPrices extends Portfolio {
  portfolio_prices: PortfolioPrice[]
}

export interface PortfolioWithMeta extends PortfolioWithPrices {
  contacts: { count: number }[]
}

export interface PortfolioInput {
  name: string
  description: string | null
  is_active: boolean
}