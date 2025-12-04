import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { SessionUser } from '@/types'

const sendNotificationSchema = z.object({
  clientId: z.string().min(1, 'Client ID requis'),
  title: z.string().min(1, 'Titre requis').max(100, 'Titre trop long'),
  message: z.string().min(1, 'Message requis').max(1000, 'Message trop long'),
  type: z.enum(['INFO', 'WARNING', 'SUCCESS', 'ERROR']).default('INFO'),
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
      return NextResponse.json({ error: 'Conseiller non trouvé' }, { status: 403 })
    }

    const body = await request.json()
    const { clientId, title, message, type } = sendNotificationSchema.parse(body)

    // Vérifier que le client appartient au conseiller
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

    // Créer la notification
    const notification = await prisma.notification.create({
      data: {
        clientId,
        managerId: manager.id,
        title,
        message,
        type
      }
    })

    return NextResponse.json({
      success: true,
      message: `Notification envoyée à ${client.user.firstName} ${client.user.lastName}`,
      notificationId: notification.id
    })

  } catch (error) {
    console.error('Error sending notification:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de la notification' },
      { status: 500 }
    )
  }
}