const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration de la base de données PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || undefined,
    host: process.env.DATABASE_URL ? undefined : (process.env.DB_HOST || 'localhost'),
    user: process.env.DATABASE_URL ? undefined : (process.env.DB_USER || 'evann'),
    password: process.env.DATABASE_URL ? undefined : (process.env.DB_PASSWORD || null),
    database: process.env.DATABASE_URL ? undefined : (process.env.DB_NAME || 'crazyreal'),
    port: process.env.DATABASE_URL ? undefined : (process.env.DB_PORT || 5432),
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Configuration de multer pour l'upload de fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers image sont autorisés!'), false);
        }
    }
});

// Middleware d'authentification JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token d\'accès requis' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_jwt', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token invalide' });
        }
        req.user = user;
        next();
    });
};

// Fonction pour reset les missions quotidiennes à 00h00
const resetDailyMissions = async () => {
    try {
        const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
        
        // Vérifier s'il y a des missions complétées hier qui doivent être reset
        const completedResult = await pool.query(`
            SELECT * FROM missions 
            WHERE is_completed = TRUE 
            AND (completed_date IS NULL OR completed_date < $1)
        `, [today]);
        
        if (completedResult.rows.length > 0) {
            // Reset toutes les missions qui ont été complétées avant aujourd'hui
            await pool.query(`
                UPDATE missions 
                SET is_completed = FALSE, completed_date = NULL 
                WHERE is_completed = TRUE 
                AND (completed_date IS NULL OR completed_date < $1)
            `, [today]);
            
            console.log(`🔄 Reset quotidien: ${completedResult.rows.length} missions remises à disposition`);
        }
    } catch (error) {
        console.error('Erreur lors du reset quotidien:', error);
    }
};

// Fonction pour marquer une mission comme complétée
const markMissionCompleted = async (missionId) => {
    try {
        const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
        await pool.query(`
            UPDATE missions 
            SET is_completed = TRUE, completed_date = $1 
            WHERE id = $2
        `, [today, missionId]);
        
        console.log(`✅ Mission ${missionId} marquée comme complétée pour aujourd'hui`);
    } catch (error) {
        console.error('Erreur lors du marquage de la mission:', error);
    }
};

// Routes de base
app.get('/', (req, res) => {
    res.json({ 
        message: 'API CrazyReal - Backend en cours d\'exécution',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Routes utilisateurs
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, first_name, last_name } = req.body;
        
        // Validation des données
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email et password sont requis' });
        }

        // Hash du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertion en base de données
        const result = await pool.query(
            'INSERT INTO users (username, email, password, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [username, email, hashedPassword, first_name, last_name]
        );

        res.status(201).json({ 
            message: 'Utilisateur créé avec succès',
            userId: result.rows[0].id
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ error: 'Username ou email déjà utilisé' });
        } else {
            console.error('Erreur lors de l\'inscription:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Récupération de l'utilisateur
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND is_active = TRUE',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        const user = result.rows[0];

        // Vérification du mot de passe
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        // Génération du token JWT
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET || 'votre_secret_jwt',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Connexion réussie',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name
            }
        });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Routes missions
