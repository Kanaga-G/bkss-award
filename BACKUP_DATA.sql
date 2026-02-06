-- 🔧 SCRIPT DE SAUVEGARDE COMPLÈTE DES DONNÉES
-- Exécutez ce script dans Supabase SQL Editor pour exporter toutes vos données

-- ========================================
-- 📋 EXPORT DES UTILISATEUS (USERS)
-- ========================================
SELECT 
    'USERS_BACKUP' as table_name,
    id,
    name,
    email,
    role,
    phone,
    created_at,
    updated_at
FROM users 
ORDER BY created_at;

-- ========================================
-- 🎭 EXPORT DES CATÉGORIES
-- ========================================
SELECT 
    'CATEGORIES_BACKUP' as table_name,
    id,
    name,
    description,
    created_at,
    updated_at
FROM categories 
ORDER BY created_at;

-- ========================================
-- 👥 EXPORT DES CANDIDATS
-- ========================================
SELECT 
    'CANDIDATES_BACKUP' as table_name,
    id,
    name,
    bio,
    image_url,
    audio_file,
    candidate_song,
    category_id,
    created_at,
    updated_at
FROM candidates 
ORDER BY category_id, created_at;

-- ========================================
-- 🗳️ EXPORT DES VOTES
-- ========================================
SELECT 
    'VOTES_BACKUP' as table_name,
    id,
    user_id,
    category_id,
    candidate_id,
    created_at,
    updated_at
FROM votes 
ORDER BY created_at;

-- ========================================
-- 🔔 EXPORT DES NOTIFICATIONS
-- ========================================
SELECT 
    'NOTIFICATIONS_BACKUP' as table_name,
    id,
    user_id,
    title,
    message,
    type,
    read,
    created_at,
    updated_at
FROM notifications 
ORDER BY created_at DESC;

-- ========================================
-- ⚙️ EXPORT DE LA CONFIGURATION VOTES
-- ========================================
SELECT 
    'VOTING_CONFIG_BACKUP' as table_name,
    is_voting_open,
    block_message,
    created_at,
    updated_at
FROM voting_config;

-- ========================================
-- 📊 STATISTIQUES DES DONNÉES
-- ========================================
SELECT 
    'STATISTICS' as table_name,
    'Total Users' as metric,
    COUNT(*) as value
FROM users
UNION ALL
SELECT 
    'STATISTICS' as table_name,
    'Total Categories' as metric,
    COUNT(*) as value
FROM categories
UNION ALL
SELECT 
    'STATISTICS' as table_name,
    'Total Candidates' as metric,
    COUNT(*) as value
FROM candidates
UNION ALL
SELECT 
    'STATISTICS' as table_name,
    'Total Votes' as metric,
    COUNT(*) as value
FROM votes
UNION ALL
SELECT 
    'STATISTICS' as table_name,
    'Total Notifications' as metric,
    COUNT(*) as value
FROM notifications;

-- ========================================
-- 🔍 VÉRIFICATION DES STRUCTURES DE TABLES
-- ========================================
SELECT 
    'TABLE_STRUCTURE' as info_type,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'categories', 'candidates', 'votes', 'notifications', 'voting_config')
ORDER BY table_name, ordinal_position;
