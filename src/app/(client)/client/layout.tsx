import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { ClientProviders } from "@/components/client/ClientProviders"
import { SessionUser } from "@/types"

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login")
  }

  const user = session.user as SessionUser

  if (user.role !== "CLIENT") {
    redirect("/dashboard")
  }

  return (
    <ClientProviders>
      {children}
    </ClientProviders>
  )
}