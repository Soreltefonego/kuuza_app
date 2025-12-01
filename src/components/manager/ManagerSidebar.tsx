'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Users,
  History,
  CreditCard,
  LogOut,
  Wallet,
  TrendingUp
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { SessionUser } from '@/types'

const menuItems = [
  { href: '/manager/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/manager/clients', icon: Users, label: 'Clients' },
  { href: '/manager/transactions', icon: History, label: 'Transactions' },
  { href: '/manager/credits', icon: CreditCard, label: 'Acheter du crédit' },
]

interface ManagerSidebarProps {
  user: SessionUser
  creditBalance?: number
}

export function ManagerSidebar({ user, creditBalance = 0 }: ManagerSidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col glass border-r border-white/10">
      <div className="flex items-center gap-3 p-6 border-b border-white/10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Avatar className="h-12 w-12">
            <AvatarFallback className="gradient-primary text-white">
              {user.firstName[0]}{user.lastName[0]}
            </AvatarFallback>
          </Avatar>
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-muted-foreground truncate">Manager</p>
        </div>
      </div>

      <div className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      'w-full justify-start',
                      isActive && 'gradient-primary shadow-lg'
                    )}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="p-4 border-t border-white/10">
        <Button
          variant="ghost"
          className="w-full justify-start hover:bg-destructive/10 hover:text-destructive"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Déconnexion
        </Button>
      </div>

      <div className="p-4 border-t border-white/10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-lg gradient-mesh p-4 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Crédit disponible</span>
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-gradient">
            {formatCurrency(creditBalance)}
          </p>
        </motion.div>
      </div>
    </div>
  )
}