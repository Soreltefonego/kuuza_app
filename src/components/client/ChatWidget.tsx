'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Clock,
  CheckCheck,
  Minimize2,
  Maximize2
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'

interface Message {
  id: string
  content: string
  senderType: 'CLIENT' | 'MANAGER' | 'SYSTEM'
  senderName?: string
  createdAt: string
  isRead: boolean
}

interface ChatWidgetProps {
  clientId: string
  clientName: string
}

export function ChatWidget({ clientId, clientName }: ChatWidgetProps) {
  const { t, i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load or create conversation
  useEffect(() => {
    if (isOpen && !conversationId) {
      loadOrCreateConversation()
    }
  }, [isOpen])

  // Poll for new messages when chat is open
  useEffect(() => {
    if (isOpen && conversationId) {
      const interval = setInterval(fetchMessages, 3000)
      return () => clearInterval(interval)
    }
  }, [isOpen, conversationId])

  const loadOrCreateConversation = async () => {
    try {
      const response = await fetch('/api/client/chat/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId })
      })

      if (response.ok) {
        const data = await response.json()
        setConversationId(data.conversationId)
        setMessages(data.messages || [])
        markMessagesAsRead(data.conversationId)
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
      toast.error(t('chat.errorLoading'))
    }
  }

  const fetchMessages = async () => {
    if (!conversationId) return

    try {
      const response = await fetch(`/api/client/chat/messages?conversationId=${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])

        // Update unread count
        const unread = data.messages.filter((msg: Message) =>
          !msg.isRead && msg.senderType !== 'CLIENT'
        ).length
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const markMessagesAsRead = async (convId: string) => {
    try {
      await fetch('/api/client/chat/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: convId })
      })
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId) return

    setIsLoading(true)
    const messageContent = newMessage.trim()
    setNewMessage('')

    // Optimistically add the message
    const tempMessage: Message = {
      id: 'temp-' + Date.now(),
      content: messageContent,
      senderType: 'CLIENT',
      senderName: clientName,
      createdAt: new Date().toISOString(),
      isRead: true
    }
    setMessages(prev => [...prev, tempMessage])

    try {
      const response = await fetch('/api/client/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          content: messageContent
        })
      })

      if (response.ok) {
        // Fetch updated messages
        await fetchMessages()

        // Auto-reply from system (simulating bank agent)
        setTimeout(() => {
          simulateBankAgentReply(messageContent)
        }, 1500)
      } else {
        toast.error(t('chat.errorSending'))
        // Remove the optimistic message
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
        setNewMessage(messageContent)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error(t('chat.errorSending'))
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
      setNewMessage(messageContent)
    } finally {
      setIsLoading(false)
    }
  }

  const simulateBankAgentReply = async (clientMessage: string) => {
    const replies = {
      fr: [
        "Merci pour votre message. Un conseiller va vous répondre dans quelques instants.",
        "Je vais transférer votre demande à un spécialiste.",
        "Nous traitons votre demande. Veuillez patienter.",
        "Un agent est en train d'examiner votre requête.",
        "Merci de votre patience. Nous revenons vers vous rapidement."
      ],
      en: [
        "Thank you for your message. An advisor will respond to you shortly.",
        "I will transfer your request to a specialist.",
        "We are processing your request. Please wait.",
        "An agent is reviewing your request.",
        "Thank you for your patience. We will get back to you soon."
      ]
    }

    const randomReply = replies[i18n.language as 'fr' | 'en']?.[
      Math.floor(Math.random() * replies[i18n.language as 'fr' | 'en']?.length)
    ] || replies.en[0]

    try {
      await fetch('/api/client/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          content: randomReply,
          senderType: 'SYSTEM'
        })
      })
      await fetchMessages()
    } catch (error) {
      console.error('Error sending system reply:', error)
    }
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    const locale = i18n.language === 'fr' ? fr : enUS
    return format(date, 'HH:mm', { locale })
  }

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-xl transition-shadow"
          >
            <MessageCircle className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed z-50 ${
              isMinimized
                ? 'bottom-6 right-6 w-72'
                : 'bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)]'
            }`}
          >
            <Card className={`border-border bg-card shadow-2xl ${
              isMinimized ? 'h-14' : 'h-[600px] max-h-[calc(100vh-6rem)]'
            } flex flex-col`}>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">
                      {t('chat.title', 'Support Client')}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {t('chat.status', 'En ligne')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-8 w-8"
                  >
                    {isMinimized ? (
                      <Maximize2 className="h-4 w-4" />
                    ) : (
                      <Minimize2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {!isMinimized && (
                <>
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                          <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p className="text-sm">
                            {t('chat.welcome', 'Bonjour! Comment puis-je vous aider?')}
                          </p>
                        </div>
                      )}
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${
                            message.senderType === 'CLIENT' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div className={`flex gap-2 max-w-[80%] ${
                            message.senderType === 'CLIENT' ? 'flex-row-reverse' : 'flex-row'
                          }`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              message.senderType === 'CLIENT'
                                ? 'bg-blue-500'
                                : message.senderType === 'SYSTEM'
                                ? 'bg-gray-500'
                                : 'bg-green-500'
                            }`}>
                              {message.senderType === 'CLIENT' ? (
                                <User className="h-4 w-4 text-white" />
                              ) : (
                                <Bot className="h-4 w-4 text-white" />
                              )}
                            </div>
                            <div>
                              <div className={`rounded-2xl px-4 py-2 ${
                                message.senderType === 'CLIENT'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-secondary text-foreground'
                              }`}>
                                <p className="text-sm">{message.content}</p>
                              </div>
                              <div className="flex items-center gap-1 mt-1 px-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {formatMessageTime(message.createdAt)}
                                </span>
                                {message.senderType === 'CLIENT' && message.isRead && (
                                  <CheckCheck className="h-3 w-3 text-blue-400 ml-1" />
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Input */}
                  <div className="p-4 border-t border-border">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        sendMessage()
                      }}
                      className="flex gap-2"
                    >
                      <Input
                        ref={inputRef}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={t('chat.placeholder', 'Tapez votre message...')}
                        disabled={isLoading}
                        className="flex-1 bg-secondary"
                      />
                      <Button
                        type="submit"
                        disabled={isLoading || !newMessage.trim()}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}