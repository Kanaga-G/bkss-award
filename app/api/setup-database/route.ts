import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Script SQL pour créer la table admin_messages
    const sqlScript = `
      -- Créer la table admin_messages
      CREATE TABLE IF NOT EXISTS admin_messages (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
          target_users TEXT DEFAULT 'all',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Ajouter la colonne admin_message_id à la table notifications si elle n'existe pas
      ALTER TABLE notifications 
      ADD COLUMN IF NOT EXISTS admin_message_id UUID REFERENCES admin_messages(id) ON DELETE CASCADE;

      -- Index pour optimiser les requêtes
      CREATE INDEX IF NOT EXISTS idx_admin_messages_created_at ON admin_messages(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_notifications_admin_message_id ON notifications(admin_message_id);

      -- Activer RLS (Row Level Security)
      ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;

      -- Politiques pour les super admins
      CREATE POLICY IF NOT EXISTS "Admins can view all admin messages" ON admin_messages
          FOR SELECT USING (
              EXISTS (
                  SELECT 1 FROM users 
                  WHERE users.id = auth.uid() 
                  AND users.role = 'SUPER_ADMIN'
              )
          );

      CREATE POLICY IF NOT EXISTS "Admins can create admin messages" ON admin_messages
          FOR INSERT WITH CHECK (
              EXISTS (
                  SELECT 1 FROM users 
                  WHERE users.id = auth.uid() 
                  AND users.role = 'SUPER_ADMIN'
              )
          );

      CREATE POLICY IF NOT EXISTS "Admins can delete admin messages" ON admin_messages
          FOR DELETE USING (
              EXISTS (
                  SELECT 1 FROM users 
                  WHERE users.id = auth.uid() 
                  AND users.role = 'SUPER_ADMIN'
              )
          );

      -- Mettre à jour les politiques des notifications
      DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;

      CREATE POLICY IF NOT EXISTS "Users can view their own notifications" ON notifications
          FOR SELECT USING (
              notifications.user_id = auth.uid()
          );

      DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;

      CREATE POLICY IF NOT EXISTS "System can insert notifications" ON notifications
          FOR INSERT WITH CHECK (
              -- Notifications créées par le système (messages admin)
              admin_message_id IS NOT NULL OR
              -- Notifications créées par l'utilisateur
              user_id = auth.uid()
          );
    `

    // Exécuter le script SQL
    const { error } = await supabaseAdmin.rpc('exec_sql', { sql: sqlScript })
    
    if (error) {
      // Si la fonction RPC n'existe pas, essayer avec SQL direct
      try {
        const { error: directError } = await supabaseAdmin
          .from('admin_messages')
          .select('id')
          .limit(1)
        
        if (directError && directError.code === '42P01') {
          // Table n'existe pas, créer avec SQL direct
          await supabaseAdmin.sql`
            CREATE TABLE IF NOT EXISTS admin_messages (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
                target_users TEXT DEFAULT 'all',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `
        }
      } catch (fallbackError) {
        console.error('Erreur fallback:', fallbackError)
      }
    }

    // Vérifier si la table existe maintenant
    const { data: tables, error: checkError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'admin_messages')

    if (checkError) {
      return NextResponse.json({ 
        error: 'Erreur vérification table: ' + checkError.message 
      }, { status: 500 })
    }

    const tableExists = tables && tables.length > 0

    return NextResponse.json({ 
      success: true,
      message: tableExists 
        ? '✅ Table admin_messages créée avec succès !'
        : '⚠️ Table peut ne pas être créée complètement',
      tableExists,
      instructions: !tableExists ? [
        '1. Allez dans votre dashboard Supabase',
        '2. Cliquez sur "SQL Editor"',
        '3. Copiez et collez le contenu du fichier QUICK_SETUP.sql',
        '4. Cliquez sur "Run" pour exécuter'
      ] : []
    })
  } catch (error) {
    console.error('Erreur setup database:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de la création de la table: ' + (error as Error).message 
    }, { status: 500 })
  }
}
