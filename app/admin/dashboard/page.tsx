import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import AdminDashboard from "@/components/admin/admin-dashboard"

export default async function AdminDashboardPage() {
  const cookieStore = cookies()
  const adminSession = (await cookieStore).get("admin_session")

  if (!adminSession) {
    redirect("/admin/login")
  }

  return <AdminDashboard />
}
