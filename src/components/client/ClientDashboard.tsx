'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
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
import { ThemeToggle } from '@/components/theme-toggle'
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
  const { theme } = useTheme()
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">KB</span>
            </div>
            <span className="font-medium">Kuuza Bank</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={() => {
                toast('Notifications bientôt disponibles', {
                  icon: '🔔',
                  style: {
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                  },
                })
              }}
            >
              <Bell className="h-5 w-5" />
            </Button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-muted-foreground"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-background border-r border-border flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold">KB</span>
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Kuuza Bank</h1>
              <p className="text-xs text-muted-foreground">Banking moderne</p>
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
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
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
          <div className="p-4 bg-secondary rounded-xl mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {client.user.firstName[0]}{client.user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">{client.user.firstName} {client.user.lastName}</p>
                <p className="text-xs text-muted-foreground">Client Premium</p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full justify-start text-muted-foreground hover:text-foreground"
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
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="absolute right-0 top-0 bottom-0 w-3/4 bg-background border-l border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 pt-20">
              <div className="mb-8">
                <Avatar className="h-16 w-16 mb-3">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {client.user.firstName[0]}{client.user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <p className="font-medium text-foreground">{client.user.firstName} {client.user.lastName}</p>
                <p className="text-sm text-muted-foreground">{client.user.email}</p>
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
                      className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-foreground transition-colors"
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
              <div className="bg-gradient-to-b from-background to-background/95 p-4 lg:p-8">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 lg:mb-8"
              >
                <p className="text-muted-foreground text-xs lg:text-sm mb-1 lg:mb-2">Solde total</p>
                <div className="flex items-center gap-2 lg:gap-4 mb-4 lg:mb-6">
                  <h1 className="text-2xl lg:text-5xl font-bold">
                    {showBalance ? formatCurrency(Number(balance)) : '••••••'}
                  </h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-muted-foreground hover:text-foreground h-8 w-8 lg:h-10 lg:w-10"
                  >
                    {showBalance ? <EyeOff className="h-4 w-4 lg:h-5 lg:w-5" /> : <Eye className="h-4 w-4 lg:h-5 lg:w-5" />}
                  </Button>
                </div>

                <div className="flex items-center gap-2 lg:gap-3 mb-4 lg:mb-6">
                  <div className="px-2 lg:px-3 py-1 bg-secondary rounded-full flex items-center gap-1 lg:gap-2">
                    <Wallet className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
                    <span className="text-xs lg:text-sm font-mono text-foreground/80">{accountNumber}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopyAccount}
                      className="h-5 w-5 lg:h-6 lg:w-6 text-muted-foreground hover:text-foreground"
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
                    className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 lg:h-12 font-medium text-xs lg:text-sm"
                  >
                    <Plus className="h-4 w-4 lg:h-5 lg:w-5 lg:mr-2" />
                    <span className="hidden lg:inline">Recharger</span>
                  </Button>
                  <Button
                    onClick={() => setShowTransferModal(true)}
                    variant="outline"
                    className="border-border text-foreground hover:bg-secondary h-10 lg:h-12 font-medium text-xs lg:text-sm"
                  >
                    <Send className="h-4 w-4 lg:h-5 lg:w-5 lg:mr-2" />
                    <span className="hidden lg:inline">Envoyer</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTab('cards')}
                    variant="outline"
                    className="border-border text-foreground hover:bg-secondary h-10 lg:h-12 font-medium text-xs lg:text-sm"
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
                  <Card className="bg-secondary border-border">
                    <CardContent className="p-3 lg:p-4">
                      <div className="flex items-center justify-between mb-1 lg:mb-2">
                        <ArrowUpRight className="h-3 w-3 lg:h-4 lg:w-4 text-red-500" />
                        <span className="text-xs text-muted-foreground">Ce mois</span>
                      </div>
                      <p className="text-lg lg:text-2xl font-bold text-foreground">{formatCurrency(0)}</p>
                      <p className="text-xs text-muted-foreground">Dépenses</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <Card className="bg-secondary border-border">
                    <CardContent className="p-3 lg:p-4">
                      <div className="flex items-center justify-between mb-1 lg:mb-2">
                        <ArrowDownLeft className="h-3 w-3 lg:h-4 lg:w-4 text-green-500" />
                        <span className="text-xs text-muted-foreground">Ce mois</span>
                      </div>
                      <p className="text-lg lg:text-2xl font-bold text-foreground">{formatCurrency(0)}</p>
                      <p className="text-xs text-muted-foreground">Revenus</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-secondary border-border">
                    <CardContent className="p-3 lg:p-4">
                      <div className="flex items-center justify-between mb-1 lg:mb-2">
                        <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 text-blue-500" />
                        <span className="text-xs text-muted-foreground">Épargne</span>
                      </div>
                      <p className="text-lg lg:text-2xl font-bold text-foreground">{formatCurrency(0)}</p>
                      <p className="text-xs text-muted-foreground">Objectifs</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <Card className="bg-secondary border-border">
                    <CardContent className="p-3 lg:p-4">
                      <div className="flex items-center justify-between mb-1 lg:mb-2">
                        <Clock className="h-3 w-3 lg:h-4 lg:w-4 text-purple-500" />
                        <span className="text-xs text-muted-foreground">En attente</span>
                      </div>
                      <p className="text-lg lg:text-2xl font-bold text-foreground">0</p>
                      <p className="text-xs text-muted-foreground">Transactions</p>
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
                  <h2 className="text-lg lg:text-xl font-semibold text-foreground">Transactions récentes</h2>
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
                    className="text-muted-foreground hover:text-foreground text-xs lg:text-sm"
                  >
                    Voir tout
                  </Button>
                </div>

                <Card className="bg-card border-border">
                  <CardContent className="p-0">
                    {transactions.length > 0 ? (
                      <div className="divide-y divide-border">
                        {transactions.slice(0, 5).map((transaction, index) => {
                          const isIncoming = transaction.toUserId === client.user.id
                          return (
                            <motion.div
                              key={transaction.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + index * 0.05 }}
                              className="p-3 lg:p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-2 lg:p-2.5 rounded-xl ${
                                  isIncoming ? 'bg-green-500/10' : 'bg-secondary'
                                }`}>
                                  {isIncoming ? (
                                    <ArrowDownLeft className="h-4 w-4 lg:h-5 lg:w-5 text-green-500" />
                                  ) : (
                                    <ArrowUpRight className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-sm lg:text-base">
                                    {transaction.description || (isIncoming ? 'Crédit reçu' : 'Débit')}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDate(transaction.createdAt)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`font-semibold text-sm lg:text-lg ${
                                  isIncoming ? 'text-green-500' : 'text-foreground'
                                }`}>
                                  {isIncoming ? '+' : '-'}{formatCurrency(Number(transaction.amount))}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {transaction.status.toLowerCase()}
                                </p>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="p-8 lg:p-12 text-center">
                        <div className="mx-auto w-12 h-12 lg:w-16 lg:h-16 mb-3 lg:mb-4 rounded-full bg-secondary flex items-center justify-center">
                          <Activity className="h-6 w-6 lg:h-8 lg:w-8 text-muted-foreground/60" />
                        </div>
                        <p className="text-muted-foreground font-medium text-sm lg:text-base">Aucune transaction</p>
                        <p className="text-xs lg:text-sm text-muted-foreground/60 mt-1">
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-40 safe-bottom">
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
                    ? 'text-foreground bg-white/10 scale-95'
                    : 'text-muted-foreground hover:text-foreground/80 active:scale-95'
                }`}
              >
                <Icon className={`h-5 w-5 transition-transform ${
                  isActive ? 'scale-110' : ''
                }`} />
                <span className={`text-xs font-medium transition-all ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
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