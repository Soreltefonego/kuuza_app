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
import { toast } from 'react-hot-toast'

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

      if (response.ok) {
        toast.success('Achat de crédit réussi!')
        router.refresh()
        setAmount('')
        setPhoneNumber('')
        setSelectedAmount(null)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erreur lors de l\'achat')
      }
    } catch (error) {
      toast.error('Erreur lors de l\'achat de crédit')
    }
    setIsLoading(false)
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gradient">Acheter des Crédits</h1>
        <p className="text-sm text-muted-foreground">
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
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Solde actuel
                </CardTitle>
                <div className="text-3xl sm:text-4xl font-bold text-gradient mt-2">
                  {formatCurrency(Number(currentBalance))}
                </div>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-500">
                <CreditCard className="h-6 w-6 text-white" />
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
          <CardHeader>
            <CardTitle>Acheter des crédits</CardTitle>
            <CardDescription>
              Choisissez votre méthode de paiement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="orange-money" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="orange-money">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Orange Money
                </TabsTrigger>
                <TabsTrigger value="mtn-money" disabled>
                  <Smartphone className="h-4 w-4 mr-2" />
                  MTN Money
                </TabsTrigger>
              </TabsList>

              <TabsContent value="orange-money" className="space-y-6">
                {/* Preset Amounts */}
                <div className="space-y-2">
                  <Label>Montants suggérés</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRESET_AMOUNTS.map((presetAmount) => (
                      <Button
                        key={presetAmount}
                        variant={selectedAmount === presetAmount ? 'default' : 'outline'}
                        className={`h-auto py-3 ${
                          selectedAmount === presetAmount ? 'gradient-primary' : 'glass-hover'
                        }`}
                        onClick={() => {
                          setSelectedAmount(presetAmount)
                          setAmount(presetAmount.toString())
                        }}
                      >
                        <div className="text-center">
                          <div className="font-bold">{formatCurrency(presetAmount)}</div>
                          <div className="text-xs opacity-70">FCFA</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Montant personnalisé (FCFA)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Entrez le montant"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value)
                      setSelectedAmount(null)
                    }}
                    className="glass"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Numéro Orange Money</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+237 6XX XXX XXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="glass"
                  />
                </div>

                {/* Info Box */}
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Comment ça marche?</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-3 w-3 text-green-400 mt-0.5 shrink-0" />
                          <span>Entrez le montant souhaité</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-3 w-3 text-green-400 mt-0.5 shrink-0" />
                          <span>Confirmez avec votre numéro Orange Money</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-3 w-3 text-green-400 mt-0.5 shrink-0" />
                          <span>Validez le paiement sur votre téléphone</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-3 w-3 text-green-400 mt-0.5 shrink-0" />
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
                  className="w-full gradient-primary h-12"
                >
                  {isLoading ? (
                    <>Traitement en cours...</>
                  ) : (
                    <>
                      <Banknote className="h-5 w-5 mr-2" />
                      Acheter {amount || selectedAmount ? formatCurrency(parseInt(amount || selectedAmount?.toString() || '0')) : 'des crédits'}
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="mtn-money" className="text-center py-8">
                <div className="mx-auto w-20 h-20 mb-4 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                  <Smartphone className="h-10 w-10 text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Bientôt disponible</h3>
                <p className="text-sm text-muted-foreground">
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Avantages des crédits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10 h-fit">
                  <CheckCircle2 className="h-4 w-4 text-violet-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Instantané</h4>
                  <p className="text-xs text-muted-foreground">
                    Crédits disponibles immédiatement après paiement
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 h-fit">
                  <CheckCircle2 className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Sécurisé</h4>
                  <p className="text-xs text-muted-foreground">
                    Transactions sécurisées avec Orange Money
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-green-500/10 h-fit">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Flexible</h4>
                  <p className="text-xs text-muted-foreground">
                    Achetez le montant exact dont vous avez besoin
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 h-fit">
                  <CheckCircle2 className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Historique</h4>
                  <p className="text-xs text-muted-foreground">
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