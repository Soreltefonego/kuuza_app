import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    // Vérifier si un admin existe déjà (par email spécifique)
    const existingAdmin = await prisma.user.findFirst({
      where: { email: 'admin@kuuzabank.com' }
    })

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Créer le hash du mot de passe
    const password = 'Admin@123'
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer le compte avec le rôle MANAGER temporairement
    const admin = await prisma.user.create({
      data: {
        email: 'admin@kuuzabank.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        phone: '+237600000000',
        role: 'MANAGER' // Utiliser MANAGER temporairement
      }
    })

    // Créer aussi un enregistrement Manager pour éviter les erreurs
    await prisma.manager.create({
      data: {
        userId: admin.id,
        creditBalance: 0
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès',
      email: admin.email,
      note: 'Utilisez email: admin@kuuzabank.com et mot de passe: Admin@123'
    })

  } catch (error) {
    console.error('Erreur lors de la création du compte admin:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte admin' },
      { status: 500 }
    )
  }
}