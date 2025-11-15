import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { amountToCents } from '@/lib/utils'
import { SessionUser } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Vérifier si c'est l'admin (par rôle ou email temporaire)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    const user = session.user as SessionUser

    if (user.role !== 'ADMIN' && user.email !== 'admin@kuuzabank.com') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { targetId, targetType, amount, description } = body

    if (!targetId || !targetType || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Données invalides' },
        { status: 400 }
      )
    }

    // Convertir le montant en centimes
    const amountInCents = amountToCents(amount)

    // Commencer une transaction
    const result = await prisma.$transaction(async (tx) => {
      let updatedAccount
      let transaction

      if (targetType === 'manager') {
        // Créditer le manager
        updatedAccount = await tx.manager.update({
          where: { id: targetId },
          data: {
            creditBalance: {
              increment: amountInCents
            }
          },
          include: {
            user: true
          }
        })

        // Créer une transaction
        transaction = await tx.transaction.create({
          data: {
            fromUserId: user.id, // Admin
            toUserId: updatedAccount.userId,
            amount: amountInCents,
            status: 'SUCCESS',
            type: 'CREDIT',
            description: description || `Crédit direct par admin`
          }
        })
      } else if (targetType === 'client') {
        // Créditer le client
        updatedAccount = await tx.client.update({
          where: { id: targetId },
          data: {
            accountBalance: {
              increment: amountInCents
            }
          },
          include: {
            user: true
          }
        })

        // Créer une transaction
        transaction = await tx.transaction.create({
          data: {
            fromUserId: user.id, // Admin
            toUserId: updatedAccount.userId,
            amount: amountInCents,
            status: 'SUCCESS',
            type: 'CREDIT',
            description: description || `Crédit direct par admin`
          }
        })
      } else {
        throw new Error('Type de compte invalide')
      }

      return { updatedAccount, transaction }
    })

    return NextResponse.json({
      success: true,
      message: 'Compte crédité avec succès',
      balance: targetType === 'manager'
        ? Number((result.updatedAccount as any).creditBalance)
        : Number((result.updatedAccount as any).accountBalance)
    })

  } catch (error: any) {
    console.error('Erreur lors du crédit:', error)
    console.error('Détails de l\'erreur:', error.message)
    return NextResponse.json(
      { error: error.message || 'Erreur lors du crédit du compte' },
      { status: 500 }
    )
  }
}