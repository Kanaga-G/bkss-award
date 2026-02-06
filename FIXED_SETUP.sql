-- Script corrigé et simplifié pour Supabase
-- Exécuter étape par étape si nécessaire

-- ÉTAPE 1: Créer la table admin_messages
CREATE TABLE IF NOT EXISTS admin_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
    target_users TEXT DEFAULT 'all',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ÉTAPE 2: Ajouter la colonne admin_message_id à notifications (si elle n'existe pas)
DO $$
BEGIN
    -- Vérifier si la colonne existe déjà
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'admin_message_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE notifications 
        ADD COLUMN admin_message_id UUID REFERENCES admin_messages(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Colonne admin_message_id ajoutée à la table notifications';
    ELSE
        RAISE NOTICE 'ℹ️ Colonne admin_message_id existe déjà';
    END IF;
END $$;

-- ÉTAPE 3: Créer les index
CREATE INDEX IF NOT EXISTS idx_admin_messages_created_at ON admin_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_admin_message_id ON notifications(admin_message_id);

-- ÉTAPE 4: Activer RLS sur admin_messages
ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 5: Supprimer anciennes politiques (si elles existent)
DROP POLICY IF EXISTS "Admins can view all admin messages" ON admin_messages;
DROP POLICY IF EXISTS "Admins can create admin messages" ON admin_messages;
DROP POLICY IF EXISTS "Admins can delete admin messages" ON admin_messages;

-- ÉTAPE 6: Créer les politiques RLS pour admin_messages
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

-- ÉTAPE 7: Mettre à jour les politiques de notifications (si nécessaire)
DO $$
BEGIN
    -- Supprimer anciennes politiques
    DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
    DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;
    
    -- Créer nouvelles politiques
    CREATE POLICY "Users can view their own notifications" ON notifications
        FOR SELECT USING (
            notifications.user_id = auth.uid()
        );

    CREATE POLICY "System can insert notifications" ON notifications
        FOR INSERT WITH CHECK (
            admin_message_id IS NOT NULL OR
            user_id = auth.uid()
        );
        
    RAISE NOTICE '✅ Politiques RLS mises à jour pour notifications';
END $$;

-- ÉTAPE 8: Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '🎉 Configuration terminée avec succès !';
    RAISE NOTICE '✅ Table admin_messages créée';
    RAISE NOTICE '✅ Index optimisés';
    RAISE NOTICE '✅ Politiques RLS configurées';
    RAISE NOTICE '🚀 Le système de messagerie est prêt !';
END $$;
