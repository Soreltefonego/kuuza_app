# Guide de Développement - Kuuza Bank

## Workflow Git

### Branches
- **`main`** : Branche de production stable
- **`dev`** : Branche de développement pour intégration des nouvelles fonctionnalités

### Processus de développement

1. **Toujours travailler sur la branche `dev`**
   ```bash
   git checkout dev
   git pull origin dev
   ```

2. **Faire vos modifications**
   ```bash
   # Développer vos fonctionnalités
   # Tester localement
   ```

3. **Commiter et pousser sur `dev`**
   ```bash
   git add .
   git commit -m "Description des changements"
   git push origin dev
   ```

4. **Merger vers `main` (après validation)**
   ```bash
   git checkout main
   git pull origin main
   git merge dev
   git push origin main
   ```

## Commandes utiles

### Développement local
```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build de production
npm run build

# Vérifier les types TypeScript
npm run type-check

# Linter
npm run lint
```

### Base de données
```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate deploy

# Ouvrir Prisma Studio
npx prisma studio
```

## Structure du projet

```
src/
├── app/                 # Pages Next.js (App Router)
│   ├── (admin)/        # Pages admin
│   ├── (client)/       # Pages client
│   ├── (manager)/      # Pages manager
│   └── api/            # Routes API
├── components/         # Composants React
│   ├── admin/         # Composants admin
│   ├── client/        # Composants client
│   ├── manager/       # Composants manager
│   └── ui/            # Composants UI réutilisables
├── lib/               # Utilitaires et configuration
├── services/          # Services métier
└── types/             # Types TypeScript
```

## Variables d'environnement

Créer un fichier `.env.local` avec :

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
```

## Conventions de code

- Utiliser TypeScript pour tout le code
- Suivre les conventions de nommage React (PascalCase pour les composants)
- Utiliser les hooks React et Next.js appropriés
- Commenter le code complexe
- Écrire des messages de commit descriptifs

## Tests

```bash
# Lancer les tests (si configurés)
npm test
```

## Déploiement

Le déploiement se fait automatiquement sur Vercel lors du push sur la branche `main`.

## Support

Pour toute question ou problème, créer une issue sur GitHub.