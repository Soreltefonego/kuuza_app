import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { ChatService } from '@/services/chat.service'
import { SessionUser } from '@/types'

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

    if (user.role !== 'CLIENT') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 50

    if (!conversationId) {
      return NextResponse.json(
        { error: 'ID de conversation manquant' },
        { status: 400 }
      )
    }

    // Verify the conversation belongs to the client
    const conversation = await ChatService.getConversation(
      conversationId,
      user.clientId!,
      'CLIENT'
    )

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation non trouvée' },
        { status: 404 }
      )
    }

    const result = await ChatService.getMessages(conversationId, page, limit)

    // Transform sender data to include name
    const messagesWithSenderName = result.messages.map(msg => ({
      ...msg,
      senderName: msg.sender ? `${msg.sender.firstName} ${msg.sender.lastName}` : 'System'
    }))

    return NextResponse.json({
      messages: messagesWithSenderName,
      pagination: result.pagination
    })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}