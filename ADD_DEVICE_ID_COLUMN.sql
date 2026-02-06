-- ========================================
-- 🔧 AJOUT DE LA COLONNE DEVICE_ID À LA TABLE USERS
-- ========================================
-- À exécuter dans le dashboard Supabase SQL Editor

-- ÉTAPE 1: Vérifier si la colonne device_id existe déjà
DO $$
BEGIN
    -- Vérifier si la colonne existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'device_id'
    ) THEN
        -- Ajouter la colonne device_id
        ALTER TABLE users 
        ADD COLUMN device_id VARCHAR(255);
        
        RAISE NOTICE '✅ Colonne device_id ajoutée à la table users';
    ELSE
        RAISE NOTICE 'ℹ️ La colonne device_id existe déjà dans la table users';
    END IF;
END $$;

-- ÉTAPE 2: Ajouter les autres colonnes manquantes si besoin
DO $$
BEGIN
    -- Vérifier et ajouter registration_ip
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'registration_ip'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN registration_ip VARCHAR(45);
        
        RAISE NOTICE '✅ Colonne registration_ip ajoutée';
    END IF;

    -- Vérifier et ajouter user_agent
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'user_agent'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN user_agent TEXT;
        
        RAISE NOTICE '✅ Colonne user_agent ajoutée';
    END IF;

    -- Vérifier et ajouter email_verified
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'email_verified'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN email_verified BOOLEAN DEFAULT false;
        
        RAISE NOTICE '✅ Colonne email_verified ajoutée';
    END IF;
END $$;

-- ÉTAPE 3: Créer les indexes pour device_id
CREATE INDEX IF NOT EXISTS idx_users_device_id ON users(device_id);
CREATE INDEX IF NOT EXISTS idx_users_registration_ip ON users(registration_ip);

-- ÉTAPE 4: Recréer device_registrations avec la bonne liaison
DROP TABLE IF EXISTS device_registrations CASCADE;

CREATE TABLE IF NOT EXISTS device_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour device_registrations
CREATE INDEX IF NOT EXISTS idx_device_registrations_device_id ON device_registrations(device_id);
CREATE INDEX IF NOT EXISTS idx_device_registrations_ip_address ON device_registrations(ip_address);
CREATE INDEX IF NOT EXISTS idx_device_registrations_user_id ON device_registrations(user_id);

-- ÉTAPE 5: Recréer email_verifications
DROP TABLE IF EXISTS email_verifications CASCADE;

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

-- Index pour email_verifications
CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at);

-- ÉTAPE 6: Vérification finale
DO $$
BEGIN
    -- Compter les colonnes de la table users
    DECLARE
        user_columns INTEGER;
    BEGIN
        SELECT COUNT(*) INTO user_columns
        FROM information_schema.columns 
        WHERE table_name = 'users';
        
        RAISE NOTICE '📊 Table users contient % colonnes', user_columns;
        
        -- Vérifier les colonnes essentielles
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'device_id'
        ) THEN
            RAISE NOTICE '✅ device_id: PRÉSENT';
        ELSE
            RAISE NOTICE '❌ device_id: MANQUANT';
        END IF;
        
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'registration_ip'
        ) THEN
            RAISE NOTICE '✅ registration_ip: PRÉSENT';
        ELSE
            RAISE NOTICE '❌ registration_ip: MANQUANT';
        END IF;
        
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'email_verified'
        ) THEN
            RAISE NOTICE '✅ email_verified: PRÉSENT';
        ELSE
            RAISE NOTICE '❌ email_verified: MANQUANT';
        END IF;
    END;
END $$;

-- ========================================
-- 📋 RÉCAPITULATIF
-- ========================================

-- Ce script ajoute:
-- ✅ Colonne device_id à la table users (si manquante)
-- ✅ Colonne registration_ip à la table users (si manquante)
-- ✅ Colonne user_agent à la table users (si Manquante)
-- ✅ Colonne email_verified à la table users (si manquante)
-- ✅ Indexes pour optimisation
-- ✅ Table device_registrations correctement liée
-- ✅ Table email_verifications correctement liée

-- ========================================
-- 🎯 RÉSULTAT ATTENDU
-- ========================================

-- Après exécution:
-- 1. Table users aura toutes les colonnes nécessaires
-- 2. device_registrations.user_id → users.id (UUID → UUID) ✓
-- 3. email_verifications.user_id → users.id (UUID → UUID) ✓
-- 4. Plus d'erreurs de types incompatibles
-- 5. Système de tracking device fonctionnel

-- ========================================
-- 🚀 TEST APRÈS EXÉCUTION
-- ========================================

-- Testez l'inscription avec:
-- 1. Création d'utilisateur avec device_id
-- 2. Enregistrement dans device_registrations
-- 3. Envoi d'email de vérification
-- 4. Création de session
-- 5. Vérification du code

-- Le système devrait maintenant fonctionner parfaitement !
