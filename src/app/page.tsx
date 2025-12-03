'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, Shield, TrendingUp, Users, CreditCard, Lock, Zap, Globe } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    // Rediriger automatiquement les utilisateurs connectés vers leur dashboard
    if (session?.user) {
      if ((session.user as any).role === 'MANAGER') {
        router.push('/manager/dashboard')
      } else if ((session.user as any).role === 'CLIENT') {
        router.push('/client/dashboard')
      }
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Bienvenue chez Kuuza Bank
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Votre partenaire bancaire digital pour gérer vos finances en toute sécurité
            </p>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link href="/login">
                <Button size="lg" className="gradient-primary min-w-[200px]">
                  Se connecter
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/manager/dashboard">
                <Button size="lg" variant="outline" className="min-w-[200px]">
                  Espace Manager
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Une banque moderne pour la Norvège
            </h2>
            <p className="text-muted-foreground text-lg">
              Des services bancaires adaptés à vos besoins
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="glass border-white/10 p-6 hover:shadow-xl transition-shadow">
                  <div className="p-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 w-fit mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <Card className="glass border-white/10 p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Commencez aujourd'hui
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Rejoignez des milliers de clients qui font confiance à Kuuza Bank
            </p>
            <Link href="/login">
              <Button size="lg" className="gradient-primary">
                Accéder à mon compte
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-4 py-8">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2024 Kuuza Bank. Tous droits réservés.</p>
          <p className="mt-2">Basé en Norvège 🇳🇴</p>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: Shield,
    title: "Sécurité maximale",
    description: "Vos données et transactions sont protégées par les dernières technologies de cryptage"
  },
  {
    icon: TrendingUp,
    title: "Gestion simplifiée",
    description: "Suivez vos finances en temps réel avec notre interface intuitive"
  },
  {
    icon: Users,
    title: "Support dédié",
    description: "Une équipe de conseillers disponibles pour vous accompagner"
  },
  {
    icon: CreditCard,
    title: "Paiements rapides",
    description: "Effectuez vos virements instantanément, 24h/24 et 7j/7"
  },
  {
    icon: Zap,
    title: "Innovation continue",
    description: "Bénéficiez des dernières innovations en matière de services bancaires"
  },
  {
    icon: Globe,
    title: "Présence internationale",
    description: "Gérez vos finances depuis n'importe où dans le monde"
  }
]