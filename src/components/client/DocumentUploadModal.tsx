'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  X,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  File,
  Image as ImageIcon
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface DocumentUploadModalProps {
  isOpen: boolean
  onClose: () => void
  transactionId: string
  onUploadSuccess: () => void
  transactionDetails?: {
    amount: number
    recipient: string
    description: string
  }
}

export function DocumentUploadModal({
  isOpen,
  onClose,
  transactionId,
  onUploadSuccess,
  transactionDetails
}: DocumentUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [documentType, setDocumentType] = useState<'invoice' | 'contract' | 'other'>('invoice')

  const acceptedFileTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg'
  ]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!acceptedFileTypes.includes(file.type)) {
        toast.error('Format de fichier non supporté. Utilisez PDF, JPG ou PNG.')
        return
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Le fichier est trop volumineux. Taille maximale: 5MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Veuillez sélectionner un document')
      return
    }

    setIsUploading(true)

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('transactionId', transactionId)
      formData.append('documentType', documentType)

      // TODO: Implement actual file upload to server
      const response = await fetch('/api/client/upload-document', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        toast.success('Document téléversé avec succès!')
        onUploadSuccess()
        handleClose()
      } else {
        throw new Error('Erreur lors du téléversement')
      }
    } catch (error) {
      toast.error('Erreur lors du téléversement du document')
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setUploadProgress(0)
    onClose()
  }

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />
    }
    return <ImageIcon className="h-8 w-8 text-blue-500" />
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <Card className="bg-card border-border">
              <CardHeader className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl">Document Justificatif Requis</CardTitle>
                </div>
                <CardDescription>
                  Pour finaliser votre virement, veuillez téléverser un document justificatif
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Transaction details */}
                {transactionDetails && (
                  <div className="p-4 bg-secondary rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Montant:</span>
                      <span className="font-medium">${transactionDetails.amount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Bénéficiaire:</span>
                      <span className="font-medium">{transactionDetails.recipient}</span>
                    </div>
                    {transactionDetails.description && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Motif:</span>
                        <span className="font-medium">{transactionDetails.description}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Document type selection */}
                <div className="space-y-2">
                  <Label>Type de document</Label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as any)}
                    className="w-full p-2 bg-secondary border border-border rounded-lg"
                  >
                    <option value="invoice">Facture</option>
                    <option value="contract">Contrat</option>
                    <option value="other">Autre justificatif</option>
                  </select>
                </div>

                {/* File upload area */}
                <div className="space-y-2">
                  <Label>Document (PDF, JPG, PNG - Max 5MB)</Label>
                  <div className="relative">
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-secondary hover:bg-muted transition-colors"
                    >
                      {selectedFile ? (
                        <div className="flex items-center gap-3">
                          {getFileIcon(selectedFile)}
                          <div className="text-left">
                            <p className="font-medium text-sm">{selectedFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(selectedFile.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Cliquez pour sélectionner un fichier
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Upload progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Téléversement en cours...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Information notice */}
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                    <div className="text-xs text-muted-foreground">
                      <p>Ce document sera vérifié par notre équipe.</p>
                      <p>Le virement sera exécuté après validation.</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={isUploading}
                    className="flex-1 border-border"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isUploading ? 'Téléversement...' : 'Téléverser et Finaliser'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}