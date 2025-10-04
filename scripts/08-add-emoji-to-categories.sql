-- Agregar campo emoji a la tabla categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '⚽';

-- Actualizar las categorías existentes con sus emojis
UPDATE categories SET emoji = '⚽' WHERE name = 'Fútbol';
UPDATE categories SET emoji = '🏀' WHERE name = 'Básquetbol';
UPDATE categories SET emoji = '⚾' WHERE name = 'Béisbol';
UPDATE categories SET emoji = '🎾' WHERE name = 'Tenis';
UPDATE categories SET emoji = '🏈' WHERE name = 'Fútbol Americano';
UPDATE categories SET emoji = '🏒' WHERE name = 'Hockey';
