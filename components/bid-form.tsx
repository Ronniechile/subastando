"use client"

import { useState, useEffect } from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, TrendingUp } from "lucide-react"
import { placeBid } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Pujando...
        </>
      ) : (
        <>
          <TrendingUp className="mr-2 h-4 w-4" />
          Hacer Puja
        </>
      )}
    </Button>
  )
}

interface BidFormProps {
  auctionId: string
  currentPrice: number
  userId: string
}

export default function BidForm({ auctionId, currentPrice, userId }: BidFormProps) {
  const [bidAmount, setBidAmount] = useState("")
  const [state, formAction] = useActionState(placeBid, null)
  const router = useRouter()

  const minBid = currentPrice + 1
  const suggestedBids = [minBid, minBid + 5, minBid + 10, minBid + 25]

  // Recargar la página cuando la puja es exitosa
  useEffect(() => {
    if (state?.success) {
      // Si el mensaje incluye "compra inmediata", recargar inmediatamente
      const isBuyNow = state.success.toLowerCase().includes('compra inmediata')
      const delay = isBuyNow ? 2000 : 1500
      
      console.log('[BidForm] Puja exitosa detectada, recargando en', delay, 'ms')
      console.log('[BidForm] Es compra inmediata?', isBuyNow)
      
      const timer = setTimeout(() => {
        console.log('[BidForm] Ejecutando recarga de página...')
        // Forzar recarga completa de la página para reflejar el estado actualizado
        window.location.href = window.location.href
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [state?.success])

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="auctionId" value={auctionId} />
        <input type="hidden" name="userId" value={userId} />

        {state?.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{state.error}</div>
        )}

        {state?.success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-sm">
            {state.success}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="amount">Tu puja (mínimo ${minBid.toFixed(2)})</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min={minBid}
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder={`${minBid.toFixed(2)}`}
            required
          />
        </div>

        <SubmitButton />
      </form>

      {/* Quick bid buttons */}
      <div className="space-y-3">
        <p className="text-sm text-gray-600">Pujas rápidas:</p>
        <div className="grid grid-cols-2 gap-2">
          {suggestedBids.map((amount) => (
            <Button
              key={amount}
              variant="outline"
              size="sm"
              onClick={() => setBidAmount(amount.toString())}
              className="text-sm"
            >
              ${amount.toFixed(2)}
            </Button>
          ))}
        </div>
        
        {/* Botón de Compra Inmediata */}
        <div className="pt-2 border-t">
          <Button
            onClick={() => setBidAmount(currentPrice.toString())}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold h-12 text-base"
          >
            ⚡ Compra Inmediata - ${currentPrice.toFixed(2)}
          </Button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Gana la subasta al instante al precio actual
          </p>
        </div>
      </div>
    </div>
  )
}
