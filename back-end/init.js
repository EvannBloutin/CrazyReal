const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

console.log('🚀 Initialisation de CrazyReal pour Railway...');

async function initDatabase() {
    if (!process.env.DATABASE_URL) {
        console.log('⚠️  DATABASE_URL non définie, skipping DB init');
        return;
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        // Test de connexion
        await pool.query('SELECT NOW()');
        console.log('✅ Connexion à la base de données établie');

        // Lire et exécuter le script SQL
        const sqlPath = path.join(__dirname, 'database.sql');
        if (fs.existsSync(sqlPath)) {
            const sql = fs.readFileSync(sqlPath, 'utf8');
            await pool.query(sql);
            console.log('✅ Base de données initialisée');
        } else {
            console.log('⚠️  Fichier database.sql non trouvé');
        }
    } catch (error) {
        console.log('⚠️  Erreur DB (peut être normal si tables existent):', error.message);
    } finally {
        await pool.end();
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