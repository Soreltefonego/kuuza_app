import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { ChatService } from '@/services/chat.service'
import { closeConversationSchema } from '@/lib/validations'
import { z } from 'zod'
import { SessionUser } from '@/types'

// POST - Close a conversation
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
    const data = closeConversationSchema.parse(body)

    const conversation = await ChatService.closeConversation(
      data.conversationId,
      user.managerId
    )

    // Serialize BigInt values if any
    const serializedConversation = {
      ...conversation,
      client: (conversation as any).client ? {
        ...(conversation as any).client,
        accountBalance: (conversation as any).client.accountBalance.toString(),
        user: (conversation as any).client.user
      } : null,
      manager: (conversation as any).manager ? {
        ...(conversation as any).manager,
        creditBalance: (conversation as any).manager.creditBalance.toString(),
        user: (conversation as any).manager.user
      } : null
    }

    return NextResponse.json({
      success: true,
      message: 'Conversation fermée avec succès',
      data: serializedConversation,
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

    console.error('Close conversation error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}