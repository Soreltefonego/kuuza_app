# 🔧 Corrections de la Base de Données

## ⚠️ IMPORTANT - À FAIRE IMMÉDIATEMENT

### 1. Exécuter le script SQL sur Supabase

1. Allez sur [Supabase Dashboard](https://app.supabase.com/project/guhbyjuvjuhtviplomvs/editor)
2. Cliquez sur **SQL Editor**
3. Créez une nouvelle requête
4. Copiez et collez le contenu du fichier `add-blocking-fields.sql`
5. Cliquez sur **Run** pour exécuter le script

### 2. Mettre à jour les variables d'environnement sur Vercel

Allez dans les settings de votre projet Vercel et assurez-vous que ces variables sont correctes:

```env
DATABASE_URL=postgresql://postgres.guhbyjuvjuhtviplomvs:@Raissa23Abidine@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

DIRECT_URL=postgresql://postgres.guhbyjuvjuhtviplomvs:@Raissa23Abidine@db.guhbyjuvjuhtviplomvs.supabase.co:5432/postgres

NEXTAUTH_URL=https://kuuza-app.vercel.app
```

### 3. Redéployer sur Vercel

Après avoir mis à jour les variables, redéployez votre application.

## ✅ Corrections appliquées

1. **Page d'accueil** : Création d'une vraie page d'accueil au lieu d'une redirection automatique
2. **Base de données** : Script SQL pour ajouter les colonnes manquantes:
   - `isBlocked`, `blockedAt`, `blockedReason`, `deletedAt` sur la table Client
   - Tables de chat et notifications

## 📝 Notes

- Les utilisateurs connectés sont automatiquement redirigés vers leur dashboard
- Les managers ont un accès direct à leur espace
- Les clients doivent utiliser leur lien d'activation unique