# 🔧 Guide de Dépannage Supabase

## 🚨 Problèmes Courants et Solutions

### ❌ **Erreur: "syntax error at or near"**

#### **Cause**
- Syntaxe SQL non compatible avec Supabase/PostgreSQL
- Version PostgreSQL différente

#### **Solution**
1. Utilisez le script `FIXED_SETUP.sql` (plus robuste)
2. Exécutez le script étape par étape si nécessaire

---

### ❌ **Erreur: "permission denied"**

#### **Cause**
- Vous n'êtes pas connecté comme super admin
- Permissions insuffisantes sur le projet

#### **Solution**
1. Vérifiez que vous êtes propriétaire du projet Supabase
2. Allez dans Settings → Members pour vérifier vos permissions
3. Demandez au propriétaire du projet de vous donner les droits

---

### ❌ **Erreur: "table already exists"**

#### **Cause**
- La table existe déjà mais avec une structure différente
- Script exécuté plusieurs fois

#### **Solution**
1. **Option A**: Supprimer et recréer
   ```sql
   DROP TABLE IF EXISTS admin_messages CASCADE;
   ```
   Puis réexécuter le script

2. **Option B**: Vérifier la structure existante
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'admin_messages';
   ```

---

### ❌ **Erreur: "column already exists"**

#### **Cause**
- La colonne `admin_message_id` existe déjà dans `notifications`

#### **Solution**
Le script `FIXED_SETUP.sql` gère automatiquement ce cas avec `DO $$` blocks

---

### ❌ **Erreur: "policy already exists"**

#### **Cause**
- Politiques RLS déjà créées avec des noms différents

#### **Solution**
1. Lister les politiques existantes:
   ```sql
   SELECT schemaname, tablename, policyname 
   FROM pg_policies 
   WHERE tablename = 'admin_messages';
   ```

2. Supprimer manuellement si nécessaire:
   ```sql
   DROP POLICY "nom_de_la_politique" ON admin_messages;
   ```

---

## 🔧 **Script d'Installation Robuste**

### 📋 **Étapes d'Exécution**

#### **1. Utiliser FIXED_SETUP.sql**
1. Copiez tout le contenu de `FIXED_SETUP.sql`
2. Collez dans l'éditeur SQL Supabase
3. Exécutez en une seule fois

#### **2. Si ça échoue, exécutez étape par étape**

**Étape 1: Table seule**
```sql
CREATE TABLE IF NOT EXISTS admin_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
    target_users TEXT DEFAULT 'all',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Étape 2: Colonne notifications**
```sql
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS admin_message_id UUID REFERENCES admin_messages(id) ON DELETE CASCADE;
```

**Étape 3: Index**
```sql
CREATE INDEX IF NOT EXISTS idx_admin_messages_created_at ON admin_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_admin_message_id ON notifications(admin_message_id);
```

**Étape 4: RLS**
```sql
ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;
```

**Étape 5: Politiques**
```sql
CREATE POLICY "Admins can view all admin messages" ON admin_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'SUPER_ADMIN'
        )
    );
```

---

## 🔍 **Vérification Post-Installation**

### ✅ **Vérifier que tout fonctionne**

#### **1. Vérifier la table**
```sql
SELECT COUNT(*) FROM admin_messages;
-- Devrait retourner 0 (table vide mais existante)
```

#### **2. Vérifier les politiques**
```sql
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'admin_messages';
-- Devrait montrer 3 politiques (SELECT, INSERT, DELETE)
```

#### **3. Vérifier la colonne dans notifications**
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND column_name = 'admin_message_id';
-- Devrait retourner 1 ligne
```

---

## 🚨 **Si Rien ne Fonctionne**

### 🔄 **Solution Nucléaire**

Si tout échoue, vous pouvez recréer manuellement :

#### **1. Supprimer tout**
```sql
DROP TABLE IF EXISTS admin_messages CASCADE;
DROP POLICY IF EXISTS "Admins can view all admin messages" ON admin_messages;
DROP POLICY IF EXISTS "Admins can create admin messages" ON admin_messages;
DROP POLICY IF EXISTS "Admins can delete admin messages" ON admin_messages;
```

#### **2. Recréer depuis zéro**
```sql
CREATE TABLE admin_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    target_users TEXT DEFAULT 'all',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notifications 
ADD COLUMN admin_message_id UUID REFERENCES admin_messages(id) ON DELETE CASCADE;

ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all admin messages" ON admin_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'SUPER_ADMIN'
        )
    );

CREATE POLICY "Admins can create admin messages" ON admin_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'SUPER_ADMIN'
        )
    );

CREATE POLICY "Admins can delete admin messages" ON admin_messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'SUPER_ADMIN'
        )
    );
```

---

## 📞 **Support Technique**

### 🆘 **Si vous avez besoin d'aide**

1. **Capture d'écran** de l'erreur complète
2. **Message d'erreur** exact (copiez-le)
3. **Étape** où ça échoue

#### **Contact**
- **WhatsApp** : 70359104
- **Email** : support@bankassaward.org

### 📋 **Informations à Fournir**

Quand vous demandez de l'aide, incluez :
- Message d'erreur complet
- Étape du script qui échoue
- Version Supabase/PostgreSQL
- Votre rôle dans le projet

---

## 🎯 **Checklist Finale**

### ✅ **Avant de tester l'application**

- [ ] Table `admin_messages` créée
- [ ] Colonne `admin_message_id` ajoutée à `notifications`
- [ ] Index créés
- [ ] RLS activé sur `admin_messages`
- [ ] Politiques RLS créées
- [ ] Pas d'erreur dans la console SQL

### 🚀 **Après l'installation**

1. **Rafraîchissez** votre application
2. **Testez** l'envoi d'un message admin
3. **Vérifiez** que les alertes fonctionnent
4. **Confirmez** que tout est opérationnel

**Le système devrait être 100% fonctionnel !** 🎉
