import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getAuctionById, getCategories } from "@/lib/actions"
import EditAuctionForm from "@/components/admin/edit-auction-form"

async function checkAdminAuth() {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin_session")

  if (!adminSession || adminSession.value !== "authenticated") {
    redirect("/admin/login")
  }
}

interface EditAuctionPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditAuctionPage({ params }: EditAuctionPageProps) {
  await checkAdminAuth()

  const { id } = await params
  const [auction, categories] = await Promise.all([getAuctionById(id), getCategories()])

  if (!auction) {
    redirect("/admin/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EditAuctionForm auction={auction} categories={categories} />
      </div>
    </div>
  )
}
