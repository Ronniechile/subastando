import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, TrendingUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import CountdownTimer from "@/components/countdown-timer"

interface Auction {
  id: string
  title: string
  description: string
  image_url: string | null
  current_price: number
  starting_price: number
  end_time: string
  status: "active" | "ended" | "cancelled"
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

interface AuctionCardProps {
  auction: Auction
}

export default function AuctionCard({ auction }: AuctionCardProps) {
  const bidCount = auction.bids.length
  const currentPrice = auction.current_price || auction.starting_price

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-0">
        <div className="relative h-48 bg-gray-100">
          {auction.image_url ? (
            <Image src={auction.image_url || "/placeholder.svg"} alt={auction.title} fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm text-gray-500">Sin imagen</p>
              </div>
            </div>
          )}

          {/* Category badge */}
          {auction.categories && (
            <Badge className="absolute top-3 left-3 bg-blue-600 hover:bg-blue-700">{auction.categories.name}</Badge>
          )}

          <div className="absolute top-3 right-3">
            <CountdownTimer endTime={auction.end_time} variant="badge" status={auction.status} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{auction.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{auction.description}</p>

        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-500">Precio actual</p>
            <p className="text-2xl font-bold text-green-600">${currentPrice.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Pujas</p>
            <p className="text-lg font-semibold flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              {bidCount}
            </p>
          </div>
        </div>

        {auction.profiles && (
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <User className="w-4 h-4 mr-1" />
            <span>Por {auction.profiles.full_name || auction.profiles.email}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link href={`/auction/${auction.id}`}>Ver Subasta</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export function AuctionCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <div className="h-48 bg-gray-200 animate-pulse" />
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-3" />
        <div className="flex justify-between mb-3">
          <div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-1 w-20" />
            <div className="h-8 bg-gray-200 rounded animate-pulse w-16" />
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-1 w-12" />
            <div className="h-6 bg-gray-200 rounded animate-pulse w-8" />
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-3 w-32" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="h-10 bg-gray-200 rounded animate-pulse w-full" />
      </CardFooter>
    </Card>
  )
}
