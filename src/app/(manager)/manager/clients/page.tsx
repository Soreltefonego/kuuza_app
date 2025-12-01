import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { ManagerService } from "@/services/manager.service"
import { ClientsPageContent } from "@/components/manager/ClientsPageContent"
import { SessionUser } from "@/types"

// Disable caching to ensure fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ClientsPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login")
  }

  const user = session.user as SessionUser

  if (!user.managerId) {
    redirect("/login")
  }

  const clients = await ManagerService.getClients(user.managerId)

  return <ClientsPageContent clients={clients} managerId={user.managerId} />
}