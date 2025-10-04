"use client"

import { useState, useEffect } from "react"
import { Clock, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CountdownTimerProps {
  endTime: string
  className?: string
  showIcon?: boolean
  variant?: "default" | "large" | "badge"
  status?: "active" | "ended" | "cancelled"
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
}

function calculateTimeRemaining(endTime: string): TimeRemaining {
  const now = new Date().getTime()
  const end = new Date(endTime).getTime()
  const diff = end - now

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
  }
}

export default function CountdownTimer({
  endTime,
  className = "",
  showIcon = true,
  variant = "default",
  status,
}: CountdownTimerProps) {
  // Si el status es "ended" o "cancelled", forzar isExpired
  const isAuctionEnded = status === "ended" || status === "cancelled"
  
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: isAuctionEnded,
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // No ejecutar el timer si la subasta ya finalizó
    if (isAuctionEnded) {
      setTimeRemaining({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
      })
      return
    }

    // Calcular tiempo inicial
    setTimeRemaining(calculateTimeRemaining(endTime))

    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(endTime))
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime, isAuctionEnded])

  // Mostrar estado inicial hasta que el componente se monte en el cliente
  if (!mounted) {
    if (isAuctionEnded) {
      return variant === "large" ? (
        <div className={`text-center ${className}`}>
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
            <p className="text-lg font-bold">Finalizada</p>
          </div>
        </div>
      ) : (
        <div className={`flex items-center ${className}`}>
          {showIcon && <Clock className="w-4 h-4 mr-1" />}
          <span className="font-medium">Finalizada</span>
        </div>
      )
    }
    return null
  }

  const formatTime = (): string => {
    if (timeRemaining.isExpired) {
      return "Finalizada"
    }

    const { days, hours, minutes, seconds } = timeRemaining

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    }
    return `${minutes}m ${seconds}s`
  }

  const getVariantStyles = () => {
    const isUrgent = !timeRemaining.isExpired && timeRemaining.days === 0 && timeRemaining.hours < 1
    const isExpired = timeRemaining.isExpired

    if (variant === "badge") {
      return {
        variant: isExpired ? "destructive" : isUrgent ? "secondary" : "default",
        className: `${className} ${isUrgent ? "animate-pulse" : ""}`,
      }
    }

    return {
      className: `${className} ${isExpired ? "text-red-600" : isUrgent ? "text-orange-600 animate-pulse" : "text-gray-700"}`,
    }
  }

  if (variant === "large") {
    if (timeRemaining.isExpired) {
      return (
        <div className={`text-center ${className}`}>
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
            <p className="text-lg font-bold">Finalizada</p>
          </div>
        </div>
      )
    }

    const { days, hours, minutes, seconds } = timeRemaining
    const isUrgent = days === 0 && hours < 1

    return (
      <div className={`text-center ${className}`}>
        <div className={`grid grid-cols-4 gap-2 ${isUrgent ? "animate-pulse" : ""}`}>
          <div className="bg-white rounded-lg p-3 shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{days}</div>
            <div className="text-xs text-gray-500">Días</div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{hours}</div>
            <div className="text-xs text-gray-500">Horas</div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{minutes}</div>
            <div className="text-xs text-gray-500">Min</div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{seconds}</div>
            <div className="text-xs text-gray-500">Seg</div>
          </div>
        </div>
        {isUrgent && !timeRemaining.isExpired && (
          <div className="mt-2 text-orange-600 font-medium flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 mr-1" />
            ¡Última hora!
          </div>
        )}
      </div>
    )
  }

  if (variant === "badge") {
    const styles = getVariantStyles()
    return (
      <Badge variant={styles.variant as any} className={styles.className}>
        {showIcon && <Clock className="w-3 h-3 mr-1" />}
        {formatTime()}
      </Badge>
    )
  }

  const styles = getVariantStyles()
  return (
    <div className={`flex items-center ${styles.className}`}>
      {showIcon && <Clock className="w-4 h-4 mr-1" />}
      <span className="font-medium">{formatTime()}</span>
    </div>
  )
}
