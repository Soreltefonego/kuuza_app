import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ClientDashboard } from "@/components/client/ClientDashboard"
import { SessionUser } from "@/types"

export default async function ClientDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login")
  }

  const user = session.user as SessionUser

  if (user.role !== "CLIENT") {
    redirect("/dashboard")
  }

  // Get client data with balance and transactions
  const client = await prisma.client.findUnique({
    where: { userId: user.id },
    include: {
      user: true,
      manager: {
        include: {
          user: true
        }
      }
    }
  })

  if (!client) {
    redirect("/login")
  }

  // Get recent transactions
  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { fromUserId: user.id },
        { toUserId: user.id }
      ]
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10,
    include: {
      fromUser: true,
      toUser: true
    }
  })

  // Convert BigInt to string for serialization
  const serializedClient = {
    ...client,
    accountBalance: client.accountBalance.toString(),
    user: client.user,
    manager: {
      ...client.manager,
      creditBalance: client.manager.creditBalance?.toString() || '0',
      user: client.manager.user
    }
  }

  const serializedTransactions = transactions.map(t => ({
    ...t,
    amount: t.amount.toString(),
    fromUser: t.fromUser,
    toUser: t.toUser
  }))

  return (
    <ClientDashboard
      client={serializedClient}
      transactions={serializedTransactions}
      balance={client.accountBalance}
    />
  )
}