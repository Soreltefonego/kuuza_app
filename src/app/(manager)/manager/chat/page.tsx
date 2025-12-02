import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ChatPanel } from '@/components/manager/ChatPanel'
import { prisma } from '@/lib/prisma'
import { SessionUser } from '@/types'

export default async function ChatPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/auth/login')
  }

  const sessionUser = session.user as SessionUser

  const manager = await prisma.manager.findUnique({
    where: { userId: sessionUser.id },
    include: {
      user: true
    }
  })

  if (!manager) {
    redirect('/auth/login')
  }

  return (
    <div className="h-full">
      <ChatPanel
        managerId={manager.id}
        managerName={`${manager.user.firstName} ${manager.user.lastName}`}
      />
    </div>
  )
}