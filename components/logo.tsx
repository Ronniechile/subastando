import { Gavel } from "lucide-react"
import Link from "next/link"

interface LogoProps {
  className?: string
  sportEmoji?: string
}

export function Logo({ className = "", sportEmoji = "⚽" }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center space-x-3 ${className}`}>
      <div className="relative">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-2.5 rounded-xl shadow-lg transform -rotate-12">
          <Gavel className="h-7 w-7 text-white" />
        </div>
        {/* Sport Ball Badge - Dynamic */}
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full shadow-lg flex items-center justify-center text-lg transition-all duration-300">
          {sportEmoji}
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          SUBASPORT
        </span>
        <span className="text-xs text-gray-500 -mt-1">Subastas Deportivas</span>
      </div>
    </Link>
  )
}
