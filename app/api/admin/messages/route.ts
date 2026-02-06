import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Vérifier si la table existe
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'admin_messages')
    
    if (tablesError || !tables || tables.length === 0) {
      // La table n'existe pas, retourner un tableau vide
      return NextResponse.json([])
    }
    
    const { data: messages, error } = await supabaseAdmin
      .from('admin_messages')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json(messages || [])
  } catch (error) {
    console.error('Erreur récupération messages admin:', error)
    // En cas d'erreur, retourner un tableau vide pour éviter de casser l'UI
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const { title, message, type, targetUsers = 'all' } = await request.json()
    
    if (!title || !message) {
      return NextResponse.json({ error: 'Titre et message requis' }, { status: 400 })
    }
    
    // Vérifier si la table admin_messages existe
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'admin_messages')
    
    if (tablesError || !tables || tables.length === 0) {
      return NextResponse.json({ 
        error: 'Table admin_messages non trouvée. Veuillez exécuter le script SQL pour créer la table.' 
      }, { status: 500 })
    }
    
    // Créer le message admin
    const { data: adminMessage, error: messageError } = await supabaseAdmin
      .from('admin_messages')
      .insert({
        title,
        message,
        type: type || 'info',
        target_users: targetUsers,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (messageError) throw messageError
    
    // Envoyer aux utilisateurs
    let query = supabaseAdmin.from('users').select('id')
    
    if (targetUsers !== 'all') {
      query = query.in('id', targetUsers)
    }
    
    const { data: users, error: usersError } = await query
    
    if (usersError) throw usersError
    
    // Créer les notifications pour chaque utilisateur
    const notifications = users.map(user => ({
      user_id: user.id,
      title,
      message,
      type: type || 'info',
      read: false,
      created_at: new Date().toISOString(),
      admin_message_id: adminMessage.id
    }))
    
    if (notifications.length > 0) {
      const { error: notificationError } = await supabaseAdmin
        .from('notifications')
        .insert(notifications)
      
      if (notificationError) throw notificationError
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Message envoyé avec succès',
      recipients: users.length 
    })
  } catch (error) {
    console.error('Erreur envoi message admin:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
