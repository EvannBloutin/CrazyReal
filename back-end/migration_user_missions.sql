-- Migration: Ajouter la table user_missions
-- À exécuter avec: mysql -u root -p crazyreal < migration_user_missions.sql

USE crazyreal;

-- Ajouter la table user_missions si elle n'existe pas déjà
CREATE TABLE IF NOT EXISTS user_missions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    mission_id INT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (mission_id) REFERENCES mission(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_mission (user_id, mission_id)
);

-- Ajouter les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_missions_user ON user_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_mission ON user_missions(mission_id);

SELECT 'Migration terminée: table user_missions créée avec succès' as message;