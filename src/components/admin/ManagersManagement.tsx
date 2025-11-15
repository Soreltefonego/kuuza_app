'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  UserPlus,
  CreditCard,
  TrendingUp,
  Users,
  Ban,
  CheckCircle,
  AlertTriangle,
  Edit,
  Eye,
  Download
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface ManagersManagementProps {
  managers: any[]
  onCreditManager: (manager: any, type: 'manager' | 'client') => void
}

export function ManagersManagement({ managers, onCreditManager }: ManagersManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended'>('all')
  const [selectedManager, setSelectedManager] = useState<any>(null)

  const filteredManagers = managers.filter(manager => {
    const matchesSearch =
      manager.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && manager.isActive !== false) ||
      (filterStatus === 'suspended' && manager.isActive === false)

    return matchesSearch && matchesStatus
  })

  const handleToggleStatus = async (managerId: string, currentStatus: boolean) => {
    try {
      // TODO: Appeler l'API pour changer le statut
      toast.success(currentStatus ? 'Manager suspendu' : 'Manager réactivé')
    } catch (error) {
      toast.error('Erreur lors du changement de statut')
    }
  }

  const handleViewDetails = (manager: any) => {
    setSelectedManager(manager)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Managers</h2>
          <p className="text-gray-400 mt-1">
            {managers.length} managers • {managers.reduce((sum, m) => sum + m.clients.length, 0)} clients au total
          </p>
        </div>

        <div className="flex gap-3">
          <Button className="gradient-primary">
            <UserPlus className="h-4 w-4 mr-2" />
            Nouveau Manager
          </Button>
          <Button variant="outline" className="border-gray-700">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Rechercher un manager..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 glass border-white/10"
          />
        </div>

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
            variant={filterStatus === 'suspended' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('suspended')}
            className={filterStatus === 'suspended' ? 'bg-red-600' : 'border-gray-700'}
          >
            Suspendus
          </Button>
        </div>
      </div>

      {/* Managers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredManagers.map((manager) => (
          <motion.div
            key={manager.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="glass border-white/10 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500" />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {manager.user.firstName[0]}{manager.user.lastName[0]}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {manager.user.firstName} {manager.user.lastName}
                      </CardTitle>
                      <p className="text-sm text-gray-400">{manager.user.email}</p>
                    </div>
                  </div>
                  <Badge
                    variant={manager.isActive !== false ? 'default' : 'destructive'}
                    className={manager.isActive !== false ? 'bg-green-500/20 text-green-500' : ''}
                  >
                    {manager.isActive !== false ? 'Actif' : 'Suspendu'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-cyan-500" />
                      <span className="text-xs text-gray-400">Clients</span>
                    </div>
                    <p className="text-xl font-bold">{manager.clients.length}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-gray-400">Solde</span>
                    </div>
                    <p className="text-lg font-bold text-gradient">
                      {formatCurrency(Number(manager.creditBalance))}
                    </p>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Téléphone:</span>
                    <span>{manager.user.phone || 'Non renseigné'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Créé le:</span>
                    <span>{formatDate(manager.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Commission totale:</span>
                    <span className="text-green-400">
                      {formatCurrency(manager.totalCommission || 0)}
                    </span>
                  </div>
                </div>

                {/* Clients Preview */}
                {manager.clients.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Clients récents:</p>
                    <div className="space-y-1">
                      {manager.clients.slice(0, 3).map((client: any) => (
                        <div key={client.id} className="flex items-center justify-between text-xs p-2 rounded bg-white/5">
                          <span>{client.user.firstName} {client.user.lastName}</span>
                          <span className="text-gray-400">
                            {formatCurrency(Number(client.accountBalance))}
                          </span>
                        </div>
                      ))}
                      {manager.clients.length > 3 && (
                        <p className="text-xs text-center text-gray-500 mt-1">
                          +{manager.clients.length - 3} autres clients
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleViewDetails(manager)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onCreditManager(manager, 'manager')}
                    className="text-green-400 hover:text-green-300"
                  >
                    <CreditCard className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleStatus(manager.id, manager.isActive !== false)}
                    className={manager.isActive !== false ? "text-orange-400 hover:text-orange-300" : "text-green-400 hover:text-green-300"}
                  >
                    {manager.isActive !== false ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredManagers.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <Users className="h-10 w-10 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Aucun manager trouvé</h3>
          <p className="text-gray-400">
            {searchTerm ? 'Aucun résultat pour votre recherche' : 'Créez votre premier manager'}
          </p>
        </div>
      )}

      {/* Manager Details Modal */}
      {selectedManager && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedManager(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl glass rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Détails du Manager</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedManager(null)}
              >
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Manager Info */}
              <div>
                <h4 className="font-medium mb-4">Informations Personnelles</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Nom complet</p>
                    <p className="font-medium">
                      {selectedManager.user.firstName} {selectedManager.user.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="font-medium">{selectedManager.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Téléphone</p>
                    <p className="font-medium">{selectedManager.user.phone || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Date d'inscription</p>
                    <p className="font-medium">{formatDate(selectedManager.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Financial Info */}
              <div>
                <h4 className="font-medium mb-4">Informations Financières</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Solde crédit</p>
                    <p className="text-2xl font-bold text-gradient">
                      {formatCurrency(Number(selectedManager.creditBalance))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Commission totale</p>
                    <p className="font-medium text-green-400">
                      {formatCurrency(selectedManager.totalCommission || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Nombre de clients</p>
                    <p className="font-medium">{selectedManager.clients.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Clients List */}
            <div className="mt-6">
              <h4 className="font-medium mb-4">Liste des Clients ({selectedManager.clients.length})</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2 text-sm text-gray-400">Client</th>
                      <th className="text-left py-2 text-sm text-gray-400">Email</th>
                      <th className="text-left py-2 text-sm text-gray-400">Solde</th>
                      <th className="text-left py-2 text-sm text-gray-400">Status</th>
                      <th className="text-left py-2 text-sm text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedManager.clients.map((client: any) => (
                      <tr key={client.id} className="border-b border-white/5">
                        <td className="py-2">
                          {client.user.firstName} {client.user.lastName}
                        </td>
                        <td className="py-2 text-sm text-gray-400">
                          {client.user.email}
                        </td>
                        <td className="py-2 font-medium">
                          {formatCurrency(Number(client.accountBalance))}
                        </td>
                        <td className="py-2">
                          <Badge
                            variant={client.isActivated ? 'default' : 'secondary'}
                            className={client.isActivated ? 'bg-green-500/20 text-green-500' : ''}
                          >
                            {client.isActivated ? 'Actif' : 'Inactif'}
                          </Badge>
                        </td>
                        <td className="py-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onCreditManager(client, 'client')}
                            className="text-green-400 hover:text-green-300"
                          >
                            Créditer
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}