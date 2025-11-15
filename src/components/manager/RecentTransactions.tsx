'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  ArrowRight,
  Clock
} from 'lucide-react'
import { TransactionWithUsers } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

interface RecentTransactionsProps {
  transactions: TransactionWithUsers[]
}

const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'CREDIT':
      return ArrowDownLeft
    case 'DEBIT':
      return ArrowUpRight
    case 'TRANSFER':
      return ArrowUpRight
    case 'BUY_CREDIT':
      return CreditCard
    default:
      return ArrowRight
  }
}

const getTransactionColor = (type: string) => {
  switch (type) {
    case 'CREDIT':
      return 'text-green-400'
    case 'DEBIT':
      return 'text-red-400'
    case 'TRANSFER':
      return 'text-blue-400'
    case 'BUY_CREDIT':
      return 'text-purple-400'
    default:
      return 'text-gray-400'
  }
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="glass border-white/10 h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Transactions récentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Aucune transaction pour le moment</p>
              </div>
            ) : (
              transactions.slice(0, 5).map((transaction, index) => {
                const Icon = getTransactionIcon(transaction.type)
                const color = getTransactionColor(transaction.type)

                return (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg glass-hover border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full bg-white/5 ${color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {transaction.description || transaction.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${color}`}>
                        {transaction.type === 'CREDIT' || transaction.type === 'BUY_CREDIT' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <Badge variant={transaction.status === 'SUCCESS' ? 'success' : 'warning'}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>

          {transactions.length > 0 && (
            <Link href="/manager/transactions">
              <Button variant="ghost" className="w-full mt-4" size="sm">
                Voir toutes les transactions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}