import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { ClientService } from '@/services/client.service'
import { transferSchema } from '@/lib/validations'
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

    if (user.role !== 'CLIENT') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = transferSchema.parse(body)

    if (!user.clientId) {
      return NextResponse.json(
        { error: 'Client ID manquant' },
        { status: 400 }
      )
    }

    const transaction = await ClientService.transfer(
      user.clientId,
      data.recipientEmail,
      data.amount,
      data.description
    )

    return NextResponse.json({
      success: true,
      message: 'Virement effectué avec succès',
      data: transaction,
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

    console.error('Transfer error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}