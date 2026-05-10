-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can view all profiles
CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Products
CREATE TABLE public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL DEFAULT '',
  price integer NOT NULL DEFAULT 0,
  price_label text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  details text[] NOT NULL DEFAULT '{}',
  sizes jsonb NOT NULL DEFAULT '{}'::jsonb,
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products" ON public.products
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admins insert products" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update products" ON public.products
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete products" ON public.products
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER products_touch
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed initial products
INSERT INTO public.products (id, name, category, price, price_label, description, details, sizes, sort_order) VALUES
('midnight-hoodie', 'Midnight Hoodie', 'Outerwear', 220, '€220',
 'Heavyweight 480gsm brushed cotton hoodie in washed black. Boxy fit, dropped shoulders, oversized hood. Made in Portugal.',
 ARRAY['100% organic cotton, 480gsm','Garment-dyed washed black','Oversized boxy fit','Made in Portugal'],
 '{"S":true,"M":true,"L":true,"XL":true}'::jsonb, 1),
('boxy-tee-001', 'Boxy Tee 001', 'Tops', 95, '€95',
 'Heavy 280gsm cotton jersey tee. Boxy silhouette, ribbed crewneck, raw hem. Quiet branding.',
 ARRAY['100% combed cotton, 280gsm','Boxy fit','Reinforced ribbed neck','Made in Portugal'],
 '{"S":true,"M":true,"L":true,"XL":true}'::jsonb, 2),
('cargo-pant-noir', 'Cargo Pant Noir', 'Bottoms', 280, '€280',
 'Wide-leg cargo trouser in matte black ripstop. Reinforced knees, oversized side pockets, drawcord cuffs.',
 ARRAY['100% cotton ripstop','Wide leg, mid rise','Six-pocket construction','Made in Italy'],
 '{"28":true,"30":true,"32":true,"34":true,"36":true}'::jsonb, 3),
('bomber-eclipse', 'Bomber Eclipse', 'Outerwear', 520, '€520',
 'Technical bomber jacket with matte nylon shell, ribbed collar and cuffs, concealed front zip. Lined.',
 ARRAY['Matte nylon shell','Ribbed knit trims','Concealed two-way zip','Lined'],
 '{"S":true,"M":true,"L":true,"XL":true}'::jsonb, 4);

-- Storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

CREATE POLICY "Public read product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admins upload product images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update product images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete product images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));