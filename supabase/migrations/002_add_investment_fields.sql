-- ========================================
-- ADD INVESTMENT FIELDS TO PROPERTIES TABLE
-- ========================================

-- Add investment-related fields
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS investment_type TEXT DEFAULT 'fractional' CHECK (investment_type IN ('fractional', 'full', 'equity'));
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS total_investment_amount DECIMAL(15, 2);
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS minimum_investment DECIMAL(15, 2);
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS maximum_investment DECIMAL(15, 2);
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS investment_slots INTEGER DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS filled_slots INTEGER DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS expected_roi_percentage DECIMAL(5, 2);
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS investment_duration_months INTEGER;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS rental_yield_percentage DECIMAL(5, 2);
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS appreciation_rate DECIMAL(5, 2);

-- Property ratings and reviews
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS average_rating DECIMAL(2, 1) DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- Developer information
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS developer_name TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS developer_logo TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS years_of_experience INTEGER;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS total_projects INTEGER;

-- Legal and compliance
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS rera_number TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS possession_date DATE;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS legal_status TEXT DEFAULT 'verified' CHECK (legal_status IN ('verified', 'pending', 'approved'));

-- Documents and media
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS brochure_url TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS floor_plan_url TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS layout_plan_url TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS video_tour_url TEXT;

-- Additional property details
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS super_area_sqft INTEGER;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS carpet_area_sqft INTEGER;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS parking_spaces INTEGER DEFAULT 0;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS floor_number INTEGER;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS total_floors INTEGER;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS furnishing_status TEXT CHECK (furnishing_status IN ('unfurnished', 'semi-furnished', 'fully-furnished'));
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS facing TEXT;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS age_years INTEGER;

-- Financial highlights
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS estimated_monthly_rental DECIMAL(12, 2);
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS maintenance_charges DECIMAL(10, 2);
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS property_tax DECIMAL(10, 2);

-- Investment features (JSON for flexibility)
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS investment_highlights TEXT[];
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}';

-- ========================================
-- PROPERTY INVESTORS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.property_investors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  investment_amount DECIMAL(15, 2) NOT NULL,
  number_of_slots INTEGER NOT NULL DEFAULT 1,
  investment_status TEXT NOT NULL DEFAULT 'pending' CHECK (investment_status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_id TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  investment_date TIMESTAMPTZ DEFAULT NOW(),
  returns_earned DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, user_id)
);

-- ========================================
-- PROPERTY REVIEWS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.property_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  investment_experience TEXT CHECK (investment_experience IN ('excellent', 'good', 'average', 'poor')),
  is_verified_investor BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, user_id)
);

-- ========================================
-- PROPERTY DOCUMENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.property_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('rera', 'legal', 'financial', 'floor_plan', 'brochure', 'other')),
  document_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_property_investors_property ON public.property_investors(property_id);
CREATE INDEX IF NOT EXISTS idx_property_investors_user ON public.property_investors(user_id);
CREATE INDEX IF NOT EXISTS idx_property_investors_status ON public.property_investors(investment_status);
CREATE INDEX IF NOT EXISTS idx_property_reviews_property ON public.property_reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_property_reviews_approved ON public.property_reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_property_documents_property ON public.property_documents(property_id);
CREATE INDEX IF NOT EXISTS idx_properties_investment_type ON public.properties(investment_type);
CREATE INDEX IF NOT EXISTS idx_properties_rera ON public.properties(rera_number);

-- ========================================
-- UPDATE TRIGGERS
-- ========================================
CREATE TRIGGER update_property_investors_updated_at 
  BEFORE UPDATE ON public.property_investors 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_reviews_updated_at 
  BEFORE UPDATE ON public.property_reviews 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- FUNCTION TO UPDATE PROPERTY RATING
-- ========================================
CREATE OR REPLACE FUNCTION update_property_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.properties
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.property_reviews
      WHERE property_id = NEW.property_id AND is_approved = true
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.property_reviews
      WHERE property_id = NEW.property_id AND is_approved = true
    )
  WHERE id = NEW.property_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_property_rating
  AFTER INSERT OR UPDATE ON public.property_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_property_rating();

-- ========================================
-- FUNCTION TO UPDATE FILLED SLOTS
-- ========================================
CREATE OR REPLACE FUNCTION update_filled_slots()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.properties
  SET filled_slots = (
    SELECT COALESCE(SUM(number_of_slots), 0)
    FROM public.property_investors
    WHERE property_id = COALESCE(NEW.property_id, OLD.property_id)
    AND investment_status = 'confirmed'
  )
  WHERE id = COALESCE(NEW.property_id, OLD.property_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_filled_slots
  AFTER INSERT OR UPDATE OR DELETE ON public.property_investors
  FOR EACH ROW
  EXECUTE FUNCTION update_filled_slots();
