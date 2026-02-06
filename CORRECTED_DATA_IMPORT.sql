-- ========================================
-- 🔄 IMPORT CORRIGÉ DES DONNÉES - BANKASS AWARDS
-- ========================================
-- Script avec UUID valides pour toutes les tables
-- Généré le: 2026-02-06T17:20:00.000Z

-- ÉTAPE 1: D'abord les catégories avec des UUID valides
INSERT INTO categories (id, name, description, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Révélation de l''Année', 'Récompense pour le meilleur artiste révélation de l''année', '2026-02-02T00:05:13.097853+00:00', '2026-02-02T00:05:13.097853+00:00'),
('550e8400-e29b-41d4-a716-446655440002', 'Meilleure Chanson de l''Année', 'Récompense pour la meilleure chanson de l''année', '2026-02-02T00:05:13.097853+00:00', '2026-02-02T00:05:13.097853+00:00'),
('550e8400-e29b-41d4-a716-446655440003', 'Meilleur Artiste de l''Année', 'Récompense pour le meilleur artiste de l''année', '2026-02-02T00:05:13.097853+00:00', '2026-02-02T00:05:13.097853+00:00'),
('550e8400-e29b-41d4-a716-446655440004', 'Prix d''Honneur Leadership', 'Prix spécial pour le leadership exceptionnel en l''honneur de Kassim Guindo', '2026-02-02T00:05:13.097853+00:00', '2026-02-05T01:00:49.607724+00:00');

-- ÉTAPE 2: Ensuite les candidats avec les bons UUID de catégories
INSERT INTO candidates (id, name, bio, image_url, audio_file, candidate_song, category_id, created_at, updated_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Trimai darché ', 'Chanteuse franco-malienne, artiste francophone la plus écoutée au monde.', '', '', 'Djadja', '550e8400-e29b-41d4-a716-446655440003', '2026-02-02T00:05:13.097853+00:00', '2026-02-02T15:30:05.686997+00:00'),
('660e8400-e29b-41d4-a716-446655440002', 'Dani music', 'Chanteur, guitariste et compositeur malienne, figure majeure de la musique dogon contemporaine.', '', '', 'Mali Sadio', '550e8400-e29b-41d4-a716-446655440003', '2026-02-02T00:05:13.097853+00:00', '2026-02-02T15:29:11.501528+00:00'),
('660e8400-e29b-41d4-a716-446655440003', 'Tchok de pédol ', 'Chanson engagée célébrant la paix et l''unité a bankass, mêlant sonorités traditionnelles.', '', '', '', '550e8400-e29b-41d4-a716-446655440003', '2026-02-02T15:30:21.975951+00:00', '2026-02-02T15:31:39.313503+00:00'),
('660e8400-e29b-41d4-a716-446655440004', 'Lil iba one', 'Biographie du candidat...', '', '', '', '550e8400-e29b-41d4-a716-446655440003', '2026-02-02T15:32:12.282247+00:00', '2026-02-02T15:32:59.533192+00:00'),
('660e8400-e29b-41d4-a716-446655440005', 'King para ', 'Biographie du candidat...', '', '', '', '550e8400-e29b-41d4-a716-446655440003', '2026-02-02T15:37:09.359962+00:00', '2026-02-02T15:37:37.794214+00:00'),
('660e8400-e29b-41d4-a716-446655440006', 'Ogoyara gang ', 'Biographie du candidat...', '', '', '', '550e8400-e29b-41d4-a716-446655440003', '2026-02-02T15:37:51.862933+00:00', '2026-02-02T15:38:29.828901+00:00'),
('660e8400-e29b-41d4-a716-446655440007', 'Ogoyara gang', 'Chanson engagée célébrant la paix et l''unité a bankass, mêlant sonorités traditionnelles.', '', '', 'Kouma', '550e8400-e29b-41d4-a716-446655440002', '2026-02-02T00:05:13.097853+00:00', '2026-02-02T15:00:37.806659+00:00'),
('660e8400-e29b-41d4-a716-446655440008', 'Tchok', 'Titre phénomène ayant battu tous les records de streaming, devenu un hymne générationnel.', '', '', 'Djadja', '550e8400-e29b-41d4-a716-446655440002', '2026-02-02T00:05:13.097853+00:00', '2026-02-02T15:03:22.950242+00:00'),
('660e8400-e29b-41d4-a716-446655440009', 'King by', 'Chanson engagée célébrant la paix et l''unité a bankass, mêlant sonorités traditionnelles.', '', '', '', '550e8400-e29b-41d4-a716-446655440002', '2026-02-02T15:11:48.59928+00:00', '2026-02-02T15:12:42.956763+00:00'),
('660e8400-e29b-41d4-a716-446655440010', 'Dionki massa', 'Chanson engagée célébrant la paix et l''unité a bankass, mêlant sonorités traditionnelles.', '', '', '', '550e8400-e29b-41d4-a716-446655440002', '2026-02-02T15:13:13.452284+00:00', '2026-02-02T15:14:53.941276+00:00'),
('660e8400-e29b-41d4-a716-446655440011', 'Trimai darché', 'Chanson engagée célébrant la paix et l''unité a bankass, mêlant sonorités traditionnelles.', '', '', '', '550e8400-e29b-41d4-a716-446655440002', '2026-02-02T15:19:23.72564+00:00', '2026-02-02T15:24:34.240966+00:00'),
('660e8400-e29b-41d4-a716-446655440012', 'King para ', 'Chanson engagée célébrant la paix et l''unité a bankass, mêlant sonorités traditionnelles.', '', '', '', '550e8400-e29b-41d4-a716-446655440002', '2026-02-02T15:19:29.039715+00:00', '2026-02-02T15:20:32.211187+00:00'),
('660e8400-e29b-41d4-a716-446655440013', 'Lil iba one', 'Chanson engagée célébrant la paix et l''unité a bankass, mêlant sonorités traditionnelles.', '', '', '', '550e8400-e29b-41d4-a716-446655440002', '2026-02-02T15:24:41.748345+00:00', '2026-02-02T15:26:25.795283+00:00'),
('660e8400-e29b-41d4-a716-446655440014', 'Le beau slay ', 'Voix douce mais puissante, il chante l''espoir et la résilience de la jeunesse bankassois.', '', '', 'Espoir', '550e8400-e29b-41d4-a716-446655440001', '2026-02-02T00:05:13.097853+00:00', '2026-02-02T14:49:23.086813+00:00'),
('660e8400-e29b-41d4-a716-446655440015', 'Plata o plomo', 'Kele', '', '', '', '550e8400-e29b-41d4-a716-446655440001', '2026-02-02T14:38:43.725791+00:00', '2026-02-02T14:41:35.372301+00:00'),
('660e8400-e29b-41d4-a716-446655440016', 'Ghetto clash', 'Biographie du candidat...', '', '', '', '550e8400-e29b-41d4-a716-446655440001', '2026-02-02T14:45:34.397459+00:00', '2026-02-02T14:47:11.320564+00:00'),
('660e8400-e29b-41d4-a716-446655440017', 'Rbai gang', 'Voix douce mais puissante, il chante l''espoir et la résilience de la jeunesse bankassois.', '', '', '', '550e8400-e29b-41d4-a716-446655440001', '2026-02-02T14:49:27.263374+00:00', '2026-02-02T14:51:19.855831+00:00'),
('660e8400-e29b-41d4-a716-446655440018', 'King makhaveli ', 'Voix douce mais puissante, il chante l''espoir et la résilience de la jeunesse bankassois.', '', '', '', '550e8400-e29b-41d4-a716-446655440001', '2026-02-02T14:53:34.810526+00:00', '2026-02-02T14:56:20.091385+00:00'),
('660e8400-e29b-41d4-a716-446655440019', 'Invisible ', 'Voix douce mais puissante, il chante l''espoir et la résilience de la jeunesse bankassois.', '', '', '', '550e8400-e29b-41d4-a716-446655440001', '2026-02-02T14:56:28.179258+00:00', '2026-02-02T14:57:45.709504+00:00');

-- ÉTAPE 3: Les utilisateurs (déjà avec des UUID valides)
-- Les utilisateurs sont déjà corrects dans votre export, donc nous les gardons tels quels

-- ÉTAPE 4: Configuration de vote par défaut
INSERT INTO voting_config (id, is_voting_open, block_message, created_at, updated_at)
VALUES ('770e8400-e29b-41d4-a716-446655440001', false, 'Les votes sont actuellement fermés. Ils seront rouverts le jour de l''evenement.', '2026-02-02T00:05:13.097853+00:00', '2026-02-02T00:05:13.097853+00:00')
ON CONFLICT DO NOTHING;

-- ÉTAPE 5: Prix de leadership
INSERT INTO leadership_prizes (id, year, prize_name, prize_description, prize_value, is_hidden, created_at, updated_at)
VALUES ('880e8400-e29b-41d4-a716-446655440001', 2026, 'Prix Spécial Leadership Kassim Guindo', 'Prix d''honneur special pour le leadership exceptionnel de Kassim Guindo', 1000000.00, true, '2026-02-02T00:05:13.097853+00:00', '2026-02-02T00:05:13.097853+00:00')
ON CONFLICT DO NOTHING;

-- ========================================
-- 📊 RÉCAPITULATIF DE L'IMPORT CORRIGÉ
-- ========================================

-- ✅ Categories: 4 enregistrements avec UUID valides
-- ✅ Candidates: 19 enregistrements avec category_id UUID valides
-- ✅ Users: 475 enregistrements déjà avec UUID valides
-- ✅ Voting Config: 1 enregistrement par défaut
-- ✅ Leadership Prizes: 1 enregistrement pour Kassim Guindo

-- ========================================
-- 🎯 CORRECTIONS APPORTÉES
-- ========================================

-- 1. ✅ Remplacement des IDs de catégories par des UUID valides
-- 2. ✅ Mise à jour des category_id dans candidates
-- 3. ✅ Ajout des descriptions pour les catégories
-- 4. ✅ Configuration par défaut du système de vote
-- 5. ✅ Prix de leadership pour Kassim Guindo

-- ========================================
-- 🚀 INSTRUCTIONS D'UTILISATION
-- ========================================

-- 1. Exécutez d'abord FINAL_COMPLETE_DATABASE.sql pour créer les tables
-- 2. Puis exécutez ce script CORRECTED_DATA_IMPORT.sql
-- 3. Enfin, importez les utilisateurs depuis votre fichier original

-- ========================================
-- ✅ IMPORT PRÊT POUR SUPABASE
-- ========================================
