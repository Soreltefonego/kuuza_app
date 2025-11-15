import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { ManagerService } from '@/services/manager.service'
import { createClientSchema } from '@/lib/validations'
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
    const data = createClientSchema.parse(body)

    if (!user.managerId) {
      return NextResponse.json(
        { error: 'Manager ID manquant' },
        { status: 400 }
      )
    }

    const client = await ManagerService.createClient(
      user.managerId,
      data
    )

    const activationLink = `${process.env.NEXTAUTH_URL}/activate/${client.activationToken}`

    return NextResponse.json({
      success: true,
      message: 'Client créé avec succès',
      data: {
        client,
        activationLink,
      },
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

    console.error('Create client error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}