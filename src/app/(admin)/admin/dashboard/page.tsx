import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AdminDashboard } from "@/components/admin/AdminDashboard"

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)

  // Vérifier si c'est l'admin par email (temporaire jusqu'à la migration DB)
  if (!session || !session.user || session.user.email !== "admin@kuuzabank.com") {
    redirect("/login")
  }

  // Récupérer toutes les statistiques de la plateforme
  const [
    totalUsers,
    totalManagers,
    totalClients,
    totalTransactions,
    managers,
    recentTransactions,
    systemStats
  ] = await Promise.all([
    prisma.user.count(),
    prisma.manager.count(),
    prisma.client.count(),
    prisma.transaction.count(),
    prisma.manager.findMany({
      include: {
        user: true,
        clients: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    }),
    prisma.transaction.findMany({
      include: {
        fromUser: true,
        toUser: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    }),
    // Statistiques système
    prisma.$queryRaw`
      SELECT
        SUM(CAST(m."creditBalance" AS DECIMAL)) as totalManagerBalance,
        SUM(CAST(c."accountBalance" AS DECIMAL)) as totalClientBalance,
        (SELECT SUM(CAST(amount AS DECIMAL)) FROM "Transaction" WHERE status = 'SUCCESS') as totalTransactionVolume,
        (SELECT COUNT(*) FROM "Transaction" WHERE DATE("createdAt") = DATE(NOW())) as todayTransactions,
        (SELECT COUNT(*) FROM "User" WHERE DATE("createdAt") = DATE(NOW())) as todayNewUsers
    FROM "Manager" m
    LEFT JOIN "Client" c ON 1=1
    LIMIT 1
    `
  ])

  // Calculer les totaux
  const stats = systemStats as any[]
  const totalBalances = {
    managers: Number(stats[0]?.totalmanagerbalance || 0),
    clients: Number(stats[0]?.totalclientbalance || 0),
    transactionVolume: Number(stats[0]?.totaltransactionvolume || 0),
    todayTransactions: Number(stats[0]?.todaytransactions || 0),
    todayNewUsers: Number(stats[0]?.todaynewusers || 0)
  }

  // Sérialiser les données BigInt
  const serializedManagers = managers.map(manager => ({
    ...manager,
    creditBalance: manager.creditBalance?.toString() || '0',
    user: manager.user,
    clients: manager.clients.map(client => ({
      ...client,
      accountBalance: client.accountBalance.toString(),
      user: client.user
    }))
  }))

  const serializedTransactions = recentTransactions.map(t => ({
    ...t,
    amount: t.amount.toString(),
    fromUser: t.fromUser,
    toUser: t.toUser
  }))

  return (
    <AdminDashboard
      totalUsers={totalUsers}
      totalManagers={totalManagers}
      totalClients={totalClients}
      totalTransactions={totalTransactions}
      managers={serializedManagers}
      recentTransactions={serializedTransactions}
      totalBalances={totalBalances}
    />
  )
}