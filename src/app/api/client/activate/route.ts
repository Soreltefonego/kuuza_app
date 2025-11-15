import { NextRequest, NextResponse } from 'next/server'
import { ClientService } from '@/services/client.service'
import { activateAccountSchema } from '@/lib/validations'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = activateAccountSchema.parse(body)

    const client = await ClientService.activateAccount(
      data.token,
      data.password
    )

    return NextResponse.json({
      success: true,
      message: 'Compte activé avec succès',
      data: {
        email: client.user.email,
        firstName: client.user.firstName,
        lastName: client.user.lastName,
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

    console.error('Activation error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}