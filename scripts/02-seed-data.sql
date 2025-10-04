-- Ejecutando script para poblar categorías en la base de datos
-- Insert sample categories
INSERT INTO public.categories (name, description) VALUES
  ('Fútbol', 'Camisetas de equipos de fútbol'),
  ('Básquetbol', 'Camisetas de equipos de básquetbol'),
  ('Béisbol', 'Camisetas de equipos de béisbol'),
  ('Fútbol Americano', 'Camisetas de equipos de fútbol americano'),
  ('Hockey', 'Camisetas de equipos de hockey')
ON CONFLICT (name) DO NOTHING;
