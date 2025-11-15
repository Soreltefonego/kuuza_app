'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface TransactionsPageContentProps {
  transactions: any[]
}

export function TransactionsPageContent({ transactions }: TransactionsPageContentProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchTerm === '' ||
      transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.fromUser?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.toUser?.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === 'all' || transaction.type === typeFilter
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'CREDIT':
        return <ArrowDownLeft className="h-4 w-4" />
      case 'DEBIT':
        return <ArrowUpRight className="h-4 w-4" />
      case 'BUY_CREDIT':
        return <CreditCard className="h-4 w-4" />
      default:
        return <ArrowUpRight className="h-4 w-4" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'CREDIT':
        return 'from-green-500 to-emerald-500'
      case 'DEBIT':
        return 'from-red-500 to-pink-500'
      case 'BUY_CREDIT':
        return 'from-violet-500 to-purple-500'
      default:
        return 'from-blue-500 to-cyan-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle2 className="h-3 w-3" />
      case 'FAILED':
        return <XCircle className="h-3 w-3" />
      case 'PENDING':
        return <AlertCircle className="h-3 w-3" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'FAILED':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'PENDING':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gradient">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Historique de toutes vos transactions
          </p>
        </div>

        <Button className="gradient-primary w-full sm:w-auto" disabled>
          <Download className="h-4 w-4 mr-2" />
          Exporter
        </Button>
      </div>

      {/* Filters - Mobile optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 glass"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="glass">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="CREDIT">Crédit</SelectItem>
            <SelectItem value="DEBIT">Débit</SelectItem>
            <SelectItem value="BUY_CREDIT">Achat crédit</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="glass">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="SUCCESS">Succès</SelectItem>
            <SelectItem value="PENDING">En attente</SelectItem>
            <SelectItem value="FAILED">Échoué</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions List - Mobile optimized */}
      <div className="space-y-4">
        {/* Desktop Table View */}
        <Card className="glass border-white/10 hidden md:block">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground">Date</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground">Type</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground">Description</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground">Montant</th>
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction, index) => (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(transaction.createdAt)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg bg-gradient-to-r ${getTransactionColor(transaction.type)}`}>
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <span className="text-sm">{transaction.type}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="text-sm">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.reference}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-semibold">
                          {formatCurrency(Number(transaction.amount))}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge className={`${getStatusColor(transaction.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(transaction.status)}
                          {transaction.status}
                        </Badge>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {filteredTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass border-white/10">
                <CardContent className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${getTransactionColor(transaction.type)}`}>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{transaction.type}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(transaction.status)} flex items-center gap-1`}>
                      {getStatusIcon(transaction.status)}
                      {transaction.status}
                    </Badge>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <p className="text-sm">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Ref: {transaction.reference}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-xs text-muted-foreground">Montant</span>
                    <span className="text-lg font-bold text-gradient">
                      {formatCurrency(Number(transaction.amount))}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTransactions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 flex items-center justify-center">
              <Clock className="h-10 w-10 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucune transaction trouvée</h3>
            <p className="text-muted-foreground">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Aucun résultat pour vos critères de recherche'
                : 'Vos transactions apparaîtront ici'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}