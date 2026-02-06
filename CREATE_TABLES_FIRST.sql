-- 🏗️ CRÉATION DES TABLES - À EXÉCUTER EN PREMIER
-- Résout l'erreur "relation does not exist"

-- ========================================
-- 📋 TABLE USERS
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'VOTER' CHECK (role IN ('VOTER', 'SUPER_ADMIN')),
    phone VARCHAR(50),
    device_id VARCHAR(255),
    registration_ip VARCHAR(45),
    user_agent TEXT,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 📋 TABLE CATEGORIES
-- ========================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 📋 TABLE CANDIDATES
-- ========================================
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

-- ========================================
-- 📋 TABLE VOTES
-- ========================================
CREATE TABLE IF NOT EXISTS votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category_id)
);

-- ========================================
-- 📋 TABLE NOTIFICATIONS
-- ========================================
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

-- ========================================
-- 📋 TABLE ADMIN_MESSAGES (MESSAGERIE)
-- ========================================
CREATE TABLE IF NOT EXISTS admin_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
    target_users TEXT DEFAULT 'all',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 📋 TABLE VOTING_CONFIG
-- ========================================
CREATE TABLE IF NOT EXISTS voting_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_voting_open BOOLEAN DEFAULT false,
    block_message TEXT DEFAULT 'Les votes ne sont pas encore ouverts.',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 🔗 TABLE DEVICE_REGISTRATIONS
-- ========================================
CREATE TABLE IF NOT EXISTS device_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimisation
CREATE INDEX IF NOT EXISTS idx_device_registrations_device_id ON device_registrations(device_id);
CREATE INDEX IF NOT EXISTS idx_device_registrations_ip_address ON device_registrations(ip_address);

-- ========================================
-- 🔗 TABLE EMAIL_VERIFICATIONS
-- ========================================
CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id) -- Un seul code par utilisateur
);

-- Index pour optimisation
CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);

-- ========================================
-- 🔗 AJOUT CONTRAINTE FOREIGN KEY POUR ADMIN_MESSAGES
-- ========================================
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
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_candidates_category_id ON candidates(category_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_category_id ON votes(category_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_admin_message_id ON notifications(admin_message_id);
CREATE INDEX IF NOT EXISTS idx_admin_messages_created_at ON admin_messages(created_at DESC);

-- ========================================
-- 🔐 ACTIVATION RLS
-- ========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_config ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 📋 POLITIQUES RLS SIMPLES
-- ========================================

-- Users
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Super admins can manage users" ON users FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'SUPER_ADMIN')
);

-- Categories
CREATE POLICY "Everyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Super admins can manage categories" ON categories FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'SUPER_ADMIN')
);

-- Candidates
CREATE POLICY "Everyone can view candidates" ON candidates FOR SELECT USING (true);
CREATE POLICY "Super admins can manage candidates" ON candidates FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'SUPER_ADMIN')
);

-- Votes
CREATE POLICY "Users can view own votes" ON votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own votes" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Super admins can view all votes" ON votes FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'SUPER_ADMIN')
);

-- Notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (
    admin_message_id IS NOT NULL OR auth.uid() = user_id
);

-- Admin Messages
CREATE POLICY "Admins can manage admin messages" ON admin_messages FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'SUPER_ADMIN')
);

-- Voting Config
CREATE POLICY "Everyone can view voting config" ON voting_config FOR SELECT USING (true);
CREATE POLICY "Super admins can manage voting config" ON voting_config FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'SUPER_ADMIN')
);

-- ========================================
-- ✅ CONFIGURATION INITIALE
-- ========================================

-- Configuration de vote initiale
INSERT INTO voting_config (is_voting_open, block_message) 
VALUES (false, 'Les votes ne sont pas encore ouverts.')
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 🎉 VÉRIFICATION
-- ========================================
DO $$
BEGIN
    RAISE NOTICE '✅ Tables créées avec succès !';
    RAISE NOTICE '✅ Index optimisés créés !';
    RAISE NOTICE '✅ Politiques RLS configurées !';
    RAISE NOTICE '✅ Système de messagerie prêt !';
    RAISE NOTICE '🚀 Vous pouvez maintenant importer vos données !';
END $$;

-- ========================================
-- 📊 VÉRIFICATION DES TABLES
-- ========================================
SELECT 
    table_name,
    '✅ Créée' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'categories', 'candidates', 'votes', 'notifications', 'admin_messages', 'voting_config')
ORDER BY table_name;
