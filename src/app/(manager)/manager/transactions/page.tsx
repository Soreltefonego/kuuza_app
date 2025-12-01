import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { ManagerService } from "@/services/manager.service"
import { TransactionsPageContent } from "@/components/manager/TransactionsPageContent"
import { SessionUser } from "@/types"

// Disable caching to ensure fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login")
  }

  const user = session.user as SessionUser

  if (!user.managerId) {
    redirect("/login")
  }

  const transactions = await ManagerService.getTransactions(user.managerId, 100)

  return <TransactionsPageContent transactions={transactions} />
}