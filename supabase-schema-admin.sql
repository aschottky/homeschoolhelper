-- Admin, Suggested Books, and Resources
-- Run in Supabase Dashboard: SQL Editor (after main schema)

-- 1) Admin flag on profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- 2) Suggested Read-Aloud Books (admin-managed; everyone can read)
CREATE TABLE IF NOT EXISTS public.suggested_books (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  title text NOT NULL,
  author text,
  illustrator text,
  age_group text NOT NULL,
  genre text,
  description text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- If the table already exists, add the illustrator column (safe to run again)
ALTER TABLE public.suggested_books ADD COLUMN IF NOT EXISTS illustrator text;

ALTER TABLE public.suggested_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read suggested books"
  ON public.suggested_books FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can manage suggested books"
  ON public.suggested_books FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 3) Homepage Resources (admin-managed)
CREATE TABLE IF NOT EXISTS public.resources (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  category text NOT NULL,
  count_label text,
  items jsonb DEFAULT '[]'::jsonb,
  color text DEFAULT 'sage',
  link text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read resources"
  ON public.resources FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can manage resources"
  ON public.resources FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 4) read_aloud_logs: ensure we can link to suggested_books and track status per child
-- (existing table has book_id text, book_title, book_author, completed, etc.)
-- Add status if missing for want/reading/completed
ALTER TABLE public.read_aloud_logs
ADD COLUMN IF NOT EXISTS status text DEFAULT 'completed' CHECK (status IN ('want', 'reading', 'completed'));

-- Grant
GRANT SELECT ON public.suggested_books TO anon, authenticated;
GRANT ALL ON public.suggested_books TO authenticated;
GRANT SELECT ON public.resources TO anon, authenticated;
GRANT ALL ON public.resources TO authenticated;

-- Optional: make your account admin (replace with your profile id from auth.users)
-- UPDATE public.profiles SET is_admin = true WHERE id = 'YOUR_USER_UUID';
