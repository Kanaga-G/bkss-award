import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    
    // Vérifier si la table admin_messages existe
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'admin_messages')
    
    if (tablesError || !tables || tables.length === 0) {
      return NextResponse.json({ 
        error: 'Table admin_messages non trouvée' 
      }, { status: 404 })
    }
    
    // Supprimer le message admin
    const { error } = await supabaseAdmin
      .from('admin_messages')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    // Supprimer les notifications associées
    await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('admin_message_id', id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur suppression message admin:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
