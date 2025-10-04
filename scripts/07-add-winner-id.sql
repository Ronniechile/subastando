-- Add winner_id column to auctions table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'auctions' 
        AND column_name = 'winner_id'
    ) THEN
        ALTER TABLE public.auctions 
        ADD COLUMN winner_id UUID REFERENCES public.profiles(id);
        
        RAISE NOTICE 'Column winner_id added successfully';
    ELSE
        RAISE NOTICE 'Column winner_id already exists';
    END IF;
END $$;
