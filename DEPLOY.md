# CrazyReal - Déploiement Railway

Ce projet est configuré pour être déployé sur Railway avec Docker.

## 🚀 Déploiement sur Railway

### 1. Prérequis
- Compte Railway (https://railway.app/)
- Repository GitHub connecté

### 2. Configuration
1. Connectez votre repository GitHub à Railway
2. Railway détectera automatiquement le `Dockerfile` et `railway.json`
3. Ajoutez une base de données PostgreSQL via Railway

### 3. Variables d'environnement à configurer sur Railway

#### Étapes de configuration :

1. **Ajoutez un service PostgreSQL dans Railway**
   - Cliquez sur "New" → "Database" → "PostgreSQL"
   - Railway générera automatiquement `DATABASE_URL`

2. **Variables obligatoires à ajouter manuellement :**
```env
NODE_ENV=production
JWT_SECRET=votre_clé_secrète_jwt_très_sécurisée_ici_minimum_32_caractères
```

3. **Variables automatiques (fournies par Railway) :**
```env
DATABASE_URL=postgres://user:password@host:port/database
PORT=auto_assigné_par_railway
```

#### ⚠️ Problèmes courants :
- **ECONNREFUSED** : `DATABASE_URL` manquante → Ajoutez PostgreSQL service
- **JWT errors** : `JWT_SECRET` manquant → Ajoutez cette variable
- **Port binding** : Railway assigne automatiquement le PORT

### 4. Structure du déploiement
- **Frontend** : Build avec Vite et servi comme fichiers statiques
- **Backend** : API Express.js qui sert aussi le frontend
- **Base de données** : PostgreSQL managed par Railway

### 5. Commandes de déploiement

Railway déploiera automatiquement à chaque push sur la branche principale.

## 🏠 Développement local avec Docker

```bash
# Construire et lancer avec docker-compose
docker-compose up --build

# L'application sera disponible sur http://localhost:3000
# PostgreSQL sur le port 5432
```

## 📁 Structure des fichiers Docker

- `Dockerfile` : Build multi-stage (frontend + backend)
- `docker-compose.yml` : Environnement de développement local
- `railway.json` : Configuration Railway
- `.dockerignore` : Fichiers exclus du build
- `back-end/start.sh` : Script d'initialisation avec DB

## 🔧 Fonctionnalités

- ✅ Build automatique du frontend React/Vite
- ✅ Serveur Express.js avec API REST
- ✅ Base de données PostgreSQL
- ✅ Upload de fichiers (stockage local)
- ✅ Authentification JWT
- ✅ CORS configuré
- ✅ SSL/HTTPS ready pour Railway

## 📊 Monitoring

Railway fournit automatiquement :
- Logs en temps réel
- Métriques de performance
- Surveillance de la santé de l'application

## 🛠️ Maintenance

Pour mettre à jour :
1. Push vos changements sur GitHub
2. Railway redéploiera automatiquement
3. La base de données persistent entre les déploiements