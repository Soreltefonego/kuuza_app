import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { ChatService } from '@/services/chat.service'
import { getMessagesSchema } from '@/lib/validations'
import { z } from 'zod'
import { SessionUser } from '@/types'

// GET - Get messages for a conversation
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

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!conversationId) {
      return NextResponse.json(
        { error: 'ID de conversation requis' },
        { status: 400 }
      )
    }

    const data = getMessagesSchema.parse({
      conversationId,
      page,
      limit
    })

    // Verify the conversation belongs to the manager or their clients
    const conversation = await ChatService.getConversation(
      data.conversationId,
      user.managerId,
      'MANAGER'
    )

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation non trouvée' },
        { status: 404 }
      )
    }

    const result = await ChatService.getMessages(
      data.conversationId,
      data.page,
      data.limit
    )

    // Transform sender data to include name
    const messagesWithSenderName = result.messages.map((msg: any) => ({
      ...msg,
      senderName: msg.sender ? `${msg.sender.firstName} ${msg.sender.lastName}` : 'System'
    }))

    return NextResponse.json({
      success: true,
      messages: messagesWithSenderName,
      pagination: result.pagination
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

    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}