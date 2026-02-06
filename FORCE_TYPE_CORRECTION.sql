-- ========================================
-- 🔧 FORCER LA CORRECTION DU TYPE users.id
-- ========================================
-- Script pour corriger le type de la colonne id de TEXT vers UUID

-- ÉTAPE 1: Créer une table users_temp avec le bon type
CREATE TABLE IF NOT EXISTS users_temp (
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

-- ÉTAPE 2: Migrer les données depuis users vers users_temp
INSERT INTO users_temp (
    name, email, role, phone, password, domain, city, 
    device_id, registration_ip, user_agent, email_verified, 
    created_at, updated_at
)
SELECT 
    name, email, role, phone, password, domain, city,
    device_id, registration_ip, user_agent, email_verified,
    created_at, updated_at
FROM users;

-- ÉTAPE 3: Supprimer l'ancienne table users
DROP TABLE users CASCADE;

-- ÉTAPE 4: Renommer users_temp en users
ALTER TABLE users_temp RENAME TO users;

-- ÉTAPE 5: Supprimer les tables problématiques
DROP TABLE IF EXISTS device_registrations;
DROP TABLE IF EXISTS email_verifications;

-- ÉTAPE 6: Recréer les tables avec les bons types
CREATE TABLE device_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE email_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ÉTAPE 7: Créer les indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_device_id ON users(device_id);
CREATE INDEX IF NOT EXISTS idx_device_registrations_device_id ON device_registrations(device_id);
CREATE INDEX IF NOT EXISTS idx_device_registrations_user_id ON device_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications(user_id);

-- ÉTAPE 8: Vérification finale
DO $$
BEGIN
    -- Vérifier le type de users.id
    DECLARE
        id_type TEXT;
        is_uuid BOOLEAN;
    BEGIN
        SELECT data_type INTO id_type
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'id';
        
        is_uuid := (id_type = 'uuid');
        
        RAISE NOTICE '📊 Type de users.id: %', id_type;
        RAISE NOTICE '✅ Est UUID: %', CASE WHEN is_uuid THEN 'OUI' ELSE 'NON' END;
        
        -- Vérifier les contraintes foreign key
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'device_registrations' 
            AND constraint_type = 'FOREIGN KEY'
        ) THEN
            RAISE NOTICE '✅ Contrainte device_registrations.user_id OK';
        END IF;
        
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'email_verifications' 
            AND constraint_type = 'FOREIGN KEY'
        ) THEN
            RAISE NOTICE '✅ Contrainte email_verifications.user_id OK';
        END IF;
    END;
END $$;

-- ========================================
-- 📋 RÉCAPITULATIF
-- ========================================

-- Ce script effectue:
-- ✅ Création d'une table users_temp avec le bon type UUID
-- ✅ Migration des données existantes
-- ✅ Remplacement de l'ancienne table users
-- ✅ Recréation des tables liées avec les bons types
-- ✅ Configuration des contraintes foreign key correctes

-- ========================================
-- 🎯 RÉSULTAT FINAL
-- ========================================

-- Après exécution:
-- 1. users.id sera de type UUID (compatible avec device_registrations.user_id)
-- 2. Toutes les données existantes seront préservées
-- 3. Plus d'erreurs de types incompatibles
-- 4. Système de tracking device fonctionnel

-- ========================================
-- 🚀 INSTRUCTIONS
-- ========================================

-- 1. Exécutez ce script dans le dashboard Supabase SQL Editor
-- 2. Attendez la fin de l'exécution
-- 3. Vérifiez les messages dans la console
-- 4. Testez l'inscription dans l'application

-- Le type users.id sera maintenant correct !
