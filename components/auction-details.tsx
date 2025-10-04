import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Tag, Calendar, TrendingUp } from "lucide-react"
import Image from "next/image"
import CountdownTimer from "@/components/countdown-timer"

interface AuctionDetailsProps {
  auction: {
    id: string
    title: string
    description: string
    image_url: string | null
    starting_price: number
    end_time: string
    created_at: string
    status: "active" | "ended" | "cancelled"
    buy_now_price?: number // Campo agregado
    categories: {
      id: string
      name: string
      description: string | null
    } | null
    profiles: {
      id: string
      full_name: string | null
      email: string
    } | null
  }
  currentPrice: number
  bids: any[]
}

export default function AuctionDetails({ auction, currentPrice, bids }: AuctionDetailsProps) {
  const isActive = auction.status === "active" && new Date(auction.end_time) > new Date()

  return (
    <div className="space-y-6">
      {/* Main image and basic info */}
      <Card>
        <CardContent className="p-0">
          <div className="relative h-96 bg-gray-100 rounded-t-lg overflow-hidden">
            {auction.image_url ? (
              <Image src={auction.image_url || "/placeholder.svg"} alt={auction.title} fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-500">Sin imagen disponible</p>
                </div>
              </div>
            )}

            {/* Status badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {auction.categories && (
                <Badge className="bg-blue-600 hover:bg-blue-700">
                  <Tag className="w-3 h-3 mr-1" />
                  {auction.categories.name}
                </Badge>
              )}
            </div>
          </div>

          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{auction.title}</h1>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tiempo Restante</h3>
              <CountdownTimer endTime={auction.end_time} variant="large" status={auction.status} />
            </div>

            {/* Price and stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-500 mb-1">Precio Actual</p>
                <p className="text-3xl font-bold text-green-600">${currentPrice.toFixed(2)}</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-500 mb-1">Precio Inicial</p>
                <p className="text-xl font-semibold text-gray-700">${auction.starting_price.toFixed(2)}</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-500 mb-1">Total de Pujas</p>
                <p className="text-xl font-semibold text-gray-700 flex items-center justify-center md:justify-start">
                  <TrendingUp className="w-5 h-5 mr-1" />
                  {bids.length}
                </p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-500 mb-1">Precio Compra Inmediata</p>
                <p className="text-3xl font-bold text-yellow-500 animate-pulse">
                  ${auction.buy_now_price?.toFixed(2) || "N/A"}
                </p>
              </div>
            </div>

            {/* Seller info */}
            {auction.profiles && (
              <div className="flex items-center text-gray-600 mb-4">
                <User className="w-5 h-5 mr-2" />
                <span>
                  Vendido por{" "}
                  <span className="font-medium">{auction.profiles.full_name || auction.profiles.email}</span>
                </span>
              </div>
            )}

            {/* Created date */}
            <div className="flex items-center text-gray-600 mb-6">
              <Calendar className="w-5 h-5 mr-2" />
              <span>Publicado el {new Date(auction.created_at).toLocaleDateString("es-ES")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Descripción</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{auction.description}</p>
        </CardContent>
      </Card>
    </div>
  )
}
