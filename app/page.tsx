import { createClient } from "@/lib/supabase/server"
import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import { getCategories } from "@/lib/actions"
import AuctionPageClient from "@/components/auction-page-client"
import Link from "next/link"
import Image from "next/image"

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getActiveAuctions() {
  const supabase = await createClient()

  const { data: auctions, error } = await supabase
    .from("auctions")
    .select(`
      *,
      categories (
        id,
        name
      ),
      profiles!seller_id (
        id,
        full_name,
        email
      ),
      bids (
        amount
      )
    `)
    .eq("status", "active")
    .gt("end_time", new Date().toISOString())
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching auctions:", error)
    return []
  }

  return auctions || []
}

export default async function HomePage() {
  const [auctions, categories] = await Promise.all([
    getActiveAuctions(),
    getCategories(),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <HeroSection 
          popularAuctions={
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              {auctions
                .sort((a: any, b: any) => {
                  const bidsA = a.bids?.length || 0
                  const bidsB = b.bids?.length || 0
                  return bidsB - bidsA
                })
                .slice(0, 3)
                .map((auction: any, index: number) => {
                  const bidCount = auction.bids?.length || 0
                  return (
                    <Link
                      key={auction.id}
                      href={`/auction/${auction.id}`}
                      className="block p-3 rounded-lg hover:bg-white/20 transition-colors mb-2 last:mb-0"
                    >
                      <div className="flex items-center gap-3">
                        {/* Imagen de la subasta */}
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-white/20 relative">
                          {auction.image_url ? (
                            <Image
                              src={auction.image_url}
                              alt={auction.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          {/* Badge de ranking */}
                          <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs border-2 border-white">
                            {index + 1}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-white truncate">
                            {auction.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-blue-100">
                              {bidCount} {bidCount === 1 ? 'puja' : 'pujas'}
                            </span>
                            <span className="text-xs font-semibold text-orange-300">
                              ${auction.current_price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
            </div>
          }
        />
        <AuctionPageClient initialAuctions={auctions} categories={categories} />
      </main>
    </div>
  )
}
