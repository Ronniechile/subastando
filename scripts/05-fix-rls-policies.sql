-- Corrigiendo políticas RLS para permitir creación de subastas
-- Deshabilitar RLS temporalmente para auctions
ALTER TABLE auctions DISABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view all auctions" ON auctions;
DROP POLICY IF EXISTS "Users can insert their own auctions" ON auctions;
DROP POLICY IF EXISTS "Users can update their own auctions" ON auctions;

-- Crear nuevas políticas más permisivas
-- Permitir a todos ver las subastas
CREATE POLICY "Anyone can view auctions" ON auctions
    FOR SELECT USING (true);

-- Permitir a usuarios autenticados crear subastas
CREATE POLICY "Authenticated users can create auctions" ON auctions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir a los propietarios actualizar sus subastas
CREATE POLICY "Users can update own auctions" ON auctions
    FOR UPDATE USING (auth.uid() = seller_id);

-- Permitir a los propietarios eliminar sus subastas
CREATE POLICY "Users can delete own auctions" ON auctions
    FOR DELETE USING (auth.uid() = seller_id);

-- Habilitar RLS nuevamente
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;

-- Asegurar que las otras tablas tengan políticas correctas
-- Políticas para bids
ALTER TABLE bids DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all bids" ON bids;
DROP POLICY IF EXISTS "Users can insert bids" ON bids;

CREATE POLICY "Anyone can view bids" ON bids
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create bids" ON bids
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Anyone can view profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para categories (solo lectura para usuarios normales)
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;

CREATE POLICY "Anyone can view categories" ON categories
    FOR SELECT USING (true);

-- Solo permitir inserción/actualización/eliminación a través de funciones específicas
CREATE POLICY "Service role can manage categories" ON categories
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
