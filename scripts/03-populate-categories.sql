-- Insertar categorías iniciales en la base de datos con emojis
INSERT INTO categories (id, name, description, emoji, created_at) VALUES
  (gen_random_uuid(), 'Fútbol', 'Camisetas de equipos de fútbol', '⚽', now()),
  (gen_random_uuid(), 'Básquetbol', 'Camisetas de equipos de básquetbol', '🏀', now()),
  (gen_random_uuid(), 'Béisbol', 'Camisetas de equipos de béisbol', '⚾', now()),
  (gen_random_uuid(), 'Tenis', 'Camisetas de tenis', '🎾', now()),
  (gen_random_uuid(), 'Fútbol Americano', 'Camisetas de equipos de fútbol americano', '🏈', now()),
  (gen_random_uuid(), 'Hockey', 'Camisetas de equipos de hockey', '🏒', now())
ON CONFLICT DO NOTHING;
