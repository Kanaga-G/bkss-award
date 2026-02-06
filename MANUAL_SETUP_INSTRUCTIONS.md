# 🗄️ Instructions d'Installation Manuelle - Table Admin Messages

## 📋 Étapes à Suivre

### 1. 🌐 Accéder à Supabase Dashboard
1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Connectez-vous avec vos identifiants
3. Sélectionnez votre projet Bankass Awards

### 2. 📝 Ouvrir l'Éditeur SQL
1. Dans le menu de gauche, cliquez sur **"SQL Editor"**
2. Cliquez sur **"New query"** pour créer une nouvelle requête

### 3. 📋 Copier le Script SQL

Copiez et collez le script suivant dans l'éditeur SQL :

```sql
-- Créer la table admin_messages
CREATE TABLE IF NOT EXISTS admin_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
    target_users TEXT DEFAULT 'all',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter la colonne admin_message_id à la table notifications si elle n'existe pas
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS admin_message_id UUID REFERENCES admin_messages(id) ON DELETE CASCADE;

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_admin_messages_created_at ON admin_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_admin_message_id ON notifications(admin_message_id);

-- Activer RLS (Row Level Security)
ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Admins can view all admin messages" ON admin_messages;
DROP POLICY IF EXISTS "Admins can create admin messages" ON admin_messages;
DROP POLICY IF EXISTS "Admins can delete admin messages" ON admin_messages;

-- Créer les politiques pour les super admins
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

-- Mettre à jour les politiques des notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;

CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (
        notifications.user_id = auth.uid()
    );

CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (
        -- Notifications créées par le système (messages admin)
        admin_message_id IS NOT NULL OR
        -- Notifications créées par l'utilisateur
        user_id = auth.uid()
    );
```

### 4. ▶️ Exécuter le Script
1. Cliquez sur le bouton **"Run"** (ou **"Execute"**) 
2. Attendez que le script se termine
3. Vous devriez voir des messages de confirmation

### 5. ✅ Vérifier l'Installation

Pour vérifier que tout fonctionne, retournez dans votre application et essayez d'envoyer un message admin :

1. Allez sur la page d'administration
2. Cliquez sur l'onglet "Messages"
3. Essayez d'envoyer un message test
4. Si l'envoi fonctionne, l'installation est réussie !

## 🔧 Si Vous Rencontrez des Problèmes

### Erreur: "Permission denied"
- Assurez-vous que vous êtes connecté comme super admin dans Supabase
- Vérifiez que vous avez les permissions nécessaires sur le projet

### Erreur: "Table already exists"
- C'est normal ! Le script utilise `IF NOT EXISTS` pour éviter les erreurs
- Continuez avec les étapes suivantes

### Erreur: "Column already exists"
- C'est aussi normal ! Le script utilise `ADD COLUMN IF NOT EXISTS`
- Continuez avec l'installation

## 📞 Support

Si vous avez des questions ou rencontrez des problèmes :

- **WhatsApp** : 70359104
- **Email** : support@bankassaward.org

## 🎉 Résultat Attendu

Après l'installation, vous devriez pouvoir :

- ✅ **Composer des messages** admin avec titre, type et destinataires
- ✅ **Envoyer des messages** à tous les utilisateurs ou à des groupes spécifiques
- ✅ **Voir l'historique** des messages envoyés
- ✅ **Supprimer des messages** avec le bouton corbeille
- ✅ **Recevoir des notifications** de succès/erreur

Le système de messagerie sera alors **100% fonctionnel** ! 🚀

---

## 📝 Notes Importantes

- Le script est **idempotent** : peut être exécuté plusieurs fois sans problème
- Les **politiques RLS** assurent la sécurité : seuls les super admins peuvent gérer les messages
- Les **index** optimisent les performances pour les requêtes futures
- La **colonne admin_message_id** dans notifications permet de lier les messages aux notifications

**Une fois le script exécuté, le système de messagerie sera immédiatement opérationnel !** 🎯
