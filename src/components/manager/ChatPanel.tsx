'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MessageCircle,
  Send,
  User,
  Clock,
  CheckCheck,
  Search,
  Archive,
  Circle,
  AlertCircle,
  ChevronRight
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'

interface Message {
  id: string
  content: string
  senderType: 'CLIENT' | 'MANAGER' | 'SYSTEM'
  senderName?: string
  createdAt: string
  isRead: boolean
}

interface Conversation {
  id: string
  clientId: string
  clientName: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  status: 'ACTIVE' | 'CLOSED' | 'ARCHIVED'
}

interface ChatPanelProps {
  managerId: string
  managerName: string
}

export function ChatPanel({ managerId, managerName }: ChatPanelProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('active')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 5000)
    return () => clearInterval(interval)
  }, [activeTab])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
      const interval = setInterval(() => fetchMessages(selectedConversation.id), 3000)
      return () => clearInterval(interval)
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    try {
      const response = await fetch(`/api/manager/chat/conversations?status=${activeTab.toUpperCase()}`)
      if (response.ok) {
        const result = await response.json()
        // Transform API response to match component expectations
        const formattedConversations = (result.data || []).map((conv: any) => ({
          id: conv.id,
          clientId: conv.client?.id || conv.clientId,
          clientName: conv.client?.user ? `${conv.client.user.firstName} ${conv.client.user.lastName}` : 'Client',
          lastMessage: conv.messages?.[0]?.content || 'Aucun message',
          lastMessageTime: conv.messages?.[0]?.createdAt || conv.updatedAt,
          unreadCount: conv._count?.messages || 0,
          status: conv.status || 'ACTIVE'
        }))
        setConversations(formattedConversations)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/manager/chat/messages?conversationId=${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
        markMessagesAsRead(conversationId)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const markMessagesAsRead = async (conversationId: string) => {
    try {
      await fetch('/api/manager/chat/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId })
      })
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    setIsLoading(true)
    const messageContent = newMessage.trim()
    setNewMessage('')

    // Optimistically add the message
    const tempMessage: Message = {
      id: 'temp-' + Date.now(),
      content: messageContent,
      senderType: 'MANAGER',
      senderName: managerName,
      createdAt: new Date().toISOString(),
      isRead: true
    }
    setMessages(prev => [...prev, tempMessage])

    try {
      const response = await fetch('/api/manager/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: messageContent
        })
      })

      if (response.ok) {
        await fetchMessages(selectedConversation.id)
        await fetchConversations()
      } else {
        toast.error('Erreur lors de l\'envoi du message')
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
        setNewMessage(messageContent)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Erreur réseau')
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
      setNewMessage(messageContent)
    } finally {
      setIsLoading(false)
    }
  }

  const closeConversation = async (conversationId: string) => {
    try {
      const response = await fetch('/api/manager/chat/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId })
      })

      if (response.ok) {
        toast.success('Conversation fermée')
        await fetchConversations()
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null)
          setMessages([])
        }
      }
    } catch (error) {
      console.error('Error closing conversation:', error)
      toast.error('Erreur lors de la fermeture')
    }
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'HH:mm')
  }

  const formatConversationTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return format(date, 'HH:mm')
    if (days === 1) return 'Hier'
    if (days < 7) return format(date, 'EEEE')
    return format(date, 'dd/MM')
  }

  const filteredConversations = conversations.filter(conv =>
    conv.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Card className="h-full border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Centre de Messages
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-5rem)]">
        <div className="flex h-full flex-col md:flex-row">
          {/* Conversations List */}
          <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-border flex flex-col h-1/3 md:h-full">
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-secondary"
                />
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-3 px-2 md:px-3">
                <TabsTrigger value="active">Actifs</TabsTrigger>
                <TabsTrigger value="closed">Fermés</TabsTrigger>
                <TabsTrigger value="archived">Archivés</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="flex-1 mt-0">
                <ScrollArea className="h-full">
                  {filteredConversations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Aucune conversation</p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {filteredConversations.map((conversation) => (
                        <motion.div
                          key={conversation.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`mb-2 p-2 md:p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedConversation?.id === conversation.id
                              ? 'bg-blue-500/10 border border-blue-500/20'
                              : 'hover:bg-secondary'
                          }`}
                          onClick={() => setSelectedConversation(conversation)}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold">
                                {conversation.clientName.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {conversation.clientName}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {conversation.lastMessage}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-xs text-muted-foreground">
                                {formatConversationTime(conversation.lastMessageTime)}
                              </span>
                              {conversation.unreadCount > 0 && (
                                <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col h-2/3 md:h-full">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                      {selectedConversation.clientName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedConversation.clientName}</h3>
                      <p className="text-xs text-muted-foreground">
                        Client ID: {selectedConversation.clientId.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                  {selectedConversation.status === 'ACTIVE' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => closeConversation(selectedConversation.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Fermer
                    </Button>
                  )}
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${
                          message.senderType === 'MANAGER' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div className={`flex gap-2 max-w-[70%] ${
                          message.senderType === 'MANAGER' ? 'flex-row-reverse' : 'flex-row'
                        }`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            message.senderType === 'CLIENT'
                              ? 'bg-blue-500'
                              : message.senderType === 'SYSTEM'
                              ? 'bg-gray-500'
                              : 'bg-green-500'
                          } text-white text-sm`}>
                            {message.senderType === 'CLIENT' ? 'C' : 'M'}
                          </div>
                          <div>
                            <div className={`rounded-2xl px-4 py-2 ${
                              message.senderType === 'MANAGER'
                                ? 'bg-green-500 text-white'
                                : 'bg-secondary text-foreground'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <div className="flex items-center gap-1 mt-1 px-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {formatMessageTime(message.createdAt)}
                              </span>
                              {message.senderType === 'MANAGER' && message.isRead && (
                                <CheckCheck className="h-3 w-3 text-green-400 ml-1" />
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input Area */}
                {selectedConversation.status === 'ACTIVE' && (
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
                        placeholder="Tapez votre message..."
                        disabled={isLoading}
                        className="flex-1 bg-secondary"
                      />
                      <Button
                        type="submit"
                        disabled={isLoading || !newMessage.trim()}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Sélectionnez une conversation pour commencer</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}