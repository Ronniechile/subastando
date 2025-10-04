import { createClient } from "@/lib/supabase/server"
import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import { getCategories } from "@/lib/actions"
import AuctionPageClient from "@/components/auction-page-client"
import Link from "next/link"

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
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
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
