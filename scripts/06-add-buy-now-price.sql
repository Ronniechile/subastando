-- Agregando campo buy_now_price a la tabla auctions
ALTER TABLE public.auctions 
ADD COLUMN buy_now_price numeric;

-- Agregando comentario para documentar el campo
COMMENT ON COLUMN public.auctions.buy_now_price IS 'Precio de compra inmediata opcional. Si una puja iguala este precio, la subasta se adjudica inmediatamente.';
