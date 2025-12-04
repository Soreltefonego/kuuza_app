'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreditCard, Smartphone, Banknote, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface CreditsPageContentProps {
  currentBalance: bigint
  managerId: string
}

const PRESET_AMOUNTS = [10000, 25000, 50000, 100000, 250000, 500000]

export function CreditsPageContent({ currentBalance, managerId }: CreditsPageContentProps) {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)

  const handlePurchase = async () => {
    const purchaseAmount = selectedAmount || parseInt(amount)

    if (!purchaseAmount || purchaseAmount <= 0) {
      toast.error('Veuillez entrer un montant valide')
      return
    }

    if (!phoneNumber || phoneNumber.length < 9) {
      toast.error('Veuillez entrer un numéro de téléphone valide')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/manager/buy-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: purchaseAmount,
          phoneNumber,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(result.message || 'Achat de crédit réussi!')

        // Force page refresh to show updated balance
        router.refresh()

        // Reset form
        setAmount('')
        setPhoneNumber('')
        setSelectedAmount(null)

        // Redirect to dashboard after successful purchase
        setTimeout(() => {
          router.push('/manager/dashboard')
        }, 1000)
      } else {
        toast.error(result.error || 'Erreur lors de l\'achat')
      }
    } catch (error) {
      console.error('Purchase error:', error)
      toast.error('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3 md:space-y-6 p-3 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-1 md:space-y-2">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gradient">Acheter des Crédits</h1>
        <p className="text-xs md:text-sm text-muted-foreground">
          Rechargez votre compte pour créditer vos clients
        </p>
      </div>

      {/* Current Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass border-white/10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-purple-500/10" />
          <CardHeader className="relative pb-2 md:pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                  Solde actuel
                </CardTitle>
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-gradient mt-1 md:mt-2">
                  {formatCurrency(Number(currentBalance))}
                </div>
              </div>
              <div className="p-1.5 md:p-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-500">
                <CreditCard className="h-4 w-4 md:h-6 md:w-6 text-white" />
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Purchase Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass border-white/10">
          <CardHeader className="pb-2 md:pb-6">
            <CardTitle className="text-sm md:text-base">Acheter des crédits</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Choisissez votre méthode de paiement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="orange-money" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-3 md:mb-6">
                <TabsTrigger value="orange-money" className="text-xs md:text-sm">
                  <Smartphone className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  Vipps
                </TabsTrigger>
                <TabsTrigger value="mtn-money" disabled className="text-xs md:text-sm">
                  <Smartphone className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  MTN Money
                </TabsTrigger>
              </TabsList>

              <TabsContent value="orange-money" className="space-y-3 md:space-y-6">

                {/* Custom Amount */}
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="amount" className="text-xs md:text-sm">Montant (FCFA)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Entrez le montant"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value)
                      setSelectedAmount(null)
                    }}
                    className="glass h-9 md:h-10"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="phone" className="text-xs md:text-sm">Numéro Vipps</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+47 9XX XX XXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="glass h-9 md:h-10"
                  />
                </div>

                {/* Info Box */}
                <div className="p-2 md:p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex gap-2 md:gap-3">
                    <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-blue-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 md:space-y-1">
                      <p className="text-xs md:text-sm font-medium">Comment ça marche?</p>
                      <ul className="text-[10px] md:text-xs text-muted-foreground space-y-0.5 md:space-y-1">
                        <li className="flex items-start gap-1.5 md:gap-2">
                          <CheckCircle2 className="h-2.5 w-2.5 md:h-3 md:w-3 text-green-400 mt-0.5 shrink-0" />
                          <span>Entrez le montant souhaité</span>
                        </li>
                        <li className="flex items-start gap-1.5 md:gap-2">
                          <CheckCircle2 className="h-2.5 w-2.5 md:h-3 md:w-3 text-green-400 mt-0.5 shrink-0" />
                          <span>Confirmez avec votre numéro Vipps</span>
                        </li>
                        <li className="flex items-start gap-1.5 md:gap-2">
                          <CheckCircle2 className="h-2.5 w-2.5 md:h-3 md:w-3 text-green-400 mt-0.5 shrink-0" />
                          <span>Validez le paiement sur votre téléphone</span>
                        </li>
                        <li className="flex items-start gap-1.5 md:gap-2">
                          <CheckCircle2 className="h-2.5 w-2.5 md:h-3 md:w-3 text-green-400 mt-0.5 shrink-0" />
                          <span>Les crédits sont ajoutés instantanément</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Purchase Button */}
                <Button
                  onClick={handlePurchase}
                  disabled={isLoading || (!amount && !selectedAmount) || !phoneNumber}
                  className="w-full gradient-primary h-9 md:h-12"
                >
                  {isLoading ? (
                    <span className="text-xs md:text-sm">Traitement en cours...</span>
                  ) : (
                    <>
                      <Banknote className="h-3 w-3 md:h-5 md:w-5 mr-1 md:mr-2" />
                      <span className="text-xs md:text-sm">
                        Acheter {amount || selectedAmount ? formatCurrency(parseInt(amount || selectedAmount?.toString() || '0')) : 'des crédits'}
                      </span>
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="mtn-money" className="text-center py-4 md:py-8">
                <div className="mx-auto w-12 h-12 md:w-20 md:h-20 mb-2 md:mb-4 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                  <Smartphone className="h-6 w-6 md:h-10 md:w-10 text-yellow-400" />
                </div>
                <h3 className="text-sm md:text-lg font-semibold mb-1 md:mb-2">Bientôt disponible</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Le paiement par MTN Money sera disponible prochainement
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass border-white/10">
          <CardHeader className="pb-2 md:pb-6">
            <CardTitle className="flex items-center gap-1.5 md:gap-2 text-sm md:text-base">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-400" />
              Avantages des crédits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 md:space-y-0 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
              <div className="flex gap-2 md:gap-3">
                <div className="p-1 md:p-2 rounded-lg bg-violet-500/10 h-fit">
                  <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-violet-400" />
                </div>
                <div>
                  <h4 className="text-xs md:text-sm font-medium mb-0.5 md:mb-1">Instantané</h4>
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    Crédits disponibles immédiatement après paiement
                  </p>
                </div>
              </div>
              <div className="flex gap-2 md:gap-3">
                <div className="p-1 md:p-2 rounded-lg bg-blue-500/10 h-fit">
                  <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xs md:text-sm font-medium mb-0.5 md:mb-1">Sécurisé</h4>
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    Transactions sécurisées avec Vipps
                  </p>
                </div>
              </div>
              <div className="flex gap-2 md:gap-3">
                <div className="p-1 md:p-2 rounded-lg bg-green-500/10 h-fit">
                  <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-green-400" />
                </div>
                <div>
                  <h4 className="text-xs md:text-sm font-medium mb-0.5 md:mb-1">Flexible</h4>
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    Achetez le montant exact dont vous avez besoin
                  </p>
                </div>
              </div>
              <div className="flex gap-2 md:gap-3">
                <div className="p-1 md:p-2 rounded-lg bg-purple-500/10 h-fit">
                  <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-xs md:text-sm font-medium mb-0.5 md:mb-1">Historique</h4>
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    Consultez tous vos achats dans les transactions
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}