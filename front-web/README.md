# CrazyReal - Front-end

Front en React + Vite minimal pour l'API CrazyReal.

Fonctionnalités implémentées :
- Inscription / Connexion (JWT stocké en localStorage)
- Page d'accueil affichant les missions et images associées
- Création de mission (auth)
- Défi du jour + upload de photo (auth)

Prérequis :
- Node.js >= 14
- Backend en cours d'exécution (voir `back-end/database.sql` et `back-end/app.js`)

Installation :

```bash
cd front-web
npm install
cp .env.example .env
# modifier VITE_API_URL si nécessaire
npm run dev
```

Notes :
- Le front attend que le backend serve les images sous le chemin `/uploads` (app.use('/uploads', express.static('uploads')) dans `back-end/app.js`).
- Pour les tests, créez d'abord des missions depuis l'API ou depuis la page "Créer mission".
