import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Header from "@/components/header"
import AuctionDetails from "@/components/auction-details"
import BidForm from "@/components/bid-form"
import BidHistory from "@/components/bid-history"
import AuctionStatusBanner from "@/components/auction-status-banner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

async function getAuction(id: string) {
  const supabase = await createClient()

  const { data: auction, error } = await supabase
    .from("auctions")
    .select(`
      *,
      categories (
        id,
        name,
        description
      ),
      profiles!seller_id (
        id,
        full_name,
        email
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching auction:", error)
    return null
  }

  return auction
}

async function getBids(auctionId: string) {
  const supabase = await createClient()

  const { data: bids, error } = await supabase
    .from("bids")
    .select(`
      *,
      profiles!bidder_id (
        id,
        full_name,
        email,
        is_anonymous
      )
    `)
    .eq("auction_id", auctionId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching bids:", error)
    return []
  }

  return bids || []
}

async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

interface AuctionPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AuctionPage({ params }: AuctionPageProps) {
  const { id } = await params
  const [auction, bids, user] = await Promise.all([getAuction(id), getBids(id), getCurrentUser()])

  if (!auction) {
    notFound()
  }

  const isOwner = user?.id === auction.seller_id
  const isActive = auction.status === "active" && new Date(auction.end_time) > new Date()
  const currentPrice = bids.length > 0 ? Math.max(...bids.map((bid) => bid.amount)) : auction.starting_price
  const winner = bids.length > 0 ? bids[0] : null

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <AuctionStatusBanner
            endTime={auction.end_time}
            isActive={isActive}
            hasWinner={!!winner}
            winnerName={winner?.profiles?.full_name || winner?.profiles?.email}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main auction details */}
          <div className="lg:col-span-2">
            <AuctionDetails auction={auction} currentPrice={currentPrice} bids={bids} />
          </div>

          {/* Sidebar with bidding */}
          <div className="space-y-6">
            {/* Bid form */}
            {isActive && !isOwner && user && (
              <Card>
                <CardHeader>
                  <CardTitle>Hacer Puja</CardTitle>
                </CardHeader>
                <CardContent>
                  <BidForm 
                    auctionId={auction.id} 
                    currentPrice={currentPrice} 
                    userId={user.id}
                    buyNowPrice={auction.buy_now_price}
                  />
                </CardContent>
              </Card>
            )}

            {/* Status messages */}
            {!isActive && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-red-600">Subasta Finalizada</p>
                    {bids.length > 0 && (
                      <p className="text-sm text-gray-600 mt-2">
                        Precio final: <span className="font-bold">${currentPrice.toFixed(2)}</span>
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {isOwner && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-blue-600">Tu Subasta</p>
                    <p className="text-sm text-gray-600 mt-2">No puedes pujar en tu propia subasta</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {!user && isActive && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-600">Inicia sesión para pujar</p>
                    <a href="/auth/login" className="text-blue-600 hover:underline mt-2 inline-block">
                      Iniciar sesión
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bid history - Solo visible para usuarios autenticados */}
            {user ? (
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Pujas</CardTitle>
                </CardHeader>
                <CardContent>
                  <BidHistory bids={bids} />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Pujas</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <p className="text-gray-600 mb-4">Inicia sesión para ver el historial de pujas</p>
                  <a href="/auth/login" className="text-blue-600 hover:underline font-medium">
                    Iniciar sesión
                  </a>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
