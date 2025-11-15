'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Building,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  PieChart,
  BarChart3,
  Calendar,
  Download,
  RefreshCw,
  Target,
  Zap,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface SystemAnalyticsProps {
  totalUsers: number
  totalManagers: number
  totalClients: number
  totalTransactions: number
  totalBalances: {
    managers: number
    clients: number
    transactionVolume: number
    todayTransactions: number
    todayNewUsers: number
  }
  managers: any[]
}

export function SystemAnalytics({
  totalUsers,
  totalManagers,
  totalClients,
  totalTransactions,
  totalBalances,
  managers
}: SystemAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month')
  const [isLoading, setIsLoading] = useState(false)

  // Calculs des métriques
  const averageBalancePerManager = totalManagers > 0 ? totalBalances.managers / totalManagers : 0
  const averageBalancePerClient = totalClients > 0 ? totalBalances.clients / totalClients : 0
  const averageTransactionValue = totalTransactions > 0 ? totalBalances.transactionVolume / totalTransactions : 0

  // Top managers par nombre de clients
  const topManagersByClients = [...managers]
    .sort((a, b) => b.clients.length - a.clients.length)
    .slice(0, 5)

  // Top managers par solde
  const topManagersByBalance = [...managers]
    .sort((a, b) => Number(b.creditBalance) - Number(a.creditBalance))
    .slice(0, 5)

  // Calcul du taux de croissance (simulé pour la démo)
  const growthRate = {
    users: 12.5,
    transactions: 28.3,
    volume: 35.7
  }

  // Métriques de performance
  const performanceMetrics = {
    conversionRate: 68.5,
    activationRate: 82.3,
    retentionRate: 91.2,
    satisfactionScore: 4.7
  }

  const handleExportReport = () => {
    toast.success('Génération du rapport en cours...')
    // TODO: Implémenter l'export PDF/Excel
  }

  const handleRefresh = () => {
    setIsLoading(true)
    toast.success('Actualisation des analytics...')
    setTimeout(() => {
      setIsLoading(false)
      window.location.reload()
    }, 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics & Rapports</h2>
          <p className="text-gray-400 mt-1">
            Vue d'ensemble des performances de la plateforme
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-4 py-2 rounded-lg glass border border-white/10 bg-transparent"
          >
            <option value="day">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="border-gray-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button
            className="gradient-primary"
            onClick={handleExportReport}
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter le Rapport
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass border-white/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-400">Croissance Utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold">{totalUsers}</p>
                <p className="text-xs text-gray-500 mt-1">Utilisateurs totaux</p>
              </div>
              <div className="text-right">
                <Badge variant="default" className="bg-green-500/20 text-green-500">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{growthRate.users}%
                </Badge>
              </div>
            </div>
            <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: '68%' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-400">Volume Transactions</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gradient">
                  {formatCurrency(totalBalances.transactionVolume)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{totalTransactions} transactions</p>
              </div>
              <div className="text-right">
                <Badge variant="default" className="bg-green-500/20 text-green-500">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{growthRate.volume}%
                </Badge>
              </div>
            </div>
            <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '85%' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-400">Taux d'Activation</CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold">{performanceMetrics.activationRate}%</p>
                <p className="text-xs text-gray-500 mt-1">Comptes activés</p>
              </div>
              <div className="text-right">
                <Badge variant="default" className="bg-yellow-500/20 text-yellow-500">
                  <Activity className="h-3 w-3 mr-1" />
                  Stable
                </Badge>
              </div>
            </div>
            <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500" style={{ width: `${performanceMetrics.activationRate}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-400">Score Satisfaction</CardTitle>
              <Award className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold">{performanceMetrics.satisfactionScore}/5</p>
                <p className="text-xs text-gray-500 mt-1">Score moyen</p>
              </div>
              <div className="text-right">
                <Badge variant="default" className="bg-purple-500/20 text-purple-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Excellent
                </Badge>
              </div>
            </div>
            <div className="mt-3 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${(performanceMetrics.satisfactionScore / 5) * 100}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview */}
      <Card className="glass border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-cyan-500" />
              Vue Financière Détaillée
            </CardTitle>
            <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
              Temps réel
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">Distribution des Fonds</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Managers</span>
                    <span className="font-bold text-purple-400">
                      {formatCurrency(totalBalances.managers)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${(totalBalances.managers / (totalBalances.managers + totalBalances.clients)) * 100}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Clients</span>
                    <span className="font-bold text-cyan-400">
                      {formatCurrency(totalBalances.clients)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${(totalBalances.clients / (totalBalances.managers + totalBalances.clients)) * 100}%` }} />
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-gray-400 mb-2">Total en Circulation</p>
                <p className="text-2xl font-bold text-gradient">
                  {formatCurrency(totalBalances.managers + totalBalances.clients)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">Moyennes</p>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-gray-500">Par Manager</p>
                    <p className="text-lg font-bold text-purple-400">
                      {formatCurrency(averageBalancePerManager)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-gray-500">Par Client</p>
                    <p className="text-lg font-bold text-cyan-400">
                      {formatCurrency(averageBalancePerClient)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-xs text-gray-500">Par Transaction</p>
                    <p className="text-lg font-bold text-green-400">
                      {formatCurrency(averageTransactionValue)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">Activité Aujourd'hui</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-400" />
                      <span className="text-sm">Nouveaux Utilisateurs</span>
                    </div>
                    <span className="font-bold text-blue-400">
                      +{totalBalances.todayNewUsers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-400" />
                      <span className="text-sm">Transactions</span>
                    </div>
                    <span className="font-bold text-green-400">
                      {totalBalances.todayTransactions}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-purple-400" />
                      <span className="text-sm">Objectif Quotidien</span>
                    </div>
                    <span className="font-bold text-purple-400">
                      78%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Managers by Clients */}
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-purple-500" />
              Top Managers (Par Clients)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topManagersByClients.map((manager, index) => (
                <motion.div
                  key={manager.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">
                        {manager.user.firstName} {manager.user.lastName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {manager.clients.length} clients
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gradient">
                      {formatCurrency(Number(manager.creditBalance))}
                    </p>
                    <p className="text-xs text-gray-400">Solde</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Managers by Balance */}
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Top Managers (Par Solde)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topManagersByBalance.map((manager, index) => (
                <motion.div
                  key={manager.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">
                        {manager.user.firstName} {manager.user.lastName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {manager.clients.length} clients
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gradient">
                      {formatCurrency(Number(manager.creditBalance))}
                    </p>
                    <p className="text-xs text-green-400">
                      Top {index + 1}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-500" />
            Santé du Système
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium text-green-500">API</span>
              </div>
              <p className="text-sm text-gray-400">Temps de réponse: 45ms</p>
              <p className="text-xs text-gray-500 mt-1">Disponibilité: 99.9%</p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium text-green-500">Base de Données</span>
              </div>
              <p className="text-sm text-gray-400">Connexions: 28/100</p>
              <p className="text-xs text-gray-500 mt-1">Latence: 12ms</p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <span className="font-medium text-yellow-500">Queue</span>
              </div>
              <p className="text-sm text-gray-400">Jobs en attente: 12</p>
              <p className="text-xs text-gray-500 mt-1">Traitement: Normal</p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium text-green-500">Cache</span>
              </div>
              <p className="text-sm text-gray-400">Hit Rate: 94%</p>
              <p className="text-xs text-gray-500 mt-1">Mémoire: 2.3GB/8GB</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}