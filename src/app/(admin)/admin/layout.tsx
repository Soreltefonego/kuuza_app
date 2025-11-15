import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { AdminProviders } from "@/components/admin/AdminProviders"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Vérifier que c'est bien un super admin (par rôle ou email temporaire)
  if (!session.user || session.user.email !== "admin@kuuzabank.com") {
    redirect("/dashboard")
  }

  return (
    <AdminProviders>
      {children}
    </AdminProviders>
  )
}