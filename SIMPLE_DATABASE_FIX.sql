-- ========================================
-- 🔧 SIMPLIFICATION: CORRECTION DES TYPES DE DONNÉES
-- ========================================
-- Script simple et sûr pour corriger les problèmes de types

-- ÉTAPE 1: Supprimer uniquement les tables problématiques
DROP TABLE IF EXISTS device_registrations;
DROP TABLE IF EXISTS email_verifications;

-- ÉTAPE 2: Recréer les tables avec les bons types
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

-- ÉTAPE 3: Ajouter les colonnes manquantes à users si besoin
DO $$
BEGIN
    -- Ajouter device_id si manquant
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'device_id'
    ) THEN
        ALTER TABLE users ADD COLUMN device_id VARCHAR(255);
        RAISE NOTICE '✅ Colonne device_id ajoutee a users';
    END IF;

    -- Ajouter registration_ip si manquant
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'registration_ip'
    ) THEN
        ALTER TABLE users ADD COLUMN registration_ip VARCHAR(45);
        RAISE NOTICE '✅ Colonne registration_ip ajoutee a users';
    END IF;

    -- Ajouter user_agent si manquant
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'user_agent'
    ) THEN
        ALTER TABLE users ADD COLUMN user_agent TEXT;
        RAISE NOTICE '✅ Colonne user_agent ajoutee a users';
    END IF;

    -- Ajouter email_verified si manquant
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'email_verified'
    ) THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Colonne email_verified ajoutee a users';
    END IF;
END $$;

-- ÉTAPE 4: Créer les indexes
CREATE INDEX IF NOT EXISTS idx_device_registrations_device_id ON device_registrations(device_id);
CREATE INDEX IF NOT EXISTS idx_device_registrations_user_id ON device_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);

-- ÉTAPE 5: Vérification
DO $$
BEGIN
    -- Vérifier que les colonnes existent
    DECLARE
        device_id_exists BOOLEAN;
        reg_ip_exists BOOLEAN;
        user_agent_exists BOOLEAN;
        email_verified_exists BOOLEAN;
    BEGIN
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'device_id'
        ) INTO device_id_exists;
        
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'registration_ip'
        ) INTO reg_ip_exists;
        
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'user_agent'
        ) INTO user_agent_exists;
        
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'email_verified'
        ) INTO email_verified_exists;
        
        RAISE NOTICE '📊 Etat des colonnes dans users:';
        RAISE NOTICE '   device_id: %', CASE WHEN device_id_exists THEN '✅ PRESENT' ELSE '❌ MANQUANT' END;
        RAISE NOTICE '   registration_ip: %', CASE WHEN reg_ip_exists THEN '✅ PRESENT' ELSE '❌ MANQUANT' END;
        RAISE NOTICE '   user_agent: %', CASE WHEN user_agent_exists THEN '✅ PRESENT' ELSE '❌ MANQUANT' END;
        RAISE NOTICE '   email_verified: %', CASE WHEN email_verified_exists THEN '✅ PRESENT' ELSE '❌ MANQUANT' END;
    END;
END $$;

-- ========================================
-- 📋 RÉCAPITULATIF
-- ========================================

-- Ce script effectue:
-- ✅ Suppression des tables problématiques uniquement
-- ✅ Recréation avec les bons types UUID
-- ✅ Ajout des colonnes manquantes si besoin
-- ✅ Création des indexes nécessaires
-- ✅ Vérification de l'état final

-- ========================================
-- 🎯 RÉSULTAT
-- ========================================

-- Après exécution:
-- 1. device_registrations.user_id (UUID) → users.id (UUID) ✓
-- 2. email_verifications.user_id (UUID) → users.id (UUID) ✓
-- 3. Plus d'erreurs de types incompatibles
-- 4. Système de tracking device fonctionnel

-- ========================================
-- 🚀 PROCHAINES ÉTAPES
-- ========================================

-- 1. Testez l'inscription dans l'application
-- 2. Vérifiez que device_id est bien enregistré
-- 3. Testez l'envoi d'emails de vérification
-- 4. Testez la création de sessions

-- Le système devrait maintenant fonctionner sans erreurs !
