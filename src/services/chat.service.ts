import { prisma } from '@/lib/prisma'
import { ChatConversation, ChatMessage } from '@prisma/client'

export class ChatService {
  // Client methods
  static async createConversation(clientId: string, subject?: string): Promise<ChatConversation> {
    return prisma.chatConversation.create({
      data: {
        clientId,
        subject,
        status: 'ACTIVE'
      },
      include: {
        client: {
          include: {
            user: true
          }
        },
        manager: {
          include: {
            user: true
          }
        }
      }
    })
  }

  static async getConversationByClient(clientId: string): Promise<ChatConversation | null> {
    return prisma.chatConversation.findFirst({
      where: {
        clientId,
        status: 'ACTIVE'
      },
      include: {
        client: {
          include: {
            user: true
          }
        },
        manager: {
          include: {
            user: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            sender: true
          }
        }
      }
    })
  }

  static async getMessages(conversationId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit

    const [messages, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where: {
          conversationId
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.chatMessage.count({
        where: {
          conversationId
        }
      })
    ])

    return {
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  static async sendMessage(
    conversationId: string,
    senderId: string,
    senderType: 'CLIENT' | 'MANAGER' | 'SYSTEM',
    content: string
  ): Promise<ChatMessage> {
    // Update conversation's updatedAt timestamp and assign manager if not assigned
    if (senderType === 'CLIENT') {
      const conversation = await prisma.chatConversation.findUnique({
        where: { id: conversationId },
        include: { client: { include: { manager: true } } }
      })

      if (conversation && !conversation.managerId) {
        // Assign the client's manager to the conversation
        await prisma.chatConversation.update({
          where: { id: conversationId },
          data: {
            managerId: conversation.client.managerId,
            updatedAt: new Date()
          }
        })
      }
    }

    return prisma.chatMessage.create({
      data: {
        conversationId,
        senderId,
        senderType,
        content,
        isRead: false
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        conversation: true
      }
    })
  }

  static async markAsRead(conversationId: string, messageId?: string, readerId?: string): Promise<void> {
    if (messageId) {
      // Mark specific message as read
      await prisma.chatMessage.updateMany({
        where: {
          id: messageId,
          conversationId,
          ...(readerId && { senderId: { not: readerId } })
        },
        data: {
          isRead: true
        }
      })
    } else {
      // Mark all messages in conversation as read
      await prisma.chatMessage.updateMany({
        where: {
          conversationId,
          ...(readerId && { senderId: { not: readerId } })
        },
        data: {
          isRead: true
        }
      })
    }
  }

  // Manager methods
  static async getManagerConversations(managerId: string) {
    return prisma.chatConversation.findMany({
      where: {
        managerId,
        status: 'ACTIVE'
      },
      include: {
        client: {
          include: {
            user: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            sender: true
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderType: 'CLIENT'
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })
  }

  static async getAllConversations(managerId: string) {
    return prisma.chatConversation.findMany({
      where: {
        OR: [
          { managerId },
          {
            client: {
              managerId
            }
          }
        ]
      },
      include: {
        client: {
          include: {
            user: true
          }
        },
        manager: {
          include: {
            user: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            sender: true
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                senderType: 'CLIENT'
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })
  }

  static async closeConversation(conversationId: string, managerId: string): Promise<ChatConversation> {
    // Verify the manager has permission to close this conversation
    const conversation = await prisma.chatConversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { managerId },
          { client: { managerId } }
        ]
      }
    })

    if (!conversation) {
      throw new Error('Conversation non trouvée ou non autorisée')
    }

    return prisma.chatConversation.update({
      where: { id: conversationId },
      data: {
        status: 'CLOSED',
        closedAt: new Date()
      },
      include: {
        client: {
          include: {
            user: true
          }
        },
        manager: {
          include: {
            user: true
          }
        }
      }
    })
  }

  static async getConversation(conversationId: string, userId: string, userRole: 'CLIENT' | 'MANAGER'): Promise<ChatConversation | null> {
    const whereClause = userRole === 'CLIENT'
      ? {
          id: conversationId,
          client: {
            userId
          }
        }
      : {
          id: conversationId,
          OR: [
            { managerId: userId },
            { client: { managerId: userId } }
          ]
        }

    return prisma.chatConversation.findFirst({
      where: whereClause,
      include: {
        client: {
          include: {
            user: true
          }
        },
        manager: {
          include: {
            user: true
          }
        }
      }
    })
  }

  static async getUnreadMessagesCount(conversationId: string, userId: string): Promise<number> {
    return prisma.chatMessage.count({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false
      }
    })
  }
}