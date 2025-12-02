import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { ChatService } from '@/services/chat.service'
import { markAsReadSchema } from '@/lib/validations'
import { z } from 'zod'
import { SessionUser } from '@/types'

// POST - Mark messages as read
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

    if (!user.clientId) {
      return NextResponse.json(
        { error: 'Client ID manquant' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const data = markAsReadSchema.parse(body)

    // Verify the conversation belongs to the client
    const conversation = await ChatService.getConversation(
      data.conversationId,
      user.clientId,
      'CLIENT'
    )

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation non trouvée' },
        { status: 404 }
      )
    }

    // Mark messages as read (excluding messages sent by the current user)
    await ChatService.markAsRead(
      data.conversationId,
      data.messageId,
      user.id
    )

    return NextResponse.json({
      success: true,
      message: 'Messages marqués comme lus',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    console.error('Mark as read error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}