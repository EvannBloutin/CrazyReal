-- Base de données CrazyReal pour PostgreSQL
-- Création de la base de données (à exécuter séparément si nécessaire)
-- CREATE DATABASE crazyreal;

-- Table users (PostgreSQL utilise souvent le pluriel)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    profile_picture VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Types ENUM pour PostgreSQL
CREATE TYPE difficulty_level_enum AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE status_enum AS ENUM ('active', 'completed', 'expired');

-- Table missions
CREATE TABLE IF NOT EXISTS missions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    creator_id INTEGER NOT NULL,
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    reward_points INTEGER DEFAULT 0,
    difficulty_level difficulty_level_enum DEFAULT 'easy',
    status status_enum DEFAULT 'active',
    max_participants INTEGER DEFAULT 1,
    current_participants INTEGER DEFAULT 0,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table pictures
CREATE TABLE IF NOT EXISTS pictures (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    mission_id INTEGER,
    user_id INTEGER,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table user_missions pour tracker qui a fait quelle mission
CREATE TABLE IF NOT EXISTS user_missions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    mission_id INTEGER NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE,
    UNIQUE (user_id, mission_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_missions_creator ON missions(creator_id);
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_completed ON missions(is_completed);
CREATE INDEX IF NOT EXISTS idx_missions_completed_date ON missions(completed_date);
CREATE INDEX IF NOT EXISTS idx_pictures_mission ON pictures(mission_id);
CREATE INDEX IF NOT EXISTS idx_pictures_user ON pictures(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_user ON user_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_mission ON user_missions(mission_id);

-- Données d'exemple (optionnel)
INSERT INTO users (username, email, password, first_name, last_name) VALUES
('admin', 'admin@crazyreal.com', '$2b$10$example_hashed_password', 'Admin', 'User'),
('testuser', 'test@example.com', '$2b$10$example_hashed_password', 'Test', 'User');

INSERT INTO missions (title, description, creator_id, location, reward_points, difficulty_level, is_completed) VALUES
('Mission Test', 'Une mission de test pour vérifier le fonctionnement', 1, 'Paris, France', 100, 'easy', FALSE),
('Photo Challenge', 'Prendre une photo d''un monument historique', 1, 'Lyon, France', 200, 'medium', FALSE),
('Nature Walk', 'Photographier un paysage naturel dans votre région', 1, 'Partout en France', 150, 'easy', FALSE),
('Street Art Hunt', 'Trouvez et photographiez une œuvre de street art', 1, 'Centre-ville', 180, 'medium', FALSE),
('Sunset Challenge', 'Capturez un magnifique coucher de soleil', 1, 'Horizon dégagé', 220, 'hard', FALSE);

-- Message de fin
SELECT 'Base de données CrazyReal créée avec succès !' as message;