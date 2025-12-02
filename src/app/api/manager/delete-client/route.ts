import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { SessionUser } from '@/types'

const deleteClientSchema = z.object({
  clientId: z.string().min(1, 'Client ID requis'),
  confirmDelete: z.boolean(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const sessionUser = session.user as SessionUser

    const manager = await prisma.manager.findUnique({
      where: { userId: sessionUser.id }
    })

    if (!manager) {
      return NextResponse.json({ error: 'Manager non trouvé' }, { status: 403 })
    }

    const body = await request.json()
    const { clientId, confirmDelete } = deleteClientSchema.parse(body)

    if (!confirmDelete) {
      return NextResponse.json(
        { error: 'Veuillez confirmer la suppression' },
        { status: 400 }
      )
    }

    // Vérifier que le client appartient au manager
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        managerId: manager.id,
        deletedAt: null
      },
      include: {
        user: true
      }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 })
    }

    // Soft delete - marquer comme supprimé (même avec un solde positif)
    await prisma.client.update({
      where: { id: clientId },
      data: {
        deletedAt: new Date(),
        isBlocked: true,
        blockedReason: 'Compte supprimé'
      }
    })

    // Fermer toutes les conversations actives
    await prisma.chatConversation.updateMany({
      where: {
        clientId: clientId,
        status: 'ACTIVE'
      },
      data: {
        status: 'CLOSED',
        closedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: `Le compte de ${client.user.firstName} ${client.user.lastName} a été supprimé`
    })

  } catch (error) {
    console.error('Error deleting client:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}