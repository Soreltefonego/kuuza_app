import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { SessionUser } from "@/types"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis")
        }

        // Get user with Prisma
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            manager: true,
            client: true,
          }
        })

        if (!user) {
          throw new Error("Email ou mot de passe incorrect")
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error("Email ou mot de passe incorrect")
        }

        // Vérifier si le client est bloqué ou supprimé
        if (user.client) {
          if (user.client.isBlocked) {
            throw new Error("Votre compte a été bloqué. Contactez votre conseiller.")
          }
          if (user.client.deletedAt) {
            throw new Error("Ce compte n'existe plus.")
          }
          if (!user.client.isActivated) {
            throw new Error("Votre compte n'est pas encore activé. Veuillez utiliser le lien d'activation.")
          }
        }

        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          managerId: user.manager?.id,
          clientId: user.client?.id,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.firstName = (user as any).firstName
        token.lastName = (user as any).lastName
        token.role = (user as any).role
        token.managerId = (user as any).managerId
        token.clientId = (user as any).clientId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as SessionUser).id = token.id as string
        (session.user as SessionUser).email = token.email as string
        (session.user as SessionUser).firstName = token.firstName as string
        (session.user as SessionUser).lastName = token.lastName as string
        (session.user as SessionUser).role = token.role as any
        (session.user as SessionUser).managerId = token.managerId as string
        (session.user as SessionUser).clientId = token.clientId as string
      }
      return session
    },
  },
}