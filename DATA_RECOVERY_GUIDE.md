# 📦 Guide de Sauvegarde et Récupération des Données

## 🎯 **Objectif**
Récupérer toutes vos données actuelles (users, candidats, votes) avant de faire des modifications sur la base de données.

## 📋 **Méthodes d'Export Disponibles**

### 1. 🌐 **API JSON Export (Recommandé)**
- **URL**: `http://localhost:3000/api/export-data`
- **Format**: JSON complet avec toutes les données
- **Avantages**: Structuré, facile à importer, inclut les statistiques

### 2. 🔧 **Script SQL Direct**
- **Fichier**: `BACKUP_DATA.sql`
- **Format**: Requêtes SQL pour visualiser les données
- **Avantages**: Rapide, visuel, pas besoin d'API

---

## 🚀 **Méthode 1: Export via API (Recommandée)**

### Étape 1: Démarrer le Serveur
```bash
npm run dev
```

### Étape 2: Accéder à l'API
Ouvrez votre navigateur et allez sur:
```
http://localhost:3000/api/export-data
```

### Étape 3: Télécharger les Données
- Le fichier JSON se téléchargera automatiquement
- Nom: `bankass_data_backup_YYYY-MM-DD.json`
- Contient: Users, Categories, Candidates, Votes, Notifications, Config

### Étape 4: Vérifier le Fichier
Le JSON contiendra:
```json
{
  "users": [...],
  "categories": [...],
  "candidates": [...],
  "votes": [...],
  "notifications": [...],
  "voting_config": {...},
  "statistics": {
    "total_users": 10,
    "total_categories": 5,
    "total_candidates": 25,
    "total_votes": 150,
    "votes_by_category": {...},
    "users_by_role": {...}
  },
  "export_date": "2026-02-06T..."
}
```

---

## 🔧 **Méthode 2: Export SQL Direct**

### Étape 1: Allez dans Supabase
1. [supabase.com/dashboard](https://supabase.com/dashboard)
2. Votre projet
3. **SQL Editor**

### Étape 2: Copiez le Script
Copiez tout le contenu de `BACKUP_DATA.sql`

### Étape 3: Exécutez
Cliquez sur **"Run"** pour voir toutes vos données

### Étape 4: Exportez les Résultats
- Copiez les résultats dans un fichier texte
- Sauvegardez par table (users.sql, categories.sql, etc.)

---

## 📊 **Ce Que Vous Allez Récupérer**

### 👥 **Users**
- ID, Nom, Email, Rôle, Téléphone
- Dates de création/mise à jour
- Statistiques par rôle

### 🎭 **Categories**
- ID, Nom, Description
- Ordre de création
- Nombre de candidats par catégorie

### 🎤 **Candidates**
- ID, Nom, Bio, Photo, Audio
- Chanson, Catégorie associée
- Informations complètes

### 🗳️ **Votes**
- ID utilisateur, catégorie, candidat
- Timestamp de chaque vote
- Statistiques de vote

### 🔔 **Notifications**
- Messages envoyés aux utilisateurs
- Types, statuts (lu/non lu)
- Historique complet

### ⚙️ **Configuration**
- État des votes (ouvert/fermé)
- Messages de blocage
- Paramètres système

---

## 🔄 **Processus de Sauvegarde Complet**

### ✅ **Checklist Avant Modification**

#### **1. Export des Données**
- [ ] API JSON exportée et sauvegardée
- [ ] Fichier JSON vérifié et complet
- [ ] Backup SQL exécuté et sauvegardé

#### **2. Vérification**
- [ ] Nombre d'utilisateurs confirmé
- [ ] Nombre de candidats confirmé  
- [ ] Nombre de votes confirmé
- [ ] Toutes les catégories présentes

#### **3. Sécurité**
- [ ] Fichier de backup sauvegardé localement
- [ ] Copie sur cloud (Google Drive, Dropbox)
- [ ] Nom de fichier avec date

---

## 🚨 **En Cas de Problème**

### 🔧 **Si l'API ne fonctionne pas**
1. Vérifiez que le serveur tourne (`npm run dev`)
2. Vérifiez la connexion Supabase (.env.local)
3. Utilisez la méthode SQL directe

### 🔧 **Si les données semblent incomplètes**
1. Vérifiez les logs de la console
2. Exécutez les requêtes SQL individuellement
3. Contactez le support avec les erreurs

### 🔧 **Si vous avez besoin de restaurer**
1. Utilisez le script d'import (créé sur demande)
2. Importez table par table
3. Vérifiez les contraintes et relations

---

## 📞 **Support Technique**

### 🆘 **Si vous rencontrez des problèmes:**

1. **Capture d'écran** de l'erreur
2. **Message d'erreur** complet
3. **Étape** où ça échoue

#### **Contact**
- **WhatsApp**: 70359104
- **Email**: support@bankassaward.org

---

## 🎉 **Une Fois la Sauvegarde Faite**

Après avoir récupéré toutes vos données:
- ✅ **Vous pouvez modifier** la base en toute sécurité
- ✅ **Vous avez une copie** de toutes vos données
- ✅ **Vous pouvez restaurer** si nécessaire
- ✅ **Vos votes et utilisateurs** sont préservés

**Vos données sont maintenant en sécurité !** 🛡️

---

## 📋 **Résumé Rapide**

### 🎯 **Actions Immédiates**
1. **Démarrez** `npm run dev`
2. **Allez sur** `http://localhost:3000/api/export-data`
3. **Téléchargez** le fichier JSON
4. **Vérifiez** le contenu
5. **Sauvegardez** le fichier en plusieurs endroits

### 🚀 **Prêt pour la Suite**
Une fois la sauvegarde faite, vous pouvez:
- Corriger la connexion Supabase
- Exécuter les scripts SQL
- Modifier la structure
- Ajouter de nouvelles fonctionnalités

**Vos données sont 100% sécurisées !** 🔒
