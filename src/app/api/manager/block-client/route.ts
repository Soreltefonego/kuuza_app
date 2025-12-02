import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { SessionUser } from '@/types'

const blockClientSchema = z.object({
  clientId: z.string().min(1, 'Client ID requis'),
  action: z.enum(['block', 'unblock']),
  reason: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const sessionUser = session.user as SessionUser

    const manager = await prisma.manager.findUnique({
      where: { userId: sessionUser.id }
    })

    if (!manager) {
      return NextResponse.json({ error: 'Manager non trouvé' }, { status: 403 })
    }

    const body = await request.json()
    const { clientId, action, reason } = blockClientSchema.parse(body)

    // Vérifier que le client appartient au manager
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        managerId: manager.id,
        deletedAt: null
      },
      include: {
        user: true
      }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 })
    }

    if (action === 'block') {
      // Bloquer le compte
      await prisma.client.update({
        where: { id: clientId },
        data: {
          isBlocked: true,
          blockedAt: new Date(),
          blockedReason: reason || 'Bloqué par le manager'
        }
      })

      return NextResponse.json({
        success: true,
        message: `Le compte de ${client.user.firstName} ${client.user.lastName} a été bloqué`
      })
    } else {
      // Débloquer le compte
      await prisma.client.update({
        where: { id: clientId },
        data: {
          isBlocked: false,
          blockedAt: null,
          blockedReason: null
        }
      })

      return NextResponse.json({
        success: true,
        message: `Le compte de ${client.user.firstName} ${client.user.lastName} a été débloqué`
      })
    }

  } catch (error) {
    console.error('Error blocking/unblocking client:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de l\'opération' },
      { status: 500 }
    )
  }
}