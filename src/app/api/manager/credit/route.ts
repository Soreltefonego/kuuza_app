import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { ManagerService } from '@/services/manager.service'
import { z } from 'zod'
import { SessionUser } from '@/types'

const creditClientSchema = z.object({
  clientId: z.string().min(1, 'Client ID requis'),
  amount: z.number().positive('Le montant doit être positif'),
  senderName: z.string().optional(),
  description: z.string().optional(),
})

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

    if (!user.managerId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = creditClientSchema.parse(body)

    const result = await ManagerService.creditClient(user.managerId, data)

    // Convert all BigInt values to numbers for JSON response
    const newBalance = Number(result.newBalance)
    const serializedResult = {
      ...result,
      client: {
        ...result.client,
        accountBalance: Number(result.client.accountBalance)
      },
      transaction: {
        ...result.transaction,
        amount: Number(result.transaction.amount)
      },
      newBalance: newBalance
    }

    return NextResponse.json({
      success: true,
      message: `Client crédité avec succès! Nouveau solde: ${newBalance} XAF`,
      data: serializedResult,
      newBalance: newBalance
    })

  } catch (error) {
    console.error('Error crediting client:', error)

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

    return NextResponse.json(
      { error: 'Erreur lors du crédit' },
      { status: 500 }
    )
  }
}