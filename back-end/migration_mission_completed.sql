-- Migration: Ajouter colonnes is_completed et completed_date à la table mission
-- À exécuter avec: mysql -u evann -p crazyreal < migration_mission_completed.sql

USE crazyreal;

-- Ajouter les colonnes si elles n'existent pas déjà
ALTER TABLE mission 
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS completed_date DATE NULL;

-- Ajouter les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_mission_completed ON mission(is_completed);
CREATE INDEX IF NOT EXISTS idx_mission_completed_date ON mission(completed_date);

-- Mettre à jour les missions existantes (toutes non complétées par défaut)
UPDATE mission SET is_completed = FALSE WHERE is_completed IS NULL;

SELECT 'Migration terminée: colonnes is_completed et completed_date ajoutées à la table mission' as message;