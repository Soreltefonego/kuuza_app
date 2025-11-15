import { prisma } from '@/lib/prisma'
import { TransactionFilter, PaginatedResponse } from '@/types'
import { Transaction } from '@prisma/client'

export class TransactionService {
  static async getTransactions(
    userId: string,
    filter?: TransactionFilter,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<Transaction>> {
    const where: any = {
      OR: [
        { fromUserId: userId },
        { toUserId: userId },
      ],
    }

    if (filter) {
      if (filter.type) {
        where.type = filter.type
      }
      if (filter.status) {
        where.status = filter.status
      }
      if (filter.fromDate || filter.toDate) {
        where.createdAt = {}
        if (filter.fromDate) {
          where.createdAt.gte = filter.fromDate
        }
        if (filter.toDate) {
          where.createdAt.lte = filter.toDate
        }
      }
    }

    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          fromUser: true,
          toUser: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.transaction.count({ where }),
    ])

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  static async getTransactionById(id: string, userId: string) {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        OR: [
          { fromUserId: userId },
          { toUserId: userId },
        ],
      },
      include: {
        fromUser: true,
        toUser: true,
        payment: true,
      },
    })

    if (!transaction) {
      throw new Error('Transaction non trouvée')
    }

    return transaction
  }

  static async getRecentTransactions(userId: string, limit: number = 10) {
    return await prisma.transaction.findMany({
      where: {
        OR: [
          { fromUserId: userId },
          { toUserId: userId },
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
}