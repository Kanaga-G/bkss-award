import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, code, userId } = await request.json()

    if (!email || !code || !userId) {
      return NextResponse.json({ error: 'Email, code et userId requis' }, { status: 400 })
    }

    // Vérifier le code dans la base de données
    const { data: verification, error: verificationError } = await supabaseAdmin
      .from('email_verifications')
      .select('*')
      .eq('user_id', userId)
      .eq('email', email)
      .eq('code', code)
      .single()

    if (verificationError || !verification) {
      return NextResponse.json({ error: 'Code de vérification invalide' }, { status: 400 })
    }

    // Vérifier si le code n'a pas expiré
    const expiresAt = new Date(verification.expires_at)
    if (expiresAt < new Date()) {
      return NextResponse.json({ error: 'Code de vérification expiré' }, { status: 400 })
    }

    // Marquer l'email comme vérifié dans la table users
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        email_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', updateError)
      return NextResponse.json({ error: 'Erreur lors de la vérification' }, { status: 500 })
    }

    // Supprimer le code de vérification utilisé
    await supabaseAdmin
      .from('email_verifications')
      .delete()
      .eq('user_id', userId)

    return NextResponse.json({ 
      success: true, 
      message: 'Email vérifié avec succès' 
    })

  } catch (error) {
    console.error('Erreur lors de la vérification:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
