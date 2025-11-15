'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  CreditCard,
  User,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Ban,
  Download
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface ClientsManagementProps {
  managers: any[]
  onCreditClient: (client: any, type: 'manager' | 'client') => void
}

export function ClientsManagement({ managers, onCreditClient }: ClientsManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedManagerId, setSelectedManagerId] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')

  // Extraire tous les clients de tous les managers
  const allClients = managers.flatMap(manager =>
    manager.clients.map((client: any) => ({
      ...client,
      managerName: `${manager.user.firstName} ${manager.user.lastName}`,
      managerId: manager.id
    }))
  )

  const filteredClients = allClients.filter(client => {
    const matchesSearch =
      client.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesManager =
      selectedManagerId === 'all' || client.managerId === selectedManagerId

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && client.isActivated) ||
      (filterStatus === 'inactive' && !client.isActivated)

    return matchesSearch && matchesManager && matchesStatus
  })

  const handleToggleStatus = async (clientId: string, currentStatus: boolean) => {
    try {
      // TODO: Appeler l'API pour changer le statut
      toast.success(currentStatus ? 'Client désactivé' : 'Client activé')
    } catch (error) {
      toast.error('Erreur lors du changement de statut')
    }
  }

  const totalBalance = allClients.reduce((sum, client) => sum + Number(client.accountBalance), 0)
  const activeClients = allClients.filter(c => c.isActivated).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header avec statistiques */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Gestion des Clients</h2>
            <p className="text-gray-400 mt-1">
              {allClients.length} clients au total • {activeClients} actifs
            </p>
          </div>

          <Button variant="outline" className="border-gray-700">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="glass border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Total Clients</span>
                <User className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold">{allClients.length}</p>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Clients Actifs</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-400">{activeClients}</p>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Solde Total</span>
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </div>
              <p className="text-xl font-bold text-gradient">
                {formatCurrency(totalBalance)}
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Solde Moyen</span>
                <CreditCard className="h-4 w-4 text-cyan-500" />
              </div>
              <p className="text-xl font-bold">
                {formatCurrency(allClients.length > 0 ? totalBalance / allClients.length : 0)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 glass border-white/10"
          />
        </div>

        <select
          value={selectedManagerId}
          onChange={(e) => setSelectedManagerId(e.target.value)}
          className="px-4 py-2 rounded-lg glass border border-white/10 bg-transparent"
        >
          <option value="all">Tous les managers</option>
          {managers.map(manager => (
            <option key={manager.id} value={manager.id}>
              {manager.user.firstName} {manager.user.lastName}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
            className={filterStatus === 'all' ? 'gradient-primary' : 'border-gray-700'}
          >
            Tous
          </Button>
          <Button
            variant={filterStatus === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('active')}
            className={filterStatus === 'active' ? 'bg-green-600' : 'border-gray-700'}
          >
            Actifs
          </Button>
          <Button
            variant={filterStatus === 'inactive' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('inactive')}
            className={filterStatus === 'inactive' ? 'bg-gray-600' : 'border-gray-700'}
          >
            Inactifs
          </Button>
        </div>
      </div>

      {/* Clients Table */}
      <Card className="glass border-white/10">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="text-left p-4 text-sm text-gray-400">Client</th>
                  <th className="text-left p-4 text-sm text-gray-400">Contact</th>
                  <th className="text-left p-4 text-sm text-gray-400">Manager</th>
                  <th className="text-left p-4 text-sm text-gray-400">Solde</th>
                  <th className="text-left p-4 text-sm text-gray-400">Status</th>
                  <th className="text-left p-4 text-sm text-gray-400">Créé le</th>
                  <th className="text-right p-4 text-sm text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client, index) => (
                  <motion.tr
                    key={client.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                          {client.user.firstName[0]}{client.user.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium">
                            {client.user.firstName} {client.user.lastName}
                          </p>
                          <p className="text-xs text-gray-400">
                            ID: {client.id.slice(-8).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-gray-500" />
                          <span className="text-gray-300">{client.user.email}</span>
                        </div>
                        {client.user.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-gray-500" />
                            <span className="text-gray-300">{client.user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                        {client.managerName}
                      </Badge>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-gradient">
                        {formatCurrency(Number(client.accountBalance))}
                      </p>
                    </td>

                    <td className="p-4">
                      <Badge
                        variant={client.isActivated ? 'default' : 'secondary'}
                        className={client.isActivated ? 'bg-green-500/20 text-green-500' : ''}
                      >
                        {client.isActivated ? 'Actif' : 'Inactif'}
                      </Badge>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="h-3 w-3" />
                        {formatDate(client.createdAt)}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onCreditClient(client, 'client')}
                          className="text-green-400 hover:text-green-300"
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          Créditer
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleStatus(client.id, client.isActivated)}
                          className={client.isActivated ? "text-orange-400 hover:text-orange-300" : "text-blue-400 hover:text-blue-300"}
                        >
                          {client.isActivated ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                <User className="h-10 w-10 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Aucun client trouvé</h3>
              <p className="text-gray-400">
                {searchTerm ? 'Aucun résultat pour votre recherche' : 'Aucun client dans le système'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}