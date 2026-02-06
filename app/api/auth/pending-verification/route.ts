import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { SessionStore } from '@/lib/session-store'

// GET - Récupérer une session en attente
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID requis' }, { status: 400 })
    }

    const session = SessionStore.getSession(sessionId)
    
    if (!session) {
      return NextResponse.json({ error: 'Session non trouvée ou expirée' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      session: {
        userId: session.userId,
        email: session.email,
        name: session.name,
        createdAt: session.createdAt
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer ou mettre à jour une session en attente
export async function POST(request: NextRequest) {
  try {
    const { userId, email, name, code, action } = await request.json()

    if (action === 'create') {
      // Créer une nouvelle session
      const sessionId = SessionStore.createSession(userId, email, name, code)

      return NextResponse.json({
        success: true,
        sessionId,
        expiresAt: new Date(Date.now() + (10 * 60 * 1000)).toISOString()
      })

    } else if (action === 'verify') {
      // Vérifier le code et supprimer les sessions
      const verifiedSessions = SessionStore.verifyAndDeleteSessions(email, code)
      
      if (verifiedSessions.length === 0) {
        return NextResponse.json({ 
          error: 'Code invalide ou expiré' 
        }, { status: 400 })
      }

      // Marquer l'email comme vérifié dans la base
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ 
          email_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur:', updateError)
        return NextResponse.json({ 
          error: 'Erreur lors de la vérification' 
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Email vérifié avec succès'
      })

    } else {
      return NextResponse.json({ 
        error: 'Action non reconnue' 
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Erreur lors de la gestion de la session:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer une session
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID requis' }, { status: 400 })
    }

    const deleted = SessionStore.deleteSession(sessionId)

    return NextResponse.json({
      success: true,
      message: deleted ? 'Session supprimée' : 'Session non trouvée'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression de la session:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
