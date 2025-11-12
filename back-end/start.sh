#!/bin/bash

# Script d'initialisation pour Railway
echo "🚀 Initialisation de l'application CrazyReal..."

# Attendre que la base de données soit disponible
if [ ! -z "$DATABASE_URL" ]; then
    echo "📊 Vérification de la connexion à la base de données..."
    
    # Extraire les informations de connexion depuis DATABASE_URL
    # Format: postgres://user:password@host:port/database
    
    # Installation de PostgreSQL client si nécessaire
    which psql > /dev/null || apk add --no-cache postgresql-client
    
    # Tentative de connexion avec retry
    for i in {1..30}; do
        if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
            echo "✅ Connexion à la base de données établie"
            break
        else
            echo "⏳ Tentative de connexion $i/30..."
            sleep 2
        fi
    done
    
    # Exécuter les migrations/init de la base de données
    echo "🔧 Initialisation du schéma de base de données..."
    psql "$DATABASE_URL" < database.sql || echo "⚠️  Erreur lors de l'exécution du script SQL (peut être normal si les tables existent déjà)"
fi

# Démarrer l'application
echo "🎯 Démarrage de l'application..."
exec npm start