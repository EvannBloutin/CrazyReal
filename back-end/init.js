const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

console.log('🚀 Initialisation de CrazyReal pour Railway...');

async function initDatabase() {
    if (!process.env.DATABASE_URL) {
        console.log('❌ DATABASE_URL non définie - Impossible de se connecter à la base de données');
        console.log('💡 Sur Railway, assurez-vous d\'avoir ajouté un service PostgreSQL');
        return;
    }

    console.log('🔗 Tentative de connexion à la base de données...');
    
    const initPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 30000,
    });

    try {
        // Test de connexion avec retry
        let connected = false;
        for (let i = 1; i <= 5; i++) {
            try {
                const result = await initPool.query('SELECT NOW() as current_time');
                console.log('✅ Connexion à la base de données établie');
                console.log('🕐 Heure serveur DB:', result.rows[0].current_time);
                connected = true;
                break;
            } catch (error) {
                console.log(`⏳ Tentative ${i}/5 échouée:`, error.message);
                if (i < 5) await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        if (!connected) {
            throw new Error('Impossible de se connecter après 5 tentatives');
        }

        // Lire et exécuter le script SQL
        const sqlPath = path.join(__dirname, 'database.sql');
        if (fs.existsSync(sqlPath)) {
            console.log('📋 Initialisation du schéma de base de données...');
            const sql = fs.readFileSync(sqlPath, 'utf8');
            await initPool.query(sql);
            console.log('✅ Base de données initialisée avec succès');
        } else {
            console.log('⚠️  Fichier database.sql non trouvé, skipping init');
        }
    } catch (error) {
        console.log('❌ Erreur lors de l\'initialisation DB:', error.message);
        console.log('💡 L\'application va démarrer mais les requêtes DB peuvent échouer');
    } finally {
        await initPool.end();
    }
}

async function startApp() {
    try {
        await initDatabase();
        console.log('🎯 Démarrage de l\'application...');
        require('./app.js');
    } catch (error) {
        console.error('❌ Erreur lors du démarrage:', error);
        process.exit(1);
    }
}

startApp();