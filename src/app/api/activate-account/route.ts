import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const activateAccountSchema = z.object({
  token: z.string().min(1, 'Token requis'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/\d/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Le mot de passe doit contenir au moins un caractère spécial')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = activateAccountSchema.parse(body)

    // Find client by activation token
    const client = await prisma.client.findFirst({
      where: {
        activationToken: token,
        isActivated: false
      },
      include: {
        user: true
      }
    })

    if (!client) {
      return NextResponse.json(
        { message: 'Token invalide ou déjà utilisé' },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user password and activate the client account
    await prisma.$transaction([
      // Update user password
      prisma.user.update({
        where: { id: client.user.id },
        data: { password: hashedPassword }
      }),
      // Activate client account
      prisma.client.update({
        where: { id: client.id },
        data: {
          isActivated: true,
          activationToken: null // Clear the token after use
        }
      })
    ])

    return NextResponse.json({
      success: true,
      message: 'Compte activé avec succès'
    })

  } catch (error) {
    console.error('Error activating account:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Erreur lors de l\'activation du compte' },
      { status: 500 }
    )
  }
}