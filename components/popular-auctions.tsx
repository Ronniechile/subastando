"use client"

import { TrendingUp, Eye } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PopularAuctionsProps {
  auctions: any[]
}

export default function PopularAuctions({ auctions }: PopularAuctionsProps) {
  // Ordenar por número de pujas (más populares)
  const popularAuctions = [...auctions]
    .sort((a, b) => {
      const bidsA = a.bids?.length || 0
      const bidsB = b.bids?.length || 0
      return bidsB - bidsA
    })
    .slice(0, 5) // Top 5

  if (popularAuctions.length === 0) {
    return null
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="w-5 h-5 text-orange-600" />
          Más Populares
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {popularAuctions.map((auction, index) => {
          const bidCount = auction.bids?.length || 0
          return (
            <Link
              key={auction.id}
              href={`/auction/${auction.id}`}
              className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {auction.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {bidCount} {bidCount === 1 ? 'puja' : 'pujas'}
                    </span>
                    <span className="text-xs font-semibold text-blue-600">
                      ${auction.current_price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}
