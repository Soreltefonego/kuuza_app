import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { ManagerSidebar } from "@/components/manager/ManagerSidebar"
import { MobileNav } from "@/components/manager/MobileNav"
import { ManagerService } from "@/services/manager.service"
import { SessionUser } from "@/types"

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login")
  }

  const user = session.user as SessionUser

  if (user.role !== "MANAGER") {
    redirect("/dashboard")
  }

  // Get manager's credit balance
  let creditBalance = BigInt(0)
  try {
    if (user.managerId) {
      const stats = await ManagerService.getManagerStats(user.managerId)
      creditBalance = stats.creditBalance
    }
  } catch (error) {
    console.error('Error fetching manager stats:', error)
  }

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <ManagerSidebar user={user} creditBalance={Number(creditBalance)} />
      </div>

      {/* Mobile Navigation */}
      <MobileNav user={user} creditBalance={creditBalance} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-3 md:px-6 pt-4 md:pt-6 pb-20 md:pb-6">
          {children}
        </div>
      </main>
    </div>
  )
}