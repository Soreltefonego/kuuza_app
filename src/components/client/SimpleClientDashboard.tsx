'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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
  TrendingUp,
  Clock,
  Home,
  Activity,
  Settings,
  LogOut,
  Menu as MenuIcon,
  X,
  ChevronDown,
  Sun,
  Moon,
  DollarSign,
  Euro,
  PoundSterling,
  Banknote,
  ArrowUp,
  ArrowDown,
  Shield,
  Zap,
  Target,
  Download
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { signOut } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { TransferModal } from './TransferModal'
import { RechargeModal } from './RechargeModal'

interface SimpleClientDashboardProps {
  client: any
  transactions: any[]
  balance: bigint
}

export function SimpleClientDashboard({ client, transactions, balance }: SimpleClientDashboardProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD')
  const [showBalance, setShowBalance] = useState(true)
  const [copied, setCopied] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showRechargeModal, setShowRechargeModal] = useState(false)

  const accountNumber = `KB${client.id.slice(-8).toUpperCase()}`
  const balanceAmount = Number(balance) / 100

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const formatCurrency = (amount: number) => {
    const symbols = { USD: '$', EUR: '€', GBP: '£' }
    return `${symbols[currency]}${amount.toFixed(2)}`
  }

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(accountNumber)
    setCopied(true)
    toast.success('Numéro de compte copié!')
    setTimeout(() => setCopied(false), 2000)
  }

  // Generate chart data
  const generateChartData = () => {
    const now = new Date()
    const data = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)

      const dayTransactions = transactions.filter(t => {
        const tDate = new Date(t.createdAt)
        return tDate.toDateString() === date.toDateString()
      })

      const income = dayTransactions
        .filter(t => t.toUserId === client.userId && t.status === 'SUCCESS')
        .reduce((sum, t) => sum + Number(t.amount) / 100, 0)

      const expenses = dayTransactions
        .filter(t => t.fromUserId === client.userId && t.status === 'SUCCESS')
        .reduce((sum, t) => sum + Number(t.amount) / 100, 0)

      data.push({
        date: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
        income,
        expenses,
        balance: balanceAmount - (i * 100) + Math.random() * 200
      })
    }

    return data
  }

  const chartData = generateChartData()

  // Calculate statistics
  const stats = {
    totalIncome: transactions
      .filter(t => t.toUserId === client.userId && t.status === 'SUCCESS')
      .reduce((sum, t) => sum + Number(t.amount) / 100, 0),
    totalExpenses: transactions
      .filter(t => t.fromUserId === client.userId && t.status === 'SUCCESS')
      .reduce((sum, t) => sum + Number(t.amount) / 100, 0),
    transactionCount: transactions.length,
    averageTransaction: transactions.length > 0
      ? transactions.reduce((sum, t) => sum + Number(t.amount) / 100, 0) / transactions.length
      : 0
  }

  // Spending categories data
  const spendingCategories = [
    { name: 'Transferts', value: 45, color: '#3b82f6' },
    { name: 'Recharges', value: 30, color: '#10b981' },
    { name: 'Achats', value: 15, color: '#f59e0b' },
    { name: 'Autres', value: 10, color: '#8b5cf6' },
  ]

  const currencyIcons = {
    USD: DollarSign,
    EUR: Euro,
    GBP: PoundSterling
  }

  const CurrencyIcon = currencyIcons[currency]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white'
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900'
    }`}>
      {/* Top Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl ${
        theme === 'dark'
          ? 'bg-black/60 border-b border-white/10'
          : 'bg-white/80 border-b border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600'
              }`}>
                <span className="text-white font-bold text-lg">KB</span>
              </div>
              <div className="hidden sm:block">
                <h1 className={`text-xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Kuuza Bank</h1>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Votre banque digitale</p>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Currency Selector */}
              <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  } border-none outline-none`}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Profile */}
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={`${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600'
                  } text-white text-sm`}>
                    {client.user.firstName[0]}{client.user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Balance Card */}
          <Card className={`overflow-hidden ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-0'
              : 'bg-gradient-to-r from-blue-500 to-purple-500 border-0'
          }`}>
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Solde disponible</p>
                    <div className="flex items-center gap-3 mt-2">
                      <h2 className="text-3xl sm:text-4xl font-bold text-white">
                        {showBalance ? formatCurrency(balanceAmount) : '••••••'}
                      </h2>
                      <button
                        onClick={() => setShowBalance(!showBalance)}
                        className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                      >
                        {showBalance ? (
                          <EyeOff className="h-4 w-4 text-white" />
                        ) : (
                          <Eye className="h-4 w-4 text-white" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-white/80 text-sm">Compte:</span>
                    <span className="text-white font-mono">{accountNumber}</span>
                    <button
                      onClick={handleCopyAccount}
                      className="p-1 rounded hover:bg-white/20 transition-colors"
                    >
                      <Copy className={`h-3 w-3 ${copied ? 'text-green-300' : 'text-white'}`} />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => setShowTransferModal(true)}
                      className="bg-white text-purple-600 hover:bg-white/90"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer
                    </Button>
                    <Button
                      onClick={() => setShowRechargeModal(true)}
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/20"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Recharger
                    </Button>
                  </div>
                </div>

                <div className="hidden sm:block">
                  <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
                    <CurrencyIcon className="h-12 w-12 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className={`${
              theme === 'dark'
                ? 'bg-gray-800/50 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>Revenus</p>
                    <p className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formatCurrency(stats.totalIncome)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-500">+12.5%</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-green-500/20' : 'bg-green-50'
                  }`}>
                    <TrendingUp className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${
              theme === 'dark'
                ? 'bg-gray-800/50 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>Dépenses</p>
                    <p className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formatCurrency(stats.totalExpenses)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowDown className="h-3 w-3 text-red-500" />
                      <span className="text-xs text-red-500">-8.2%</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-red-500/20' : 'bg-red-50'
                  }`}>
                    <ArrowDownLeft className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-red-400' : 'text-red-600'
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${
              theme === 'dark'
                ? 'bg-gray-800/50 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>Transactions</p>
                    <p className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {stats.transactionCount}
                    </p>
                    <p className={`text-xs ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                    }`}>Ce mois</p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-50'
                  }`}>
                    <Activity className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${
              theme === 'dark'
                ? 'bg-gray-800/50 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>Épargne</p>
                    <p className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formatCurrency(balanceAmount * 0.3)}
                    </p>
                    <p className={`text-xs ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                    }`}>Objectif: {formatCurrency(balanceAmount * 0.5)}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-50'
                  }`}>
                    <Target className={`h-5 w-5 ${
                      theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Balance Chart */}
          <Card className={`${
            theme === 'dark'
              ? 'bg-gray-800/50 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <CardHeader>
              <CardTitle className={`${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Évolution du solde</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                  <XAxis
                    dataKey="date"
                    stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                    fontSize={12}
                  />
                  <YAxis
                    stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                    fontSize={12}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                      border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: theme === 'dark' ? '#f3f4f6' : '#111827' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorBalance)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className={`${
            theme === 'dark'
              ? 'bg-gray-800/50 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <CardHeader>
              <CardTitle className={`${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Transactions récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-900/50 hover:bg-gray-900/80'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'CREDIT' || transaction.toUserId === client.userId
                          ? theme === 'dark' ? 'bg-green-500/20' : 'bg-green-50'
                          : theme === 'dark' ? 'bg-red-500/20' : 'bg-red-50'
                      }`}>
                        {transaction.type === 'CREDIT' || transaction.toUserId === client.userId ? (
                          <ArrowDownLeft className={`h-4 w-4 ${
                            theme === 'dark' ? 'text-green-400' : 'text-green-600'
                          }`} />
                        ) : (
                          <ArrowUpRight className={`h-4 w-4 ${
                            theme === 'dark' ? 'text-red-400' : 'text-red-600'
                          }`} />
                        )}
                      </div>
                      <div>
                        <p className={`font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {transaction.type === 'CREDIT' || transaction.toUserId === client.userId
                            ? `De ${transaction.fromUser?.firstName || 'Système'}`
                            : `Vers ${transaction.toUser?.firstName || 'Inconnu'}`}
                        </p>
                        <p className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        transaction.type === 'CREDIT' || transaction.toUserId === client.userId
                          ? 'text-green-500'
                          : theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {transaction.type === 'CREDIT' || transaction.toUserId === client.userId ? '+' : '-'}
                        {formatCurrency(Number(transaction.amount) / 100)}
                      </p>
                      <Badge variant={transaction.status === 'SUCCESS' ? 'default' : 'secondary'}
                        className={`text-[10px] ${
                          transaction.status === 'SUCCESS'
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-yellow-500/20 text-yellow-500'
                        }`}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
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
    </div>
  )
}