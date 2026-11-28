export interface Contact {
  id: string
  portfolio_id: string
  shop_name: string
  owner_name: string | null
  phone: string
  phone2: string | null
  wilaya: string | null
  commune: string | null
  address: string | null
  maps_url: string | null
  notes: string | null
}

export interface NewContactInput {
  shop_name: string
  owner_name: string | null
  phone: string
  phone2: string | null
  wilaya: string
  commune: string
  address: string | null
  maps_url: string | null
  notes: string | null
}