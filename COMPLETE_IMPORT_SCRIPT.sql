-- 🔄 SCRIPT D'IMPORT COMPLET - BANKASS AWARDS
-- Inclut les tables existantes + système de messagerie
-- Syntaxe PostgreSQL correcte - Pas d'ARRAY

-- ========================================
-- 🏗️ CRÉATION DES TABLES (si n'existent pas)
-- ========================================

-- Table users (structure corrigée)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'VOTER' CHECK (role IN ('VOTER', 'SUPER_ADMIN')),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table candidates (structure corrigée - pas de ARRAY)
CREATE TABLE IF NOT EXISTS candidates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    image_url TEXT,
    audio_file TEXT,
    candidate_song VARCHAR(255),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table votes
CREATE TABLE IF NOT EXISTS votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category_id) -- Un vote par utilisateur par catégorie
);

-- Table notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
    read BOOLEAN DEFAULT false,
    admin_message_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table admin_messages (système de messagerie)
CREATE TABLE IF NOT EXISTS admin_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
    target_users TEXT DEFAULT 'all',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table voting_config
CREATE TABLE IF NOT EXISTS voting_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY DEFAULT (gen_random_uuid())::uuid,
    is_voting_open BOOLEAN DEFAULT false,
    block_message TEXT DEFAULT 'Les votes ne sont pas encore ouverts.',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 🔗 AJOUT DES CONTRAINTES FOREIGN KEY
-- ========================================

-- Ajouter la contrainte pour admin_message_id dans notifications
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notifications_admin_message_id_fkey'
        AND table_name = 'notifications'
    ) THEN
        ALTER TABLE notifications 
        ADD CONSTRAINT notifications_admin_message_id_fkey 
        FOREIGN KEY (admin_message_id) REFERENCES admin_messages(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ========================================
-- 📊 INDEX POUR OPTIMISATION
-- ========================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_candidates_category_id ON candidates(category_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_category_id ON votes(category_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_admin_message_id ON notifications(admin_message_id);
CREATE INDEX IF NOT EXISTS idx_admin_messages_created_at ON admin_messages(created_at DESC);

-- ========================================
-- 🔐 ACTIVATION RLS (ROW LEVEL SECURITY)
-- ========================================

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_config ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 📋 POLITIQUES RLS - USERS
-- ========================================

-- Users peuvent voir leur propre profil
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Super admins peuvent tout voir sur users
CREATE POLICY "Super admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'SUPER_ADMIN'
        )
    );

-- Super admins peuvent créer des users
CREATE POLICY "Super admins can create users" ON users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'SUPER_ADMIN'
        )
    );

-- ========================================
-- 📋 POLITIQUES RLS - CATEGORIES
-- ========================================

-- Tout le monde peut voir les catégories
CREATE POLICY "Everyone can view categories" ON categories
    FOR SELECT USING (true);

-- Super admins peuvent gérer les catégories
CREATE POLICY "Super admins can manage categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'SUPER_ADMIN'
        )
    );

-- ========================================
-- 📋 POLITIQUES RLS - CANDIDATES
-- ========================================

-- Tout le monde peut voir les candidats
CREATE POLICY "Everyone can view candidates" ON candidates
    FOR SELECT USING (true);

-- Super admins peuvent gérer les candidats
CREATE POLICY "Super admins can manage candidates" ON candidates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'SUPER_ADMIN'
        )
    );

-- ========================================
-- 📋 POLITIQUES RLS - VOTES
-- ========================================

-- Users peuvent voir leurs propres votes
CREATE POLICY "Users can view own votes" ON votes
    FOR SELECT USING (auth.uid() = user_id);

-- Users peuvent créer leurs votes
CREATE POLICY "Users can create own votes" ON votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Super admins peuvent voir tous les votes
CREATE POLICY "Super admins can view all votes" ON votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'SUPER_ADMIN'
        )
    );

-- ========================================
-- 📋 POLITIQUES RLS - NOTIFICATIONS
-- ========================================

-- Users peuvent voir leurs notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Système peut insérer des notifications
CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (
        admin_message_id IS NOT NULL OR auth.uid() = user_id
    );

-- Users peuvent marquer leurs notifications comme lues
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- 📋 POLITIQUES RLS - ADMIN_MESSAGES
-- ========================================

-- Supprimer anciennes politiques si elles existent
DROP POLICY IF EXISTS "Admins can view all admin messages" ON admin_messages;
DROP POLICY IF EXISTS "Admins can create admin messages" ON admin_messages;
DROP POLICY IF EXISTS "Admins can delete admin messages" ON admin_messages;

