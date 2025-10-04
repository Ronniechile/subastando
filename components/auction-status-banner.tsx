"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, Clock } from "lucide-react"

interface AuctionStatusBannerProps {
  endTime: string
  isActive: boolean
  hasWinner?: boolean
  winnerName?: string
}

export default function AuctionStatusBanner({ endTime, isActive, hasWinner, winnerName }: AuctionStatusBannerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const end = new Date(endTime).getTime()
      const diff = end - now

      if (diff <= 0) {
        setIsExpired(true)
        setTimeLeft(0)
      } else {
        setIsExpired(false)
        setTimeLeft(diff)
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [endTime])

  const isUrgent = timeLeft > 0 && timeLeft < 3600000 // Less than 1 hour

  if (isExpired || !isActive) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <CheckCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Subasta Finalizada</strong>
          {hasWinner && winnerName && <span className="block mt-1">Ganador: {winnerName}</span>}
        </AlertDescription>
      </Alert>
    )
  }

  if (isUrgent) {
    return (
      <Alert className="border-orange-200 bg-orange-50 animate-pulse">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>¡Última hora!</strong> Esta subasta terminará pronto. ¡No pierdas la oportunidad de pujar!
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="border-blue-200 bg-blue-50">
      <Clock className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <strong>Subasta Activa</strong> - Puedes hacer pujas hasta que termine el tiempo.
      </AlertDescription>
    </Alert>
  )
}
