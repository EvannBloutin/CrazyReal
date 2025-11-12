#!/bin/bash

echo "🧪 Test de l'environnement CrazyReal"

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé"
    exit 1
fi

echo "✅ Docker et Docker Compose sont installés"

# Vérifier les fichiers nécessaires
files_to_check=(
    "Dockerfile"
    "docker-compose.yml"
    "railway.json"
    "back-end/package.json"
    "front-web/package.json"
    "back-end/database.sql"
)

for file in "${files_to_check[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ $file existe"
    else
        echo "❌ $file manquant"
        exit 1
    fi
done

echo "🏗️  Construction de l'image Docker..."
if docker build -t crazyreal-test .; then
    echo "✅ Image Docker construite avec succès"
else
    echo "❌ Erreur lors de la construction de l'image Docker"
    exit 1
fi

echo "🚀 Tout est prêt pour le déploiement sur Railway !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Pushez votre code sur GitHub"
echo "2. Connectez votre repo à Railway"
echo "3. Ajoutez une base PostgreSQL"
echo "4. Configurez les variables d'environnement"
echo "5. Railway déploiera automatiquement !"