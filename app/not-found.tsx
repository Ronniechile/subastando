import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Trophy } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-4 rounded-full">
            <Trophy className="h-12 w-12 text-white" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Página no encontrada</h1>
        <p className="text-xl text-gray-600 mb-8">La subasta que buscas no existe o ha sido eliminada.</p>

        <Button asChild size="lg">
          <Link href="/">Volver a las subastas</Link>
        </Button>
      </div>
    </div>
  )
}
