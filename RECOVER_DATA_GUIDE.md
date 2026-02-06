# 📊 GUIDE COMPLET POUR RÉCUPÉRER ET IMPORTER VOS DONNÉES

## 🎯 **Objectif**
Récupérer vos données existantes de Supabase et les importer progressivement avec `json-to-sql-converter.html`

---

## 🔧 **MÉTHODE 1: VIA DASHBOARD SUPABASE (Recommandée)**

### Étape 1: Exportation depuis le Dashboard

1. **Connectez-vous à votre dashboard Supabase**
2. **Allez dans "Table Editor"**
3. **Sélectionnez chaque table** une par une et exportez:

#### **Pour chaque table:**
- `users` → Exporter en JSON
- `categories` → Exporter en JSON  
- `candidates` → Exporter en JSON
- `votes` → Exporter en JSON
- `notifications` → Exporter en JSON
- `admin_messages` → Exporter en JSON
- `voting_config` → Exporter en JSON
- `leadership_prizes` → Exporter en JSON (si existe)

### Étape 2: Utilisation du Convertisseur

1. **Ouvrez `json-to-sql-converter.html`** dans votre navigateur
2. **Pour chaque table exportée:**
   - Copiez le JSON exporté
   - Collez dans la section appropriée du convertisseur
   - Cliquez sur "Générer SQL"
   - Copiez le SQL généré

### Étape 3: Importation Progressive

1. **Allez dans "SQL Editor"** de Supabase
2. **Exécutez les SQL** dans cet ordre:
   ```sql
   -- 1. D'abord les catégories
   INSERT INTO categories (id, name, description, created_at, updated_at) VALUES (...);
   
   -- 2. Ensuite les candidats
   INSERT INTO candidates (id, name, bio, image_url, audio_file, candidate_song, category_id, created_at, updated_at) VALUES (...);
   
   -- 3. Puis les utilisateurs
   INSERT INTO users (id, name, email, role, phone, password, domain, city, device_id, registration_ip, user_agent, email_verified, created_at, updated_at) VALUES (...);
   
   -- 4. Enfin les votes et autres
   INSERT INTO votes (id, user_id, category_id, candidate_id, created_at) VALUES (...);
   ```

---

## 🔧 **MÉTHODE 2: VIA SQL DIRECT**

### Étape 1: Requêtes d'Exportation

Exécutez ces requêtes dans le SQL Editor de Supabase:

```sql
-- Exporter les utilisateurs
SELECT json_agg(users) FROM users;

-- Exporter les catégories  
SELECT json_agg(categories) FROM categories;

-- Exporter les candidats
SELECT json_agg(candidates) FROM candidates;

-- Exporter les votes
SELECT json_agg(votes) FROM votes;

-- Exporter les notifications
SELECT json_agg(notifications) FROM notifications;

-- Exporter les messages admin
SELECT json_agg(admin_messages) FROM admin_messages;

-- Exporter la config de vote
SELECT json_agg(voting_config) FROM voting_config;

-- Exporter les prix de leadership
SELECT json_agg(leadership_prizes) FROM leadership_prizes;
```

### Étape 2: Copier les Résultats

1. **Exécutez chaque requête** ci-dessus
2. **Copiez le résultat JSON** affiché
3. **Utilisez json-to-sql-converter.html** pour convertir
4. **Importez progressivement** comme dans la Méthode 1

---

## 🎯 **FORMAT JSON ATTENDU POUR LE CONVERTISSEUR**

### Users:
```json
[
  {
    "id": "uuid-here",
    "name": "Nom Utilisateur",
    "email": "email@example.com",
    "role": "VOTER",
    "phone": "+22312345678",
    "password": "hashed_password",
    "domain": "domaine",
    "city": "ville",
    "device_id": "device-123",
    "registration_ip": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "email_verified": true,
    "created_at": "2026-02-06T...",
    "updated_at": "2026-02-06T..."
  }
]
```

### Categories:
```json
[
  {
    "id": "uuid-here",
    "name": "Meilleur Artiste",
    "description": "Description...",
    "created_at": "2026-02-06T...",
    "updated_at": "2026-02-06T..."
  }
]
```

### Candidates:
```json
[
  {
    "id": "uuid-here",
    "name": "Nom Candidat",
    "bio": "Biographie...",
    "image_url": "https://...",
    "audio_file": "https://...",
    "candidate_song": "Titre chanson",
    "category_id": "uuid-category",
    "created_at": "2026-02-06T...",
    "updated_at": "2026-02-06T..."
  }
]
```

---

## 📋 **ORDRE D'IMPORTATION RECOMMANDÉ**

1. **categories** (d'abord)
2. **candidates** (dépend des catégories)
3. **users** (indépendant)
4. **votes** (dépend de users, categories, candidates)
5. **notifications** (dépend de users)
6. **admin_messages** (indépendant)
7. **voting_config** (indépendant)
8. **leadership_prizes** (dépend de users)

---

## 🚀 **CONSEILS POUR UNE IMPORTATION RÉUSSIE**

### Avant l'Importation:
- ✅ **Vérifiez les types** de données
- ✅ **Assurez-vous** que les UUID sont valides
- ✅ **Vérifiez les dates** au format ISO

### Pendant l'Importation:
- ✅ **Importez par petits lots** (100-200 enregistrements)
- ✅ **Vérifiez les erreurs** après chaque lot
- ✅ **Utilisez ON CONFLICT DO NOTHING** pour éviter les doublons

### Après l'Importation:
- ✅ **Vérifiez les comptes** d'enregistrements
- ✅ **Testez les foreign keys**
- ✅ **Validez les données** importées

---

## 🎯 **EXEMPLE D'UTILISATION DU CONVERTISSEUR**

### Étape 1: Préparation
1. **Exportez** les catégories depuis Supabase
2. **Copiez** le JSON résultant
3. **Ouvrez** `json-to-sql-converter.html`

### Étape 2: Conversion
1. **Collez** le JSON dans "Données Catégories"
2. **Cliquez** sur "Générer SQL Catégories"
3. **Copiez** le SQL généré

### Étape 3: Importation
1. **Allez** dans SQL Editor de Supabase
2. **Collez** et **exécutez** le SQL
3. **Vérifiez** le message de succès

### Répétez pour chaque table...

---

## 📞 **SUPPORT ET DÉPANNAGE**

### Erreurs Communes:
- **"UUID invalide"** → Vérifiez le format des UUID
- **"Foreign key violation"** → Importez dans le bon ordre
- **"Duplicate key"** → Utilisez ON CONFLICT DO NOTHING

### Solutions:
- **Nettoyez les JSON** avant conversion
- **Vérifiez les types** de données
- **Importez progressivement** par lots

---

## 🎉 **RÉSULTAT FINAL**

Après avoir suivi ce guide:

- ✅ **Données récupérées** de votre ancienne base
- ✅ **Importation progressive** avec le convertisseur
- ✅ **Base de données** complète et fonctionnelle
- ✅ **Système BANKASS AWARDS** prêt

---

## 📁 **FICHIERS UTILES**

- ✅ **`json-to-sql-converter.html`** - Convertisseur
- ✅ **`RECOVER_DATA_GUIDE.md`** - Ce guide
- ✅ **`FINAL_COMPLETE_DATABASE.sql`** - Structure complète

---

## 🚀 **PRÊT À COMMENCER**

**Suivez ce guide étape par étape pour récupérer et importer toutes vos données !**
