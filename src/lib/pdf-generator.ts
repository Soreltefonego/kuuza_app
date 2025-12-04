import jsPDF from 'jspdf'
import { formatCurrency, formatDate } from './utils'

interface TransferOrderData {
  reference: string
  date: Date
  senderName: string
  senderAccount?: string
  recipientName: string
  recipientAccount?: string
  amount: number
  currency: string
  description: string
  bankName: string
  status: string
  type: 'incoming' | 'outgoing'
}

export function generateWireTransferPDF(data: TransferOrderData): void {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('KUUZA BANK', 105, 20, { align: 'center' })

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Banque Virtuelle Internationale', 105, 28, { align: 'center' })
  doc.text('www.kuuzabank.com', 105, 34, { align: 'center' })

  // Title
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  const title = data.type === 'incoming' ? 'ORDRE DE VIREMENT REÇU' : 'ORDRE DE VIREMENT ÉMIS'
  doc.text(title, 105, 50, { align: 'center' })

  // Reference and date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Référence: ${data.reference}`, 20, 65)
  doc.text(`Date: ${formatDate(data.date)}`, 140, 65)

  // Divider
  doc.line(20, 70, 190, 70)

  // Sender information
  doc.setFont('helvetica', 'bold')
  doc.text('ÉMETTEUR', 20, 80)
  doc.setFont('helvetica', 'normal')
  doc.text(`Nom: ${data.senderName}`, 20, 88)
  if (data.senderAccount) {
    doc.text(`Compte: ${data.senderAccount}`, 20, 96)
  }

  // Recipient information
  doc.setFont('helvetica', 'bold')
  doc.text('BÉNÉFICIAIRE', 20, 110)
  doc.setFont('helvetica', 'normal')
  doc.text(`Nom: ${data.recipientName}`, 20, 118)
  if (data.recipientAccount) {
    doc.text(`Compte: ${data.recipientAccount}`, 20, 126)
  }
  doc.text(`Banque: ${data.bankName}`, 20, 134)

  // Transaction details
  doc.setFont('helvetica', 'bold')
  doc.text('DÉTAILS DE LA TRANSACTION', 20, 150)
  doc.setFont('helvetica', 'normal')

  // Amount box
  doc.setFillColor(240, 240, 240)
  doc.rect(20, 155, 170, 20, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(`Montant: ${formatCurrency(data.amount)}`, 105, 167, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Devise: ${data.currency}`, 20, 185)
  doc.text(`Motif: ${data.description}`, 20, 193)
  doc.text(`Statut: ${data.status}`, 20, 201)

  // Footer
  doc.line(20, 220, 190, 220)
  doc.setFontSize(8)
  doc.text('Ce document est généré électroniquement et ne nécessite pas de signature.', 105, 230, { align: 'center' })
  doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 105, 236, { align: 'center' })

  // Security notice
  doc.setFontSize(7)
  doc.text('KUUZA BANK - Tous droits réservés - Document confidentiel', 105, 250, { align: 'center' })

  // Save the PDF
  const fileName = `ordre-virement-${data.reference}-${Date.now()}.pdf`
  doc.save(fileName)
}

export function generateTransactionReceipt(transaction: any): void {
  const doc = new jsPDF()

  // Header with logo placeholder
  doc.setFillColor(41, 98, 255)
  doc.rect(0, 0, 210, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('KUUZA BANK', 105, 20, { align: 'center' })

  doc.setFontSize(12)
  doc.text('Reçu de Transaction', 105, 30, { align: 'center' })

  // Reset text color
  doc.setTextColor(0, 0, 0)

  // Transaction status
  const statusColor = transaction.status === 'COMPLETED' ? [0, 128, 0] : [255, 165, 0]
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2])
  doc.rect(20, 50, 170, 10, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.text(transaction.status === 'COMPLETED' ? 'TRANSACTION RÉUSSIE' : 'TRANSACTION EN COURS', 105, 56, { align: 'center' })

  // Reset text color
  doc.setTextColor(0, 0, 0)

  // Transaction details section
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Détails de la Transaction', 20, 75)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)

  const details = [
    ['Référence:', transaction.reference],
    ['Date:', formatDate(transaction.createdAt)],
    ['Type:', transaction.type],
    ['Montant:', formatCurrency(Number(transaction.amount))],
    ['Description:', transaction.description || 'N/A'],
  ]

  let yPos = 85
  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.text(label, 20, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(value, 60, yPos)
    yPos += 8
  })

  // Parties involved
  yPos += 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Parties Impliquées', 20, yPos)

  yPos += 10
  doc.setFontSize(10)

  if (transaction.fromUser) {
    doc.text('De:', 20, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(`${transaction.fromUser.firstName} ${transaction.fromUser.lastName}`, 60, yPos)
    yPos += 8
  }

  if (transaction.toUser) {
    doc.setFont('helvetica', 'bold')
    doc.text('Vers:', 20, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(`${transaction.toUser.firstName} ${transaction.toUser.lastName}`, 60, yPos)
    yPos += 8
  }

  // QR Code placeholder
  doc.setDrawColor(200, 200, 200)
  doc.rect(80, yPos + 10, 50, 50)
  doc.setFontSize(8)
  doc.text('Code de vérification', 105, yPos + 35, { align: 'center' })

  // Footer
  doc.setFontSize(8)
  doc.text('Document généré automatiquement - Ne nécessite pas de signature', 105, 270, { align: 'center' })
  doc.text('KUUZA BANK © 2024 - Tous droits réservés', 105, 275, { align: 'center' })

  // Save
  doc.save(`recu-${transaction.reference}.pdf`)
}