# Configuration Manuelle Supabase

## 🎯 État Actuel
- ✅ Connexion Supabase établie (pooler fonctionne)
- ❌ Tables non créées (nécessite exécution SQL manuelle)
- ✅ Scripts de données prêts

## 📋 Étapes à Suivre

### 1. Accéder à l'Éditeur SQL Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous à votre projet `bankass-awards`
3. Allez dans **SQL Editor**
4. Copiez-collez le SQL ci-dessous

### 2. Exécuter le SQL de Création des Tables

```sql
-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  domain TEXT,
  city TEXT,
  phone TEXT,
  role TEXT DEFAULT 'VOTER' CHECK (role IN ('VOTER', 'SUPER_ADMIN')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des catégories
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
  name TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  special BOOLEAN DEFAULT FALSE,
  is_leadership_prize BOOLEAN DEFAULT FALSE,
  pre_assigned_winner TEXT,
  pre_assigned_winner_bio TEXT,
  pre_assigned_winner_image TEXT,
  pre_assigned_winner_achievements TEXT[],
  pre_assigned_winner_tribute TEXT,
  leadership_revealed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des candidats
CREATE TABLE IF NOT EXISTS candidates (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  alias TEXT,
  image TEXT NOT NULL,
  bio TEXT NOT NULL,
  achievements TEXT[],
  song_count INTEGER,
  candidate_song TEXT,
  audio_file TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des votes
CREATE TABLE IF NOT EXISTS votes (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  candidate_name TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  UNIQUE(user_id, category_id)
);

-- Table des sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des logs d'administration
CREATE TABLE IF NOT EXISTS admin_logs (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des paramètres de l'application
CREATE TABLE IF NOT EXISTS app_settings (
  id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language plpgsql;

-- Appliquer le trigger aux tables qui ont updated_at
CREATE TRIGGER set_users_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_categories_timestamp BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_candidates_timestamp BEFORE UPDATE ON candidates FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_app_settings_timestamp BEFORE UPDATE ON app_settings FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
```

### 3. Exécuter le Script de Données

Après avoir créé les tables, exécutez ce deuxième SQL pour insérer les données :

