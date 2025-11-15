'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Users,
  History,
  CreditCard,
  LogOut,
  Menu,
  X,
  Wallet
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { SessionUser } from '@/types'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

const menuItems = [
  { href: '/manager/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/manager/clients', icon: Users, label: 'Clients' },
  { href: '/manager/transactions', icon: History, label: 'Transactions' },
  { href: '/manager/credits', icon: CreditCard, label: 'Acheter du crédit' },
]

interface MobileNavProps {
  user: SessionUser
  creditBalance?: bigint
}

export function MobileNav({ user, creditBalance = BigInt(0) }: MobileNavProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 glass">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] glass border-white/10 p-0">
          <div className="flex h-full flex-col">
            {/* User Info */}
            <div className="flex items-center gap-3 p-6 border-b border-white/10">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="gradient-primary text-white">
                  {user.firstName[0]}{user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">Manager</p>
              </div>
            </div>

            {/* Credit Balance */}
            <div className="px-4 pt-4">
              <div className="rounded-lg gradient-mesh p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Crédit disponible</span>
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
                <p className="text-xl font-bold text-gradient">
                  {Number(creditBalance).toLocaleString('fr-FR')} XAF
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-3 py-4">
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isActive ? 'default' : 'ghost'}
                        className={cn(
                          'w-full justify-start',
                          isActive && 'gradient-primary shadow-lg'
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="mr-3 h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Logout */}
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
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}