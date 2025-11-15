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
      className="col-span-1 md:col-span-2 lg:col-span-3"
    >
      <Card className="glass border-white/10 h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                      className="w-full h-20 flex-col gap-2 glass-hover border-white/10"
                    >
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-xs">{action.label}</span>
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