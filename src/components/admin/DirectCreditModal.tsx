'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  X,
  CreditCard,
  User,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Send,
  Building,
  Hash,
  Mail,
  Phone
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface DirectCreditModalProps {
  isOpen: boolean
  onClose: () => void
  account: any
  onSuccess: () => void
}

export function DirectCreditModal({
  isOpen,
  onClose,
  account,
  onSuccess
}: DirectCreditModalProps) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [transactionComplete, setTransactionComplete] = useState(false)

  if (!account) return null

  const isManager = account.type === 'manager'
  const displayName = isManager
    ? `${account.user.firstName} ${account.user.lastName}`
    : `${account.user.firstName} ${account.user.lastName}`
  const currentBalance = isManager
    ? Number(account.creditBalance)
    : Number(account.accountBalance)

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Veuillez entrer un montant valide')
      return
    }

    setShowConfirmation(true)
  }

  const confirmCredit = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/admin/credit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetId: account.id,
          targetType: account.type,
          amount: parseFloat(amount),
          description
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors du crédit')
      }

      setTransactionComplete(true)
      setTimeout(() => {
        onSuccess()
        resetModal()
      }, 2000)
    } catch (error) {
      toast.error('Erreur lors du crédit du compte')
      console.error(error)
    } finally {
      setIsProcessing(false)
    }
  }

  const resetModal = () => {
    setAmount('')
    setDescription('')
    setShowConfirmation(false)
    setTransactionComplete(false)
    onClose()
  }

  const quickAmounts = [50000, 100000, 250000, 500000, 1000000]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl"
          >
            <Card className="glass border-white/10">
              <CardHeader className="border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle>Crédit Direct</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {!showConfirmation && !transactionComplete && (
                  <div className="space-y-6">
                    {/* Account Info */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {isManager ? (
                            <Building className="h-5 w-5 text-purple-400" />
                          ) : (
                            <User className="h-5 w-5 text-cyan-400" />
                          )}
                          <Badge variant="outline" className={isManager ? "border-purple-500/50 text-purple-400" : "border-cyan-500/50 text-cyan-400"}>
                            {isManager ? 'Manager' : 'Client'}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Solde actuel</p>
                          <p className="text-lg font-bold text-gradient">
                            {formatCurrency(currentBalance)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Nom</p>
                          <p className="font-medium">{displayName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Email</p>
                          <p className="font-medium text-sm">{account.user.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">ID</p>
                          <p className="font-mono text-sm">{account.id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Téléphone</p>
                          <p className="font-medium text-sm">{account.user.phone || 'Non renseigné'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                      <Label className="text-sm text-gray-400">Montant à créditer (FCFA)</Label>
                      <div className="mt-2">
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                          <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            className="pl-10 text-2xl font-bold h-14 glass border-white/10"
                          />
                        </div>

                        {/* Quick amounts */}
                        <div className="grid grid-cols-5 gap-2 mt-3">
                          {quickAmounts.map((value) => (
                            <Button
                              key={value}
                              variant="outline"
                              size="sm"
                              onClick={() => setAmount(value.toString())}
                              className="border-gray-700 hover:bg-white/10"
                            >
                              {value >= 1000000 ? `${value / 1000000}M` : `${value / 1000}K`}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <Label className="text-sm text-gray-400">Description (optionnelle)</Label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Raison du crédit..."
                        className="mt-2 w-full px-3 py-2 rounded-lg glass border border-white/10 bg-transparent resize-none h-24 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      />
                    </div>

                    {/* Preview */}
                    {amount && parseFloat(amount) > 0 && (
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-500 font-medium">Aperçu de la transaction</span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p>
                            Nouveau solde après crédit:{' '}
                            <span className="font-bold text-green-400">
                              {formatCurrency(currentBalance + parseFloat(amount))}
                            </span>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 border-gray-700"
                      >
                        Annuler
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={!amount || parseFloat(amount) <= 0}
                        className="flex-1 gradient-primary"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Créditer le compte
                      </Button>
                    </div>
                  </div>
                )}

                {/* Confirmation */}
                {showConfirmation && !transactionComplete && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="text-center py-6">
                      <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                        <AlertCircle className="h-8 w-8 text-yellow-500" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Confirmer le crédit</h3>
                      <p className="text-gray-400">
                        Vous êtes sur le point de créditer ce compte
                      </p>
                    </div>

                    <div className="space-y-3 p-4 rounded-lg bg-white/5">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Bénéficiaire</span>
                        <span className="font-medium">{displayName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type de compte</span>
                        <Badge variant="outline" className={isManager ? "border-purple-500/50 text-purple-400" : "border-cyan-500/50 text-cyan-400"}>
                          {isManager ? 'Manager' : 'Client'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Montant</span>
                        <span className="text-xl font-bold text-gradient">
                          {formatCurrency(parseFloat(amount))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Nouveau solde</span>
                        <span className="font-bold text-green-400">
                          {formatCurrency(currentBalance + parseFloat(amount))}
                        </span>
                      </div>
                      {description && (
                        <div className="pt-3 border-t border-white/10">
                          <p className="text-sm text-gray-400">Description</p>
                          <p className="mt-1">{description}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowConfirmation(false)}
                        disabled={isProcessing}
                        className="flex-1 border-gray-700"
                      >
                        Retour
                      </Button>
                      <Button
                        onClick={confirmCredit}
                        disabled={isProcessing}
                        className="flex-1 gradient-primary"
                      >
                        {isProcessing ? (
                          <>
                            <div className="h-4 w-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Traitement...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirmer le crédit
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Success */}
                {transactionComplete && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="mx-auto w-20 h-20 mb-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center"
                    >
                      <CheckCircle className="h-10 w-10 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-2">Crédit effectué!</h3>
                    <p className="text-gray-400 mb-4">
                      Le compte a été crédité avec succès
                    </p>
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 inline-block">
                      <p className="text-3xl font-bold text-gradient">
                        {formatCurrency(parseFloat(amount))}
                      </p>
                    </div>
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