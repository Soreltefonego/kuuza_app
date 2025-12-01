import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { ManagerService } from "@/services/manager.service"
import { CreditBalanceCard } from "@/components/manager/CreditBalanceCard"
import { QuickActions } from "@/components/manager/QuickActions"
import { ClientsOverview } from "@/components/manager/ClientsOverview"
import { RecentTransactions } from "@/components/manager/RecentTransactions"
import { SessionUser } from "@/types"

// Disable caching to ensure fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

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

  // Safe conversion of BigInt to Number
  const creditBalance = stats?.creditBalance ? Number(stats.creditBalance) : 0

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gradient">
            Bonjour, {user.firstName}!
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Voici un aperçu de votre activité
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 md:gap-6">
        <div className="lg:col-span-2">
          <CreditBalanceCard balance={creditBalance} />
        </div>
        <div className="lg:col-span-3">
          <QuickActions />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
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