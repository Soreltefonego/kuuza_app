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
  Activity
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl lg:text-2xl font-bold mb-2 text-foreground">Activité</h2>
        <p className="text-sm lg:text-base text-muted-foreground">Historique de vos transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
        <Card className="bg-secondary border-border">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 lg:p-2 rounded-lg bg-green-500/10">
                <ArrowDownLeft className="h-3 w-3 lg:h-4 lg:w-4 text-green-500" />
              </div>
              <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 text-green-500" />
            </div>
            <p className="text-lg lg:text-2xl font-bold text-foreground">{formatCurrency(totalReceived)}</p>
            <p className="text-xs text-muted-foreground">Total reçu ce mois</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary border-border">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 lg:p-2 rounded-lg bg-red-500/10">
                <ArrowUpRight className="h-3 w-3 lg:h-4 lg:w-4 text-red-500" />
              </div>
              <TrendingDown className="h-3 w-3 lg:h-4 lg:w-4 text-red-500" />
            </div>
            <p className="text-lg lg:text-2xl font-bold text-foreground">{formatCurrency(totalSent)}</p>
            <p className="text-xs text-muted-foreground">Total envoyé ce mois</p>
          </CardContent>
        </Card>

        <Card className="bg-secondary border-border">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 lg:p-2 rounded-lg bg-yellow-500/10">
                <Activity className="h-3 w-3 lg:h-4 lg:w-4 text-yellow-500" />
              </div>
              <span className="text-xs text-muted-foreground">En cours</span>
            </div>
            <p className="text-lg lg:text-2xl font-bold text-foreground">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Transactions en attente</p>
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
            placeholder="Rechercher une transaction..."
            className="pl-10 bg-secondary border-border text-sm lg:text-base"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
            className={`${filterType === 'all' ? 'bg-blue-600' : 'border-gray-700'} text-xs lg:text-sm`}
          >
            Tout
          </Button>
          <Button
            variant={filterType === 'received' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('received')}
            className={`${filterType === 'received' ? 'bg-green-600' : 'border-gray-700'} text-xs lg:text-sm`}
          >
            Reçu
          </Button>
          <Button
            variant={filterType === 'sent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('sent')}
            className={`${filterType === 'sent' ? 'bg-red-600' : 'border-gray-700'} text-xs lg:text-sm`}
          >
            Envoyé
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="border-gray-700 text-xs lg:text-sm"
        >
          <Download className="h-3 w-3 lg:h-4 lg:w-4 mr-2" />
          Exporter
        </Button>
      </div>

      {/* Transactions List */}
      <Card className="bg-gray-950 border-border">
        <CardHeader>
          <CardTitle className="text-base lg:text-lg text-foreground">Historique des transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTransactions.length > 0 ? (
            <div className="divide-y divide-gray-800">
              {filteredTransactions.map((transaction, index) => {
                const isIncoming = transaction.toUserId === userId
                const otherUser = isIncoming ? transaction.fromUser : transaction.toUser

                return (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${
                          isIncoming ? 'bg-green-500/10' : 'bg-red-500/10'
                        }`}>
                          {isIncoming ? (
                            <ArrowDownLeft className="h-5 w-5 text-green-500" />
                          ) : (
                            <ArrowUpRight className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {transaction.description || (isIncoming ? 'Transfert reçu' : 'Transfert envoyé')}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Utilisateur'}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(transaction.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className={`font-semibold text-lg ${
                          isIncoming ? 'text-green-500' : 'text-foreground'
                        }`}>
                          {isIncoming ? '+' : '-'}{formatCurrency(Number(transaction.amount))}
                        </p>
                        <Badge
                          variant={
                            transaction.status === 'COMPLETED' ? 'default' :
                            transaction.status === 'PENDING' ? 'secondary' : 'destructive'
                          }
                          className="mt-1"
                        >
                          {transaction.status === 'COMPLETED' ? 'Complété' :
                           transaction.status === 'PENDING' ? 'En attente' : 'Échoué'}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="mx-auto w-12 h-12 lg:w-16 lg:h-16 mb-3 lg:mb-4 rounded-full bg-secondary flex items-center justify-center">
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