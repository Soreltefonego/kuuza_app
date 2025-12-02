'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  Building2,
  User,
  CreditCard,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ActivityViewProps {
  transactions: any[]
  userId: string
}

export function ActivityView({ transactions, userId }: ActivityViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'sent' | 'received'>('all')
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null)

  // Filtrer les transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.fromUser?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.toUser?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterType === 'all' ||
                          (filterType === 'sent' && transaction.fromUserId === userId) ||
                          (filterType === 'received' && transaction.toUserId === userId)

    return matchesSearch && matchesFilter
  })

  // Calculer les statistiques
  const totalReceived = transactions
    .filter(t => t.toUserId === userId && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalSent = transactions
    .filter(t => t.fromUserId === userId && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const pendingCount = transactions.filter(t => t.status === 'PENDING').length

  // Fonction pour obtenir l'icône de statut
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  // Fonction pour formater le type de transaction
  const getTransactionTypeLabel = (transaction: any, isIncoming: boolean) => {
    if (transaction.type === 'DEPOSIT') return 'Dépôt'
    if (transaction.type === 'WITHDRAWAL') return 'Retrait'
    if (transaction.type === 'TRANSFER') {
      if (isIncoming) {
        return transaction.metadata?.senderName ? 'Virement reçu' : 'Transfert reçu'
      }
      return 'Virement émis'
    }
    return transaction.type
  }

  // Fonction pour obtenir les détails du compte
  const getAccountDetails = (transaction: any, isIncoming: boolean) => {
    const otherUser = isIncoming ? transaction.fromUser : transaction.toUser

    if (transaction.metadata?.senderName && isIncoming) {
      // Si c'est un virement reçu avec un nom d'expéditeur personnalisé
      return {
        name: transaction.metadata.senderName,
        type: 'Virement bancaire',
        icon: Building2
      }
    } else if (otherUser) {
      // Transaction avec un autre utilisateur
      return {
        name: `${otherUser.firstName} ${otherUser.lastName}`,
        type: otherUser.role === 'MANAGER' ? 'Manager Kuuza Bank' : 'Client Kuuza Bank',
        icon: User
      }
    } else if (isIncoming && transaction.type === 'DEPOSIT') {
      // Dépôt depuis le manager
      return {
        name: 'Kuuza Bank',
        type: 'Crédit Manager',
        icon: Building2
      }
    }

    return {
      name: 'Compte Kuuza',
      type: 'Transaction interne',
      icon: CreditCard
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl lg:text-2xl font-bold mb-2 text-foreground">Historique des transactions</h2>
        <p className="text-sm lg:text-base text-muted-foreground">Consultez tous vos mouvements bancaires</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 lg:p-2 rounded-lg bg-green-500/10">
                <ArrowDownLeft className="h-3 w-3 lg:h-4 lg:w-4 text-green-500" />
              </div>
              <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 text-green-500" />
            </div>
            <p className="text-lg lg:text-2xl font-bold text-foreground">{formatCurrency(totalReceived)}</p>
            <p className="text-xs text-muted-foreground">Total crédité ce mois</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 lg:p-2 rounded-lg bg-red-500/10">
                <ArrowUpRight className="h-3 w-3 lg:h-4 lg:w-4 text-red-500" />
              </div>
              <TrendingDown className="h-3 w-3 lg:h-4 lg:w-4 text-red-500" />
            </div>
            <p className="text-lg lg:text-2xl font-bold text-foreground">{formatCurrency(totalSent)}</p>
            <p className="text-xs text-muted-foreground">Total débité ce mois</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 lg:p-2 rounded-lg bg-yellow-500/10">
                <Activity className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-500" />
              </div>
              <span className="text-xs text-muted-foreground">En cours</span>
            </div>
            <p className="text-lg lg:text-2xl font-bold text-foreground">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Opérations en attente</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, description..."
            className="pl-10 bg-secondary border-border text-sm lg:text-base"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
            className={`${filterType === 'all' ? 'bg-primary' : 'border-border'} text-xs lg:text-sm`}
          >
            Toutes
          </Button>
          <Button
            variant={filterType === 'received' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('received')}
            className={`${filterType === 'received' ? 'bg-green-600 hover:bg-green-700' : 'border-border'} text-xs lg:text-sm`}
          >
            Crédit
          </Button>
          <Button
            variant={filterType === 'sent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('sent')}
            className={`${filterType === 'sent' ? 'bg-red-600 hover:bg-red-700' : 'border-border'} text-xs lg:text-sm`}
          >
            Débit
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="border-border text-xs lg:text-sm"
        >
          <Download className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
          Relevé PDF
        </Button>
      </div>

      {/* Transactions List */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base lg:text-lg text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Relevé de compte
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTransactions.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredTransactions.map((transaction, index) => {
                const isIncoming = transaction.toUserId === userId
                const accountDetails = getAccountDetails(transaction, isIncoming)
                const AccountIcon = accountDetails.icon
                const isExpanded = expandedTransaction === transaction.id

                return (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setExpandedTransaction(isExpanded ? null : transaction.id)}
                  >
                    <div className="p-4">
                      {/* Transaction principale */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-full mt-1 ${
                            isIncoming ? 'bg-green-500/10' : 'bg-red-500/10'
                          }`}>
                            {isIncoming ? (
                              <ArrowDownLeft className="h-4 w-4 lg:h-5 lg:w-5 text-green-500" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4 lg:h-5 lg:w-5 text-red-500" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-start gap-2">
                              <div className="flex-1">
                                <p className="font-semibold text-foreground text-sm lg:text-base">
                                  {getTransactionTypeLabel(transaction, isIncoming)}
                                </p>

                                {/* Nom de l'expéditeur/destinataire */}
                                <div className="flex items-center gap-2 mt-1">
                                  <AccountIcon className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs lg:text-sm text-foreground/90 font-medium">
                                    {accountDetails.name}
                                  </span>
                                </div>

                                {/* Motif/Description */}
                                {transaction.description && (
                                  <p className="text-xs lg:text-sm text-muted-foreground mt-1.5 italic">
                                    "{transaction.description}"
                                  </p>
                                )}

                                {/* Date et heure */}
                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {new Date(transaction.createdAt).toLocaleDateString('fr-FR', {
                                      day: '2-digit',
                                      month: 'long',
                                      year: 'numeric'
                                    })}
                                  </span>
                                  <span>•</span>
                                  <span>
                                    {new Date(transaction.createdAt).toLocaleTimeString('fr-FR', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Montant et statut */}
                        <div className="text-right ml-4">
                          <p className={`font-bold text-base lg:text-lg ${
                            isIncoming ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {isIncoming ? '+' : '-'} {formatCurrency(Number(transaction.amount))}
                          </p>

                          <div className="flex items-center gap-1 justify-end mt-2">
                            {getStatusIcon(transaction.status)}
                            <span className="text-xs text-muted-foreground">
                              {transaction.status === 'COMPLETED' ? 'Exécuté' :
                               transaction.status === 'PENDING' ? 'En cours' : 'Échoué'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Détails supplémentaires (expandable) */}
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 pt-4 border-t border-border"
                        >
                          <div className="grid grid-cols-2 gap-4 text-xs lg:text-sm">
                            <div>
                              <p className="text-muted-foreground mb-1">Référence</p>
                              <p className="font-mono text-foreground">{transaction.reference}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1">Type d'opération</p>
                              <p className="text-foreground">{transaction.type}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1">Compte émetteur</p>
                              <p className="text-foreground">{accountDetails.type}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1">ID Transaction</p>
                              <p className="font-mono text-foreground text-xs">{transaction.id}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="mx-auto w-12 h-12 lg:w-16 lg:h-16 mb-3 lg:mb-4 rounded-full bg-muted flex items-center justify-center">
                <Activity className="h-6 w-6 lg:h-8 lg:w-8 text-muted-foreground/60" />
              </div>
              <p className="text-muted-foreground font-medium text-sm lg:text-base">Aucune transaction trouvée</p>
              <p className="text-xs lg:text-sm text-muted-foreground/60 mt-1">
                {searchTerm ? 'Essayez avec d\'autres critères de recherche' : 'Vos transactions apparaîtront ici'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}