```sql
-- Insérer l'administrateur par défaut
INSERT INTO users (id, name, email, role)
VALUES ('super_admin_001', 'Super Admin', 'admin@bankassawards.com', 'SUPER_ADMIN')
ON CONFLICT (id) DO NOTHING;

-- Insérer les catégories par défaut
INSERT INTO categories (id, name, subtitle, special, is_leadership_prize, pre_assigned_winner, pre_assigned_winner_image, pre_assigned_winner_bio, pre_assigned_winner_achievements, pre_assigned_winner_tribute)
VALUES 
  ('trophee-leadership', 'Prix d''Honneur Leadership', '- Révéler à la fin du vote', TRUE, TRUE, 'Kassim Guindo', '/kassim-guindo-portrait-leadership.jpg', 
   'Kassim Guindo, figure emblématique de Bankass, demeure une légende vivante dans le cœur de tous ceux qui l''ont connu. Visionnaire et leader naturel, il a consacré sa vie à l''émancipation de sa communauté, croyant fermement que chaque jeune de Bankass portait en lui les graines de la grandeur. Son parcours, marqué par une détermination sans faille et une générosité infinie, a inspiré des générations entières. Qu''il soit parmi nous ou qu''il veille sur nous depuis les étoiles, son héritage reste immortel.',
   ARRAY['Fondateur du mouvement Winner Boys', 'Mentor de centaines de jeunes de Bankass', 'Pionnier du développement communautaire local', 'Symbole d''espoir et de résilience pour toute une génération', 'Bâtisseur de ponts entre tradition et modernité'],
   'À toi, Kassim,

Tu es de ceux dont on ne sait jamais vraiment s''ils sont partis ou s''ils sont simplement passés dans une autre dimension de l''existence. Car comment pourrait-on dire qu''un homme comme toi a disparu, quand chaque rue de Bankass porte encore l''écho de tes pas, quand chaque jeune que tu as guidé continue de porter ta flamme ?

Tu nous as appris que le leadership n''est pas une question de titre, mais de cœur. Que la vraie richesse se mesure non pas à ce que l''on possède, mais à ce que l''on donne. Tu as été le père que beaucoup n''ont jamais eu, le frère sur qui l''on pouvait compter, l''ami qui ne jugeait jamais.

Si tu es là-haut, sache que nous pensons à toi chaque jour.
Si tu es quelque part ici-bas, sache que nous te cherchons encore.
Où que tu sois, sache que tu es aimé, honoré, et jamais oublié.

Ce trophée porte ton nom. Cette cérémonie célèbre ta mémoire. Cet héritage est le tien.

Avec tout notre amour et notre gratitude éternelle,
La famille Bankass Awards et les Winner Boys')
ON CONFLICT (id) DO NOTHING;

-- Insérer les autres catégories
INSERT INTO categories (id, name, subtitle, special, is_leadership_prize)
VALUES 
  ('revelation', 'Révélation de l''Année', 'Découverte du nouveau talent qui a marqué l''année', FALSE, FALSE),
  ('meilleure-chanson', 'Meilleure Chanson de l''Année', 'Le titre qui a marqué les esprits cette année', FALSE, FALSE),
  ('meilleur-artiste', 'Meilleur Artiste de l''Année', 'Récompenser l''excellence artistique et l''impact culturel', FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Insérer les candidats par défaut
INSERT INTO candidates (id, category_id, name, alias, image, bio, achievements, song_count, candidate_song)
VALUES 
  ('rev-1', 'revelation', 'Bakary Sangaré', 'Baka', '/african-man-artist-portrait-young.jpg', 'Jeune artiste émergent de Bankass, son style unique mélange tradition et modernité.', ARRAY['Premier concert solo à Bamako', '100 000 vues sur YouTube', 'Artiste local de l''année 2024'], 5, 'Bankass Revolution'),
  ('rev-2', 'revelation', 'Aminata Dicko', 'Mina', '/african-woman-singer-portrait-rising.jpg', 'Voix douce mais puissante, elle chante l''espoir et la résilience de la jeunesse malienne.', ARRAY['Premier album en production', 'Collaboration avec Oumou Sangaré', 'Révélation du Festival au Désert'], 8, 'Espoir'),
  ('mc-1', 'meilleure-chanson', 'Oumou Sangaré', 'La Dame de Mopti', '/music-album-cover-gold-artistic.jpg', 'Titre phénomène ayant battu tous les records de streaming, devenu un hymne générationnel.', ARRAY['1 milliard de streams', 'Disque de diamant', 'Chanson de la décennie'], 12, 'Djadja'),
  ('mc-2', 'meilleure-chanson', 'Fatoumata Diawara', 'Fatou', '/music-album-cover-african-artistic.jpg', 'Chanson engagée célébrant la paix et l''unité au Mali, mêlant sonorités traditionnelles.', ARRAY['Prix de la meilleure chanson africaine', 'Message de paix', 'Clip primé'], 15, 'Kouma'),
  ('ma-1', 'meilleur-artiste', 'Rokia Traoré', 'La Voix d''Or', '/african-woman-musician-portrait-artistic.jpg', 'Chanteuse, guitariste et compositrice malienne, figure majeure de la musique africaine contemporaine.', ARRAY['Victoire de la Musique', 'Collaboration internationale', 'Directrice artistique du Festival au Désert'], 45, 'Mali Sadio'),
  ('ma-2', 'meilleur-artiste', 'Aya Nakamura', 'La Reine du Pop Urbaine', '/african-woman-singer-portrait-glamour.jpg', 'Chanteuse franco-malienne, artiste francophone la plus écoutée au monde.', ARRAY['Album de diamant', 'NRJ Music Award', 'Artiste francophone #1 mondial'], 32, 'Djadja')
ON CONFLICT (id) DO NOTHING;

-- Insérer les paramètres par défaut
INSERT INTO app_settings (key, value)
VALUES 
  ('leadership_revealed', 'false'),
  ('voting_enabled', 'true'),
  ('app_version', '"1.0.0"')
ON CONFLICT (key) DO NOTHING;
```

### 4. Vérifier et Lancer l'Application

Une fois les tables créées et les données insérées :

```bash
npm run dev
```

L'application devrait maintenant fonctionner avec la base de données Supabase !

## 🔧 Si Problème Persiste

Si vous rencontrez des erreurs SQL :
- Vérifiez que chaque instruction se termine par `;`
- Exécutez les instructions une par une
- Contactez-moi pour débugger

## ✅ Validation

Après configuration, vous devriez voir :
- Page d'accueil fonctionnelle
- Panneau d'administration accessible
- Catégories et candidats affichés
- Système de vote opérationnel
