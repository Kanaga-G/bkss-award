# 📥 Guide d'Import des Données JSON vers Supabase

## 🎯 **Important à Comprendre**

Le fichier JSON que vous avez téléchargé est une **sauvegarde**, pas un script exécutable. Vous devez utiliser les données du JSON pour créer des requêtes SQL d'insertion.

## 📋 **Processus d'Import**

### Étape 1: Analysez Votre Fichier JSON

Ouvrez votre fichier `bankass_data_backup_2026-02-06.json`. Vous verrez:

```json
{
  "users": [
    {
      "id": "uuid-here",
      "name": "Nom utilisateur",
      "email": "email@example.com",
      "role": "VOTER",
      "phone": "+123456789",
      "created_at": "2026-02-06T...",
      "updated_at": "2026-02-06T..."
    }
  ],
  "categories": [...],
  "candidates": [...],
  "votes": [...]
}
```

### Étape 2: Créez les Requêtes SQL d'Insertion

Pour chaque table, vous devez créer des requêtes INSERT. Voici les modèles:

---

## 👥 **Import des Users**

```sql
-- Insérer les utilisateurs
INSERT INTO users (id, name, email, role, phone, created_at, updated_at) 
VALUES 
('uuid-1', 'Nom 1', 'email1@example.com', 'VOTER', '+123456789', '2026-02-06T...', '2026-02-06T...'),
('uuid-2', 'Nom 2', 'email2@example.com', 'SUPER_ADMIN', '+987654321', '2026-02-06T...', '2026-02-06T...');
```

---

## 🎭 **Import des Categories**

```sql
-- Insérer les catégories
INSERT INTO categories (id, name, description, created_at, updated_at) 
VALUES 
('uuid-1', 'Meilleur Artiste', 'Catégorie pour le meilleur artiste', '2026-02-06T...', '2026-02-06T...'),
('uuid-2', 'Meilleure Chanson', 'Catégorie pour la meilleure chanson', '2026-02-06T...', '2026-02-06T...');
```

---

## 🎤 **Import des Candidates**

```sql
-- Insérer les candidats
INSERT INTO candidates (id, name, bio, image_url, audio_file, candidate_song, category_id, created_at, updated_at) 
VALUES 
('uuid-1', 'Candidat 1', 'Bio du candidat...', 'url-image', 'url-audio', 'Nom chanson', 'category-uuid', '2026-02-06T...', '2026-02-06T...'),
('uuid-2', 'Candidat 2', 'Bio du candidat 2...', 'url-image2', 'url-audio2', 'Nom chanson2', 'category-uuid', '2026-02-06T...', '2026-02-06T...');
```

---

## 🗳️ **Import des Votes**

```sql
-- Insérer les votes
INSERT INTO votes (id, user_id, category_id, candidate_id, created_at, updated_at) 
VALUES 
('uuid-1', 'user-uuid', 'category-uuid', 'candidate-uuid', '2026-02-06T...', '2026-02-06T...'),
('uuid-2', 'user-uuid2', 'category-uuid2', 'candidate-uuid2', '2026-02-06T...', '2026-02-06T...');
```

---

## 🔔 **Import des Notifications**

```sql
-- Insérer les notifications
INSERT INTO notifications (id, user_id, title, message, type, read, created_at, updated_at) 
VALUES 
('uuid-1', 'user-uuid', 'Titre notif', 'Message notif', 'info', false, '2026-02-06T...', '2026-02-06T...');
```

---

## 🛠️ **Outils d'Import Automatique**

### Option 1: Script de Conversion

Je peux créer un script qui convertit automatiquement votre JSON en SQL:

```javascript
// Copiez ce code dans la console de votre navigateur
const jsonData = /* collez votre JSON ici */;

function convertToSQL(data) {
  let sql = '';
  
  // Users
  if (data.users && data.users.length > 0) {
    sql += '-- Users\nINSERT INTO users (id, name, email, role, phone, created_at, updated_at) VALUES\n';
    sql += data.users.map(user => 
      `('${user.id}', '${user.name.replace(/'/g, "''")}', '${user.email}', '${user.role}', '${user.phone || ''}', '${user.created_at}', '${user.updated_at}')`
    ).join(',\n');
    sql += ';\n\n';
  }
  
  // Categories
  if (data.categories && data.categories.length > 0) {
    sql += '-- Categories\nINSERT INTO categories (id, name, description, created_at, updated_at) VALUES\n';
    sql += data.categories.map(cat => 
      `('${cat.id}', '${cat.name.replace(/'/g, "''")}', '${cat.description || ''}', '${cat.created_at}', '${cat.updated_at}')`
    ).join(',\n');
    sql += ';\n\n';
  }
  
  // Continuez pour autres tables...
  
  return sql;
}

const sqlScript = convertToSQL(jsonData);
console.log(sqlScript);
// Copiez le résultat et collez dans Supabase
```

### Option 2: Import Direct via API

Créez une API d'import:

```typescript
// app/api/import-data/route.ts
export async function POST(request: Request) {
  const data = await request.json();
  
  // Import users
  for (const user of data.users) {
    await supabaseAdmin.from('users').insert(user);
  }
  
  // Import categories
  for (const category of data.categories) {
    await supabaseAdmin.from('categories').insert(category);
  }
  
  // Continuez pour autres tables...
  
  return NextResponse.json({ success: true });
}
```

---

## 🚀 **Étapes Recommandées**

### 1. **Préparation**
- Ouvrez votre fichier JSON
- Vérifiez que toutes les données sont présentes
- Notez le nombre d'enregistrements par table

### 2. **Conversion**
- Utilisez le script JavaScript ci-dessus
- Ou convertissez manuellement en SQL
- Vérifiez la syntaxe SQL

### 3. **Import**
- Allez dans Supabase SQL Editor
- Exécutez table par table (dans le bon ordre)
- Vérifiez les erreurs

### 4. **Validation**
- Comptez les enregistrements importés
- Comparez avec votre backup
- Testez l'application

---

## 📋 **Ordre d'Import Important**

Importez dans cet ordre pour respecter les contraintes:

1. **Categories** (pas de dépendances)
2. **Users** (pas de dépendances)
3. **Candidates** (dépend de Categories)
4. **Votes** (dépend de Users, Categories, Candidates)
5. **Notifications** (dépend de Users)

---

## 🚨 **Points d'Attention**

### ⚠️ **Contraintes UUID**
- Assurez-vous que les IDs sont valides
- Les foreign keys doivent exister

### ⚠️ **Échappement des Quotes**
- Remplacez les apostrophes simples: `'` → `''`
- Évitez les injections SQL

### ⚠️ **Timestamps**
- Conservez les dates originales
- Format ISO: `2026-02-06T12:34:56.789Z`

---

## 📞 **Support Si Besoin**

Si vous avez besoin d'aide pour:
- Convertir votre JSON en SQL
- Résoudre les erreurs d'import
- Optimiser le processus

**WhatsApp**: 70359104

**Le processus d'import nécessite une conversion JSON → SQL avant l'exécution sur Supabase !** 🔄
