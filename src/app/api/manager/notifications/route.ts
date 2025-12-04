import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { SessionUser } from '@/types'

const sendNotificationSchema = z.object({
  clientId: z.string(),
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  type: z.enum(['INFO', 'WARNING', 'SUCCESS', 'ERROR']).default('INFO')
})

// GET - Get all notifications for the manager
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const user = session.user as SessionUser

    if (user.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    if (!user.managerId) {
      return NextResponse.json(
        { error: 'Manager ID manquant' },
        { status: 400 }
      )
    }

    const notifications = await prisma.notification.findMany({
      where: {
        managerId: user.managerId
      },
      include: {
        client: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: notifications
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}

// POST - Send a notification to a client
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const user = session.user as SessionUser

    if (user.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    if (!user.managerId) {
      return NextResponse.json(
        { error: 'Manager ID manquant' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const data = sendNotificationSchema.parse(body)

    // Check if client exists
    const client = await prisma.client.findUnique({
      where: { id: data.clientId }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      )
    }

    // Check if client is blocked
    if (client.isBlocked) {
      return NextResponse.json(
        { error: 'Impossible d\'envoyer une notification à un client bloqué' },
        { status: 400 }
      )
    }

    // Create the notification
    const notification = await prisma.notification.create({
      data: {
        clientId: data.clientId,
        managerId: user.managerId,
        title: data.title,
        message: data.message,
        type: data.type
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Notification envoyée avec succès',
      data: notification
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Send notification error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}