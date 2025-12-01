import { prisma } from '@/lib/prisma'
import { amountToCents, generateActivationToken, generateTransactionReference } from '@/lib/utils'
import { CreateClientInput, CreditClientInput } from '@/lib/validations'
import { TransactionStatus, TransactionType, PaymentStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

export class ManagerService {
  static async getManagerStats(managerId: string) {
    try {
      // Get manager with retry logic
      const manager = await this.retryOperation(() =>
        prisma.manager.findUnique({
          where: { id: managerId }
        })
      )

      if (!manager) {
        throw new Error('Manager not found')
      }

      // Get client counts with retry logic
      const [clientCount, activeClients] = await Promise.all([
        this.retryOperation(() =>
          prisma.client.count({
            where: { managerId }
          })
        ),
        this.retryOperation(() =>
          prisma.client.count({
            where: {
              managerId,
              isActivated: true
            }
          })
        )
      ])

      // Get volume from successful transactions with retry logic
      const totalVolume = await this.retryOperation(() =>
        prisma.transaction.aggregate({
          where: {
            OR: [
              { fromUser: { manager: { id: managerId } } },
              { toUser: { client: { managerId } } }
            ],
            status: TransactionStatus.SUCCESS
          },
          _sum: {
            amount: true
          }
        })
      )

      return {
        creditBalance: manager.creditBalance,
        totalClients: clientCount,
        activeClients: activeClients,
        totalVolume: totalVolume._sum.amount || BigInt(0),
      }
    } catch (error) {
      console.error('Error getting manager stats:', error)
      throw error
    }
  }

  // Helper method for retry logic
  private static async retryOperation<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    let lastError: Error | undefined

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        console.warn(`Attempt ${attempt}/${maxRetries} failed:`, error)

        if (attempt < maxRetries) {
          // Exponential backoff: 100ms, 200ms, 400ms
          await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt - 1)))
        }
      }
    }

    throw lastError || new Error('Operation failed after retries')
  }

  static async createClient(managerId: string, data: CreateClientInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà')
    }

    const activationToken = generateActivationToken()
    const temporaryPassword = await bcrypt.hash(activationToken, 10)

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            password: temporaryPassword,
            role: 'CLIENT',
          },
        })

        // Create client
        const client = await tx.client.create({
          data: {
            userId: user.id,
            managerId,
            activationToken,
            accountBalance: BigInt(0),
            isActivated: false,
          },
          include: {
            user: true,
          },
        })

        return client
      })

      return result
    } catch (error) {
      console.error('Error creating client:', error)
      throw error
    }
  }

  static async creditClient(managerId: string, data: CreditClientInput) {
    const amountInCents = amountToCents(data.amount)

    return await prisma.$transaction(async (tx) => {
      const manager = await tx.manager.findUnique({
        where: { id: managerId },
        include: { user: true },
      })

      if (!manager) {
        throw new Error('Manager non trouvé')
      }

      if (manager.creditBalance < amountInCents) {
        throw new Error('Crédit insuffisant')
      }

      const client = await tx.client.findUnique({
        where: { id: data.clientId },
        include: { user: true },
      })

      if (!client) {
        throw new Error('Client non trouvé')
      }

      if (client.managerId !== managerId) {
        throw new Error('Vous ne pouvez pas créditer ce client')
      }

      // Update manager credit balance
      await tx.manager.update({
        where: { id: managerId },
        data: {
          creditBalance: {
            decrement: amountInCents,
          },
        },
      })

      // Update client account balance
      const updatedClient = await tx.client.update({
        where: { id: data.clientId },
        data: {
          accountBalance: {
            increment: amountInCents,
          },
        },
      })

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          type: TransactionType.CREDIT,
          amount: amountInCents,
          fromUserId: manager.userId,
          toUserId: client.userId,
          description: `Crédit de compte client`,
          status: TransactionStatus.SUCCESS,
          reference: generateTransactionReference(),
        },
      })

      return {
        transaction,
        client: updatedClient,
        newBalance: Number(updatedClient.accountBalance)
      }
    })
  }

  static async buyCredits(managerId: string, amount: number, phoneNumber?: string) {
    const amountInCents = amountToCents(amount)

    return await prisma.$transaction(async (tx) => {
      const manager = await tx.manager.findUnique({
        where: { id: managerId },
        include: { user: true },
      })

      if (!manager) {
        throw new Error('Manager non trouvé')
      }

      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          type: TransactionType.BUY_CREDIT,
          amount: amountInCents,
          toUserId: manager.userId,
          description: `Achat de crédit via Orange Money`,
          status: TransactionStatus.SUCCESS,
          reference: generateTransactionReference(),
        },
      })

      // Create Orange Money payment record
      const payment = await tx.orangeMoneyPayment.create({
        data: {
          managerId,
          amount: amountInCents,
          transactionId: transaction.id,
          status: PaymentStatus.SUCCESS,
          phoneNumber,
          paymentReference: `OM-${Date.now()}`,
        },
      })

      // Update manager credit balance
      await tx.manager.update({
        where: { id: managerId },
        data: {
          creditBalance: {
            increment: amountInCents,
          },
        },
      })

      return { transaction, payment }
    })
  }

  static async getClients(managerId: string) {
    try {
      const clients = await this.retryOperation(() =>
        prisma.client.findMany({
          where: { managerId },
          include: {
            user: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        })
      )

      return clients
    } catch (error) {
      console.error('Error fetching clients:', error)
      // Return empty array
      return []
    }
  }

  static async getTransactions(managerId: string, limit = 50) {
    try {
      const transactions = await this.retryOperation(() =>
        prisma.transaction.findMany({
          where: {
            OR: [
              { fromUser: { manager: { id: managerId } } },
              { toUser: { client: { managerId } } },
            ],
          },
          include: {
            fromUser: true,
            toUser: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: limit,
        })
      )

      return transactions
    } catch (error) {
      console.error('Error fetching transactions:', error)
      // Return empty array
      return []
    }
  }
}