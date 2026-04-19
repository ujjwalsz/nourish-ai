-- Auto-update timestamps function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  dietary_preference TEXT NOT NULL DEFAULT 'balanced',
  daily_calorie_goal INTEGER NOT NULL DEFAULT 2200,
  daily_protein_goal INTEGER NOT NULL DEFAULT 130,
  daily_carbs_goal INTEGER NOT NULL DEFAULT 275,
  daily_fat_goal INTEGER NOT NULL DEFAULT 78,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Meals table
CREATE TABLE public.meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Snack',
  calories NUMERIC NOT NULL DEFAULT 0,
  protein NUMERIC NOT NULL DEFAULT 0,
  carbs NUMERIC NOT NULL DEFAULT 0,
  fat NUMERIC NOT NULL DEFAULT 0,
  fiber NUMERIC NOT NULL DEFAULT 0,
  sugar NUMERIC NOT NULL DEFAULT 0,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meals"
  ON public.meals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals"
  ON public.meals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals"
  ON public.meals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals"
  ON public.meals FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_meals_user_logged ON public.meals(user_id, logged_at DESC);

-- Analyzed foods table
CREATE TABLE public.analyzed_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  serving TEXT,
  description TEXT,
  confidence TEXT,
  source TEXT NOT NULL DEFAULT 'image',
  calories NUMERIC NOT NULL DEFAULT 0,
  protein NUMERIC NOT NULL DEFAULT 0,
  carbs NUMERIC NOT NULL DEFAULT 0,
  fat NUMERIC NOT NULL DEFAULT 0,
  fiber NUMERIC NOT NULL DEFAULT 0,
  sugar NUMERIC NOT NULL DEFAULT 0,
  vitamins JSONB NOT NULL DEFAULT '[]'::jsonb,
  health_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.analyzed_foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyzed foods"
  ON public.analyzed_foods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyzed foods"
  ON public.analyzed_foods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyzed foods"
  ON public.analyzed_foods FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_analyzed_foods_user_created ON public.analyzed_foods(user_id, created_at DESC);