'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'
import { Shield } from 'lucide-react'

export default function SetupAdminPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [adminCreated, setAdminCreated] = useState(false)
  const router = useRouter()

  const handleCreateAdmin = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/setup-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setAdminCreated(true)
        toast.success('Compte admin créé avec succès!')
      } else {
        toast.error(data.error || 'Erreur lors de la création')
      }
    } catch (error) {
      toast.error('Erreur lors de la création du compte admin')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass border-white/10">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Configuration Admin</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {!adminCreated ? (
            <div className="space-y-6">
              <p className="text-gray-400">
                Cliquez sur le bouton ci-dessous pour créer le compte super admin initial.
              </p>

              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm text-yellow-500">
                  ⚠️ Cette page doit être supprimée après la création du premier admin
                </p>
              </div>

              <Button
                onClick={handleCreateAdmin}
                disabled={isLoading}
                className="w-full gradient-primary"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  'Créer le compte Super Admin'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <Shield className="h-10 w-10 text-white" />
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-green-400">Admin créé avec succès!</h3>

                <div className="p-4 rounded-lg bg-white/5 text-left space-y-2">
                  <p className="text-sm">
                    <span className="text-gray-400">Email:</span>{' '}
                    <span className="font-mono">admin@kuuzabank.com</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-400">Mot de passe:</span>{' '}
                    <span className="font-mono">Admin@123</span>
                  </p>
                </div>

                <p className="text-sm text-yellow-500">
                  ⚠️ Changez le mot de passe après la première connexion
                </p>

                <Button
                  onClick={() => router.push('/login')}
                  className="w-full gradient-primary"
                >
                  Aller à la connexion
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}