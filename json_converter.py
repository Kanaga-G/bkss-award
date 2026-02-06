#!/usr/bin/env python3
"""
🔄 Convertisseur JSON → SQL pour Bankass Awards
Usage: python json_converter.py bankass_data_backup_2026-02-06.json
"""

import json
import sys
from datetime import datetime

def escape_sql_string(text):
    """Échappe les chaînes pour SQL"""
    if not text:
        return ''
    return str(text).replace("'", "''")

def convert_users(users):
    """Convertit les utilisateurs en SQL"""
    if not users:
        return "-- 👥 Aucun utilisateur à importer\n\n"
    
    sql = "-- 👥 Import des Users\n"
    sql += "INSERT INTO users (id, name, email, role, phone, created_at, updated_at) VALUES\n"
    
    values = []
    for user in users:
        values.append(f"""('{user.get('id', '')}', '{escape_sql_string(user.get('name', ''))}', '{user.get('email', '')}', '{user.get('role', 'VOTER')}', '{escape_sql_string(user.get('phone', ''))}', '{user.get('created_at', '')}', '{user.get('updated_at', '')}')""")
    
    sql += ",\n".join(values)
    sql += ";\n\n"
    return sql

def convert_categories(categories):
    """Convertit les catégories en SQL"""
    if not categories:
        return "-- 🎭 Aucune catégorie à importer\n\n"
    
    sql = "-- 🎭 Import des Categories\n"
    sql += "INSERT INTO categories (id, name, description, created_at, updated_at) VALUES\n"
    
    values = []
    for cat in categories:
        values.append(f"""('{cat.get('id', '')}', '{escape_sql_string(cat.get('name', ''))}', '{escape_sql_string(cat.get('description', ''))}', '{cat.get('created_at', '')}', '{cat.get('updated_at', '')}')""")
    
    sql += ",\n".join(values)
    sql += ";\n\n"
    return sql

def convert_candidates(candidates):
    """Convertit les candidats en SQL"""
    if not candidates:
        return "-- 🎤 Aucun candidat à importer\n\n"
    
    sql = "-- 🎤 Import des Candidates\n"
    sql += "INSERT INTO candidates (id, name, bio, image_url, audio_file, candidate_song, category_id, created_at, updated_at) VALUES\n"
    
    values = []
    for cand in candidates:
        values.append(f"""('{cand.get('id', '')}', '{escape_sql_string(cand.get('name', ''))}', '{escape_sql_string(cand.get('bio', ''))}', '{escape_sql_string(cand.get('image_url', ''))}', '{escape_sql_string(cand.get('audio_file', ''))}', '{escape_sql_string(cand.get('candidate_song', ''))}', '{cand.get('category_id', '')}', '{cand.get('created_at', '')}', '{cand.get('updated_at', '')}')""")
    
    sql += ",\n".join(values)
    sql += ";\n\n"
    return sql

def convert_votes(votes):
    """Convertit les votes en SQL"""
    if not votes:
        return "-- 🗳️ Aucun vote à importer\n\n"
    
    sql = "-- 🗳️ Import des Votes\n"
    sql += "INSERT INTO votes (id, user_id, category_id, candidate_id, created_at, updated_at) VALUES\n"
    
    values = []
    for vote in votes:
        values.append(f"""('{vote.get('id', '')}', '{vote.get('user_id', '')}', '{vote.get('category_id', '')}', '{vote.get('candidate_id', '')}', '{vote.get('created_at', '')}', '{vote.get('updated_at', '')}')""")
    
    sql += ",\n".join(values)
    sql += ";\n\n"
    return sql

def convert_notifications(notifications):
    """Convertit les notifications en SQL"""
    if not notifications:
        return "-- 🔔 Aucune notification à importer\n\n"
    
    sql = "-- 🔔 Import des Notifications\n"
    sql += "INSERT INTO notifications (id, user_id, title, message, type, read, admin_message_id, created_at, updated_at) VALUES\n"
    
    values = []
    for notif in notifications:
        read_value = 'true' if notif.get('read', False) else 'false'
        admin_msg_id = notif.get('admin_message_id')
        admin_msg_sql = f"'{admin_msg_id}'" if admin_msg_id else 'NULL'
        
        values.append(f"""('{notif.get('id', '')}', '{notif.get('user_id', '')}', '{escape_sql_string(notif.get('title', ''))}', '{escape_sql_string(notif.get('message', ''))}', '{notif.get('type', 'info')}', {read_value}, {admin_msg_sql}, '{notif.get('created_at', '')}', '{notif.get('updated_at', '')}')""")
    
    sql += ",\n".join(values)
    sql += ";\n\n"
    return sql

def main():
    if len(sys.argv) != 2:
        print("Usage: python json_converter.py votre_fichier.json")
        sys.exit(1)
    
    json_file = sys.argv[1]
    output_file = json_file.replace('.json', '_converted.sql')
    
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"🔄 Conversion de {json_file}...")
        
        # En-tête du script
        sql = f"""-- 🔄 SCRIPT D'IMPORT DONNÉES BANKASS AWARDS
-- Généré le: {datetime.now().isoformat()}
-- Fichier source: {json_file}

-- ========================================
-- 📋 IMPORT DES DONNÉES
-- ========================================

"""
        
        # Ordre d'import important
        if 'categories' in data:
            sql += convert_categories(data['categories'])
        
        if 'users' in data:
            sql += convert_users(data['users'])
        
        if 'candidates' in data:
            sql += convert_candidates(data['candidates'])
        
        if 'votes' in data:
            sql += convert_votes(data['votes'])
        
        if 'notifications' in data:
            sql += convert_notifications(data['notifications'])
        
        # Statistiques
        sql += "-- ========================================\n"
        sql += "-- 📊 STATISTIQUES\n"
        sql += "-- ========================================\n"
        sql += f"-- Total Users: {len(data.get('users', []))}\n"
        sql += f"-- Total Categories: {len(data.get('categories', []))}\n"
        sql += f"-- Total Candidates: {len(data.get('candidates', []))}\n"
        sql += f"-- Total Votes: {len(data.get('votes', []))}\n"
        sql += f"-- Total Notifications: {len(data.get('notifications', []))}\n"
        sql += "\n"
        sql += "-- ✅ Conversion terminée avec succès !\n"
        sql += "-- 🚀 Prêt pour l'import dans Supabase\n"
        
        # Sauvegarder le fichier SQL
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(sql)
        
        print(f"✅ Conversion réussie !")
        print(f"📁 Fichier généré: {output_file}")
        print(f"📋 Instructions:")
        print(f"1. Copiez le contenu de {output_file}")
        print(f"2. Allez dans Supabase Dashboard → SQL Editor")
        print(f"3. Collez et exécutez")
        
    except FileNotFoundError:
        print(f"❌ Erreur: Fichier {json_file} non trouvé")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"❌ Erreur JSON: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Erreur: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
