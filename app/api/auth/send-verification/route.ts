import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { SessionStore } from '@/lib/session-store'

export async function POST(request: NextRequest) {
  try {
    const { email, userId, name, createSession = false } = await request.json()

    if (!email || !userId) {
      return NextResponse.json({ error: 'Email et userId requis' }, { status: 400 })
    }

    // Générer un code de vérification à 6 chiffres
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Sauvegarder le code dans la base de données
    const { error: dbError } = await supabaseAdmin
      .from('email_verifications')
      .upsert({
        user_id: userId,
        email: email,
        code: verificationCode,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (dbError) {
      console.error('Erreur lors de la sauvegarde du code:', dbError)
      return NextResponse.json({ error: 'Erreur lors de la génération du code' }, { status: 500 })
    }

    // Créer une session en attente si demandé
    let sessionId = null
    if (createSession && name) {
      try {
        sessionId = SessionStore.createSession(userId, email, name, verificationCode)
      } catch (sessionError) {
        console.error('Erreur lors de la création de session:', sessionError)
        // Continuer même si la session échoue
      }
    }

    // Envoyer l'email avec nodemailer
    try {
      const nodemailer = require('nodemailer')
      
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: "hogonstore1997@gmail.com",
          pass: "hthgssrilohaqpov",
        },
      })

      const info = await transporter.sendMail({
        from: '"BANKASS AWARDS" <hogonstore1997@gmail.com>',
        to: email,
        subject: "Code de vérification BANKASS AWARDS",
        text: `Votre code de vérification est ${verificationCode}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; font-size: 24px; margin-bottom: 10px;">BANKASS AWARDS</h1>
              <p style="color: #666; font-size: 16px;">Code de vérification</p>
            </div>
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h2 style="color: #007bff; font-size: 32px; letter-spacing: 5px; margin: 0;">${verificationCode}</h2>
            </div>
            <div style="text-align: center; color: #666; font-size: 14px;">
              <p>Ce code expire dans 10 minutes.</p>
              <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
            </div>
          </div>
        `,
      })

      console.log("Email envoyé avec succès:", info.messageId)
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError)
      // En développement, continuer même si l'email échoue
    }

    // En développement, on retourne le code directement
    const responseData: any = {
      success: true,
      message: 'Code de vérification envoyé',
      sessionId
    }

    if (process.env.NODE_ENV === 'development') {
      responseData.developmentCode = verificationCode
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Erreur lors de l\'envoi du code:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
