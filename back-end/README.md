# CrazyReal - Backend

Backend API pour l'application CrazyReal avec Express.js, MySQL et JWT.

## Configuration de la base de données

Le fichier `database.sql` contient la structure complète de la base de données avec :
- Tables : `user`, `mission`, `pictures`, `user_missions`
- Index de performance
- Données d'exemple (5 missions de test)

### Installation complète (première fois)

```bash
# Créer la base de données et toutes les tables
mysql -u evann -p < database.sql
```

### Si vous avez déjà une base existante

```bash
# Option 1: Supprimer et recréer (ATTENTION: perte de données)
mysql -u evann -p -e "DROP DATABASE IF EXISTS crazyreal;"
mysql -u evann -p < database.sql

# Option 2: Mettre à jour manuellement
mysql -u evann -p crazyreal -e "
ALTER TABLE mission 
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS completed_date DATE NULL;
"
```

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