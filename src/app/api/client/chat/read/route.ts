import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { ChatService } from '@/services/chat.service'
import { SessionUser } from '@/types'

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

    if (user.role !== 'CLIENT') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { conversationId, messageId } = body

    if (!conversationId) {
      return NextResponse.json(
        { error: 'ID de conversation manquant' },
        { status: 400 }
      )
    }

    // Mark messages as read
    await ChatService.markAsRead(conversationId, messageId, user.id)

    return NextResponse.json({
      success: true,
      message: 'Messages marqués comme lus'
    })
  } catch (error) {
    console.error('Mark as read error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}