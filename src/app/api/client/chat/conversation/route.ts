import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { ChatService } from '@/services/chat.service'
import { createConversationSchema } from '@/lib/validations'
import { z } from 'zod'
import { SessionUser } from '@/types'
import { prisma } from '@/lib/prisma'

// GET - Get or create conversation for client
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

    if (!user.clientId) {
      return NextResponse.json(
        { error: 'Client ID manquant' },
        { status: 400 }
      )
    }

    // Check if client has an active conversation
    let conversation = await ChatService.getConversationByClient(user.clientId)

    // If no active conversation exists, create a new one
    if (!conversation) {
      // Check if there was a previous closed conversation
      const closedConversation = await prisma.chatConversation.findFirst({
        where: {
          clientId: user.clientId,
          status: 'CLOSED'
        },
        orderBy: {
          closedAt: 'desc'
        }
      })

      // Create a new conversation
      conversation = await ChatService.createConversation(
        user.clientId,
        closedConversation ? 'Nouvelle conversation' : 'Support général'
      )
    }

    // Serialize BigInt values to strings
    const serializedConversation = conversation ? {
      ...conversation,
      client: (conversation as any).client ? {
        ...(conversation as any).client,
        accountBalance: (conversation as any).client.accountBalance?.toString()
      } : null,
      manager: (conversation as any).manager ? {
        ...(conversation as any).manager,
        creditBalance: (conversation as any).manager.creditBalance?.toString()
      } : null
    } : null

    return NextResponse.json({
      success: true,
      data: serializedConversation,
    })
  } catch (error) {
    console.error('Get conversation error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}

// POST - Create new conversation with optional subject
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
    const data = createConversationSchema.parse(body)

    // Check if client already has an active conversation
    const existingConversation = await ChatService.getConversationByClient(user.clientId)
    if (existingConversation) {
      return NextResponse.json(
        { error: 'Une conversation active existe déjà' },
        { status: 400 }
      )
    }

    const conversation = await ChatService.createConversation(user.clientId, data.subject)

    return NextResponse.json({
      success: true,
      message: 'Conversation créée avec succès',
      data: conversation,
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

    console.error('Create conversation error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}