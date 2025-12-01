'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, TrendingUp, Plus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface CreditBalanceCardProps {
  balance: number
}

export function CreditBalanceCard({ balance }: CreditBalanceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass border-white/10 overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-10" />
        <CardHeader className="relative pb-2 md:pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs md:text-sm font-medium">Solde de crédit</CardTitle>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
            >
              <Wallet className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </motion.div>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-2 md:space-y-4 pt-0">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <p className="text-2xl md:text-4xl font-bold text-gradient">
              {formatCurrency(balance)}
            </p>
          </motion.div>

          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
            <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-400" />
            <span>+12% ce mois</span>
          </div>

          <Link href="/manager/credits">
            <Button className="w-full h-8 md:h-10" size="sm">
              <Plus className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
              <span className="text-xs md:text-sm">Acheter du crédit</span>
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  )
}