import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  console.log("[v0] Auth callback - code:", code ? "present" : "missing")
  console.log("[v0] Auth callback - next:", next)

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      console.log("[v0] Auth callback - session exchange successful")
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error("[v0] Auth callback - session exchange error:", error)
    }
  }

  console.log("[v0] Auth callback - redirecting to login with error")
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`)
}
