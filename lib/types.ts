export interface Auction {
  bids: boolean
  id: string
  title: string
  description: string
  image_url: string | null
  category_id: string | null
  seller_id: string
  starting_price: number
  current_price: number
  buy_now_price: number | null
  start_time: string
  end_time: string
  status: "active" | "ended" | "cancelled"
  winner_id: string | null
  created_at: string
  updated_at: string
}

export interface Bid {
  id: string
  auction_id: string
  bidder_id: string
  amount: number
  created_at: string
}

export interface Category {
  id: string
  name: string
  description: string | null
  emoji: string | null
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}
