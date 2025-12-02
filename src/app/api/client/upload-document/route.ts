import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TransactionStatus } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const transactionId = formData.get('transactionId') as string
    const documentType = formData.get('documentType') as string

    if (!file || !transactionId) {
      return NextResponse.json(
        { error: 'Fichier et ID de transaction requis' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non supporté' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux (max 5MB)' },
        { status: 400 }
      )
    }

    // Update transaction with document info
    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        metadata: {
          documentUploaded: true,
          documentType: documentType || 'Justificatif de transfert',
          documentName: file.name,
          documentUploadedAt: new Date().toISOString()
        },
        status: TransactionStatus.SUCCESS
      }
    })

    // In a real application, you would:
    // 1. Upload the file to a storage service (S3, Cloudinary, etc.)
    // 2. Store the file URL in the database
    // 3. Implement proper file validation and virus scanning

    return NextResponse.json({
      success: true,
      message: 'Document téléversé avec succès',
      transactionId: transaction.id
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du téléversement' },
      { status: 500 }
    )
  }
}