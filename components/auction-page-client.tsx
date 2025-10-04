"use client"

import { useState, useMemo } from "react"
import AuctionGrid from "@/components/auction-grid"
import CategoryFilter from "@/components/category-filter"
import PopularAuctions from "@/components/popular-auctions"
import { Gavel } from "lucide-react"
import type { Category } from "@/lib/types"

interface AuctionPageClientProps {
  initialAuctions: any[]
  categories: Category[]
}

export default function AuctionPageClient({ initialAuctions, categories }: AuctionPageClientProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  // Filtrar subastas según la categoría seleccionada
  const filteredAuctions = useMemo(() => {
    if (!selectedCategoryId) {
      return initialAuctions
    }
    return initialAuctions.filter(auction => auction.category_id === selectedCategoryId)
  }, [initialAuctions, selectedCategoryId])

  // Encontrar la categoría seleccionada
  const selectedCategory = selectedCategoryId 
    ? categories.find(cat => cat.id === selectedCategoryId)
    : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar with filters */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
            {/* Logo dinámico */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-4 rounded-2xl shadow-lg transform -rotate-12">
                  <Gavel className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-3xl bg-white border-2 border-blue-600 transition-all duration-300">
                  {selectedCategory?.emoji || "⚽"}
                </div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Filtrar por Categoría</h3>
            
            {/* Filtro de categorías sin navegación */}
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategoryId(null)}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                  selectedCategoryId === null
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Todas las categorías
              </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                    selectedCategoryId === category.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className="text-lg">{category.emoji || "⚽"}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory ? `Subastas de ${selectedCategory.name}` : "Subastas Activas"}
              </h2>
              <p className="text-gray-600 mt-1">{filteredAuctions.length} subastas disponibles</p>
            </div>
          </div>

          <AuctionGrid auctions={filteredAuctions} />
        </div>
      </div>
    </div>
  )
}
