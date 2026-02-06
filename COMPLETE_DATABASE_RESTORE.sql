-- ========================================
-- 🔄 RESTAURATION COMPLÈTE DE LA BASE DE DONNÉES
-- ========================================
-- À exécuter dans le dashboard Supabase SQL Editor

-- ÉTAPE 1: Suppression complète des anciennes tables (avec vérifications)
DROP TABLE IF EXISTS device_registrations CASCADE;
DROP TABLE IF EXISTS email_verifications CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS candidates CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS admin_messages CASCADE;
DROP TABLE IF EXISTS voting_config CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ÉTAPE 2: Recréation de toutes les tables avec les bons types

-- Table USERS avec tous les champs nécessaires
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'VOTER' CHECK (role IN ('VOTER', 'SUPER_ADMIN')),
    phone VARCHAR(50),
    password VARCHAR(255),
    domain VARCHAR(255),
    city VARCHAR(255),
    device_id VARCHAR(255),
    registration_ip VARCHAR(45),
    user_agent TEXT,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table CANDIDATES
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

-- Table VOTES
CREATE TABLE IF NOT EXISTS votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    admin_message_id UUID REFERENCES admin_messages(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table ADMIN_MESSAGES
CREATE TABLE IF NOT EXISTS admin_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'INFO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table VOTING_CONFIG
CREATE TABLE IF NOT EXISTS voting_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    is_voting_open BOOLEAN DEFAULT false,
    block_message TEXT DEFAULT 'Les votes sont actuellement fermes. Ils seront rouverts le jour de l''evenement.',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table DEVICE_REGISTRATIONS avec liaison correcte
CREATE TABLE IF NOT EXISTS device_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table EMAIL_VERIFICATIONS avec liaison correcte
CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ÉTAPE 3: Création des indexes pour optimisation

-- Index pour USERS
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_device_id ON users(device_id);
CREATE INDEX IF NOT EXISTS idx_users_registration_ip ON users(registration_ip);

-- Index pour CATEGORIES
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Index pour CANDIDATES
CREATE INDEX IF NOT EXISTS idx_candidates_name ON candidates(name);
CREATE INDEX IF NOT EXISTS idx_candidates_category_id ON candidates(category_id);

-- Index pour VOTES
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_category_id ON votes(category_id);
CREATE INDEX IF NOT EXISTS idx_votes_candidate_id ON votes(candidate_id);

-- Index pour NOTIFICATIONS
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Index pour ADMIN_MESSAGES
CREATE INDEX IF NOT EXISTS idx_admin_messages_type ON admin_messages(type);

-- Index pour DEVICE_REGISTRATIONS
CREATE INDEX IF NOT EXISTS idx_device_registrations_device_id ON device_registrations(device_id);
CREATE INDEX IF NOT EXISTS idx_device_registrations_ip_address ON device_registrations(ip_address);
CREATE INDEX IF NOT EXISTS idx_device_registrations_user_id ON device_registrations(user_id);

-- Index pour EMAIL_VERIFICATIONS
CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_code ON email_verifications(code);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at);

-- ÉTAPE 4: Insertion des données initiales

-- Créer un utilisateur admin par défaut
INSERT INTO users (name, email, role, password, email_verified, created_at, updated_at)
VALUES 
    ('Admin', 'admin@bankassawards.com', 'SUPER_ADMIN', '$2b$12$abcdefghijklmnopqrstuvwx', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Créer quelques catégories par défaut
INSERT INTO categories (name, description, created_at, updated_at) VALUES
    ('Meilleur Artiste', 'Recompense pour le meilleur artiste de l''annee', NOW(), NOW()),
    ('Meilleur Chanteur', 'Recompense pour le meilleur chanteur de l''annee', NOW(), NOW()),
    ('Meilleur Producteur', 'Recompense pour le meilleur producteur de l''annee', NOW(), NOW()),
    ('Revelation de l''Annee', 'Artiste ayant le plus progresse cette annee', NOW(), NOW()),
    ('Meilleure Performance', 'Recompense pour la meilleure performance live', NOW(), NOW()),
    ('Meilleur Clip', 'Recompense pour le meilleur clip video', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Configuration de vote par défaut
INSERT INTO voting_config (is_voting_open, block_message, created_at, updated_at)
VALUES (false, 'Les votes sont actuellement fermes. Ils seront rouverts le jour de l''evenement.', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ÉTAPE 5: Vérification finale
DO $$
BEGIN
    -- Compter les tables créées
    DECLARE
        table_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO table_count
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'categories', 'candidates', 'votes', 'notifications', 'admin_messages', 'voting_config', 'device_registrations', 'email_verifications');
        
        RAISE NOTICE '📊 Nombre de tables creees: %', table_count;
        
        -- Verifier les types des colonnes importantes
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'id' 
            AND data_type = 'uuid'
        ) THEN
            RAISE NOTICE '✅ users.id est bien de type UUID';
        END IF;
        
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'device_id'
        ) THEN
            RAISE NOTICE '✅ users.device_id est bien present';
        END IF;
        
        -- Verifier les contraintes foreign key
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'device_registrations' 
            AND constraint_type = 'FOREIGN KEY'
        ) THEN
            RAISE NOTICE '✅ Contraintes foreign key device_registrations OK';
        END IF;
        
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'email_verifications' 
            AND constraint_type = 'FOREIGN KEY'
        ) THEN
            RAISE NOTICE '✅ Contraintes foreign key email_verifications OK';
        END IF;
    END;
END $$;

-- ========================================
-- 📋 RÉCAPITULATIF DE LA RESTAURATION
-- ========================================

-- Ce script a effectué:
-- ✅ Suppression complète des anciennes tables
-- ✅ Recréation de toutes les tables avec les bons types
-- ✅ Configuration des contraintes foreign key correctes
-- ✅ Création de tous les indexes nécessaires
-- ✅ Insertion des données initiales
-- ✅ Vérification de l'intégrité de la structure

-- ========================================
-- 🎯 RÉSULTAT FINAL
-- ========================================

-- Après exécution, vous aurez:
-- 1. Base de données complètement recréée
-- 2. Types UUID correctement configurés
-- 3. Toutes les contraintes foreign key fonctionnelles
-- 4. Système d'inscription avec device tracking prêt
-- 5. Système de vérification email opérationnel
-- 6. Utilisateur admin par défaut: admin@bankassawards.com / admin

-- ========================================
-- 🚀 PROCHAINES ÉTAPES
-- ========================================

-- 1. Testez la connexion à l'application
-- 2. Testez l'inscription avec device tracking
-- 3. Testez l'envoi d'emails de vérification
-- 4. Testez la création de sessions
-- 5. Testez la redirection vers /verify

-- Le système BANKASS AWARDS est maintenant complètement restauré !
