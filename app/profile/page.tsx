import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Header from "@/components/header"
import ProfileTabs from "@/components/profile-tabs"

async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

async function getUserProfile(userId: string) {
  const supabase = await createClient()

  console.log("[v0] Fetching profile for user:", userId)

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("[v0] Error fetching profile:", error)
    return null
  }

  console.log("[v0] Profile fetched successfully:", profile?.email)
  return profile
}

async function getUserAuctions(userId: string) {
  const supabase = await createClient()

  console.log("[v0] Fetching auctions for user:", userId)

  const { data: auctions, error } = await supabase
    .from("auctions")
    .select(`
      *,
      categories (
        id,
        name
      ),
      bids (
        amount
      )
    `)
    .eq("seller_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching user auctions:", error)
    return []
  }

  console.log("[v0] User auctions fetched:", auctions?.length || 0)
  return auctions || []
}

async function getUserBids(userId: string) {
  const supabase = await createClient()

  console.log("[v0] Fetching bids for user:", userId)

  const { data: bids, error } = await supabase
    .from("bids")
    .select(`
      *,
      auctions (
        id,
        title,
        image_url,
        end_time,
        status,
        categories (
          name
        )
      )
    `)
    .eq("bidder_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching user bids:", error)
    return []
  }

  console.log("[v0] User bids fetched:", bids?.length || 0)
  return bids || []
}

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    console.log("[v0] No user found, redirecting to login")
    redirect("/auth/login")
  }

  console.log("[v0] User authenticated, loading profile data for:", user.email)

  try {
    const [profile, auctions, bids] = await Promise.all([
      getUserProfile(user.id),
      getUserAuctions(user.id),
      getUserBids(user.id),
    ])

    console.log("[v0] Profile page data loaded successfully")

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-gray-600 mt-2">Gestiona tus subastas y pujas</p>
          </div>

          <ProfileTabs profile={profile} auctions={auctions} bids={bids} />
        </main>
      </div>
    )
  } catch (error) {
    console.error("[v0] Error loading profile page:", error)
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Error al cargar el perfil</h1>
            <p className="text-gray-600 mt-2">Por favor, intenta nuevamente más tarde.</p>
          </div>
        </main>
      </div>
    )
  }
}
