"use client"

import { useState, useEffect } from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Upload, Trophy } from "lucide-react"
import { createAuction } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} size="lg" className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creando subasta...
        </>
      ) : (
        <>
          <Trophy className="mr-2 h-4 w-4" />
          Crear Subasta
        </>
      )}
    </Button>
  )
}

interface Category {
  id: string
  name: string
  description: string | null
}

interface CreateAuctionFormProps {
  categories?: Category[]
  userId?: string
  isAdmin?: boolean
}

export default function CreateAuctionForm({
  categories: propCategories,
  userId: propUserId,
  isAdmin = false,
}: CreateAuctionFormProps) {
  const [selectedCategory, setSelectedCategory] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [categories, setCategories] = useState<Category[]>(propCategories || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [state, formAction] = useActionState(createAuction, null)

  useEffect(() => {
    if (!propCategories || propCategories.length === 0) {
      setError("No hay categorías disponibles. Por favor, contacta al administrador.")
    }
  }, [propCategories])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Cargando categorías...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-red-600">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="mr-2 h-5 w-5" />
          Detalles de la Subasta
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="userId" value={isAdmin ? "admin" : propUserId || ""} />
          <input type="hidden" name="categoryId" value={selectedCategory} />
          <input type="hidden" name="isAdmin" value={isAdmin.toString()} />

          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{state.error}</div>
          )}

          {state?.success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {state.success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título de la Subasta *</Label>
              <Input
                id="title"
                name="title"
                placeholder="Ej: Camiseta Real Madrid 2024 Firmada"
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory} required>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1 text-sm text-gray-500">No hay categorías disponibles</div>
                  )}
                </SelectContent>
              </Select>
              {categories.length === 0 && (
                <p className="text-sm text-red-500">
                  No se pudieron cargar las categorías. Por favor, recarga la página.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe tu camiseta: talla, estado, historia, autenticidad, etc."
              required
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL de la Imagen</Label>
            <div className="flex space-x-2">
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="h-12"
              />
              <Button type="button" variant="outline" className="h-12 px-4 bg-transparent">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500">Sube una imagen clara de tu camiseta</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startingPrice">Precio Inicial ($) *</Label>
              <Input
                id="startingPrice"
                name="startingPrice"
                type="number"
                step="0.01"
                min="1"
                placeholder="50.00"
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyNowPrice">Precio Compra Inmediata ($)</Label>
              <Input
                id="buyNowPrice"
                name="buyNowPrice"
                type="number"
                step="0.01"
                min="1"
                placeholder="200.00 (opcional)"
                className="h-12"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Información Importante</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• La subasta durará exactamente 24 horas desde su creación</li>
              <li>• El precio inicial debe ser realista para atraer pujadores</li>
              <li>
                • Si estableces un precio de compra inmediata, la subasta se adjudicará automáticamente al primer
                usuario que puje ese monto
              </li>
              <li>• Las imágenes claras aumentan las posibilidades de venta</li>
              <li>• Una vez creada, no podrás cancelar la subasta</li>
            </ul>
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  )
}
