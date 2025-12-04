'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { UserPlus, Send, Search, User, Mail, Phone, Calendar, CreditCard, Copy, CheckCircle, Link, Ban, Trash2, Unlock, Bell } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ClientsPageContentProps {
  clients: any[]
  managerId: string
}

export function ClientsPageContent({ clients, managerId }: ClientsPageContentProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [creditDialogOpen, setCreditDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activationLinkDialogOpen, setActivationLinkDialogOpen] = useState(false)
  const [activationLink, setActivationLink] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)
  const [blockDialogOpen, setBlockDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clientToBlock, setClientToBlock] = useState<any>(null)
  const [clientToDelete, setClientToDelete] = useState<any>(null)
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false)
  const [clientToNotify, setClientToNotify] = useState<any>(null)
  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    type: 'INFO'
  })

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })

  const [creditAmount, setCreditAmount] = useState('')
  const [creditData, setCreditData] = useState({
    amount: '',
    senderName: '',
    description: ''
  })

  const filteredClients = clients.filter(client =>
    client.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateClient = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/manager/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        const clientData = result.data
        const baseUrl = window.location.origin
        const link = `${baseUrl}/activate/${clientData.activationToken}`

        setActivationLink(link)
        setCreateDialogOpen(false)
        setActivationLinkDialogOpen(true)
        setFormData({ firstName: '', lastName: '', email: '', phone: '' })
        toast.success('Client créé avec succès')
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erreur lors de la création')
      }
    } catch (error) {
      toast.error('Erreur lors de la création du client')
    }
    setIsLoading(false)
  }

  const handleCreditClient = async () => {
    if (!selectedClient || !creditData.amount) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/manager/credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient.id,
          amount: parseFloat(creditData.amount),
          senderName: creditData.senderName || 'Kuuza Bank',
          description: creditData.description || 'Virement bancaire',
        }),
      })

      if (response.ok) {
        const result = await response.json()

        // Generate wire transfer PDF
        if (result.transaction) {
          const { generateWireTransferPDF } = await import('@/lib/pdf-generator')
          generateWireTransferPDF({
            reference: result.transaction.id,
            date: new Date(),
            senderName: creditData.senderName || 'Kuuza Bank',
            senderAccount: 'KUUZA-CENTRAL-001',
            recipientName: `${selectedClient.user.firstName} ${selectedClient.user.lastName}`,
            recipientAccount: selectedClient.accountNumber,
            amount: parseFloat(creditData.amount),
            currency: 'USD',
            description: creditData.description || 'Virement bancaire',
            status: 'COMPLETED',
            bankName: 'Kuuza Bank',
            type: 'incoming'
          })
          toast.success('Ordre de virement généré et téléchargé!')
        }

        toast.success(result.message || 'Client crédité avec succès!')
        setCreditDialogOpen(false)
        setCreditData({ amount: '', senderName: '', description: '' })
        setCreditAmount('')
        setSelectedClient(null)
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors du crédit')
      }
    } catch (error) {
      console.error('Erreur lors du crédit:', error)
      toast.error('Erreur réseau lors du crédit')
    }
    setIsLoading(false)
  }

  const handleBlockClient = async (client: any, action: 'block' | 'unblock') => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/manager/block-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          action,
          reason: action === 'block' ? 'Bloqué par le manager' : undefined
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message)
        setBlockDialogOpen(false)
        setClientToBlock(null)
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || `Erreur lors du ${action === 'block' ? 'blocage' : 'déblocage'}`)
      }
    } catch (error) {
      console.error('Error blocking/unblocking client:', error)
      toast.error('Erreur réseau')
    }
    setIsLoading(false)
  }

  const handleDeleteClient = async () => {
    if (!clientToDelete) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/manager/delete-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: clientToDelete.id,
          confirmDelete: true
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message)
        setDeleteDialogOpen(false)
        setClientToDelete(null)
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      toast.error('Erreur réseau')
    }
    setIsLoading(false)
  }

  const handleSendNotification = async () => {
    if (!clientToNotify || !notificationData.title || !notificationData.message) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/manager/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: clientToNotify.id,
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message)
        setNotificationDialogOpen(false)
        setClientToNotify(null)
        setNotificationData({ title: '', message: '', type: 'INFO' })
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de l\'envoi')
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      toast.error('Erreur réseau')
    }
    setIsLoading(false)
  }

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-6">
      {/* Header with actions - Mobile optimized */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gradient">Mes Clients</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Gérez vos clients et leurs comptes
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Create Client Dialog */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary w-full sm:w-auto">
                <UserPlus className="h-4 w-4 mr-2" />
                Nouveau client
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md rounded-lg">
              <DialogHeader>
                <DialogTitle>Créer un nouveau client</DialogTitle>
                <DialogDescription>
                  Entrez les informations du nouveau client
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john.doe@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+237 6XX XXX XXX"
                  />
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="w-full sm:w-auto">
                  Annuler
                </Button>
                <Button onClick={handleCreateClient} disabled={isLoading} className="gradient-primary w-full sm:w-auto">
                  {isLoading ? 'Création...' : 'Créer le client'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Credit Client Dialog */}
          <Dialog open={creditDialogOpen} onOpenChange={setCreditDialogOpen}>
            <DialogContent className="w-[95vw] max-w-md rounded-lg">
              <DialogHeader>
                <DialogTitle>Créditer un client</DialogTitle>
                <DialogDescription>
                  {selectedClient && (
                    <span>
                      Client: {selectedClient.user.firstName} {selectedClient.user.lastName}
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Montant (USD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={creditData.amount}
                    onChange={(e) => setCreditData({ ...creditData, amount: e.target.value })}
                    placeholder="1000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderName">Nom de l'expéditeur (optionnel)</Label>
                  <Input
                    id="senderName"
                    value={creditData.senderName}
                    onChange={(e) => setCreditData({ ...creditData, senderName: e.target.value })}
                    placeholder="Ex: Société ABC, John Doe..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Laissez vide pour afficher "Kuuza Bank"
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Motif du virement (optionnel)</Label>
                  <Input
                    id="description"
                    value={creditData.description}
                    onChange={(e) => setCreditData({ ...creditData, description: e.target.value })}
                    placeholder="Ex: Salaire, Remboursement, Paiement facture..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Ce motif sera visible dans l'historique du client
                  </p>
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setCreditDialogOpen(false)} className="w-full sm:w-auto">
                  Annuler
                </Button>
                <Button onClick={handleCreditClient} disabled={isLoading} className="gradient-primary w-full sm:w-auto">
                  {isLoading ? 'Traitement...' : 'Créditer'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search Bar - Mobile optimized */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Rechercher un client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 glass"
        />
      </div>

      {/* Clients Grid - Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {filteredClients.map((client, index) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="glass border-white/10 hover:border-white/20 transition-all">
              <CardHeader className="pb-2 md:pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500">
                      <User className="h-3 w-3 md:h-4 md:w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-sm md:text-base">
                        {client.user.firstName} {client.user.lastName}
                      </CardTitle>
                      <Badge
                        variant={
                          client.isBlocked ? 'destructive' :
                          client.isActivated ? 'default' : 'secondary'
                        }
                        className="mt-1 text-[10px] md:text-xs"
                      >
                        {client.isBlocked ? 'Bloqué' : client.isActivated ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 md:space-y-3 pt-0">
                {/* Contact Info */}
                <div className="space-y-1.5 md:space-y-2 text-sm">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <Mail className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground" />
                    <span className="text-[10px] md:text-xs truncate">{client.user.email}</span>
                  </div>
                  {client.user.phone && (
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <Phone className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground" />
                      <span className="text-[10px] md:text-xs">{client.user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <Calendar className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground" />
                    <span className="text-[10px] md:text-xs">Créé le {formatDate(client.createdAt)}</span>
                  </div>
                </div>

                {/* Balance */}
                <div className="pt-2 md:pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] md:text-xs text-muted-foreground">Solde</span>
                    <span className="text-sm md:text-lg font-bold text-gradient">
                      {formatCurrency(Number(client.accountBalance))}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <div className="flex gap-1.5 md:gap-2">
                    {!client.isActivated && client.activationToken && (
                      <Button
                        onClick={() => {
                          const link = `${window.location.origin}/activate/${client.activationToken}`
                          navigator.clipboard.writeText(link)
                          toast.success('Lien d\'activation copié!')
                        }}
                        variant="outline"
                        className="flex-1 h-8 md:h-9"
                        size="sm"
                      >
                        <Link className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1 md:mr-2" />
                        <span className="text-[10px] md:text-xs">Copier lien</span>
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        setSelectedClient(client)
                        setCreditDialogOpen(true)
                      }}
                      className={client.isActivated ? "w-full gradient-primary h-8 md:h-9" : "flex-1 gradient-primary h-8 md:h-9"}
                      size="sm"
                      disabled={client.isBlocked}
                    >
                      <Send className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1 md:mr-2" />
                      <span className="text-[10px] md:text-xs">Créditer</span>
                    </Button>
                  </div>

                  {/* Notification and Management Actions */}
                  <div className="flex gap-1.5 md:gap-2">
                    <Button
                      onClick={() => {
                        setClientToNotify(client)
                        setNotificationDialogOpen(true)
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1 h-8 md:h-9 text-blue-500 hover:text-blue-600"
                    >
                      <Bell className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                      <span className="text-[10px] md:text-xs">Notifier</span>
                    </Button>
                    <Button
                      onClick={() => {
                        setClientToBlock(client)
                        setBlockDialogOpen(true)
                      }}
                      variant="outline"
                      size="sm"
                      className={`h-8 md:h-9 px-2 ${
                        client.isBlocked
                          ? 'text-green-500 hover:text-green-600'
                          : 'text-orange-500 hover:text-orange-600'
                      }`}
                    >
                      {client.isBlocked ? (
                        <>
                          <Unlock className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                          <span className="text-[10px] md:text-xs">Débloquer</span>
                        </>
                      ) : (
                        <>
                          <Ban className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                          <span className="text-[10px] md:text-xs">Bloquer</span>
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        setClientToDelete(client)
                        setDeleteDialogOpen(true)
                      }}
                      variant="outline"
                      size="sm"
                      className="h-8 md:h-9 px-2 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                      <span className="text-[10px] md:text-xs">Supprimer</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 flex items-center justify-center">
            <UserPlus className="h-10 w-10 text-violet-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Aucun client trouvé</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Aucun résultat pour votre recherche' : 'Créez votre premier client pour commencer'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setCreateDialogOpen(true)} className="gradient-primary">
              <UserPlus className="h-4 w-4 mr-2" />
              Créer un client
            </Button>
          )}
        </motion.div>
      )}

      {/* Activation Link Dialog */}
      <Dialog open={activationLinkDialogOpen} onOpenChange={setActivationLinkDialogOpen}>
        <DialogContent className="w-[95vw] max-w-lg rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Client créé avec succès!
            </DialogTitle>
            <DialogDescription>
              Partagez ce lien avec votre client pour qu'il active son compte
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Lien d'activation</Label>
              <div className="flex gap-2">
                <div className="flex-1 p-3 bg-muted rounded-lg break-all text-sm">
                  {activationLink}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(activationLink)
                    setLinkCopied(true)
                    toast.success('Lien copié!')
                    setTimeout(() => setLinkCopied(false), 3000)
                  }}
                  className="shrink-0"
                >
                  {linkCopied ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                ⚠️ Ce lien est à usage unique et permet au client de définir son mot de passe.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActivationLinkDialogOpen(false)}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block/Unblock Dialog */}
      <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {clientToBlock?.isBlocked ? 'Débloquer le compte' : 'Bloquer le compte'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {clientToBlock?.isBlocked
                ? `Êtes-vous sûr de vouloir débloquer le compte de ${clientToBlock?.user?.firstName} ${clientToBlock?.user?.lastName} ? Le client pourra à nouveau accéder à son compte.`
                : `Êtes-vous sûr de vouloir bloquer le compte de ${clientToBlock?.user?.firstName} ${clientToBlock?.user?.lastName} ? Le client ne pourra plus accéder à son compte.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setClientToBlock(null)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleBlockClient(clientToBlock, clientToBlock?.isBlocked ? 'unblock' : 'block')}
              className={clientToBlock?.isBlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}
            >
              {clientToBlock?.isBlocked ? 'Débloquer' : 'Bloquer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              Supprimer le compte
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3">
                <p>
                  Êtes-vous sûr de vouloir supprimer définitivement le compte de{' '}
                  <span className="font-semibold">
                    {clientToDelete?.user?.firstName} {clientToDelete?.user?.lastName}
                  </span>
                  ?
                </p>
                {Number(clientToDelete?.accountBalance) > 0 && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-yellow-600">
                      ⚠️ Attention: Ce compte a un solde de {formatCurrency(Number(clientToDelete?.accountBalance))}.
                      Le solde sera perdu lors de la suppression.
                    </p>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Cette action est irréversible. Toutes les données associées seront perdues.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setClientToDelete(null)}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClient}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Notification Dialog */}
      <Dialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle>Envoyer une notification</DialogTitle>
            <DialogDescription>
              Envoyez un message personnalisé à {clientToNotify?.user?.firstName} {clientToNotify?.user?.lastName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notif-type">Type de notification</Label>
              <Select
                value={notificationData.type}
                onValueChange={(value) => setNotificationData({ ...notificationData, type: value })}
              >
                <SelectTrigger id="notif-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INFO">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      Information
                    </div>
                  </SelectItem>
                  <SelectItem value="SUCCESS">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Succès
                    </div>
                  </SelectItem>
                  <SelectItem value="WARNING">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      Avertissement
                    </div>
                  </SelectItem>
                  <SelectItem value="ERROR">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      Erreur
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notif-title">Titre *</Label>
              <Input
                id="notif-title"
                value={notificationData.title}
                onChange={(e) => setNotificationData({ ...notificationData, title: e.target.value })}
                placeholder="Ex: Mise à jour importante"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                {notificationData.title.length}/100 caractères
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notif-message">Message *</Label>
              <textarea
                id="notif-message"
                value={notificationData.message}
                onChange={(e) => setNotificationData({ ...notificationData, message: e.target.value })}
                placeholder="Tapez votre message ici..."
                className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground">
                {notificationData.message.length}/1000 caractères
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setNotificationDialogOpen(false)
                setClientToNotify(null)
                setNotificationData({ title: '', message: '', type: 'INFO' })
              }}
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSendNotification}
              disabled={isLoading || !notificationData.title || !notificationData.message}
              className="gradient-primary w-full sm:w-auto"
            >
              <Bell className="h-4 w-4 mr-2" />
              {isLoading ? 'Envoi...' : 'Envoyer la notification'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}