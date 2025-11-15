import { prisma } from '@/lib/prisma'
import { amountToCents, generateTransactionReference } from '@/lib/utils'
import { TransactionStatus, TransactionType } from '@prisma/client'
import bcrypt from 'bcryptjs'

export class ClientService {
  static async getClientStats(clientId: string) {
    const [client, sentCount, receivedCount, totalSent, totalReceived] = await Promise.all([
      prisma.client.findUnique({
        where: { id: clientId },
        include: { user: true },
      }),
      prisma.transaction.count({
        where: {
          fromUser: { client: { id: clientId } },
          status: TransactionStatus.SUCCESS,
        },
      }),
      prisma.transaction.count({
        where: {
          toUser: { client: { id: clientId } },
          status: TransactionStatus.SUCCESS,
        },
      }),
      prisma.transaction.aggregate({
        where: {
          fromUser: { client: { id: clientId } },
          status: TransactionStatus.SUCCESS,
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.transaction.aggregate({
        where: {
          toUser: { client: { id: clientId } },
          status: TransactionStatus.SUCCESS,
        },
        _sum: {
          amount: true,
        },
      }),
    ])

    return {
      accountBalance: client?.accountBalance || BigInt(0),
      sentCount,
      receivedCount,
      totalSent: totalSent._sum.amount || BigInt(0),
      totalReceived: totalReceived._sum.amount || BigInt(0),
    }
  }

  static async activateAccount(token: string, password: string) {
    const client = await prisma.client.findUnique({
      where: { activationToken: token },
      include: { user: true },
    })

    if (!client) {
      throw new Error('Token d\'activation invalide')
    }

    if (client.isActivated) {
      throw new Error('Ce compte est déjà activé')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: client.userId },
        data: { password: hashedPassword },
      })

      await tx.client.update({
        where: { id: client.id },
        data: {
          isActivated: true,
          activatedAt: new Date(),
          activationToken: null,
        },
      })
    })

    return client
  }

  static async transfer(clientId: string, recipientEmail: string, amount: number, description?: string) {
    const amountInCents = amountToCents(amount)

    return await prisma.$transaction(async (tx) => {
      const sender = await tx.client.findUnique({
        where: { id: clientId },
        include: { user: true },
      })

      if (!sender) {
        throw new Error('Client non trouvé')
      }

      if (sender.accountBalance < amountInCents) {
        throw new Error('Solde insuffisant')
      }

      const recipientUser = await tx.user.findUnique({
        where: { email: recipientEmail },
        include: { client: true },
      })

      if (!recipientUser || !recipientUser.client) {
        throw new Error('Destinataire non trouvé')
      }

      if (recipientUser.client.managerId !== sender.managerId) {
        throw new Error('Vous ne pouvez transférer qu\'aux clients du même manager')
      }

      if (recipientUser.id === sender.userId) {
        throw new Error('Vous ne pouvez pas transférer à vous-même')
      }

      await tx.client.update({
        where: { id: clientId },
        data: {
          accountBalance: {
            decrement: amountInCents,
          },
        },
      })

      await tx.client.update({
        where: { id: recipientUser.client.id },
        data: {
          accountBalance: {
            increment: amountInCents,
          },
        },
      })

      const transaction = await tx.transaction.create({
        data: {
          type: TransactionType.TRANSFER,
          amount: amountInCents,
          fromUserId: sender.userId,
          toUserId: recipientUser.id,
          description: description || 'Virement',
          status: TransactionStatus.SUCCESS,
          reference: generateTransactionReference(),
        },
        include: {
          fromUser: true,
          toUser: true,
        },
      })

      return transaction
    })
  }

  static async getTransactions(clientId: string, limit = 50) {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      throw new Error('Client non trouvé')
    }

    return await prisma.transaction.findMany({
      where: {
        OR: [
          { fromUserId: client.userId },
          { toUserId: client.userId },
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
  }

  static async searchClients(clientId: string, query: string) {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    })

    if (!client) {
      throw new Error('Client non trouvé')
    }

    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            client: {
              managerId: client.managerId,
              isActivated: true,
            },
          },
          {
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
            ],
          },
          {
            id: { not: client.userId },
          },
        ],
      },
      include: {
        client: true,
      },
      take: 10,
    })

    return users
  }
}