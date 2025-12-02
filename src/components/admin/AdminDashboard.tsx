'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Users,
  Building,
  CreditCard,
  TrendingUp,
  DollarSign,
  Activity,
  Search,
  Settings,
  LogOut,
  Shield,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Menu,
  X
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { signOut } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { ManagersManagement } from './ManagersManagement'
import { ClientsManagement } from './ClientsManagement'
import { TransactionsOverview } from './TransactionsOverview'
import { SystemAnalytics } from './SystemAnalytics'
import { DirectCreditModal } from './DirectCreditModal'

interface AdminDashboardProps {
  totalUsers: number
  totalManagers: number
  totalClients: number
  totalTransactions: number
  managers: any[]
  recentTransactions: any[]
  totalBalances: {
    managers: number
    clients: number
    transactionVolume: number
    todayTransactions: number
    todayNewUsers: number
  }
}

export function AdminDashboard({
  totalUsers,
  totalManagers,
  totalClients,
  totalTransactions,
  managers,
  recentTransactions,
  totalBalances
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'managers', label: 'Managers', icon: Building },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'transactions', label: 'Transactions', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: PieChart }
  ]

  const handleDirectCredit = (account: any, type: 'manager' | 'client') => {
    setSelectedAccount({ ...account, type })
    setShowCreditModal(true)
  }

  const handleRefreshData = () => {
    toast.success('Données actualisées')
    window.location.reload()
  }

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-muted"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="p-1.5 md:p-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-500">
                <Shield className="h-4 w-4 md:h-6 md:w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base md:text-xl font-bold">Super Admin</h1>
                <p className="text-xs text-muted-foreground">Kuuza Bank</p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshData}
                className="border-border hidden md:flex"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="border-destructive/20 text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16 md:pt-20">
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar Navigation */}
        <aside className={`fixed left-0 top-16 md:top-20 bottom-0 w-64 bg-card border-r border-border p-4 md:p-6 z-50 transition-transform md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:block`}>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all text-sm md:text-base ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* System Status */}
          <div className="mt-6 md:mt-8 p-3 md:p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-xs md:text-sm font-medium text-green-500">Système OK</span>
            </div>
            <p className="text-xs text-muted-foreground">Services opérationnels</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="md:ml-64 flex-1 p-4 md:p-8 w-full overflow-x-hidden">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Card className="glass border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Utilisateurs Total</CardTitle>
                      <Users className="h-4 w-4 text-blue-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl md:text-3xl font-bold">{totalUsers}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="default" className="bg-green-500/20 text-green-500">
                        +{totalBalances.todayNewUsers} aujourd'hui
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Managers</CardTitle>
                      <Building className="h-4 w-4 text-purple-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl md:text-3xl font-bold">{totalManagers}</p>
                    <p className="text-xs md:text-sm text-muted-foreground mt-2">
                      Solde: {formatCurrency(totalBalances.managers)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Clients</CardTitle>
                      <Users className="h-4 w-4 text-cyan-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl md:text-3xl font-bold">{totalClients}</p>
                    <p className="text-xs md:text-sm text-muted-foreground mt-2">
                      Solde: {formatCurrency(totalBalances.clients)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Transactions</CardTitle>
                      <Activity className="h-4 w-4 text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl md:text-3xl font-bold">{totalTransactions}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="default" className="bg-blue-500/20 text-blue-500">
                        +{totalBalances.todayTransactions} aujourd'hui
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Financial Overview */}
              <Card className="glass border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-yellow-500" />
                    Aperçu Financier
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground mb-1">Volume Total des Transactions</p>
                      <p className="text-lg md:text-2xl font-bold text-gradient">
                        {formatCurrency(totalBalances.transactionVolume)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground mb-1">Solde Total Managers</p>
                      <p className="text-lg md:text-2xl font-bold text-purple-400">
                        {formatCurrency(totalBalances.managers)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground mb-1">Solde Total Clients</p>
                      <p className="text-lg md:text-2xl font-bold text-cyan-400">
                        {formatCurrency(totalBalances.clients)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-border">
                    <p className="text-xs md:text-sm text-muted-foreground mb-3">Actions Rapides</p>
                    <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                      <Button
                        onClick={() => setActiveTab('managers')}
                        className="gradient-primary text-xs md:text-sm"
                      >
                        Gérer les Managers
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('transactions')}
                        className="border-border text-xs md:text-sm"
                      >
                        Voir les Transactions
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => toast('Export en cours...')}
                        className="border-border text-xs md:text-sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Exporter
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Managers */}
              <Card className="glass border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Managers Récents</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('managers')}
                    >
                      Voir tout
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {managers.slice(0, 5).map((manager) => (
                      <div
                        key={manager.id}
                        className="flex items-center justify-between p-2 md:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                            <span className="text-xs md:text-sm font-bold">
                              {manager.user.firstName[0]}{manager.user.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm md:text-base">
                              {manager.user.firstName} {manager.user.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {manager.clients.length} clients • {formatCurrency(Number(manager.creditBalance))}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDirectCredit(manager, 'manager')}
                          className="text-green-400 hover:text-green-300 text-xs md:text-sm"
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Créditer</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card className="glass border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Transactions Récentes</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('transactions')}
                    >
                      Voir tout
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto -mx-4 md:mx-0">
                    <table className="w-full min-w-[600px] px-4 md:px-0">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 text-xs text-muted-foreground px-2 md:px-0">De</th>
                          <th className="text-left py-2 text-xs text-muted-foreground px-2 md:px-0">Vers</th>
                          <th className="text-left py-2 text-xs text-muted-foreground px-2 md:px-0">Montant</th>
                          <th className="text-left py-2 text-xs text-muted-foreground px-2 md:px-0">Status</th>
                          <th className="text-left py-2 text-xs text-muted-foreground px-2 md:px-0">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentTransactions.slice(0, 10).map((transaction) => (
                          <tr key={transaction.id} className="border-b border-border">
                            <td className="py-2 text-xs md:text-sm px-2 md:px-0">
                              {transaction.fromUser?.firstName || 'Système'} {transaction.fromUser?.lastName || ''}
                            </td>
                            <td className="py-2 text-xs md:text-sm px-2 md:px-0">
                              {transaction.toUser?.firstName || 'N/A'} {transaction.toUser?.lastName || ''}
                            </td>
                            <td className="py-2 text-xs md:text-sm font-medium px-2 md:px-0">
                              {formatCurrency(Number(transaction.amount))}
                            </td>
                            <td className="py-2 px-2 md:px-0">
                              <Badge
                                variant={transaction.status === 'SUCCESS' ? 'default' : 'secondary'}
                                className={transaction.status === 'SUCCESS' ? 'bg-green-500/20 text-green-500 text-xs' : 'text-xs'}
                              >
                                {transaction.status}
                              </Badge>
                            </td>
                            <td className="py-2 text-xs md:text-sm text-muted-foreground px-2 md:px-0">
                              {formatDate(transaction.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Managers Management Tab */}
          {activeTab === 'managers' && (
            <ManagersManagement
              managers={managers}
              onCreditManager={handleDirectCredit}
            />
          )}

          {/* Clients Management Tab */}
          {activeTab === 'clients' && (
            <ClientsManagement
              managers={managers}
              onCreditClient={handleDirectCredit}
            />
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <TransactionsOverview
              transactions={recentTransactions}
            />
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <SystemAnalytics
              totalUsers={totalUsers}
              totalManagers={totalManagers}
              totalClients={totalClients}
              totalTransactions={totalTransactions}
              totalBalances={totalBalances}
              managers={managers}
            />
          )}
        </main>
      </div>

      {/* Direct Credit Modal */}
      <DirectCreditModal
        isOpen={showCreditModal}
        onClose={() => {
          setShowCreditModal(false)
          setSelectedAccount(null)
        }}
        account={selectedAccount}
        onSuccess={() => {
          toast.success('Compte crédité avec succès')
          handleRefreshData()
        }}
      />
    </div>
  )
}