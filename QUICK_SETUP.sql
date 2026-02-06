-- Script rapide pour créer la table admin_messages
-- Exécuter ce script dans votre dashboard Supabase SQL Editor

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

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Admins can view all admin messages" ON admin_messages;
DROP POLICY IF EXISTS "Admins can create admin messages" ON admin_messages;
DROP POLICY IF EXISTS "Admins can delete admin messages" ON admin_messages;

-- Créer les politiques pour les super admins
CREATE POLICY "Admins can view all admin messages" ON admin_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'SUPER_ADMIN'
        )
    );

CREATE POLICY "Admins can create admin messages" ON admin_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'SUPER_ADMIN'
        )
    );

CREATE POLICY "Admins can delete admin messages" ON admin_messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'SUPER_ADMIN'
        )
    );

-- Mettre à jour les politiques des notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;

CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (
        notifications.user_id = auth.uid()
    );

CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (
        -- Notifications créées par le système (messages admin)
        admin_message_id IS NOT NULL OR
        -- Notifications créées par l'utilisateur
        user_id = auth.uid()
    );

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Table admin_messages créée avec succès !';
    RAISE NOTICE '✅ Politiques RLS configurées !';
    RAISE NOTICE '✅ Index créés pour optimisation !';
END $$;
