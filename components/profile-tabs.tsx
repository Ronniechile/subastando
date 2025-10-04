"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Trophy, TrendingUp, Calendar, DollarSign, EyeOff } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import CountdownTimer from "@/components/countdown-timer"

interface Profile {
  id: string
  email: string
  full_name: string | null
  is_anonymous: boolean | null
  created_at: string
}

interface Auction {
  id: string
  title: string
  description: string
  image_url: string | null
  starting_price: number
  current_price: number
  end_time: string
  status: string
  created_at: string
  categories: {
    id: string
    name: string
  } | null
  bids: {
    amount: number
  }[]
}

interface Bid {
  id: string
  amount: number
  created_at: string
  auctions: {
    id: string
    title: string
    image_url: string | null
    end_time: string
    status: string
    categories: {
      name: string
    } | null
  } | null
  isWinner: boolean
  winnerInfo: {
    full_name: string | null
    email: string
    amount: number
  } | null
}

interface ProfileTabsProps {
  profile: Profile | null
  auctions: Auction[]
  bids: Bid[]
}

export default function ProfileTabs({ profile, auctions, bids }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [isAnonymous, setIsAnonymous] = useState(profile?.is_anonymous || false)
  const [isSaving, setIsSaving] = useState(false)

  const activeAuctions = auctions.filter((auction) => auction.status === "active")
  const completedAuctions = auctions.filter((auction) => auction.status === "ended")
  const totalEarnings = completedAuctions.reduce((sum, auction) => sum + auction.current_price, 0)

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName,
          is_anonymous: isAnonymous,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar el perfil')
      }

      setIsEditing(false)
      alert("Perfil actualizado correctamente")
      // Recargar la página para reflejar los cambios
      window.location.reload()
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      alert("Error al actualizar el perfil")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Resumen</TabsTrigger>
        <TabsTrigger value="bids">Mis Pujas</TabsTrigger>
        <TabsTrigger value="settings">Configuración</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Subastas Activas</p>
                  <p className="text-2xl font-bold">{activeAuctions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Vendido</p>
                  <p className="text-2xl font-bold">{completedAuctions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ganancias</p>
                  <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pujas Realizadas</p>
                  <p className="text-2xl font-bold">{bids.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Subastas Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {auctions.slice(0, 3).map((auction) => (
                <div key={auction.id} className="flex items-center space-x-4 py-3 border-b last:border-b-0">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0">
                    {auction.image_url ? (
                      <Image
                        src={auction.image_url || "/placeholder.svg"}
                        alt={auction.title}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{auction.title}</p>
                    <p className="text-sm text-gray-500">${auction.current_price.toFixed(2)}</p>
                  </div>
                  <Badge variant={auction.status === "active" ? "default" : "secondary"}>{auction.status}</Badge>
                </div>
              ))}
              {auctions.length === 0 && <p className="text-gray-500 text-center py-4">No has creado subastas aún</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pujas Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {bids.slice(0, 3).map((bid) => (
                <div key={bid.id} className="flex items-center space-x-4 py-3 border-b last:border-b-0">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0">
                    {bid.auctions?.image_url ? (
                      <Image
                        src={bid.auctions.image_url || "/placeholder.svg"}
                        alt={bid.auctions.title}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{bid.auctions?.title}</p>
                    <p className="text-sm text-gray-500">Tu puja: ${bid.amount.toFixed(2)}</p>
                  </div>
                  <Badge variant={bid.auctions?.status === "active" ? "default" : "secondary"}>
                    {bid.auctions?.status}
                  </Badge>
                </div>
              ))}
              {bids.length === 0 && <p className="text-gray-500 text-center py-4">No has hecho pujas aún</p>}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="bids" className="space-y-6">
        <h2 className="text-2xl font-bold">Mis Pujas</h2>

        <div className="space-y-4">
          {bids.map((bid) => (
            <Card key={bid.id}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                    {bid.auctions?.image_url ? (
                      <Image
                        src={bid.auctions.image_url || "/placeholder.svg"}
                        alt={bid.auctions.title}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Trophy className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{bid.auctions?.title}</h3>
                    <p className="text-gray-600">
                      {bid.auctions?.categories?.name} • Pujado el{" "}
                      {new Date(bid.created_at).toLocaleDateString("es-ES")}
                    </p>
                    {bid.auctions?.status === "ended" && (
                      <div className="mt-2">
                        {bid.isWinner ? (
                          <div className="flex items-center text-green-600">
                            <Trophy className="w-4 h-4 mr-1" />
                            <span className="font-medium">¡Ganaste esta subasta!</span>
                          </div>
                        ) : bid.winnerInfo ? (
                          <div className="text-gray-500 text-sm">
                            Ganador: {bid.winnerInfo.full_name || bid.winnerInfo.email} - $
                            {bid.winnerInfo.amount.toFixed(2)}
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm">Subasta finalizada sin ganador</div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Tu puja</p>
                    <p className="text-2xl font-bold text-blue-600">${bid.amount.toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge variant={bid.auctions?.status === "active" ? "default" : "secondary"}>
                      {bid.auctions?.status === "active" ? "Activa" : "Finalizada"}
                    </Badge>
                    {bid.auctions?.status === "active" && (
                      <CountdownTimer endTime={bid.auctions.end_time} variant="default" showIcon={false} status={bid.auctions.status as "active" | "ended" | "cancelled"} />
                    )}
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/auction/${bid.auctions?.id}`}>Ver Subasta</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {bids.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No has hecho pujas</h3>
              <p className="text-gray-500 mb-4">Explora las subastas activas y haz tu primera puja</p>
              <Button asChild>
                <Link href="/">Ver Subastas</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="settings" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Información Personal
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  Editar
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-gray-700">Email</Label>
              <p className="text-gray-900 mt-1">{profile?.email}</p>
              <p className="text-xs text-gray-500 mt-1">El email no se puede modificar</p>
            </div>
            
            <div>
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                Nombre Completo
              </Label>
              {isEditing ? (
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ingresa tu nombre completo"
                  className="mt-1"
                />
              ) : (
                <p className="text-gray-900 mt-1">{profile?.full_name || "No especificado"}</p>
              )}
            </div>

            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <Checkbox
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                disabled={!isEditing}
              />
              <div className="flex-1">
                <Label
                  htmlFor="anonymous"
                  className="text-sm font-medium text-gray-900 cursor-pointer flex items-center gap-2"
                >
                  <EyeOff className="w-4 h-4" />
                  Aparecer como anónimo en las pujas
                </Label>
                <p className="text-xs text-gray-600 mt-1">
                  Si activas esta opción, tu nombre no será visible públicamente en el historial de pujas. 
                  Aparecerás como "Usuario Anónimo" para otros usuarios.
                </p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Miembro desde</Label>
              <p className="text-gray-900 mt-1">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("es-ES", {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : "N/A"}
              </p>
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? "Guardando..." : "Guardar Cambios"}
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false)
                    setFullName(profile?.full_name || "")
                  }}
                  variant="outline"
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
