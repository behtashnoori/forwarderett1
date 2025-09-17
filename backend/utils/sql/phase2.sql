-- Phase 2 catalog setup: shipment modes, incoterms, package types

CREATE TABLE IF NOT EXISTS public.shipment_mode (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name_fa TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.incoterm (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name_fa TEXT NOT NULL,
  desc_fa TEXT,
  modes TEXT
);

CREATE TABLE IF NOT EXISTS public.package_type (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name_fa TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shipmode_namefa ON public.shipment_mode (LOWER(name_fa));
CREATE INDEX IF NOT EXISTS idx_incoterm_namefa ON public.incoterm (LOWER(name_fa));
CREATE INDEX IF NOT EXISTS idx_packtype_namefa ON public.package_type (LOWER(name_fa));

INSERT INTO public.shipment_mode (code, name_fa) VALUES
 ('road','جاده‌ای'),
 ('rail','ریلی'),
 ('air','هوایی'),
 ('sea','دریایی')
ON CONFLICT (code) DO UPDATE SET name_fa = EXCLUDED.name_fa;

INSERT INTO public.package_type (code, name_fa) VALUES
 ('box','کارتن/باکس'),
 ('pallet','پالت'),
 ('drum','بشکه'),
 ('bag','کیسه'),
 ('bulk','فله')
ON CONFLICT (code) DO UPDATE SET name_fa = EXCLUDED.name_fa;
