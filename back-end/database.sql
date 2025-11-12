-- Base de données CrazyReal
-- Création de la base de données
CREATE DATABASE IF NOT EXISTS crazyreal;
USE crazyreal;

-- Table user
CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    profile_picture VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Table mission
CREATE TABLE IF NOT EXISTS mission (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    creator_id INT NOT NULL,
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    reward_points INT DEFAULT 0,
    difficulty_level ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
    status ENUM('active', 'completed', 'expired') DEFAULT 'active',
    max_participants INT DEFAULT 1,
    current_participants INT DEFAULT 0,
    start_date DATETIME,
    end_date DATETIME,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Table pictures
CREATE TABLE IF NOT EXISTS pictures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    mission_id INT,
    user_id INT,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (mission_id) REFERENCES mission(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Table user_missions pour tracker qui a fait quelle mission
CREATE TABLE IF NOT EXISTS user_missions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    mission_id INT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (mission_id) REFERENCES mission(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_mission (user_id, mission_id)
);

-- Index pour améliorer les performances
CREATE INDEX idx_user_email ON user(email);
CREATE INDEX idx_user_username ON user(username);
CREATE INDEX idx_mission_creator ON mission(creator_id);
CREATE INDEX idx_mission_status ON mission(status);
CREATE INDEX idx_mission_completed ON mission(is_completed);
CREATE INDEX idx_mission_completed_date ON mission(completed_date);
CREATE INDEX idx_pictures_mission ON pictures(mission_id);
CREATE INDEX idx_pictures_user ON pictures(user_id);
CREATE INDEX idx_user_missions_user ON user_missions(user_id);
CREATE INDEX idx_user_missions_mission ON user_missions(mission_id);

-- Données d'exemple (optionnel)
INSERT INTO user (username, email, password, first_name, last_name) VALUES
('admin', 'admin@crazyreal.com', '$2b$10$example_hashed_password', 'Admin', 'User'),
('testuser', 'test@example.com', '$2b$10$example_hashed_password', 'Test', 'User');

INSERT INTO mission (title, description, creator_id, location, reward_points, difficulty_level, is_completed) VALUES
('Mission Test', 'Une mission de test pour vérifier le fonctionnement', 1, 'Paris, France', 100, 'easy', FALSE),
('Photo Challenge', 'Prendre une photo d\'un monument historique', 1, 'Lyon, France', 200, 'medium', FALSE),
('Nature Walk', 'Photographier un paysage naturel dans votre région', 1, 'Partout en France', 150, 'easy', FALSE),
('Street Art Hunt', 'Trouvez et photographiez une œuvre de street art', 1, 'Centre-ville', 180, 'medium', FALSE),
('Sunset Challenge', 'Capturez un magnifique coucher de soleil', 1, 'Horizon dégagé', 220, 'hard', FALSE);

-- Message de fin
SELECT 'Base de données CrazyReal créée avec succès !' as message;