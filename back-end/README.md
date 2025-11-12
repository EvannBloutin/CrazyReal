# CrazyReal - Backend

Backend API pour l'application CrazyReal avec Express.js, MySQL et JWT.

## Configuration de la base de données PostgreSQL

Le fichier `database.sql` contient la structure complète de la base de données avec :
- Tables : `users`, `missions`, `pictures`, `user_missions`
- Types ENUM PostgreSQL
- Index de performance
- Données d'exemple (5 missions de test)

### Installation complète (première fois)

```bash
# Créer la base de données
createdb crazyreal

# Importer la structure et les données
psql -d crazyreal -f database.sql
```

### Alternative avec psql

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base
CREATE DATABASE crazyreal;
\c crazyreal

# Importer le fichier
\i database.sql
```

### Pour Render (Production)

Render va automatiquement créer une base PostgreSQL et fournir l'URL de connexion via `DATABASE_URL`.

## Démarrage du serveur

```bash
# Installation des dépendances
npm install

# Configuration
cp .env.example .env
# Modifier .env avec vos paramètres de base de données

# Démarrage
npm start
# ou pour le développement :
npm run dev
```

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Missions
- `GET /api/missions/today` - Mission du jour (plus ancienne non complétée)
- `GET /api/missions/:id/completed` - Vérifier si un utilisateur a fait une mission
- `POST /api/missions` - Créer une mission (authentifié)

### Images
- `POST /api/pictures` - Upload d'image pour une mission (authentifié)
- `GET /api/pictures/today` - Images de la mission du jour
- `GET /uploads/*` - Servir les images statiques

### Admin
- `POST /api/admin/reset-missions` - Reset manuel des missions

## Fonctionnalités

- **Mission du jour** : Sélection automatique de la plus ancienne mission non complétée
- **Reset quotidien** : À minuit, toutes les missions redeviennent disponibles
- **Upload unique** : Un utilisateur ne peut faire chaque mission qu'une fois par jour
- **Images communautaires** : Toutes les photos sont partagées sur la page d'accueil