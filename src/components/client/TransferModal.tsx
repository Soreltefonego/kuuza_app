'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  X,
  Send,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  User,
  CreditCard,
  Building,
  Globe
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface TransferModalProps {
  isOpen: boolean
  onClose: () => void
  currentBalance: number
}

type TransferStep = 'recipient' | 'amount' | 'confirm' | 'success'

export function TransferModal({ isOpen, onClose, currentBalance }: TransferModalProps) {
  const [step, setStep] = useState<TransferStep>('recipient')
  const [isLoading, setIsLoading] = useState(false)

  // Form data
  const [recipientData, setRecipientData] = useState({
    recipientName: '',
    iban: '',
    bankName: '',
    swift: '',
    country: 'Cameroun'
  })

  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  const handleRecipientSubmit = () => {
    if (!recipientData.recipientName || !recipientData.iban) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }
    setStep('amount')
  }

  const handleAmountSubmit = () => {
    const transferAmount = parseFloat(amount)
    if (!amount || transferAmount <= 0) {
      toast.error('Veuillez entrer un montant valide')
      return
    }
    if (transferAmount > currentBalance) {
      toast.error('Solde insuffisant')
      return
    }
    setStep('confirm')
  }

  const handleConfirmTransfer = async () => {
    setIsLoading(true)

    try {
      // Simuler l'appel API
      await new Promise(resolve => setTimeout(resolve, 2000))

      // TODO: Appeler l'API de transfert
      const response = await fetch('/api/client/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...recipientData,
          amount: parseFloat(amount),
          description
        })
      })

      if (response.ok) {
        setStep('success')
        toast.success('Transfert effectué avec succès!')
      } else {
        throw new Error('Erreur lors du transfert')
      }
    } catch (error) {
      toast.error('Erreur lors du transfert. Veuillez réessayer.')
      console.error('Transfer error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setStep('recipient')
    setRecipientData({
      recipientName: '',
      iban: '',
      bankName: '',
      swift: '',
      country: 'Cameroun'
    })
    setAmount('')
    setDescription('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg"
          >
            <Card className="bg-gray-950 border-gray-800">
              <CardHeader className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="absolute right-4 top-4 text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
                    <Send className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl">Transfert d'argent</CardTitle>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center gap-2 mt-4">
                  <div className={`flex-1 h-1 rounded-full ${
                    step === 'recipient' ? 'bg-blue-500' : 'bg-gray-700'
                  }`} />
                  <div className={`flex-1 h-1 rounded-full ${
                    ['amount', 'confirm', 'success'].includes(step) ? 'bg-blue-500' : 'bg-gray-700'
                  }`} />
                  <div className={`flex-1 h-1 rounded-full ${
                    ['confirm', 'success'].includes(step) ? 'bg-blue-500' : 'bg-gray-700'
                  }`} />
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Step 1: Recipient Information */}
                {step === 'recipient' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor="recipientName">Nom du bénéficiaire *</Label>
                      <div className="relative mt-2">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          id="recipientName"
                          value={recipientData.recipientName}
                          onChange={(e) => setRecipientData({
                            ...recipientData,
                            recipientName: e.target.value
                          })}
                          placeholder="John Doe"
                          className="pl-10 bg-gray-900 border-gray-800"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="iban">IBAN / Numéro de compte *</Label>
                      <div className="relative mt-2">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          id="iban"
                          value={recipientData.iban}
                          onChange={(e) => setRecipientData({
                            ...recipientData,
                            iban: e.target.value.toUpperCase()
                          })}
                          placeholder="CM21 0003 0000 1234 5678 9012 345"
                          className="pl-10 bg-gray-900 border-gray-800 font-mono"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Format IBAN ou numéro de compte local
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="bankName">Nom de la banque</Label>
                      <div className="relative mt-2">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          id="bankName"
                          value={recipientData.bankName}
                          onChange={(e) => setRecipientData({
                            ...recipientData,
                            bankName: e.target.value
                          })}
                          placeholder="Banque Atlantique"
                          className="pl-10 bg-gray-900 border-gray-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="swift">Code SWIFT/BIC</Label>
                        <Input
                          id="swift"
                          value={recipientData.swift}
                          onChange={(e) => setRecipientData({
                            ...recipientData,
                            swift: e.target.value.toUpperCase()
                          })}
                          placeholder="COBACMCX"
                          className="bg-gray-900 border-gray-800 font-mono"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Pays</Label>
                        <div className="relative mt-2">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="country"
                            value={recipientData.country}
                            onChange={(e) => setRecipientData({
                              ...recipientData,
                              country: e.target.value
                            })}
                            placeholder="Cameroun"
                            className="pl-10 bg-gray-900 border-gray-800"
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleRecipientSubmit}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Continuer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                )}

                {/* Step 2: Amount */}
                {step === 'amount' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="p-4 bg-gray-900 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">Destinataire</p>
                      <p className="font-medium">{recipientData.recipientName}</p>
                      <p className="text-sm text-gray-400 font-mono">{recipientData.iban}</p>
                    </div>

                    <div>
                      <Label htmlFor="amount">Montant à envoyer</Label>
                      <div className="relative mt-2">
                        <Input
                          id="amount"
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0"
                          className="text-2xl font-bold bg-gray-900 border-gray-800 pr-16"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                          USD
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Solde disponible: {formatCurrency(currentBalance)}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="description">Description (optionnel)</Label>
                      <Input
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Motif du transfert"
                        className="mt-2 bg-gray-900 border-gray-800"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setStep('recipient')}
                        className="flex-1 border-gray-700"
                      >
                        Retour
                      </Button>
                      <Button
                        onClick={handleAmountSubmit}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        Continuer
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Confirm */}
                {step === 'confirm' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                      <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-500">Vérifiez les détails</p>
                          <p className="text-sm text-gray-400 mt-1">
                            Veuillez vérifier attentivement les informations avant de confirmer.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-500">Destinataire</span>
                        <span className="font-medium">{recipientData.recipientName}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-500">IBAN</span>
                        <span className="font-mono text-sm">{recipientData.iban}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-500">Banque</span>
                        <span>{recipientData.bankName || '-'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-t border-gray-800 pt-3">
                        <span className="text-gray-500">Montant</span>
                        <span className="text-xl font-bold text-blue-400">
                          {formatCurrency(parseFloat(amount))}
                        </span>
                      </div>
                      {description && (
                        <div className="flex justify-between py-2">
                          <span className="text-gray-500">Description</span>
                          <span className="text-sm">{description}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setStep('amount')}
                        className="flex-1 border-gray-700"
                        disabled={isLoading}
                      >
                        Retour
                      </Button>
                      <Button
                        onClick={handleConfirmTransfer}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Traitement...' : 'Confirmer le transfert'}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Success */}
                {step === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="mx-auto w-20 h-20 mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="h-10 w-10 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Transfert réussi!</h3>
                    <p className="text-gray-400 mb-6">
                      {formatCurrency(parseFloat(amount))} ont été envoyés à {recipientData.recipientName}
                    </p>
                    <Button
                      onClick={handleClose}
                      className="w-full bg-gray-800 hover:bg-gray-700"
                    >
                      Fermer
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}