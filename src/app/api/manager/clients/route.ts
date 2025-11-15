import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { ManagerService } from '@/services/manager.service'
import { z } from 'zod'
import { SessionUser } from '@/types'

const createClientSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
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
    const data = createClientSchema.parse(body)

    const client = await ManagerService.createClient(user.managerId, data)

    // Convert BigInt values to strings for JSON serialization
    const serializedClient = {
      ...client,
      accountBalance: client.accountBalance.toString(),
      user: {
        ...client.user,
        id: client.user.id
      }
    }

    return NextResponse.json({
      success: true,
      data: serializedClient,
    })

  } catch (error) {
    console.error('Error creating client:', error)

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
      { error: 'Erreur lors de la création du client' },
      { status: 500 }
    )
  }
}