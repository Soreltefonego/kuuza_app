'use client'

import { useState } from 'react'
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
  User,
  Wallet
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { SessionUser } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ThemeToggle } from '@/components/theme-toggle'

const menuItems = [
  { href: '/manager/dashboard', icon: LayoutDashboard, label: 'Accueil' },
  { href: '/manager/clients', icon: Users, label: 'Clients' },
  { href: '/manager/transactions', icon: History, label: 'Historique' },
  { href: '/manager/credits', icon: CreditCard, label: 'Crédit' },
]

interface MobileNavProps {
  user: SessionUser
  creditBalance?: bigint
}

export function MobileNav({ user, creditBalance = BigInt(0) }: MobileNavProps) {
  const pathname = usePathname()
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <>
      {/* Bottom Navigation Bar - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-white/10 w-full max-w-[100vw] overflow-hidden">
        <div className="flex items-center justify-around py-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex flex-col items-center justify-center py-2 px-1",
                    "transition-colors duration-200"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-violet-500 to-purple-500 shadow-lg"
                      : "bg-transparent"
                  )}>
                    <Icon className={cn(
                      "h-5 w-5 transition-colors duration-200",
                      isActive ? "text-white" : "text-muted-foreground"
                    )} />
                  </div>
                  <span className={cn(
                    "text-[10px] mt-1 font-medium transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            )
          })}

          {/* Profile Button */}
          <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
            <DialogTrigger asChild>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center justify-center py-2 px-1 flex-1"
              >
                <div className="p-2 rounded-xl bg-transparent">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <span className="text-[10px] mt-1 font-medium text-muted-foreground">
                  Profil
                </span>
              </motion.button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-sm mx-auto">
              <DialogHeader>
                <DialogTitle className="text-center">Mon Profil</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* User Info */}
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="gradient-primary text-white">
                      {user.firstName[0]}{user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-muted-foreground">Manager</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                {/* Credit Balance */}
                <div className="p-4 rounded-lg gradient-mesh">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Crédit disponible</span>
                    <Wallet className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-gradient">
                    {formatCurrency(Number(creditBalance))}
                  </p>
                </div>

                {/* Theme Toggle */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <span className="text-sm font-medium">Thème</span>
                  <ThemeToggle />
                </div>

                {/* Logout */}
                <Button
                  variant="outline"
                  className="w-full border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    setProfileOpen(false)
                    signOut({ callbackUrl: '/login' })
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Spacer for bottom navigation */}
      <div className="md:hidden h-20" />
    </>
  )
}