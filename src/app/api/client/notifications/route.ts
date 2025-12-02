import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SessionUser } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const sessionUser = session.user as SessionUser

    const client = await prisma.client.findUnique({
      where: { userId: sessionUser.id }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 403 })
    }

    // Récupérer les notifications
    const notifications = await prisma.notification.findMany({
      where: {
        clientId: client.id
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    // Compter les notifications non lues
    const unreadCount = await prisma.notification.count({
      where: {
        clientId: client.id,
        isRead: false
      }
    })

    return NextResponse.json({
      notifications,
      unreadCount
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des notifications' },
      { status: 500 }
    )
  }
}

// Marquer les notifications comme lues
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const sessionUser = session.user as SessionUser

    const client = await prisma.client.findUnique({
      where: { userId: sessionUser.id }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 403 })
    }

    const body = await request.json()
    const { notificationIds } = body

    if (notificationIds && Array.isArray(notificationIds)) {
      // Marquer des notifications spécifiques comme lues
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          clientId: client.id
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })
    } else {
      // Marquer toutes les notifications comme lues
      await prisma.notification.updateMany({
        where: {
          clientId: client.id,
          isRead: false
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications marquées comme lues'
    })

  } catch (error) {
    console.error('Error marking notifications as read:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}