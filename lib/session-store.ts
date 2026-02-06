// Stockage centralisé des sessions en attente
import crypto from 'crypto'

export interface PendingSession {
  userId: string
  email: string
  name: string
  code: string
  expiresAt: number
  createdAt: number
}

// Stockage en mémoire pour les sessions en attente (partagé entre toutes les APIs)
const pendingSessions = new Map<string, PendingSession>()

// Nettoyer les sessions expirées toutes les 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [sessionId, session] of pendingSessions.entries()) {
    if (session.expiresAt < now) {
      pendingSessions.delete(sessionId)
    }
  }
}, 5 * 60 * 1000)

export class SessionStore {
  // Créer une nouvelle session
  static createSession(userId: string, email: string, name: string, code: string): string {
    const sessionId = crypto.randomUUID()
    const expiresAt = Date.now() + (10 * 60 * 1000) // 10 minutes
    
    const session: PendingSession = {
      userId,
      email,
      name,
      code,
      expiresAt,
      createdAt: Date.now()
    }

    pendingSessions.set(sessionId, session)
    console.log('Session créée:', { sessionId, userId, email, expiresAt })
    
    return sessionId
  }

  // Récupérer une session
  static getSession(sessionId: string): PendingSession | null {
    const session = pendingSessions.get(sessionId)
    
    if (!session) {
      return null
    }

    // Vérifier si la session n'est pas expirée
    if (session.expiresAt < Date.now()) {
      pendingSessions.delete(sessionId)
      return null
    }

    return session
  }

  // Vérifier et supprimer les sessions par email et code
  static verifyAndDeleteSessions(email: string, code: string): PendingSession[] {
    const userSessions = Array.from(pendingSessions.entries())
      .filter(([_, session]) => session.email === email && session.code === code)
    
    if (userSessions.length === 0) {
      return []
    }

    // Supprimer toutes les sessions de cet utilisateur
    userSessions.forEach(([sessionId]) => {
      pendingSessions.delete(sessionId)
    })

    return userSessions.map(([_, session]) => session)
  }

  // Supprimer une session spécifique
  static deleteSession(sessionId: string): boolean {
    return pendingSessions.delete(sessionId)
  }

  // Nettoyer manuellement les sessions expirées
  static cleanupExpiredSessions(): number {
    const now = Date.now()
    let deletedCount = 0
    
    for (const [sessionId, session] of pendingSessions.entries()) {
      if (session.expiresAt < now) {
        pendingSessions.delete(sessionId)
        deletedCount++
      }
    }
    
    return deletedCount
  }

  // Obtenir toutes les sessions (pour debugging)
  static getAllSessions(): Map<string, PendingSession> {
    return new Map(pendingSessions)
  }

  // Obtenir le nombre de sessions actives
  static getActiveSessionCount(): number {
    const now = Date.now()
    let activeCount = 0
    
    for (const session of pendingSessions.values()) {
      if (session.expiresAt > now) {
        activeCount++
      }
    }
    
    return activeCount
  }
}
