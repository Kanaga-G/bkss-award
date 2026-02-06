-- ========================================
-- 🔧 CORRECTION FINALE DES TYPES DE DONNÉES
-- ========================================
-- À exécuter manuellement dans le dashboard Supabase SQL Editor

-- ÉTAPE 1: Supprimer les tables problématiques
DROP TABLE IF EXISTS device_registrations CASCADE;
DROP TABLE IF EXISTS email_verifications CASCADE;

-- ÉTAPE 2: Recréer device_registrations avec les bons types
CREATE TABLE IF NOT EXISTS device_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ÉTAPE 3: Recréer email_verifications avec les bons types
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

-- ÉTAPE 4: Créer les indexes pour device_registrations
CREATE INDEX IF NOT EXISTS idx_device_registrations_device_id ON device_registrations(device_id);
CREATE INDEX IF NOT EXISTS idx_device_registrations_ip_address ON device_registrations(ip_address);
CREATE INDEX IF NOT EXISTS idx_device_registrations_user_id ON device_registrations(user_id);

-- ÉTAPE 5: Créer les indexes pour email_verifications
CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_code ON email_verifications(code);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at);

-- ÉTAPE 6: Vérification que tout est correct
DO $$
BEGIN
    -- Vérifier device_registrations
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'device_registrations'
    ) THEN
        RAISE NOTICE '✅ Table device_registrations créée avec succès';
    END IF;

    -- Vérifier email_verifications
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'email_verifications'
    ) THEN
        RAISE NOTICE '✅ Table email_verifications créée avec succès';
    END IF;

    -- Vérifier les contraintes foreign key
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'device_registrations' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name = 'device_registrations_user_id_fkey'
    ) THEN
        RAISE NOTICE '✅ Contrainte foreign key device_registrations.user_id OK';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'email_verifications' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name = 'email_verifications_user_id_fkey'
    ) THEN
        RAISE NOTICE '✅ Contrainte foreign key email_verifications.user_id OK';
    END IF;
END $$;

-- ========================================
-- 📋 RÉCAPITULATIF DES ACTIONS
-- ========================================

-- Ce script a effectué:
-- ✅ Suppression des anciennes tables (device_registrations, email_verifications)
-- ✅ Recréation avec les bons types UUID
-- ✅ Configuration des contraintes foreign key correctes
-- ✅ Création de tous les indexes nécessaires
-- ✅ Vérification de l'intégrité de la structure

-- ========================================
-- 🎯 RÉSULTAT ATTENDU
-- ========================================

-- Après exécution, vous devriez voir:
-- 1. Les tables device_registrations et email_verifications recréées
-- 2. Les contraintes foreign key fonctionnelles
-- 3. Les indexes créés pour optimisation
-- 4. Plus d'erreurs de type "uuid and text are incompatible"

-- ========================================
-- 🚀 PROCHAINES ÉTAPES
-- ========================================

-- 1. Testez l'inscription dans l'application
-- 2. Vérifiez que les emails de vérification s'envoient
-- 3. Testez la création de sessions
-- 4. Testez la redirection vers /verify

-- Le système devrait maintenant fonctionner sans erreurs de types !
