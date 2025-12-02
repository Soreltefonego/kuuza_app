'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  X,
  Plus,
  CreditCard,
  Smartphone,
  Building,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface RechargeModalProps {
  isOpen: boolean
  onClose: () => void
  currentBalance: number
}

export function RechargeModal({ isOpen, onClose, currentBalance }: RechargeModalProps) {
  const [amount, setAmount] = useState('')
  const [bankData, setBankData] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    swift: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const quickAmounts = [5000, 10000, 25000, 50000, 100000]

  const handleRecharge = async () => {
    const rechargeAmount = parseFloat(amount)

    if (!amount || rechargeAmount <= 0) {
      toast.error('Veuillez entrer un montant valide')
      return
    }

    if (!bankData.bankName || !bankData.accountNumber || !bankData.accountHolder) {
      toast.error('Veuillez remplir tous les champs bancaires obligatoires')
      return
    }

    setIsLoading(true)

    try {
      // Simuler l'appel API
      await new Promise(resolve => setTimeout(resolve, 2000))

      // TODO: Appeler l'API de recharge
      const response = await fetch('/api/client/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: rechargeAmount,
          paymentMethod: 'bank',
          bankData
        })
      })

      if (response.ok) {
        setIsSuccess(true)
        toast.success('Recharge effectuée avec succès!')
      } else {
        throw new Error('Erreur lors de la recharge')
      }
    } catch (error) {
      toast.error('Erreur lors de la recharge. Veuillez réessayer.')
      console.error('Recharge error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setAmount('')
    setBankData({
      bankName: '',
      accountNumber: '',
      accountHolder: '',
      swift: ''
    })
    setIsSuccess(false)
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

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500">
                    <Building className="h-5 w-5 text-foreground" />
                  </div>
                  <CardTitle className="text-xl">Virement bancaire</CardTitle>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {!isSuccess ? (
                  <>
                    {/* Current Balance */}
                    <div className="p-4 bg-secondary rounded-xl">
                      <p className="text-sm text-muted-foreground mb-1">Solde actuel</p>
                      <p className="text-2xl font-bold">{formatCurrency(currentBalance)}</p>
                    </div>

                    {/* Amount Input */}
                    <div>
                      <Label htmlFor="amount">Montant à recharger</Label>
                      <div className="relative mt-2">
                        <Input
                          id="amount"
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0"
                          className="text-xl font-bold bg-secondary border-border pr-16"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          USD
                        </span>
                      </div>
                    </div>

                    {/* Quick Amounts */}
                    <div className="grid grid-cols-3 gap-2">
                      {quickAmounts.map((quickAmount) => (
                        <Button
                          key={quickAmount}
                          variant="outline"
                          size="sm"
                          onClick={() => setAmount(quickAmount.toString())}
                          className="border-border hover:bg-muted"
                        >
                          {formatCurrency(quickAmount).replace('$', '')}
                        </Button>
                      ))}
                    </div>

                    {/* Bank Transfer Form */}
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <div className="flex gap-3">
                          <AlertCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium text-blue-500 mb-1">Coordonnées bancaires</p>
                            <p className="text-muted-foreground">
                              Veuillez renseigner vos coordonnées bancaires pour effectuer le virement.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="bankName" className="text-foreground">Nom de la banque *</Label>
                          <Input
                            id="bankName"
                            value={bankData.bankName}
                            onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })}
                            placeholder="Ex: BICEC, UBA, Société Générale..."
                            className="mt-1 bg-secondary border-border text-foreground"
                          />
                        </div>

                        <div>
                          <Label htmlFor="accountHolder" className="text-foreground">Titulaire du compte *</Label>
                          <Input
                            id="accountHolder"
                            value={bankData.accountHolder}
                            onChange={(e) => setBankData({ ...bankData, accountHolder: e.target.value })}
                            placeholder="Nom complet du titulaire"
                            className="mt-1 bg-secondary border-border text-foreground"
                          />
                        </div>

                        <div>
                          <Label htmlFor="accountNumber" className="text-foreground">Numéro de compte *</Label>
                          <Input
                            id="accountNumber"
                            value={bankData.accountNumber}
                            onChange={(e) => setBankData({ ...bankData, accountNumber: e.target.value })}
                            placeholder="Ex: 12345678901234567890"
                            className="mt-1 bg-secondary border-border text-foreground"
                          />
                        </div>

                        <div>
                          <Label htmlFor="swift" className="text-foreground">Code SWIFT/BIC (optionnel)</Label>
                          <Input
                            id="swift"
                            value={bankData.swift}
                            onChange={(e) => setBankData({ ...bankData, swift: e.target.value })}
                            placeholder="Ex: BICECMCX"
                            className="mt-1 bg-secondary border-border text-foreground"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Code SWIFT pour les virements internationaux
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                        <div className="flex gap-3">
                          <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                          <div className="text-xs">
                            <p className="font-medium text-yellow-500 mb-1">Information importante</p>
                            <p className="text-muted-foreground">
                              Les virements bancaires peuvent prendre 24-48h pour être traités.
                              Vous recevrez une confirmation par email une fois le virement validé.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      onClick={handleRecharge}
                      disabled={isLoading || !amount}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isLoading ? 'Traitement...' : `Recharger ${amount ? formatCurrency(parseFloat(amount)) : ''}`}
                    </Button>
                  </>
                ) : (
                  /* Success State */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="mx-auto w-20 h-20 mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="h-10 w-10 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Recharge réussie!</h3>
                    <p className="text-muted-foreground mb-2">
                      {formatCurrency(parseFloat(amount))} ont été ajoutés à votre compte
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                      Nouveau solde: {formatCurrency(currentBalance + parseFloat(amount))}
                    </p>
                    <Button
                      onClick={handleClose}
                      className="w-full bg-muted hover:bg-muted"
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