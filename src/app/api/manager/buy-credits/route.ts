import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { ManagerService } from '@/services/manager.service'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { SessionUser } from '@/types'

const buyCreditsSchema = z.object({
  amount: z.number().positive('Le montant doit être positif'),
  phoneNumber: z.string().min(9, 'Numéro de téléphone invalide'),
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
    const data = buyCreditsSchema.parse(body)

    const result = await ManagerService.buyCredits(
      user.managerId,
      data.amount,
      data.phoneNumber
    )

    // Invalidate relevant cache paths to force fresh data
    revalidatePath('/manager/dashboard', 'page')
    revalidatePath('/manager/credits', 'page')
    revalidatePath('/manager/transactions', 'page')
    revalidatePath('/(manager)', 'layout')

    // Sérialiser les BigInt avant de retourner la réponse
    const serializedResult = {
      ...result,
      transaction: result.transaction ? {
        ...result.transaction,
        amount: result.transaction.amount.toString()
      } : undefined,
      payment: result.payment ? {
        ...result.payment,
        amount: result.payment.amount.toString()
      } : undefined
    }

    return NextResponse.json({
      success: true,
      message: 'Crédit acheté avec succès',
      data: serializedResult,
    })

  } catch (error) {
    console.error('Error buying credits:', error)

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
      { error: 'Erreur lors de l\'achat de crédit' },
      { status: 500 }
    )
  }
}