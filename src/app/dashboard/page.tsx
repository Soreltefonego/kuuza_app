import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { SessionUser } from "@/types"

export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login")
  }

  const user = session.user as SessionUser

  // Vérifier si c'est l'admin par email (temporaire jusqu'à la migration DB)
  if (user.email === "admin@kuuzabank.com" || user.role === "ADMIN") {
    redirect("/admin/dashboard")
  } else if (user.role === "MANAGER") {
    redirect("/manager/dashboard")
  } else if (user.role === "CLIENT") {
    redirect("/client/dashboard")
  }

  redirect("/login")
}