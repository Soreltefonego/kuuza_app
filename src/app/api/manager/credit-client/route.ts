import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { ManagerService } from '@/services/manager.service'
import { creditClientSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { SessionUser } from '@/types'

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

    const body = await request.json()
    const data = creditClientSchema.parse(body)

    if (!user.managerId) {
      return NextResponse.json(
        { error: 'Manager ID manquant' },
        { status: 400 }
      )
    }

    const result = await ManagerService.creditClient(
      user.managerId,
      data
    )

    // Invalidate relevant cache paths to force fresh data
    revalidatePath('/manager/dashboard', 'page')
    revalidatePath('/manager/clients', 'page')
    revalidatePath('/manager/transactions', 'page')
    revalidatePath('/(manager)', 'layout')

    // Sérialiser les BigInt avant de retourner la réponse
    const serializedResult = {
      transaction: {
        ...result.transaction,
        amount: result.transaction.amount.toString()
      },
      client: {
        ...result.client,
        accountBalance: result.client.accountBalance.toString()
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Client crédité avec succès',
      data: serializedResult,
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

    console.error('Credit client error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}