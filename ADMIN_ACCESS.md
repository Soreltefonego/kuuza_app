# 🔐 Accès au Dashboard Super Admin

## 📍 URL d'accès
```
http://localhost:3002/admin/dashboard
```

## 🚀 Étapes pour créer et accéder au compte Super Admin

### 1. Créer le compte admin (première fois seulement)

#### Option A: Via l'interface web
1. Aller sur: `http://localhost:3002/setup-admin`
2. Cliquer sur "Créer le compte Super Admin"
3. Noter les identifiants affichés

#### Option B: Via le script Node.js
```bash
node scripts/create-admin.js
```

### 2. Identifiants par défaut
- **Email**: `admin@kuuzabank.com`
- **Mot de passe**: `Admin@123`

⚠️ **IMPORTANT**: Changez le mot de passe après la première connexion !

### 3. Se connecter
1. Aller sur: `http://localhost:3002/login`
2. Entrer les identifiants admin
3. Vous serez automatiquement redirigé vers `/admin/dashboard`

## 🎯 Fonctionnalités du Super Admin

### Vue d'ensemble
- Statistiques globales de la plateforme
- Métriques financières en temps réel
- Activité récente des utilisateurs

### Gestion des Managers
- Voir tous les managers
- Créditer directement leurs comptes
- Suspendre/Activer des managers
- Voir leurs clients

### Gestion des Clients
- Voir tous les clients de tous les managers
- Filtrer par manager, statut
- Créditer directement les comptes
- Activer/Désactiver des clients

### Transactions
- Historique complet de toutes les transactions
- Filtres avancés (statut, type, date)
- Export des données
- Détails de chaque transaction

### Analytics
- KPIs de performance
- Distribution financière
- Top performers
- Santé du système

## 🛠️ Structure technique

### Routes
- `/admin/dashboard` - Page principale du dashboard admin
- `/api/admin/credit` - API pour créditer les comptes

### Composants principaux
- `AdminDashboard.tsx` - Dashboard principal avec navigation
- `ManagersManagement.tsx` - Gestion des managers
- `ClientsManagement.tsx` - Gestion des clients
- `DirectCreditModal.tsx` - Modal de crédit direct
- `TransactionsOverview.tsx` - Vue des transactions
- `SystemAnalytics.tsx` - Analytics et rapports

## 🔒 Sécurité
- Authentification requise avec rôle ADMIN
- Toutes les actions sont tracées dans les transactions
- Redirection automatique si non autorisé

## ⚠️ Note de sécurité
Après avoir créé le compte admin, supprimez la page `/setup-admin` pour éviter la création non autorisée de comptes admin supplémentaires.

```bash
rm src/app/setup-admin/page.tsx
rm src/app/api/setup-admin/route.ts
```