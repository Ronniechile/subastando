import AuctionCard from "@/components/auction-card"

interface Auction {
  id: string
  title: string
  description: string
  image_url: string | null
  current_price: number
  starting_price: number
  end_time: string
  categories: {
    id: string
    name: string
  } | null
  profiles: {
    id: string
    full_name: string | null
    email: string
  } | null
  bids: {
    amount: number
  }[]
}

interface AuctionGridProps {
  auctions: Auction[]
}

export default function AuctionGrid({ auctions }: AuctionGridProps) {
  if (auctions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay subastas activas</h3>
        <p className="text-gray-500">Sé el primero en crear una subasta</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {auctions.map((auction) => (
        <AuctionCard key={auction.id} auction={auction} />
      ))}
    </div>
  )
}
