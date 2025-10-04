import { createClient } from "@/lib/supabase/server"
import Header from "@/components/header"
import AuctionGrid from "@/components/auction-grid"
import HeroSection from "@/components/hero-section"
import CategoryFilter from "@/components/category-filter"
import { Suspense } from "react"
import { AuctionCardSkeleton } from "@/components/auction-card"
import { getCategories } from "@/lib/actions"

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
  const [auctions, categories] = await Promise.all([getActiveAuctions(), getCategories()])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main>
        <HeroSection />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar with filters */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtrar por Categoría</h3>
                <CategoryFilter categories={categories} />
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Subastas Activas</h2>
                  <p className="text-gray-600 mt-1">{auctions.length} subastas disponibles</p>
                </div>
              </div>

              <Suspense
                fallback={
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <AuctionCardSkeleton key={i} />
                    ))}
                  </div>
                }
              >
                <AuctionGrid auctions={auctions} />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
