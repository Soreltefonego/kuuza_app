import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { ManagerService } from "@/services/manager.service"
import { CreditBalanceCard } from "@/components/manager/CreditBalanceCard"
import { QuickActions } from "@/components/manager/QuickActions"
import { ClientsOverview } from "@/components/manager/ClientsOverview"
import { RecentTransactions } from "@/components/manager/RecentTransactions"
import { SessionUser } from "@/types"

export default async function ManagerDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login")
  }

  const user = session.user as SessionUser

  if (!user.managerId) {
    redirect("/login")
  }

  const [stats, clients, transactions] = await Promise.all([
    ManagerService.getManagerStats(user.managerId),
    ManagerService.getClients(user.managerId),
    ManagerService.getTransactions(user.managerId, 10),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">
            Bonjour, {user.firstName}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Voici un aperçu de votre activité
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CreditBalanceCard balance={stats.creditBalance} />
        <QuickActions />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClientsOverview
          clients={clients}
          totalClients={stats.totalClients}
          activeClients={stats.activeClients}
        />
        <RecentTransactions transactions={transactions} />
      </div>
    </div>
  )
}