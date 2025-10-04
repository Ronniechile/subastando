"use client"

import { Button } from "@/components/ui/button"
import { Gavel, User, LogOut, Shield } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { signOut } from "@/lib/actions"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useSearchParams } from "next/navigation"

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [categoryEmoji, setCategoryEmoji] = useState<string>("⚽")
  const searchParams = useSearchParams()

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Only update state if there's an actual change
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Obtener emoji de la categoría actual
  useEffect(() => {
    const categoryId = searchParams?.get("category")
    if (categoryId) {
      const supabase = createClient()
      supabase
        .from("categories")
        .select("emoji")
        .eq("id", categoryId)
        .single()
        .then(({ data }) => {
          if (data && data.emoji) {
            setCategoryEmoji(data.emoji)
          } else {
            setCategoryEmoji("⚽")
          }
        })
    } else {
      setCategoryEmoji("⚽")
    }
  }, [searchParams])

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-2.5 rounded-xl shadow-lg transform -rotate-12 overflow-hidden">
                <Gavel className="h-7 w-7 text-white relative z-10" />
                {/* Efecto de brillo */}
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_ease-in-out_1] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              </div>
              {/* Sport Ball Badge - Dynamic */}
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full shadow-lg flex items-center justify-center text-lg transition-all duration-300">
                {categoryEmoji}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">SUBASPORT</span>
              <span className="text-xs text-gray-500 -mt-1 hidden sm:block">Subastas Deportivas</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">
              Subastas
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">{user.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Mi Perfil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <form action={signOut}>
                        <button type="submit" className="flex items-center space-x-2 w-full">
                          <LogOut className="h-4 w-4" />
                          <span>Cerrar Sesión</span>
                        </button>
                      </form>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button asChild variant="ghost">
                  <Link href="/auth/login">Iniciar Sesión</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/sign-up">Registrarse</Link>
                </Button>
              </div>
            )}

            <Button asChild variant="outline" size="sm">
              <Link href="/admin/login" className="flex items-center space-x-1">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
