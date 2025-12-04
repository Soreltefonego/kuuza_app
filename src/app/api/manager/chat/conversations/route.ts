import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { ChatService } from '@/services/chat.service'
import { SessionUser } from '@/types'

// GET - Get all conversations for a manager
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

    const conversations = await ChatService.getAllConversations(user.managerId)

    // Serialize BigInt values if any
    const serializedConversations = conversations.map(conversation => ({
      ...conversation,
      client: {
        ...conversation.client,
        accountBalance: conversation.client?.accountBalance?.toString(),
        user: conversation.client?.user
      },
      manager: conversation.manager ? {
        ...conversation.manager,
        creditBalance: conversation.manager.creditBalance.toString(),
        user: conversation.manager.user
      } : null
    }))

    return NextResponse.json({
      success: true,
      data: serializedConversations,
    })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    console.error('Get conversations error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}