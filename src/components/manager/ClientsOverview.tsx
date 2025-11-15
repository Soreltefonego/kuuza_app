'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, UserCheck, ArrowRight } from 'lucide-react'
import { ClientWithUser } from '@/types'
import { formatCurrency, getInitials } from '@/lib/utils'
import Link from 'next/link'

interface ClientsOverviewProps {
  clients: ClientWithUser[]
  totalClients: number
  activeClients: number
}

export function ClientsOverview({ clients, totalClients, activeClients }: ClientsOverviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="glass border-white/10 h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Clients</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{totalClients}</span>
              </div>
              <div className="flex items-center gap-1">
                <UserCheck className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">{activeClients}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {clients.slice(0, 5).map((client, index) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg glass-hover border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs gradient-accent">
                      {getInitials(client.user.firstName, client.user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {client.user.firstName} {client.user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(client.accountBalance)}
                    </p>
                  </div>
                </div>
                <Badge variant={client.isActivated ? 'success' : 'warning'}>
                  {client.isActivated ? 'Actif' : 'En attente'}
                </Badge>
              </motion.div>
            ))}
          </div>

          <Link href="/manager/clients">
            <Button variant="ghost" className="w-full mt-4" size="sm">
              Voir tous les clients
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  )
}