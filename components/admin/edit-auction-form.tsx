"use client"

import { useState } from "react"
import { useFormState } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { editAuctionAdmin } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface EditAuctionFormProps {
  auction: any
  categories: any[]
}

export default function EditAuctionForm({ auction, categories }: EditAuctionFormProps) {
  const [state, formAction] = useFormState(editAuctionAdmin, null)
  const [selectedCategory, setSelectedCategory] = useState(auction.category_id || "0")
  const router = useRouter()

  // Redirect to admin dashboard on success
  if (state?.success) {
    router.push("/admin/dashboard")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Panel
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editar Subasta: {auction.title}</CardTitle>
          <CardDescription>
            Modifica los detalles de la subasta. Los campos marcados con * son obligatorios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <input type="hidden" name="auctionId" value={auction.id} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título de la subasta *</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={auction.title}
                  placeholder="Ej: Camiseta Real Madrid 2024"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoría</Label>
                <Select name="categoryId" value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sin categoría</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={auction.description}
                placeholder="Describe la camiseta: talla, estado, características especiales..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="imageUrl">URL de la imagen</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  defaultValue={auction.image_url || ""}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buyNowPrice">Precio Compra Inmediata ($)</Label>
                <Input
                  id="buyNowPrice"
                  name="buyNowPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={auction.buy_now_price || ""}
                  placeholder="Opcional - precio para compra inmediata"
                />
                <p className="text-sm text-gray-500">Debe ser mayor al precio actual (${auction.current_price})</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Información de la subasta</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-yellow-700">
                <div>
                  <span className="font-medium">Precio inicial:</span> ${auction.starting_price}
                </div>
                <div>
                  <span className="font-medium">Precio actual:</span> ${auction.current_price}
                </div>
                <div>
                  <span className="font-medium">Total de pujas:</span> {auction.bids?.length || 0}
                </div>
                <div>
                  <span className="font-medium">Estado:</span> {auction.status === "active" ? "Activa" : "Finalizada"}
                </div>
              </div>
            </div>

            {state?.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{state.error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Link href="/admin/dashboard">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit">Actualizar Subasta</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
