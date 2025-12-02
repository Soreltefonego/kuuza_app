const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Vérifier si un admin existe déjà
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      console.log('❌ Un compte admin existe déjà:')
      console.log('Email:', existingAdmin.email)
      return
    }

    // Créer le hash du mot de passe
    const password = 'Admin@123' // Mot de passe par défaut
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer le compte admin
    const admin = await prisma.user.create({
      data: {
        email: 'admin@kuuzabank.com',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        phone: '+4790000000',
        role: 'ADMIN',
        isEmailVerified: true
      }
    })

    console.log('✅ Compte Super Admin créé avec succès!')
    console.log('📧 Email:', admin.email)
    console.log('🔑 Mot de passe:', password)
    console.log('🔗 URL:', 'http://localhost:3002/admin/dashboard')
    console.log('\n⚠️  IMPORTANT: Changez le mot de passe après la première connexion!')

  } catch (error) {
    console.error('❌ Erreur lors de la création du compte admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()