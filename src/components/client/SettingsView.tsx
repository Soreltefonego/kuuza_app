'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  Bell,
  Smartphone,
  Globe,
  CreditCard,
  ChevronRight,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface SettingsViewProps {
  client: any
}

export function SettingsView({ client }: SettingsViewProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Form states
  const [profileData, setProfileData] = useState({
    firstName: client.user.firstName,
    lastName: client.user.lastName,
    email: client.user.email,
    phone: client.user.phone || ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Notification settings
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    transactions: true,
    security: true,
    promotions: false
  })

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      // TODO: Appeler l'API pour sauvegarder le profil
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Profil mis à jour avec succès')
      setIsEditingProfile(false)
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    setIsLoading(true)
    try {
      // TODO: Appeler l'API pour changer le mot de passe
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Mot de passe modifié avec succès')
      setIsChangingPassword(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error('Erreur lors du changement de mot de passe')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl lg:text-2xl font-bold mb-2 text-white">Paramètres</h2>
        <p className="text-sm lg:text-base text-gray-300">Gérez votre compte et vos préférences</p>
      </div>

      {/* Profile Section */}
      <Card className="bg-gray-950 border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500">
              <User className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-white text-base lg:text-lg">Informations personnelles</CardTitle>
          </div>
          {!isEditingProfile ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingProfile(true)}
              className="border-gray-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditingProfile(false)
                  setProfileData({
                    firstName: client.user.firstName,
                    lastName: client.user.lastName,
                    email: client.user.email,
                    phone: client.user.phone || ''
                  })
                }}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-3 lg:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
            <div>
              <Label htmlFor="firstName" className="text-white">Prénom</Label>
              <Input
                id="firstName"
                value={profileData.firstName}
                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                disabled={!isEditingProfile}
                className="mt-2 bg-gray-900 border-gray-800 text-white placeholder:text-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-white">Nom</Label>
              <Input
                id="lastName"
                value={profileData.lastName}
                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                disabled={!isEditingProfile}
                className="mt-2 bg-gray-900 border-gray-800 text-white placeholder:text-gray-400"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-white">Email</Label>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                disabled={!isEditingProfile}
                className="pl-10 bg-gray-900 border-gray-800 text-white placeholder:text-gray-400"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone" className="text-white">Téléphone</Label>
            <div className="relative mt-2">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
              <Input
                id="phone"
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                disabled={!isEditingProfile}
                placeholder="+237 6XX XXX XXX"
                className="pl-10 bg-gray-900 border-gray-800 text-white placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Statut du compte</p>
                <p className="font-medium mt-1 text-white">
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Vérifié
                  </Badge>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-300">Membre depuis</p>
                <p className="font-medium mt-1 text-white">
                  {new Date(client.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card className="bg-gray-950 border-gray-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-white text-base lg:text-lg">Sécurité</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 lg:space-y-4">
          {!isChangingPassword ? (
            <Button
              variant="outline"
              onClick={() => setIsChangingPassword(true)}
              className="w-full justify-between border-gray-800 hover:bg-gray-900"
            >
              <div className="flex items-center gap-3">
                <Lock className="h-4 w-4" />
                <span>Changer le mot de passe</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="currentPassword" className="text-white">Mot de passe actuel</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="mt-2 bg-gray-900 border-gray-800 text-white placeholder:text-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="newPassword" className="text-white">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="mt-2 bg-gray-900 border-gray-800 text-white placeholder:text-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-white">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="mt-2 bg-gray-900 border-gray-800 text-white placeholder:text-gray-400"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsChangingPassword(false)
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                  }}
                  disabled={isLoading}
                  className="flex-1 border-gray-700 text-xs lg:text-sm"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleChangePassword}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-xs lg:text-sm"
                >
                  {isLoading ? 'Changement...' : 'Changer le mot de passe'}
                </Button>
              </div>
            </motion.div>
          )}

          <div className="space-y-2 lg:space-y-3">
            <div className="flex items-center justify-between p-2 lg:p-3 bg-gray-900 rounded-lg">
              <div className="flex items-center gap-2 lg:gap-3">
                <Smartphone className="h-3 w-3 lg:h-4 lg:w-4 text-gray-300" />
                <span className="text-xs lg:text-sm text-white">Authentification à deux facteurs</span>
              </div>
              <Switch
                checked={false}
                onCheckedChange={() => toast('Bientôt disponible')}
              />
            </div>

            <div className="flex items-center justify-between p-2 lg:p-3 bg-gray-900 rounded-lg">
              <div className="flex items-center gap-2 lg:gap-3">
                <Shield className="h-3 w-3 lg:h-4 lg:w-4 text-gray-300" />
                <span className="text-xs lg:text-sm text-white">Connexion biométrique</span>
              </div>
              <Switch
                checked={false}
                onCheckedChange={() => toast('Bientôt disponible')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card className="bg-gray-950 border-gray-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-white text-base lg:text-lg">Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-2 lg:p-3 bg-gray-900 rounded-lg">
            <div className="flex items-center gap-2 lg:gap-3">
              <Mail className="h-3 w-3 lg:h-4 lg:w-4 text-gray-300" />
              <span className="text-xs lg:text-sm text-white">Notifications par email</span>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(checked) => {
                setNotifications({ ...notifications, email: checked })
                toast.success('Préférences mises à jour')
              }}
            />
          </div>

          <div className="flex items-center justify-between p-2 lg:p-3 bg-gray-900 rounded-lg">
            <div className="flex items-center gap-2 lg:gap-3">
              <Smartphone className="h-3 w-3 lg:h-4 lg:w-4 text-gray-300" />
              <span className="text-xs lg:text-sm text-white">Notifications SMS</span>
            </div>
            <Switch
              checked={notifications.sms}
              onCheckedChange={(checked) => {
                setNotifications({ ...notifications, sms: checked })
                toast.success('Préférences mises à jour')
              }}
            />
          </div>

          <div className="flex items-center justify-between p-2 lg:p-3 bg-gray-900 rounded-lg">
            <div className="flex items-center gap-2 lg:gap-3">
              <Bell className="h-3 w-3 lg:h-4 lg:w-4 text-gray-300" />
              <span className="text-xs lg:text-sm text-white">Notifications push</span>
            </div>
            <Switch
              checked={notifications.push}
              onCheckedChange={(checked) => {
                setNotifications({ ...notifications, push: checked })
                toast.success('Préférences mises à jour')
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preferences Section */}
      <Card className="bg-gray-950 border-gray-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-white text-base lg:text-lg">Préférences</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 lg:space-y-4">
          <div>
            <Label className="text-white">Langue</Label>
            <select className="mt-2 w-full p-2 bg-gray-900 border border-gray-800 rounded-lg text-white">
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <Label className="text-white">Devise par défaut</Label>
            <select className="mt-2 w-full p-2 bg-gray-900 border border-gray-800 rounded-lg text-white" defaultValue="USD">
              <option value="USD">USD - Dollar US</option>
              <option value="EUR">EUR - Euro</option>
              <option value="XAF">XAF - Franc CFA</option>
            </select>
          </div>

          <div>
            <Label className="text-white">Fuseau horaire</Label>
            <select className="mt-2 w-full p-2 bg-gray-900 border border-gray-800 rounded-lg text-white">
              <option value="Africa/Douala">Afrique/Douala (UTC+1)</option>
              <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-gray-950 border-red-900/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <CardTitle className="text-red-500 text-base lg:text-lg">Zone de danger</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            className="w-full text-sm lg:text-base"
            onClick={() => toast.error('Contactez le support pour fermer votre compte')}
          >
            Fermer le compte
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}