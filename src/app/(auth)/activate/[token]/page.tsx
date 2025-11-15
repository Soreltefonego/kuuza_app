'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function ActivateAccountPage() {
  const params = useParams()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })

  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  })

  const checkPasswordStrength = (password: string) => {
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    })
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setFormData({ ...formData, password: newPassword })
    checkPasswordStrength(newPassword)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    const allCriteriaMet = Object.values(passwordStrength).every(v => v)
    if (!allCriteriaMet) {
      toast.error('Le mot de passe ne respecte pas tous les critères')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/activate-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: params.token,
          password: formData.password
        })
      })

      if (response.ok) {
        toast.success('Compte activé avec succès!')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erreur lors de l\'activation')
      }
    } catch (error) {
      toast.error('Erreur lors de l\'activation du compte')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-white">
              Activez votre compte
            </CardTitle>
            <CardDescription className="text-gray-400">
              Créez votre mot de passe pour accéder à votre espace bancaire
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200">
                  Nouveau mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handlePasswordChange}
                    className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-white/20"
                    placeholder="Entrez votre mot de passe"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Password Strength Indicators */}
              <div className="space-y-2 p-4 bg-white/5 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Critères du mot de passe:</p>
                <div className="space-y-1">
                  {[
                    { key: 'hasMinLength', label: 'Au moins 8 caractères' },
                    { key: 'hasUppercase', label: 'Une lettre majuscule' },
                    { key: 'hasLowercase', label: 'Une lettre minuscule' },
                    { key: 'hasNumber', label: 'Un chiffre' },
                    { key: 'hasSpecial', label: 'Un caractère spécial' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2">
                      {passwordStrength[key as keyof typeof passwordStrength] ? (
                        <CheckCircle className="h-3 w-3 text-green-400" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-gray-600" />
                      )}
                      <span className={`text-xs ${
                        passwordStrength[key as keyof typeof passwordStrength]
                          ? 'text-green-400'
                          : 'text-gray-500'
                      }`}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-200">
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-white/20"
                    placeholder="Confirmez votre mot de passe"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-400">Les mots de passe ne correspondent pas</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black hover:bg-gray-100 font-medium"
              >
                {isLoading ? 'Activation...' : 'Activer mon compte'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}