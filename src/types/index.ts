import { User, Manager, Client, Transaction, OrangeMoneyPayment, Role, TransactionType, TransactionStatus, PaymentStatus } from '@prisma/client'

export type UserWithRelations = User & {
  manager?: Manager | null
  client?: Client & {
    manager: Manager & {
      user: User
    }
  } | null
}

export type ManagerWithUser = Manager & {
  user: User
}

export type ClientWithUser = Client & {
  user: User
}

export type ClientWithRelations = Client & {
  user: User
  manager: ManagerWithUser
}

export type TransactionWithUsers = Transaction & {
  fromUser?: User | null
  toUser?: User | null
}

export type PaymentWithTransaction = OrangeMoneyPayment & {
  transaction: Transaction
}

export interface SessionUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: Role
  managerId?: string
  clientId?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface DashboardStats {
  totalClients?: number
  activeClients?: number
  totalTransactions?: number
  totalVolume?: bigint
  creditBalance?: bigint
  accountBalance?: bigint
}

export interface TransactionFilter {
  type?: TransactionType
  status?: TransactionStatus
  fromDate?: Date
  toDate?: Date
  userId?: string
}

export { Role, TransactionType, TransactionStatus, PaymentStatus }