-- Créer les nouvelles politiques
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

-- ========================================
-- 📋 POLITIQUES RLS - VOTING_CONFIG
-- ========================================

-- Tout le monde peut voir la config de vote
CREATE POLICY "Everyone can view voting config" ON voting_config
    FOR SELECT USING (true);

-- Super admins peuvent gérer la config de vote
CREATE POLICY "Super admins can manage voting config" ON voting_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'SUPER_ADMIN'
        )
    );

-- ========================================
-- 📝 INSÉRATION DES DONNÉES DE BASE
-- ========================================

-- Configuration de vote initiale
INSERT INTO voting_config (is_voting_open, block_message) 
VALUES (false, 'Les votes ne sont pas encore ouverts.')
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 🎯 ZONE D'IMPORT VOS DONNÉES
-- ========================================

-- INSTRUCTIONS:
-- 1. Copiez vos données JSON ci-dessous en utilisant le format:
--    INSERT INTO users (id, name, email, role, phone, created_at, updated_at) VALUES
--    ('uuid-1', 'Nom', 'email', 'VOTER', 'phone', 'timestamp', 'timestamp');

-- 2. Importez dans cet ordre:
--    - Categories d'abord
--    - Users ensuite  
--    - Candidates après
--    - Votes à la fin
--    - Notifications en dernier

-- EXEMPLE - À remplacer avec vos vraies données:
/*
-- Categories
INSERT INTO categories (id, name, description, created_at, updated_at) VALUES
('cat-uuid-1', 'Meilleur Artiste', 'Récompense le meilleur artiste de l\'année', '2026-02-06T10:00:00Z', '2026-02-06T10:00:00Z'),
('cat-uuid-2', 'Meilleure Chanson', 'Récompense la meilleure chanson', '2026-02-06T10:00:00Z', '2026-02-06T10:00:00Z');

-- Users
INSERT INTO users (id, name, email, role, phone, created_at, updated_at) VALUES
('user-uuid-1', 'Jean Dupont', 'jean@example.com', 'VOTER', '+123456789', '2026-02-06T10:00:00Z', '2026-02-06T10:00:00Z'),
('user-uuid-2', 'Admin', 'admin@bankassaward.org', 'SUPER_ADMIN', '+987654321', '2026-02-06T10:00:00Z', '2026-02-06T10:00:00Z');

-- Candidates
INSERT INTO candidates (id, name, bio, image_url, audio_file, candidate_song, category_id, created_at, updated_at) VALUES
('cand-uuid-1', 'Artiste 1', 'Bio de l\'artiste...', 'https://example.com/image1.jpg', 'https://example.com/audio1.mp3', 'Chanson 1', 'cat-uuid-1', '2026-02-06T10:00:00Z', '2026-02-06T10:00:00Z');

-- Votes
INSERT INTO votes (id, user_id, category_id, candidate_id, created_at, updated_at) VALUES
('vote-uuid-1', 'user-uuid-1', 'cat-uuid-1', 'cand-uuid-1', '2026-02-06T11:00:00Z', '2026-02-06T11:00:00Z');
*/

-- ========================================
-- ✅ VÉRIFICATION FINALE
-- ========================================

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '🎉 Import Bankass Awards terminé avec succès !';
    RAISE NOTICE '✅ Tables créées: users, categories, candidates, votes, notifications, admin_messages, voting_config';
    RAISE NOTICE '✅ Index optimisés créés';
    RAISE NOTICE '✅ Politiques RLS configurées';
    RAISE NOTICE '✅ Système de messagerie prêt';
    RAISE NOTICE '🚀 Bankass Awards est opérationnel !';
END $$;

-- ========================================
-- 📊 STATISTIQUES VÉRIFICATION
-- ========================================

-- Vérifiez que tout est bien configuré
SELECT 
    'users' as table_name, 
    COUNT(*) as record_count 
FROM users
UNION ALL
SELECT 
    'categories' as table_name, 
    COUNT(*) as record_count 
FROM categories
UNION ALL
SELECT 
    'candidates' as table_name, 
    COUNT(*) as record_count 
FROM candidates
UNION ALL
SELECT 
    'votes' as table_name, 
    COUNT(*) as record_count 
FROM votes
UNION ALL
SELECT 
    'notifications' as table_name, 
    COUNT(*) as record_count 
FROM notifications
UNION ALL
SELECT 
    'admin_messages' as table_name, 
    COUNT(*) as record_count 
FROM admin_messages
ORDER BY table_name;
