"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Users, DollarSign, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import type { Auction } from "@/lib/types"
import { deleteAuctionAdmin } from "@/lib/actions"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AdminAuctionsList() {
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchAuctions() {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("auctions")
        .select(`
          *,
          categories (name),
          bids (id, amount)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching auctions:", error)
      } else {
        setAuctions(data || [])
      }
      setLoading(false)
    }

    fetchAuctions()
  }, [])

  const handleDelete = async (auctionId: string, auctionTitle: string) => {
    setDeleting(auctionId)
    try {
      await deleteAuctionAdmin(auctionId)
      // Remove auction from local state
      setAuctions(auctions.filter((auction) => auction.id !== auctionId))
    } catch (error: any) {
      alert(error.message || "Error al eliminar la subasta")
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando subastas...</div>
  }

  return (
    <div className="space-y-4">
      {auctions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No hay subastas creadas aún</div>
      ) : (
        auctions.map((auction) => (
          <Card key={auction.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{auction.title}</CardTitle>
                  <CardDescription className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary">{auction.categories?.name}</Badge>
                    <Badge variant={auction.status === "active" ? "default" : "secondary"}>
                      {auction.status === "active" ? "Activa" : "Finalizada"}
                    </Badge>
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Link href={`/auction/${auction.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  </Link>
                  <Link href={`/admin/edit-auction/${auction.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                        disabled={deleting === auction.id}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {deleting === auction.id ? "..." : "Eliminar"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar subasta?</AlertDialogTitle>
                        <AlertDialogDescription>
                          ¿Estás seguro de que quieres eliminar la subasta "{auction.title}"? Esta acción no se puede
                          deshacer.
                          {auction.bids && auction.bids.length > 0 && (
                            <span className="block mt-2 text-red-600 font-medium">
                              Esta subasta tiene {auction.bids.length} puja(s) y no se puede eliminar.
                            </span>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(auction.id, auction.title)}
                          disabled={auction.bids && auction.bids.length > 0}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-medium">${auction.current_price}</p>
                    <p className="text-gray-500">Precio actual</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium">{auction.bids?.length || 0}</p>
                    <p className="text-gray-500">Pujas</p>
                  </div>
                </div>
                <div>
                  <p className="font-medium">{new Date(auction.end_time).toLocaleDateString()}</p>
                  <p className="text-gray-500">Fecha fin</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
