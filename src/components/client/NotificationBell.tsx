'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Bell,
  X,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'

interface Notification {
  id: string
  title: string
  message: string
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR'
  isRead: boolean
  createdAt: string
  readAt?: string
}

interface NotificationBellProps {
  inSidebar?: boolean
}

export function NotificationBell({ inSidebar = false }: NotificationBellProps) {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/client/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markAsRead = async (notificationIds?: string[]) => {
    try {
      const response = await fetch('/api/client/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds })
      })

      if (response.ok) {
        await fetchNotifications()
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }

  const handleOpenDropdown = () => {
    setIsOpen(!isOpen)
    if (!isOpen && unreadCount > 0) {
      // Mark all as read when opening
      setTimeout(() => markAsRead(), 1000)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'INFO':
        return <Info className="h-4 w-4 text-blue-500" />
      case 'WARNING':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'ERROR':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return i18n.language === 'fr' ? 'À l\'instant' : 'Just now'
    if (minutes < 60) return i18n.language === 'fr' ? `Il y a ${minutes}m` : `${minutes}m ago`
    if (hours < 24) return i18n.language === 'fr' ? `Il y a ${hours}h` : `${hours}h ago`
    if (days < 7) return i18n.language === 'fr' ? `Il y a ${days}j` : `${days}d ago`

    const locale = i18n.language === 'fr' ? fr : enUS
    return format(date, 'dd MMM', { locale })
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleOpenDropdown}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 lg:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Notification panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`${
                inSidebar
                  ? 'fixed left-64 top-16 z-50 w-80 lg:w-96'
                  : 'fixed lg:absolute right-2 lg:right-0 top-14 lg:top-12 z-50 w-[calc(100vw-1rem)] sm:w-80 lg:w-96 max-w-[24rem]'
              }`}
            >
              <Card className="border-border bg-card shadow-lg">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {unreadCount} {i18n.language === 'fr' ? 'non lues' : 'unread'}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="h-7 w-7"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Notifications list */}
                <ScrollArea className="h-[400px] max-h-[60vh]">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">
                        {i18n.language === 'fr'
                          ? 'Aucune notification'
                          : 'No notifications'}
                      </p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`mb-2 p-3 rounded-lg transition-colors ${
                            !notification.isRead
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                              : 'hover:bg-secondary'
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className="pt-0.5">
                              {getIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-medium text-sm truncate">
                                  {notification.title}
                                </h4>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatNotificationTime(notification.createdAt)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              {!notification.isRead && (
                                <div className="mt-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {i18n.language === 'fr' ? 'Nouveau' : 'New'}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => markAsRead()}
                    >
                      {i18n.language === 'fr'
                        ? 'Marquer tout comme lu'
                        : 'Mark all as read'}
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}