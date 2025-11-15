'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface TransactionsOverviewProps {
  transactions: any[]
}

export function TransactionsOverview({ transactions }: TransactionsOverviewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'failed'>('all')
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit' | 'transfer'>('all')
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)

  const itemsPerPage = 20

  // Filtrer les transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch =
      transaction.fromUser?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.fromUser?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.toUser?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.toUser?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'completed' && transaction.status === 'SUCCESS') ||
      (filterStatus === 'pending' && transaction.status === 'PENDING') ||
      (filterStatus === 'failed' && transaction.status === 'FAILED')

    const matchesType =
      filterType === 'all' ||
      (filterType === 'credit' && transaction.type === 'CREDIT') ||
      (filterType === 'debit' && transaction.type === 'DEBIT') ||
      (filterType === 'transfer' && transaction.type === 'TRANSFER')

    const transactionDate = new Date(transaction.createdAt)
    const now = new Date()
    let matchesDate = true

    if (dateRange === 'today') {
      matchesDate = transactionDate.toDateString() === now.toDateString()
    } else if (dateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      matchesDate = transactionDate >= weekAgo
    } else if (dateRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      matchesDate = transactionDate >= monthAgo
    }

    return matchesSearch && matchesStatus && matchesType && matchesDate
  })

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Statistiques
  const totalVolume = filteredTransactions
    .filter(t => t.status === 'SUCCESS')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const completedCount = filteredTransactions.filter(t => t.status === 'SUCCESS').length
  const pendingCount = filteredTransactions.filter(t => t.status === 'PENDING').length
  const failedCount = filteredTransactions.filter(t => t.status === 'FAILED').length

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-500/20 text-green-500'
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-500'
      case 'FAILED':
        return 'bg-red-500/20 text-red-500'
      default:
        return ''
    }
  }

  const handleExport = () => {
    toast.success('Export des transactions en cours...')
    // TODO: Implémenter l'export CSV/Excel
  }

  const handleRefresh = () => {
    toast.success('Actualisation des transactions...')
    window.location.reload()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Transactions</h2>
            <p className="text-gray-400 mt-1">
              {filteredTransactions.length} transactions • Volume: {formatCurrency(totalVolume)}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="border-gray-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              className="border-gray-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="glass border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Volume Total</span>
                <DollarSign className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gradient">
                {formatCurrency(totalVolume)}
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Complétées</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-400">{completedCount}</p>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">En attente</span>
                <Clock className="h-4 w-4 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Échouées</span>
                <XCircle className="h-4 w-4 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-red-400">{failedCount}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Rechercher par nom, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 glass border-white/10"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 rounded-lg glass border border-white/10 bg-transparent"
        >
          <option value="all">Tous les statuts</option>
          <option value="completed">Complétées</option>
          <option value="pending">En attente</option>
          <option value="failed">Échouées</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-4 py-2 rounded-lg glass border border-white/10 bg-transparent"
        >
          <option value="all">Tous les types</option>
          <option value="credit">Crédits</option>
          <option value="debit">Débits</option>
          <option value="transfer">Transferts</option>
        </select>

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as any)}
          className="px-4 py-2 rounded-lg glass border border-white/10 bg-transparent"
        >
          <option value="all">Toutes les dates</option>
          <option value="today">Aujourd'hui</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
        </select>
      </div>

      {/* Transactions Table */}
      <Card className="glass border-white/10">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="text-left p-4 text-sm text-gray-400">ID Transaction</th>
                  <th className="text-left p-4 text-sm text-gray-400">De</th>
                  <th className="text-left p-4 text-sm text-gray-400">Vers</th>
                  <th className="text-left p-4 text-sm text-gray-400">Type</th>
                  <th className="text-left p-4 text-sm text-gray-400">Montant</th>
                  <th className="text-left p-4 text-sm text-gray-400">Status</th>
                  <th className="text-left p-4 text-sm text-gray-400">Date</th>
                  <th className="text-right p-4 text-sm text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map((transaction, index) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-mono text-sm">
                        {transaction.id.slice(0, 8).toUpperCase()}...
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {transaction.fromUser ? (
                          <>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                              {transaction.fromUser.firstName[0]}{transaction.fromUser.lastName[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {transaction.fromUser.firstName} {transaction.fromUser.lastName}
                              </p>
                              <p className="text-xs text-gray-400">
                                {transaction.fromUser.email}
                              </p>
                            </div>
                          </>
                        ) : (
                          <Badge variant="outline" className="border-green-500/30 text-green-400">
                            Système
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {transaction.toUser ? (
                          <>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                              {transaction.toUser.firstName[0]}{transaction.toUser.lastName[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {transaction.toUser.firstName} {transaction.toUser.lastName}
                              </p>
                              <p className="text-xs text-gray-400">
                                {transaction.toUser.email}
                              </p>
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {transaction.type === 'CREDIT' && (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        )}
                        {transaction.type === 'DEBIT' && (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        {transaction.type === 'TRANSFER' && (
                          <ArrowRight className="h-4 w-4 text-blue-500" />
                        )}
                        <span className="text-sm capitalize">
                          {transaction.type?.toLowerCase() || 'Transfer'}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-gradient">
                        {formatCurrency(Number(transaction.amount))}
                      </p>
                    </td>

                    <td className="p-4">
                      <Badge
                        variant="default"
                        className={getStatusColor(transaction.status)}
                      >
                        <span className="flex items-center gap-1">
                          {getStatusIcon(transaction.status)}
                          {transaction.status}
                        </span>
                      </Badge>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="h-3 w-3" />
                        {formatDate(transaction.createdAt)}
                      </div>
                    </td>

                    <td className="p-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedTransaction(transaction)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {paginatedTransactions.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                <Activity className="h-10 w-10 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Aucune transaction trouvée</h3>
              <p className="text-gray-400">
                {searchTerm ? 'Aucun résultat pour votre recherche' : 'Aucune transaction dans le système'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-white/10 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Page {currentPage} sur {totalPages} • {filteredTransactions.length} résultats
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="border-gray-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage - 2 + i
                  if (page < 1 || page > totalPages) return null
                  return (
                    <Button
                      key={page}
                      size="sm"
                      variant={page === currentPage ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(page)}
                      className={page === currentPage ? 'gradient-primary' : 'border-gray-700'}
                    >
                      {page}
                    </Button>
                  )
                }).filter(Boolean)}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="border-gray-700"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedTransaction(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Détails de la Transaction</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedTransaction(null)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">ID Transaction</p>
                  <p className="font-mono text-sm">{selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Status</p>
                  <Badge
                    variant="default"
                    className={getStatusColor(selectedTransaction.status)}
                  >
                    <span className="flex items-center gap-1">
                      {getStatusIcon(selectedTransaction.status)}
                      {selectedTransaction.status}
                    </span>
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Type</p>
                  <p className="capitalize">{selectedTransaction.type?.toLowerCase() || 'Transfer'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Montant</p>
                  <p className="text-xl font-bold text-gradient">
                    {formatCurrency(Number(selectedTransaction.amount))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Date de création</p>
                  <p>{formatDate(selectedTransaction.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Dernière mise à jour</p>
                  <p>{formatDate(selectedTransaction.updatedAt)}</p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <h4 className="font-medium mb-3">Parties impliquées</h4>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-sm text-gray-400 mb-1">Expéditeur</p>
                    {selectedTransaction.fromUser ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                          {selectedTransaction.fromUser.firstName[0]}{selectedTransaction.fromUser.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium">
                            {selectedTransaction.fromUser.firstName} {selectedTransaction.fromUser.lastName}
                          </p>
                          <p className="text-sm text-gray-400">{selectedTransaction.fromUser.email}</p>
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline" className="border-green-500/30 text-green-400">
                        Crédit Système
                      </Badge>
                    )}
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-sm text-gray-400 mb-1">Destinataire</p>
                    {selectedTransaction.toUser ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {selectedTransaction.toUser.firstName[0]}{selectedTransaction.toUser.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium">
                            {selectedTransaction.toUser.firstName} {selectedTransaction.toUser.lastName}
                          </p>
                          <p className="text-sm text-gray-400">{selectedTransaction.toUser.email}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500">Non spécifié</span>
                    )}
                  </div>
                </div>
              </div>

              {selectedTransaction.description && (
                <div className="border-t border-white/10 pt-4">
                  <p className="text-sm text-gray-400 mb-1">Description</p>
                  <p>{selectedTransaction.description}</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}