app.get('/api/missions', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT m.*, u.username as creator_username 
            FROM missions m 
            JOIN users u ON m.creator_id = u.id 
            WHERE m.status = 'active'
            ORDER BY m.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des missions:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour la mission du jour
app.get('/api/missions/today', async (req, res) => {
    try {
        // D'abord, vérifier s'il faut reset les missions (nouveau jour)
        await resetDailyMissions();
        
        // Récupérer la mission du jour (plus ancienne non complétée)
        const result = await pool.query(`
            SELECT m.*, u.username as creator_username 
            FROM missions m 
            JOIN users u ON m.creator_id = u.id 
            WHERE m.status = 'active' AND m.is_completed = FALSE
            ORDER BY m.created_at ASC
            LIMIT 1
        `);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Aucune mission disponible' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erreur lors de la récupération de la mission du jour:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Vérifier si un utilisateur a déjà fait une mission
app.get('/api/missions/:id/completed', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM user_missions WHERE user_id = $1 AND mission_id = $2',
            [req.user.userId, req.params.id]
        );
        
        res.json({ completed: result.rows.length > 0 });
    } catch (error) {
        console.error('Erreur lors de la vérification de la mission:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.post('/api/missions', authenticateToken, async (req, res) => {
    try {
        const { title, description, location, latitude, longitude, reward_points, difficulty_level, max_participants, start_date, end_date } = req.body;
        
        const result = await pool.query(
            'INSERT INTO missions (title, description, creator_id, location, latitude, longitude, reward_points, difficulty_level, max_participants, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id',
            [title, description, req.user.userId, location, latitude, longitude, reward_points, difficulty_level, max_participants, start_date, end_date]
        );

        res.status(201).json({
            message: 'Mission créée avec succès',
            missionId: result.rows[0].id
        });
    } catch (error) {
        console.error('Erreur lors de la création de la mission:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.get('/api/missions/:id', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT m.*, u.username as creator_username 
            FROM missions m 
            JOIN users u ON m.creator_id = u.id 
            WHERE m.id = $1
        `, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Mission non trouvée' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erreur lors de la récupération de la mission:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Routes pictures
app.post('/api/pictures', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Aucun fichier uploadé' });
        }

        const { mission_id, description } = req.body;
        
        // Vérifier si l'utilisateur a déjà fait cette mission
        const existingResult = await pool.query(
            'SELECT * FROM user_missions WHERE user_id = $1 AND mission_id = $2',
            [req.user.userId, mission_id]
        );
        
        if (existingResult.rows.length > 0) {
            return res.status(400).json({ error: 'Vous avez déjà complété cette mission' });
        }
        
        // Utiliser une transaction pour insérer l'image et marquer la mission comme faite
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Insérer l'image
            const result = await client.query(
                'INSERT INTO pictures (filename, original_name, file_path, file_size, mime_type, mission_id, user_id, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
                [req.file.filename, req.file.originalname, req.file.path, req.file.size, req.file.mimetype, mission_id, req.user.userId, description]
            );
            
            // Marquer la mission comme complétée pour cet utilisateur
            await client.query(
                'INSERT INTO user_missions (user_id, mission_id) VALUES ($1, $2)',
                [req.user.userId, mission_id]
            );
            
            // Marquer la mission globale comme complétée (plus disponible aujourd'hui)
            await markMissionCompleted(mission_id);
            
            await client.query('COMMIT');
            client.release();
            
            res.status(201).json({
                message: 'Image uploadée avec succès et mission complétée !',
                pictureId: result.rows[0].id,
                filename: req.file.filename
            });
        } catch (error) {
            await client.query('ROLLBACK');
            client.release();
            throw error;
        }
        
    } catch (error) {
        console.error('Erreur lors de l\'upload de l\'image:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.get('/api/pictures/mission/:missionId', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, u.username 
            FROM pictures p 
            JOIN users u ON p.user_id = u.id 
            WHERE p.mission_id = $1 AND p.is_public = TRUE
            ORDER BY p.upload_date DESC
        `, [req.params.missionId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des images:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour récupérer les images de la mission du jour
app.get('/api/pictures/today', async (req, res) => {
    try {
        // D'abord, vérifier s'il faut reset les missions (nouveau jour)
        await resetDailyMissions();
        
        // Récupérer la mission du jour (plus ancienne non complétée)
        const missionsResult = await pool.query(`
            SELECT * FROM missions 
            WHERE status = 'active' AND is_completed = FALSE 
            ORDER BY created_at ASC 
            LIMIT 1
        `);
        
        if (missionsResult.rows.length === 0) {
            return res.json([]);
        }
        
        const todayMissionId = missionsResult.rows[0].id;
        
        // Récupérer toutes les images de cette mission
        const result = await pool.query(`
            SELECT p.*, u.username, u.first_name, u.last_name
            FROM pictures p 
            JOIN users u ON p.user_id = u.id 
            WHERE p.mission_id = $1 AND p.is_public = TRUE
            ORDER BY p.upload_date DESC
        `, [todayMissionId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des images du jour:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Servir les fichiers statiques (images uploadées)
app.use('/uploads', express.static('uploads'));

// Gestion des erreurs globales
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'Fichier trop volumineux (max 5MB)' });
        }
    }
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
});

// Route admin pour reset manuel des missions (utile pour les tests)
app.post('/api/admin/reset-missions', async (req, res) => {
    try {
        await resetDailyMissions();
        res.json({ message: 'Reset des missions effectué avec succès' });
    } catch (error) {
        console.error('Erreur lors du reset manuel:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route 404
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

// Fonction pour démarrer le système de reset quotidien
const startDailyResetScheduler = () => {
    // Reset au démarrage du serveur (désactivé temporairement pour éviter les erreurs d'auth)
    // resetDailyMissions();
    
    // Programmer le reset quotidien à minuit
    const scheduleNextReset = () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0); // Minuit
        
        const msUntilMidnight = tomorrow.getTime() - now.getTime();
        
        setTimeout(() => {
            resetDailyMissions();
            scheduleNextReset(); // Programmer le prochain reset
        }, msUntilMidnight);
        
        console.log(`⏰ Prochain reset des missions: ${tomorrow.toLocaleString('fr-FR')}`);
    };
    
    scheduleNextReset();
};

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur CrazyReal démarré sur le port ${PORT}`);
    console.log(`📱 API disponible sur http://localhost:${PORT}`);
    console.log(`📊 Base de données PostgreSQL: ${process.env.DB_NAME || 'crazyreal'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`);
    
    // Démarrer le système de reset quotidien
    startDailyResetScheduler();
});

// Gestion propre de l'arrêt du serveur
process.on('SIGINT', async () => {
    console.log('\n🛑 Arrêt du serveur...');
    await pool.end();
    process.exit(0);
});