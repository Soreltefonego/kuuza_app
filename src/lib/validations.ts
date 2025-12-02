import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

export const signupSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

export const createClientSchema = z.object({
  email: z.string().email('Email invalide'),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().optional(),
})

export const creditClientSchema = z.object({
  clientId: z.string().cuid('Client invalide'),
  amount: z.number().positive('Le montant doit être positif'),
  senderName: z.string().optional(),
  description: z.string().optional(),
})

export const buyCreditsSchema = z.object({
  amount: z.number().positive('Le montant doit être positif'),
  phoneNumber: z.string().optional(),
})

export const transferSchema = z.object({
  recipientEmail: z.string().email('Email invalide'),
  amount: z.number().positive('Le montant doit être positif'),
  description: z.string().optional(),
})

export const activateAccountSchema = z.object({
  token: z.string().min(32, 'Token invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

// Chat validation schemas
export const createConversationSchema = z.object({
  subject: z.string().optional(),
})

export const sendMessageSchema = z.object({
  conversationId: z.string().cuid('ID de conversation invalide'),
  content: z.string().min(1, 'Le message ne peut pas être vide').max(1000, 'Le message ne peut pas dépasser 1000 caractères'),
})

export const getMessagesSchema = z.object({
  conversationId: z.string().cuid('ID de conversation invalide'),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().min(1).max(50).optional().default(20),
})

export const markAsReadSchema = z.object({
  conversationId: z.string().cuid('ID de conversation invalide'),
  messageId: z.string().cuid('ID de message invalide').optional(),
})

export const closeConversationSchema = z.object({
  conversationId: z.string().cuid('ID de conversation invalide'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type CreateClientInput = z.infer<typeof createClientSchema>
export type CreditClientInput = z.infer<typeof creditClientSchema>
export type BuyCreditsInput = z.infer<typeof buyCreditsSchema>
export type TransferInput = z.infer<typeof transferSchema>
export type ActivateAccountInput = z.infer<typeof activateAccountSchema>
export type CreateConversationInput = z.infer<typeof createConversationSchema>
export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type GetMessagesInput = z.infer<typeof getMessagesSchema>
export type MarkAsReadInput = z.infer<typeof markAsReadSchema>
export type CloseConversationInput = z.infer<typeof closeConversationSchema>