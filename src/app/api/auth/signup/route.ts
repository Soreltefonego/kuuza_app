import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signupSchema } from '@/lib/validations'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting signup process...')

    const body = await request.json()
    console.log('Request body received:', { email: body.email, firstName: body.firstName })

    const data = signupSchema.parse(body)
    console.log('Validation passed')

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)
    console.log('Password hashed')

    // Create user and manager in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          role: 'MANAGER',
        }
      })

      console.log('User created:', newUser.id)

      // Create manager profile
      const manager = await tx.manager.create({
        data: {
          userId: newUser.id,
          creditBalance: BigInt(0),
        }
      })

      console.log('Manager profile created:', manager.id)

      return {
        user: newUser,
        manager: manager
      }
    })

    console.log('Account created successfully')

    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès',
      data: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
      },
    })

  } catch (error) {
    console.error('Signup error:', error)

    if (error instanceof z.ZodError) {
      const firstError = error.issues?.[0]
      return NextResponse.json(
        { error: firstError?.message || 'Erreur de validation' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du compte' },
      { status: 500 }
    )
  }
}