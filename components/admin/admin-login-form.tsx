"use client"

import { useState, useTransition } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { signInAdmin } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg font-medium rounded-lg h-[60px]"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Verificando...
        </>
      ) : (
        "Acceder como Administrador"
      )}
    </Button>
  )
}

export default function AdminLoginForm() {
  const router = useRouter()
  const [state, setState] = useState<{ error?: string; success?: boolean } | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (state?.success) {
      router.push("/admin/dashboard")
    }
  }, [state, router])

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await signInAdmin(null, formData)
      setState(result)
    })
  }

  return (
    <div className="w-full max-w-md">
      <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-purple-600 p-3 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-gray-900">Panel de Administración</CardTitle>
            <CardDescription className="text-lg text-gray-600 mt-2">
              Acceso restringido para administradores
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            {state?.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{state.error}</div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Usuario Administrador
                </label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="admin"
                  required
                  className="h-12 text-base"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <Input id="password" name="password" type="password" required className="h-12 text-base" />
              </div>
            </div>

            <SubmitButton />

            <div className="text-center text-sm text-gray-500">Solo personal autorizado puede acceder a este panel</div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
