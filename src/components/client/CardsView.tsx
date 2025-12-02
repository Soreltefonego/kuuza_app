'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CreditCard,
  Plus,
  Lock,
  Unlock,
  Settings,
  Eye,
  EyeOff,
  Copy,
  MoreVertical,
  Wifi,
  ShoppingBag,
  Globe,
  Shield
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'

interface CardsViewProps {
  client: any
}

export function CardsView({ client }: CardsViewProps) {
  const [showCardNumber, setShowCardNumber] = useState<{ [key: string]: boolean }>({})
  const [selectedCard, setSelectedCard] = useState<string | null>(null)

  // Données simulées des cartes
  const cards = [
    {
      id: '1',
      type: 'visa',
      name: 'Carte Visa Classic',
      number: '4532 1234 5678 9012',
      holder: `${client.user.firstName} ${client.user.lastName}`,
      expiry: '12/26',
      cvv: '123',
      status: 'active',
      balance: 150000,
      color: 'from-blue-600 to-blue-800',
      features: ['Sans contact', 'Achats en ligne', 'International']
    },
    {
      id: '2',
      type: 'mastercard',
      name: 'Carte Mastercard Gold',
      number: '5412 7512 3412 3456',
      holder: `${client.user.firstName} ${client.user.lastName}`,
      expiry: '09/25',
      cvv: '456',
      status: 'active',
      balance: 500000,
      color: 'from-yellow-600 to-amber-700',
      features: ['Sans contact', 'Achats en ligne', 'International', 'Assurance voyage']
    },
    {
      id: '3',
      type: 'virtual',
      name: 'Carte Virtuelle',
      number: '4916 3385 5398 2511',
      holder: `${client.user.firstName} ${client.user.lastName}`,
      expiry: '06/24',
      cvv: '789',
      status: 'inactive',
      balance: 25000,
      color: 'from-purple-600 to-pink-600',
      features: ['Achats en ligne uniquement', 'Sécurisée']
    }
  ]

  const handleCopyCardNumber = (cardNumber: string) => {
    navigator.clipboard.writeText(cardNumber.replace(/\s/g, ''))
    toast.success('Numéro de carte copié')
  }

  const handleToggleCard = (cardId: string, currentStatus: string) => {
    const action = currentStatus === 'active' ? 'bloquée' : 'activée'
    toast.success(`Carte ${action} avec succès`)
  }

  const maskCardNumber = (number: string) => {
    const parts = number.split(' ')
    return `${parts[0]} •••• •••• ${parts[3]}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold mb-2 text-foreground">Mes Cartes</h2>
          <p className="text-sm lg:text-base text-muted-foreground">Gérez vos cartes bancaires</p>
        </div>
        <Button
          onClick={() => toast('Demande de nouvelle carte bientôt disponible')}
          className="bg-blue-600 hover:bg-blue-700 text-sm lg:text-base"
        >
          <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
          Nouvelle carte
        </Button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-card border-border overflow-hidden">
              {/* Card Visual */}
              <div className={`relative h-48 lg:h-56 bg-gradient-to-br ${card.color} p-4 lg:p-6 rounded-t-lg`}>
                <div className="absolute top-4 right-4">
                  <Badge
                    variant={card.status === 'active' ? 'default' : 'secondary'}
                    className={card.status === 'active' ? 'bg-green-600' : 'bg-gray-600'}
                  >
                    {card.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="flex justify-between items-start mb-6 lg:mb-8">
                  <div>
                    <p className="text-foreground/70 text-xs lg:text-sm">{card.name}</p>
                    <p className="text-foreground font-semibold text-base lg:text-lg mt-1">{card.type.toUpperCase()}</p>
                  </div>
                  <Wifi className="h-6 w-6 lg:h-8 lg:w-8 text-foreground rotate-90" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <p className="text-foreground font-mono text-sm lg:text-lg tracking-wider">
                      {showCardNumber[card.id] ? card.number : maskCardNumber(card.number)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowCardNumber({
                        ...showCardNumber,
                        [card.id]: !showCardNumber[card.id]
                      })}
                      className="h-5 w-5 lg:h-6 lg:w-6 text-foreground/70 hover:text-foreground"
                    >
                      {showCardNumber[card.id] ? <EyeOff className="h-3 w-3 lg:h-4 lg:w-4" /> : <Eye className="h-3 w-3 lg:h-4 lg:w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyCardNumber(card.number)}
                      className="h-5 w-5 lg:h-6 lg:w-6 text-foreground/70 hover:text-foreground"
                    >
                      <Copy className="h-3 w-3 lg:h-4 lg:w-4" />
                    </Button>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-foreground/70 text-xs">Titulaire</p>
                      <p className="text-foreground text-xs lg:text-sm uppercase">{card.holder}</p>
                    </div>
                    <div>
                      <p className="text-foreground/70 text-xs">Expire</p>
                      <p className="text-foreground text-xs lg:text-sm">{card.expiry}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Details */}
              <CardContent className="p-3 lg:p-4">
                <div className="flex justify-between items-center mb-3 lg:mb-4">
                  <div>
                    <p className="text-xs lg:text-sm text-muted-foreground">Plafond disponible</p>
                    <p className="text-lg lg:text-xl font-bold text-foreground">{formatCurrency(card.balance)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedCard(selectedCard === card.id ? null : card.id)}
                  >
                    <MoreVertical className="h-4 w-4 lg:h-5 lg:w-5" />
                  </Button>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1 lg:gap-2 mb-3 lg:mb-4">
                  {card.features.map((feature) => (
                    <Badge key={feature} variant="secondary" className="bg-muted text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                {selectedCard === card.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start border-gray-700 text-sm lg:text-base"
                      onClick={() => handleToggleCard(card.id, card.status)}
                    >
                      {card.status === 'active' ? (
                        <>
                          <Lock className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                          Bloquer la carte
                        </>
                      ) : (
                        <>
                          <Unlock className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                          Activer la carte
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start border-gray-700 text-sm lg:text-base"
                      onClick={() => toast('Gestion des limites bientôt disponible')}
                    >
                      <Settings className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                      Gérer les limites
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start border-gray-700 text-sm lg:text-base"
                      onClick={() => toast('Affichage du code PIN bientôt disponible')}
                    >
                      <Shield className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
                      Afficher le code PIN
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Card Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base lg:text-lg text-foreground">Paramètres des cartes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 lg:space-y-3">
          <button
            onClick={() => toast('Gestion des paiements en ligne bientôt disponible')}
            className="w-full flex items-center justify-between p-2 lg:p-3 bg-secondary hover:bg-muted rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2 lg:gap-3">
              <Globe className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
              <div className="text-left">
                <p className="font-medium text-sm lg:text-base">Paiements en ligne</p>
                <p className="text-xs text-muted-foreground">Autorisez les achats sur internet</p>
              </div>
            </div>
            <Badge variant="default" className="bg-green-600 text-xs">Activé</Badge>
          </button>

          <button
            onClick={() => toast('Gestion des paiements sans contact bientôt disponible')}
            className="w-full flex items-center justify-between p-3 bg-secondary hover:bg-muted rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <Wifi className="h-5 w-5 text-muted-foreground" />
              <div className="text-left">
                <p className="font-medium">Paiements sans contact</p>
                <p className="text-xs text-muted-foreground">Payez rapidement avec le NFC</p>
              </div>
            </div>
            <Badge variant="default" className="bg-green-600">Activé</Badge>
          </button>

          <button
            onClick={() => toast('Gestion des paiements à l\'étranger bientôt disponible')}
            className="w-full flex items-center justify-between p-2 lg:p-3 bg-secondary hover:bg-muted rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2 lg:gap-3">
              <Globe className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
              <div className="text-left">
                <p className="font-medium text-sm lg:text-base">Paiements à l'étranger</p>
                <p className="text-xs text-muted-foreground">Utilisez vos cartes à l'international</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">Désactivé</Badge>
          </button>

          <button
            onClick={() => toast('Gestion des retraits bientôt disponible')}
            className="w-full flex items-center justify-between p-2 lg:p-3 bg-secondary hover:bg-muted rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2 lg:gap-3">
              <CreditCard className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
              <div className="text-left">
                <p className="font-medium text-sm lg:text-base">Retraits DAB</p>
                <p className="text-xs text-muted-foreground">Retirez de l'argent aux distributeurs</p>
              </div>
            </div>
            <Badge variant="default" className="bg-green-600 text-xs">Activé</Badge>
          </button>
        </CardContent>
      </Card>
    </div>
  )
}