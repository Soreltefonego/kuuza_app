'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserPlus, CreditCard, Send, History } from 'lucide-react'
import Link from 'next/link'

const actions = [
  {
    icon: UserPlus,
    label: 'Créer un client',
    href: '/manager/clients',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Send,
    label: 'Créditer un client',
    href: '/manager/clients',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: CreditCard,
    label: 'Acheter du crédit',
    href: '/manager/credits',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: History,
    label: 'Voir les transactions',
    href: '/manager/transactions',
    color: 'from-orange-500 to-red-500',
  },
]

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="glass border-white/10">
        <CardHeader className="pb-2 md:pb-3">
          <CardTitle className="text-xs md:text-sm font-medium">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 md:space-y-3 pt-0">
          <div className="grid grid-cols-2 gap-1.5 md:gap-2">
            {actions.map((action, index) => {
              const Icon = action.icon
              return (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Link href={action.href}>
                    <Button
                      variant="outline"
                      className="w-full h-12 md:h-14 flex-col gap-1 glass-hover border-white/10 text-xs"
                    >
                      <div className={`p-1 md:p-1.5 rounded-lg bg-gradient-to-r ${action.color}`}>
                        <Icon className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" />
                      </div>
                      <span className="text-[9px] md:text-[10px] leading-tight">{action.label}</span>
                    </Button>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}