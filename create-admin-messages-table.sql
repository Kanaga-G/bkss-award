-- Table pour les messages administrateurs
CREATE TABLE IF NOT EXISTS admin_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
    target_users TEXT DEFAULT 'all', -- 'all' ou IDs séparés par des virgules
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mettre à jour la table notifications pour inclure les messages admin
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS admin_message_id UUID REFERENCES admin_messages(id) ON DELETE CASCADE;

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_admin_messages_created_at ON admin_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_admin_message_id ON notifications(admin_message_id);

-- RLS (Row Level Security) pour admin_messages
ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;

-- Politique: Seuls les super admins peuvent voir les messages admin
CREATE POLICY "Admins can view all admin messages" ON admin_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'SUPER_ADMIN'
        )
    );

-- Politique: Seuls les super admins peuvent créer des messages admin
CREATE POLICY "Admins can create admin messages" ON admin_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'SUPER_ADMIN'
        )
    );

-- Politique: Seuls les super admins peuvent supprimer des messages admin
CREATE POLICY "Admins can delete admin messages" ON admin_messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'SUPER_ADMIN'
        )
    );

-- Mettre à jour la politique des notifications pour inclure les messages admin
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;

CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (
        notifications.user_id = auth.uid()
    );

-- Mettre à jour la politique des notifications pour inclure les messages admin
DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;

CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (
        -- Notifications créées par le système (messages admin)
        admin_message_id IS NOT NULL OR
        -- Notifications créées par l'utilisateur
        user_id = auth.uid()
    );
