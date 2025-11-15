'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Plus,
  Bell,
  Eye,
  EyeOff,
  Copy,
  Send,
  Wallet,
  TrendingUp,
  Clock,
  Home,
  Activity,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { signOut } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { TransferModal } from './TransferModal'
import { RechargeModal } from './RechargeModal'
import { ActivityView } from './ActivityView'
import { SettingsView } from './SettingsView'
import { CardsView } from './CardsView'

interface ClientDashboardProps {
  client: any
  transactions: any[]
  balance: bigint
}

export function ClientDashboard({ client, transactions, balance }: ClientDashboardProps) {
  const [showBalance, setShowBalance] = useState(true)
  const [copied, setCopied] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showRechargeModal, setShowRechargeModal] = useState(false)

  const accountNumber = `KB${client.id.slice(-8).toUpperCase()}`

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(accountNumber)
    setCopied(true)
    toast.success('Numéro de compte copié!')
    setTimeout(() => setCopied(false), 2000)
  }

  const navItems = [
    { id: 'home', icon: Home, label: 'Accueil' },
    { id: 'activity', icon: Activity, label: 'Activité' },
    { id: 'cards', icon: CreditCard, label: 'Cartes' },
    { id: 'settings', icon: Settings, label: 'Paramètres' }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-900">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">KB</span>
            </div>
            <span className="font-medium">Kuuza Bank</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400"
              onClick={() => {
                toast('Notifications bientôt disponibles', {
                  icon: '🔔',
                  style: {
                    background: '#1f2937',
                    color: '#fff',
                  },
                })
              }}
            >
              <Bell className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-400"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-black border-r border-gray-900 flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-black font-bold">KB</span>
            </div>
            <div>
              <h1 className="font-semibold text-white">Kuuza Bank</h1>
              <p className="text-xs text-gray-300">Banking moderne</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === item.id
                      ? 'bg-white text-black'
                      : 'text-gray-400 hover:text-white hover:bg-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="mt-auto p-6">
          <div className="p-4 bg-gray-900 rounded-xl mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-white text-black text-sm">
                  {client.user.firstName[0]}{client.user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-white">{client.user.firstName} {client.user.lastName}</p>
                <p className="text-xs text-gray-300">Client Premium</p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full justify-start text-gray-400 hover:text-white"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="absolute right-0 top-0 bottom-0 w-3/4 bg-black border-l border-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 pt-20">
              <div className="mb-8">
                <Avatar className="h-16 w-16 mb-3">
                  <AvatarFallback className="bg-white text-black text-xl">
                    {client.user.firstName[0]}{client.user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <p className="font-medium text-white">{client.user.firstName} {client.user.lastName}</p>
                <p className="text-sm text-gray-300">{client.user.email}</p>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id)
                        setMobileMenuOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors"
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-500"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Déconnexion</span>
                </button>
              </nav>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="pt-16 lg:pt-0 pb-20 lg:pb-0">
          {activeTab === 'home' && (
            <>
              {/* Balance Section */}
              <div className="bg-gradient-to-b from-black to-gray-950 p-4 lg:p-8">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 lg:mb-8"
              >
                <p className="text-gray-300 text-xs lg:text-sm mb-1 lg:mb-2">Solde total</p>
                <div className="flex items-center gap-2 lg:gap-4 mb-4 lg:mb-6">
                  <h1 className="text-2xl lg:text-5xl font-bold">
                    {showBalance ? formatCurrency(Number(balance)) : '••••••'}
                  </h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-gray-300 hover:text-white h-8 w-8 lg:h-10 lg:w-10"
                  >
                    {showBalance ? <EyeOff className="h-4 w-4 lg:h-5 lg:w-5" /> : <Eye className="h-4 w-4 lg:h-5 lg:w-5" />}
                  </Button>
                </div>

                <div className="flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
                  <div className="px-2 lg:px-3 py-1 bg-gray-900 rounded-full flex items-center gap-1 lg:gap-2">
                    <Wallet className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400" />
                    <span className="text-xs lg:text-sm font-mono text-gray-200">{accountNumber}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopyAccount}
                      className="h-5 w-5 lg:h-6 lg:w-6 text-gray-300 hover:text-white"
                    >
                      <Copy className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
                    </Button>
                  </div>
                  <div className="px-2 lg:px-3 py-1 bg-green-500/10 text-green-500 rounded-full flex items-center gap-1">
                    <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs font-medium">Actif</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-2 lg:gap-3">
                  <Button
                    onClick={() => setShowRechargeModal(true)}
                    className="bg-white text-black hover:bg-gray-100 h-10 lg:h-12 font-medium text-xs lg:text-sm"
                  >
                    <Plus className="h-4 w-4 lg:h-5 lg:w-5 lg:mr-2" />
                    <span className="hidden lg:inline">Recharger</span>
                  </Button>
                  <Button
                    onClick={() => setShowTransferModal(true)}
                    variant="outline"
                    className="border-gray-800 text-white hover:bg-gray-900 h-10 lg:h-12 font-medium text-xs lg:text-sm"
                  >
                    <Send className="h-4 w-4 lg:h-5 lg:w-5 lg:mr-2" />
                    <span className="hidden lg:inline">Envoyer</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTab('cards')}
                    variant="outline"
                    className="border-gray-800 text-white hover:bg-gray-900 h-10 lg:h-12 font-medium text-xs lg:text-sm"
                  >
                    <CreditCard className="h-4 w-4 lg:h-5 lg:w-5 lg:mr-2" />
                    <span className="hidden lg:inline">Cartes</span>
                  </Button>
                </div>
              </motion.div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-3 lg:p-4">
                      <div className="flex items-center justify-between mb-1 lg:mb-2">
                        <ArrowUpRight className="h-3 w-3 lg:h-4 lg:w-4 text-red-500" />
                        <span className="text-xs text-gray-300">Ce mois</span>
                      </div>
                      <p className="text-lg lg:text-2xl font-bold text-white">0 XAF</p>
                      <p className="text-xs text-gray-300">Dépenses</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-3 lg:p-4">
                      <div className="flex items-center justify-between mb-1 lg:mb-2">
                        <ArrowDownLeft className="h-3 w-3 lg:h-4 lg:w-4 text-green-500" />
                        <span className="text-xs text-gray-300">Ce mois</span>
                      </div>
                      <p className="text-lg lg:text-2xl font-bold text-white">0 XAF</p>
                      <p className="text-xs text-gray-300">Revenus</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-3 lg:p-4">
                      <div className="flex items-center justify-between mb-1 lg:mb-2">
                        <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 text-blue-500" />
                        <span className="text-xs text-gray-300">Épargne</span>
                      </div>
                      <p className="text-lg lg:text-2xl font-bold text-white">0 XAF</p>
                      <p className="text-xs text-gray-300">Objectifs</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-3 lg:p-4">
                      <div className="flex items-center justify-between mb-1 lg:mb-2">
                        <Clock className="h-3 w-3 lg:h-4 lg:w-4 text-purple-500" />
                        <span className="text-xs text-gray-300">En attente</span>
                      </div>
                      <p className="text-lg lg:text-2xl font-bold text-white">0</p>
                      <p className="text-xs text-gray-300">Transactions</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Recent Transactions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                  <h2 className="text-lg lg:text-xl font-semibold text-white">Transactions récentes</h2>
                  <Button
                    onClick={() => {
                      toast('Page des transactions complète bientôt disponible', {
                        icon: '📊',
                        style: {
                          background: '#1f2937',
                          color: '#fff',
                        },
                      })
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:text-white text-xs lg:text-sm"
                  >
                    Voir tout
                  </Button>
                </div>

                <Card className="bg-gray-950 border-gray-800">
                  <CardContent className="p-0">
                    {transactions.length > 0 ? (
                      <div className="divide-y divide-gray-800">
                        {transactions.slice(0, 5).map((transaction, index) => {
                          const isIncoming = transaction.toUserId === client.user.id
                          return (
                            <motion.div
                              key={transaction.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + index * 0.05 }}
                              className="p-3 lg:p-4 flex items-center justify-between hover:bg-gray-900/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-2 lg:p-2.5 rounded-xl ${
                                  isIncoming ? 'bg-green-500/10' : 'bg-gray-900'
                                }`}>
                                  {isIncoming ? (
                                    <ArrowDownLeft className="h-4 w-4 lg:h-5 lg:w-5 text-green-500" />
                                  ) : (
                                    <ArrowUpRight className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-sm lg:text-base">
                                    {transaction.description || (isIncoming ? 'Crédit reçu' : 'Débit')}
                                  </p>
                                  <p className="text-xs text-gray-300">
                                    {formatDate(transaction.createdAt)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`font-semibold text-sm lg:text-lg ${
                                  isIncoming ? 'text-green-500' : 'text-white'
                                }`}>
                                  {isIncoming ? '+' : '-'}{formatCurrency(Number(transaction.amount))}
                                </p>
                                <p className="text-xs text-gray-300 capitalize">
                                  {transaction.status.toLowerCase()}
                                </p>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="p-8 lg:p-12 text-center">
                        <div className="mx-auto w-12 h-12 lg:w-16 lg:h-16 mb-3 lg:mb-4 rounded-full bg-gray-900 flex items-center justify-center">
                          <Activity className="h-6 w-6 lg:h-8 lg:w-8 text-gray-600" />
                        </div>
                        <p className="text-gray-300 font-medium text-sm lg:text-base">Aucune transaction</p>
                        <p className="text-xs lg:text-sm text-gray-600 mt-1">
                          Vos transactions apparaîtront ici
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
            </>
          )}

          {/* Activity View */}
          {activeTab === 'activity' && (
            <div className="p-4 lg:p-8 max-w-6xl mx-auto">
              <ActivityView transactions={transactions} userId={client.user.id} />
            </div>
          )}

          {/* Cards View */}
          {activeTab === 'cards' && (
            <div className="p-4 lg:p-8 max-w-6xl mx-auto">
              <CardsView client={client} />
            </div>
          )}

          {/* Settings View */}
          {activeTab === 'settings' && (
            <div className="p-4 lg:p-8 max-w-6xl mx-auto">
              <SettingsView client={client} />
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <TransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        currentBalance={Number(balance)}
      />
      <RechargeModal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
        currentBalance={Number(balance)}
      />

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-950/95 backdrop-blur-lg border-t border-gray-800 z-40 safe-bottom">
        <div className="grid grid-cols-4 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 py-2 px-2 rounded-xl mx-1 my-1 transition-all duration-200 ${
                  isActive
                    ? 'text-white bg-white/10 scale-95'
                    : 'text-gray-400 hover:text-gray-200 active:scale-95'
                }`}
              >
                <Icon className={`h-5 w-5 transition-transform ${
                  isActive ? 'scale-110' : ''
                }`} />
                <span className={`text-xs font-medium transition-all ${
                  isActive ? 'text-white' : 'text-gray-500'
                }`}>{item.label}</span>
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}