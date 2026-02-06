"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Users, MessageSquare, Bell, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface AdminMessage {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  target_users: string | string[]
  created_at: string
  recipients_count?: number
}

interface AdminMessagePanelProps {
  showSuccessAlert?: (message: string) => void
  showErrorAlert?: (message: string) => void
  showInfoAlert?: (message: string) => void
}

export function AdminMessagePanel({ 
  showSuccessAlert, 
  showErrorAlert, 
  showInfoAlert 
}: AdminMessagePanelProps) {
  const [messages, setMessages] = useState<AdminMessage[]>([])
  const [newMessage, setNewMessage] = useState({
    title: '',
    message: '',
    type: 'info' as const,
    targetUsers: 'all'
  })
  const [isSending, setIsSending] = useState(false)
  const [showCompose, setShowCompose] = useState(false)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/admin/messages')
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      showErrorAlert?.('Erreur de connexion')
    }
  }

  const sendMessage = async () => {
    if (!newMessage.title.trim() || !newMessage.message.trim()) {
      showErrorAlert?.('Veuillez remplir tous les champs')
      return
    }

    setIsSending(true)
    try {
      const response = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage)
      })

      const data = await response.json()

      if (response.ok) {
        showSuccessAlert?.(`Message envoyé à ${data.recipients} utilisateur(s)`)
        setNewMessage({ title: '', message: '', type: 'info', targetUsers: 'all' })
        setShowCompose(false)
        fetchMessages()
      } else {
        showErrorAlert?.(data.error || 'Erreur lors de l\'envoi')
      }
    } catch (error) {
      showErrorAlert?.('Erreur de connexion')
    } finally {
      setIsSending(false)
    }
  }

  const deleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/admin/messages/${messageId}`, { method: 'DELETE' })
      
      if (response.ok) {
        showInfoAlert?.('Message supprimé')
        setMessages(messages.filter(m => m.id !== messageId))
      } else {
        const data = await response.json()
        showErrorAlert?.(data.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      showErrorAlert?.('Erreur de connexion')
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'info': return '📢 Info'
      case 'warning': return '⚠️ Avertissement'
      case 'success': return '✅ Succès'
      case 'error': return '❌ Erreur'
      default: return type
    }
  }

  const getTargetLabel = (target: string | string[]) => {
    if (Array.isArray(target)) {
      return `${target.length} utilisateur(s) spécifiques`
    }
    switch (target) {
      case 'all': return 'Tous les utilisateurs'
      case 'voters': return 'Utilisateurs ayant voté'
      case 'active': return 'Utilisateurs actifs'
      default: return target
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Messages Admin</h2>
        </div>
        <Button
          onClick={() => setShowCompose(!showCompose)}
          className="flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Nouveau Message
        </Button>
      </div>

      {/* Compose Message */}
      <AnimatePresence>
        {showCompose && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card>
              <CardHeader>
                <CardTitle>Composer un message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Titre</label>
                  <Input
                    value={newMessage.title}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Titre du message..."
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={newMessage.type}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="info">📢 Information</option>
                    <option value="warning">⚠️ Avertissement</option>
                    <option value="success">✅ Succès</option>
                    <option value="error">❌ Erreur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Destinataires</label>
                  <select
                    value={newMessage.targetUsers}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, targetUsers: e.target.value }))}
                    className="w-full p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">👥 Tous les utilisateurs</option>
                    <option value="voters">🗳️ Utilisateurs ayant voté</option>
                    <option value="active">🟢 Utilisateurs actifs</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <Textarea
                    value={newMessage.message}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Votre message..."
                    rows={4}
                    className="w-full"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={sendMessage}
                    disabled={isSending || !newMessage.title.trim() || !newMessage.message.trim()}
                    className="flex-1"
                  >
                    {isSending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Envoi...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Envoyer
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCompose(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages List */}
      <div className="space-y-4">
        {messages.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="text-center py-12">
              <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">Aucun message envoyé</h3>
              <p className="text-sm text-muted-foreground">Commencez par composer votre premier message</p>
            </CardContent>
          </Card>
        ) : (
          messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group"
            >
              <Card className="hover:shadow-md transition-all duration-200 border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg truncate">{message.title}</h3>
                        <Badge variant="secondary" className={getTypeColor(message.type)}>
                          {getTypeLabel(message.type)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {getTargetLabel(message.target_users)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {formatDate(message.created_at)}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMessage(message.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.message}</p>
                  </div>
                  
                  {message.recipients_count && (
                    <div className="mt-3 text-sm text-muted-foreground">
                      Envoyé à {message.recipients_count} utilisateur{message.recipients_count > 1 ? 's' : ''}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
