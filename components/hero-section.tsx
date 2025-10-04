import { Button } from "@/components/ui/button"
import { Trophy, Clock, Users, Shield } from "lucide-react"
import Link from "next/link"

interface HeroSectionProps {
  popularAuctions?: React.ReactNode
}

export default function HeroSection({ popularAuctions }: HeroSectionProps) {
  return (
    <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-orange-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 p-4 rounded-full">
              <Trophy className="h-12 w-12 text-white" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Subasta las mejores
            <span className="block text-orange-300">camisetas deportivas</span>
          </h1>

          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Encuentra camisetas únicas de tus equipos favoritos o vende las tuyas. Subastas seguras con contador de
            tiempo real.
          </p>

          <div className="flex flex-col lg:flex-row gap-6 justify-center items-center lg:items-start mb-12 max-w-5xl mx-auto px-4">
            <div className="flex flex-col items-center lg:items-start gap-4 w-full lg:w-auto">
              <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg w-full sm:w-auto">
                <Link href="/auth/sign-up">Empezar a Pujar</Link>
              </Button>
            </div>
            
            {/* Subastas más populares */}
            {popularAuctions && (
              <div className="w-full lg:w-auto lg:min-w-[400px] max-w-md lg:max-w-none">
                {popularAuctions}
              </div>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="bg-white/20 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Subastas de 24 Horas</h3>
              <p className="text-blue-100">Cada subasta dura exactamente un día con contador en tiempo real</p>
            </div>

            <div className="text-center">
              <div className="bg-white/20 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Transacciones Seguras</h3>
              <p className="text-blue-100">Sistema de autenticación robusto y pagos protegidos</p>
            </div>

            <div className="text-center">
              <div className="bg-white/20 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Comunidad Activa</h3>
              <p className="text-blue-100">Miles de coleccionistas y fanáticos del deporte</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
