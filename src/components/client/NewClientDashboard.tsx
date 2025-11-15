'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTheme } from '@/contexts/ThemeContext'
import { useCurrency } from '@/contexts/CurrencyContext'
import { Menu, Transition } from '@headlessui/react'
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
  Menu as MenuIcon,
  X,
  ChevronDown,
  Sun,
  Moon,
  DollarSign,
  Euro,
  PoundSterling,
  Banknote,
  ChartBar,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Shield,
  Zap,
  Target,
  Smartphone,
  Globe,
  Receipt,
  Download
} from 'lucide-react'
import { formatCurrency as formatUtil, formatDate } from '@/lib/utils'
import { signOut } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { TransferModal } from './TransferModal'
import { RechargeModal } from './RechargeModal'

interface ClientDashboardProps {
  client: any
  transactions: any[]
  balance: bigint
}

const currencyIcons = {
  USD: DollarSign,
  EUR: Euro,
  GBP: PoundSterling,
  JPY: Banknote,
  CAD: DollarSign,
  CHF: Banknote,
  AUD: DollarSign,
  CNY: Banknote
}

export function NewClientDashboard({ client, transactions, balance }: ClientDashboardProps) {
  const [showBalance, setShowBalance] = useState(true)
  const [copied, setCopied] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showRechargeModal, setShowRechargeModal] = useState(false)
  const [chartPeriod, setChartPeriod] = useState('week')

  const { theme, toggleTheme } = useTheme()
  const { currency, setCurrency, formatCurrency, currencySymbol } = useCurrency()

  const accountNumber = `KB${client.id.slice(-8).toUpperCase()}`
  const balanceAmount = Number(balance) / 100

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

  const CurrencyIcon = currencyIcons[currency]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-black'
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
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

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'overview'
                    ? theme === 'dark'
                      ? 'text-blue-400 bg-blue-400/10'
                      : 'text-blue-600 bg-blue-50'
                    : theme === 'dark'
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Vue d'ensemble
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'transactions'
                    ? theme === 'dark'
                      ? 'text-blue-400 bg-blue-400/10'
                      : 'text-blue-600 bg-blue-50'
                    : theme === 'dark'
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Transactions
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? theme === 'dark'
                      ? 'text-blue-400 bg-blue-400/10'
                      : 'text-blue-600 bg-blue-50'
                    : theme === 'dark'
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('cards')}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'cards'
                    ? theme === 'dark'
                      ? 'text-blue-400 bg-blue-400/10'
                      : 'text-blue-600 bg-blue-50'
                    : theme === 'dark'
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Cartes
              </button>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Currency Selector */}
              <Menu as="div" className="relative">
                <Menu.Button className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}>
                  <CurrencyIcon className="h-4 w-4" />
                  <span className="font-medium">{currency}</span>
                  <ChevronDown className="h-3 w-3" />
                </Menu.Button>
                <Transition
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <Menu.Items className={`absolute right-0 mt-2 w-48 rounded-xl shadow-lg ${
                    theme === 'dark'
                      ? 'bg-gray-800 border border-gray-700'
                      : 'bg-white border border-gray-200'
                  }`}>
                    <div className="p-1">
                      {Object.keys(currencyIcons).map((curr) => {
                        const Icon = currencyIcons[curr as keyof typeof currencyIcons]
                        return (
                          <Menu.Item key={curr}>
                            {({ active }) => (
                              <button
                                onClick={() => setCurrency(curr as any)}
                                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors ${
                                  active
                                    ? theme === 'dark'
                                      ? 'bg-gray-700'
                                      : 'bg-gray-100'
                                    : ''
                                } ${
                                  currency === curr
                                    ? theme === 'dark'
                                      ? 'text-blue-400'
                                      : 'text-blue-600'
                                    : theme === 'dark'
                                      ? 'text-gray-300'
                                      : 'text-gray-700'
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                                <span className="font-medium">{curr}</span>
                                {currency === curr && (
                                  <div className="ml-auto w-2 h-2 rounded-full bg-blue-500" />
                                )}
                              </button>
                            )}
                          </Menu.Item>
                        )
                      })}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>

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

              {/* Notifications */}
              <button className={`p-2 rounded-lg transition-colors relative ${
                theme === 'dark'
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}>
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* Profile Menu */}
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={`${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600'
                    } text-white`}>
                      {client.user.firstName[0]}{client.user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {client.user.firstName} {client.user.lastName}
                    </p>
                    <p className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {accountNumber}
                    </p>
                  </div>
                </Menu.Button>
                <Transition
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <Menu.Items className={`absolute right-0 mt-2 w-56 rounded-xl shadow-lg ${
                    theme === 'dark'
                      ? 'bg-gray-800 border border-gray-700'
                      : 'bg-white border border-gray-200'
                  }`}>
                    <div className="p-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => setActiveTab('settings')}
                            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors ${
                              active
                                ? theme === 'dark'
                                  ? 'bg-gray-700'
                                  : 'bg-gray-100'
                                : ''
                            } ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}
                          >
                            <Settings className="h-4 w-4" />
                            <span>Paramètres</span>
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors ${
                              active
                                ? theme === 'dark'
                                  ? 'bg-red-500/20'
                                  : 'bg-red-50'
                                : ''
                            } ${
                              theme === 'dark' ? 'text-red-400' : 'text-red-600'
                            }`}
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Déconnexion</span>
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className={`fixed inset-0 z-40 lg:hidden ${
              theme === 'dark' ? 'bg-gray-900' : 'bg-white'
            }`}
            style={{ top: '64px' }}
          >
            <div className="p-4 space-y-2">
              {['overview', 'transactions', 'analytics', 'cards', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab)
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === tab
                      ? theme === 'dark'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-blue-50 text-blue-600'
                      : theme === 'dark'
                        ? 'text-gray-400 hover:bg-gray-800'
                        : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
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
                <div className="flex items-center justify-between">
                  <CardTitle className={`${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Évolution du solde</CardTitle>
                  <div className="flex gap-2">
                    {['week', 'month', 'year'].map((period) => (
                      <button
                        key={period}
                        onClick={() => setChartPeriod(period)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          chartPeriod === period
                            ? theme === 'dark'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-blue-50 text-blue-600'
                            : theme === 'dark'
                              ? 'text-gray-500 hover:text-gray-300'
                              : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {period === 'week' ? 'Semaine' : period === 'month' ? 'Mois' : 'Année'}
                      </button>
                    ))}
                  </div>
                </div>
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
                      tickFormatter={(value) => `${currencySymbol}${value}`}
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
                <div className="flex items-center justify-between">
                  <CardTitle className={`${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Transactions récentes</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab('transactions')}
                    className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                  >
                    Voir tout
                  </Button>
                </div>
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
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Analytics</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Income vs Expenses */}
              <Card className={`${
                theme === 'dark'
                  ? 'bg-gray-800/50 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}>
                <CardHeader>
                  <CardTitle className={`${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Revenus vs Dépenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                      <XAxis dataKey="date" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} fontSize={12} />
                      <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                          border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="expenses" fill="#ef4444" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Spending Categories */}
              <Card className={`${
                theme === 'dark'
                  ? 'bg-gray-800/50 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}>
                <CardHeader>
                  <CardTitle className={`${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Catégories de dépenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={spendingCategories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {spendingCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Summary */}
            <Card className={`${
              theme === 'dark'
                ? 'bg-gray-800/50 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <CardHeader>
                <CardTitle className={`${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Résumé mensuel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>Moyenne par transaction</p>
                    <p className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formatCurrency(stats.averageTransaction)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>Plus grosse dépense</p>
                    <p className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {formatCurrency(Math.max(...transactions.map(t => Number(t.amount) / 100), 0))}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>Économies ce mois</p>
                    <p className={`text-2xl font-bold text-green-500`}>
                      {formatCurrency(stats.totalIncome - stats.totalExpenses)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>Taux d'épargne</p>
                    <p className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {stats.totalIncome > 0
                        ? `${(((stats.totalIncome - stats.totalExpenses) / stats.totalIncome) * 100).toFixed(1)}%`
                        : '0%'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Toutes les transactions</h2>
              <Button className={`${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}>
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>

            <Card className={`${
              theme === 'dark'
                ? 'bg-gray-800/50 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${
                      theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50'
                    }`}>
                      <tr>
                        <th className={`text-left p-4 font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Type</th>
                        <th className={`text-left p-4 font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Description</th>
                        <th className={`text-left p-4 font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Montant</th>
                        <th className={`text-left p-4 font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Status</th>
                        <th className={`text-left p-4 font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className={`border-t ${
                          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                        }`}>
                          <td className="p-4">
                            <div className={`inline-flex p-2 rounded-lg ${
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
                          </td>
                          <td className="p-4">
                            <p className={`font-medium ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {transaction.description ||
                                (transaction.type === 'CREDIT' || transaction.toUserId === client.userId
                                  ? `Reçu de ${transaction.fromUser?.firstName || 'Système'}`
                                  : `Envoyé à ${transaction.toUser?.firstName || 'Inconnu'}`)}
                            </p>
                          </td>
                          <td className="p-4">
                            <p className={`font-bold ${
                              transaction.type === 'CREDIT' || transaction.toUserId === client.userId
                                ? 'text-green-500'
                                : theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {transaction.type === 'CREDIT' || transaction.toUserId === client.userId ? '+' : '-'}
                              {formatCurrency(Number(transaction.amount) / 100)}
                            </p>
                          </td>
                          <td className="p-4">
                            <Badge variant={transaction.status === 'SUCCESS' ? 'default' : 'secondary'}
                              className={`${
                                transaction.status === 'SUCCESS'
                                  ? 'bg-green-500/20 text-green-500'
                                  : 'bg-yellow-500/20 text-yellow-500'
                              }`}>
                              {transaction.status}
                            </Badge>
                          </td>
                          <td className={`p-4 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
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

        {/* Cards Tab */}
        {activeTab === 'cards' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Mes cartes</h2>

            {/* Virtual Card */}
            <Card className={`overflow-hidden ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-0'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 border-0'
            }`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-white/80 text-sm">Carte Virtuelle</p>
                    <p className="text-white text-2xl font-bold mt-1">Kuuza Premium</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/30" />
                    <div className="w-8 h-8 rounded-full bg-white/30 -ml-3" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="font-mono text-white text-lg tracking-wider">
                    •••• •••• •••• {client.id.slice(-4)}
                  </div>

                  <div className="flex gap-8">
                    <div>
                      <p className="text-white/60 text-xs">Titulaire</p>
                      <p className="text-white font-medium">
                        {client.user.firstName} {client.user.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs">Expire</p>
                      <p className="text-white font-medium">12/26</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs">CVV</p>
                      <p className="text-white font-medium">•••</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    size="sm"
                    className="bg-white/20 backdrop-blur hover:bg-white/30 text-white border-0"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Bloquer
                  </Button>
                  <Button
                    size="sm"
                    className="bg-white/20 backdrop-blur hover:bg-white/30 text-white border-0"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Détails
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Card Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: Zap, title: 'Paiements instantanés', desc: 'Transactions en temps réel' },
                { icon: Shield, title: 'Sécurité maximale', desc: 'Protection 3D Secure' },
                { icon: Globe, title: 'Acceptée partout', desc: 'Dans plus de 200 pays' }
              ].map((feature, index) => (
                <Card key={index} className={`${
                  theme === 'dark'
                    ? 'bg-gray-800/50 border-gray-700'
                    : 'bg-white border-gray-200'
                }`}>
                  <CardContent className="p-6">
                    <feature.icon className={`h-8 w-8 mb-3 ${
                      theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                    <h3 className={`font-semibold mb-1 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{feature.title}</h3>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Request Physical Card */}
            <Card className={`${
              theme === 'dark'
                ? 'bg-gray-800/50 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>Carte physique</h3>
                    <p className={`text-sm mt-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>Recevez votre carte Kuuza en 5-7 jours ouvrés</p>
                  </div>
                  <Button className={`${
                    theme === 'dark'
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-purple-500 hover:bg-purple-600'
                  }`}>
                    Commander
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Paramètres</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Settings */}
              <Card className={`lg:col-span-2 ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}>
                <CardHeader>
                  <CardTitle className={`${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Profil</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>Prénom</label>
                      <input
                        type="text"
                        value={client.user.firstName}
                        readOnly
                        className={`mt-1 w-full px-3 py-2 rounded-lg ${
                          theme === 'dark'
                            ? 'bg-gray-900 border-gray-700 text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        } border`}
                      />
                    </div>
                    <div>
                      <label className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>Nom</label>
                      <input
                        type="text"
                        value={client.user.lastName}
                        readOnly
                        className={`mt-1 w-full px-3 py-2 rounded-lg ${
                          theme === 'dark'
                            ? 'bg-gray-900 border-gray-700 text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        } border`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>Email</label>
                    <input
                      type="email"
                      value={client.user.email}
                      readOnly
                      className={`mt-1 w-full px-3 py-2 rounded-lg ${
                        theme === 'dark'
                          ? 'bg-gray-900 border-gray-700 text-white'
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                      } border`}
                    />
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>Téléphone</label>
                    <input
                      type="tel"
                      value={client.phoneNumber || ''}
                      readOnly
                      className={`mt-1 w-full px-3 py-2 rounded-lg ${
                        theme === 'dark'
                          ? 'bg-gray-900 border-gray-700 text-white'
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                      } border`}
                    />
                  </div>
                  <Button className={`w-full ${
                    theme === 'dark'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}>
                    Mettre à jour le profil
                  </Button>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card className={`${
                theme === 'dark'
                  ? 'bg-gray-800/50 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}>
                <CardHeader>
                  <CardTitle className={`${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Sécurité</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <button className={`w-full text-left p-3 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>Changer le mot de passe</span>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </button>
                  <button className={`w-full text-left p-3 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>Authentification à 2 facteurs</span>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </button>
                  <button className={`w-full text-left p-3 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>Sessions actives</span>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 ${
        theme === 'dark'
          ? 'bg-black/90 backdrop-blur-xl border-t border-white/10'
          : 'bg-white/90 backdrop-blur-xl border-t border-gray-200'
      }`}>
        <div className="grid grid-cols-5 gap-1 p-2">
          {[
            { id: 'overview', icon: Home, label: 'Accueil' },
            { id: 'transactions', icon: Activity, label: 'Activité' },
            { id: 'transfer', icon: Send, label: 'Envoyer' },
            { id: 'cards', icon: CreditCard, label: 'Cartes' },
            { id: 'settings', icon: Settings, label: 'Plus' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'transfer') {
                  setShowTransferModal(true)
                } else {
                  setActiveTab(item.id)
                }
              }}
              className={`flex flex-col items-center justify-center py-2 rounded-lg transition-colors ${
                activeTab === item.id
                  ? theme === 'dark'
                    ? 'text-blue-400'
                    : 'text-blue-600'
                  : theme === 'dark'
                    ? 'text-gray-500'
                    : 'text-gray-600'
              }`}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

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