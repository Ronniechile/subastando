-- Agregar campo is_anonymous a la tabla profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;

-- Comentario: Este campo permite a los usuarios aparecer como anónimos en las pujas
COMMENT ON COLUMN profiles.is_anonymous IS 'Si es true, el usuario aparecerá como "Usuario Anónimo" en las pujas públicas';
