import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { SessionUser } from '@/types'

const createConversationSchema = z.object({
  clientId: z.string().min(1, 'Client ID requis'),
  subject: z.string().optional().default('Support général'),
  message: z.string().min(1, 'Message initial requis')
})

// POST - Create a new conversation with a client
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
    const data = createConversationSchema.parse(body)

    // Verify the client belongs to this manager
    const client = await prisma.client.findFirst({
      where: {
        id: data.clientId,
        managerId: user.managerId,
        deletedAt: null
      }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client non trouvé ou non autorisé' },
        { status: 404 }
      )
    }

    // Check if there's already an active conversation
    const existingConversation = await prisma.chatConversation.findFirst({
      where: {
        clientId: data.clientId,
        status: 'ACTIVE'
      }
    })

    if (existingConversation) {
      // Send a message to the existing conversation instead
      const message = await prisma.chatMessage.create({
        data: {
          conversationId: existingConversation.id,
          senderId: user.id,
          senderType: 'MANAGER',
          content: data.message
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Message envoyé dans la conversation existante',
        data: {
          conversation: existingConversation,
          message
        }
      })
    }

    // Create new conversation
    const conversation = await prisma.chatConversation.create({
      data: {
        clientId: data.clientId,
        managerId: user.managerId,
        subject: data.subject,
        status: 'ACTIVE'
      }
    })

    // Send the initial message
    const message = await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: user.id,
        senderType: 'MANAGER',
        content: data.message
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Conversation créée avec succès',
      data: {
        conversation,
        message
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
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