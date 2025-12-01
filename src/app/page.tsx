'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, CreditCard, Users, TrendingUp, Shield, Zap, Globe } from 'lucide-react'

const features = [
  {
    icon: CreditCard,
    title: 'Gestion de crédit virtuel',
    description: 'Achetez et gérez votre crédit virtuel en toute simplicité'
  },
  {
    icon: Users,
    title: 'Gestion de clients',
    description: 'Créez et gérez vos clients avec des comptes individuels'
  },
  {
    icon: TrendingUp,
    title: 'Transactions en temps réel',
    description: 'Suivez toutes les transactions instantanément'
  },
  {
    icon: Shield,
    title: 'Sécurité maximale',
    description: 'Vos données sont protégées avec les dernières technologies'
  },
  {
    icon: Zap,
    title: 'Interface moderne',
    description: 'Une expérience utilisateur fluide et intuitive'
  },
  {
    icon: Globe,
    title: 'Accessible partout',
    description: 'Accédez à votre compte depuis n\'importe quel appareil'
  }
]

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30" />

        <nav className="relative z-10 border-b border-white/10 glass">
          <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2"
              >
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg gradient-primary flex items-center justify-center">
                  <CreditCard className="h-4 w-4 md:h-6 md:w-6 text-white" />
                </div>
                <span className="text-lg md:text-xl font-bold text-gradient">Kuuza Bank</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2 md:space-x-4"
              >
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-xs md:text-sm px-2 md:px-4">
                    Connexion
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="shadow-lg text-xs md:text-sm px-3 md:px-4">
                    <span className="hidden sm:inline">Créer un compte</span>
                    <span className="sm:hidden">S'inscrire</span>
                    <ArrowRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </nav>

        <section className="relative z-10 container mx-auto px-4 md:px-6 py-12 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6"
            >
              <span className="text-gradient">Votre banque virtuelle</span>
              <br className="hidden sm:block" />
              <span className="sm:hidden text-gradient"> nouvelle génération</span>
              <span className="hidden sm:inline">nouvelle génération</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-sm sm:text-base md:text-xl text-muted-foreground mb-8 md:mb-10 px-2"
            >
              Gérez vos clients, crédits et transactions dans un environnement
              virtuel sécurisé et moderne
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4"
            >
              <Link href="/signup">
                <Button size="lg" className="shadow-xl w-full sm:w-auto text-sm md:text-base">
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="glass w-full sm:w-auto text-sm md:text-base">
                  Se connecter
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        <section className="relative z-10 container mx-auto px-4 md:px-6 py-12 md:py-24">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
              Fonctionnalités principales
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-4 md:px-0">
              Tout ce dont vous avez besoin pour gérer votre banque virtuelle
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="glass border border-white/10 rounded-xl p-4 md:p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg gradient-primary flex items-center justify-center mb-3 md:mb-4">
                    <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <h3 className="text-base md:text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </section>

        <section className="relative z-10 container mx-auto px-4 md:px-6 py-12 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="glass border border-white/10 rounded-2xl p-6 md:p-8 lg:p-12 text-center"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
              Prêt à commencer?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 md:mb-8 px-4 md:px-0">
              Rejoignez des milliers de managers qui utilisent déjà Kuuza Bank
            </p>
            <Link href="/signup">
              <Button size="lg" className="shadow-xl w-full sm:w-auto text-sm md:text-base px-6 md:px-8">
                Créer un compte maintenant
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </Link>
          </motion.div>
        </section>
      </div>
    </div>
  )
}