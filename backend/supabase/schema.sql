-- FarmEase Smart Cattle Management System
-- Supabase PostgreSQL Database Schema & Security Policies

-- 1. ENUMS & CONSTANTS
CREATE TYPE user_role AS ENUM ('admin', 'farmer', 'veterinarian', 'worker');
CREATE TYPE cattle_gender AS ENUM ('female', 'male');
CREATE TYPE health_status AS ENUM ('healthy', 'sick', 'under_treatment', 'quarantined', 'pregnant');
CREATE TYPE lactation_stage AS ENUM ('early', 'mid', 'late', 'dry', 'heifer', 'bull');
CREATE TYPE milk_session AS ENUM ('morning', 'evening');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'completed');
CREATE TYPE transaction_type AS ENUM ('income', 'expense');

-- 2. USER PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'worker',
    avatar_url TEXT,
    phone TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CATTLE TABLE
CREATE TABLE IF NOT EXISTS public.cattle (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tag_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    breed TEXT NOT NULL,
    gender cattle_gender NOT NULL DEFAULT 'female',
    date_of_birth DATE NOT NULL,
    weight_kg NUMERIC(6,2) NOT NULL,
    health_status health_status NOT NULL DEFAULT 'healthy',
    lactation_stage lactation_stage NOT NULL DEFAULT 'heifer',
    image_url TEXT,
    sire_tag TEXT,
    dam_tag TEXT,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. MILK LOGS TABLE
CREATE TABLE IF NOT EXISTS public.milk_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cattle_id UUID NOT NULL REFERENCES public.cattle(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    session milk_session NOT NULL,
    yield_liters NUMERIC(5,2) NOT NULL,
    fat_percentage NUMERIC(4,2),
    snf_percentage NUMERIC(4,2),
    notes TEXT,
    recorded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. HEALTH & VETERINARY RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.health_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cattle_id UUID NOT NULL REFERENCES public.cattle(id) ON DELETE CASCADE,
    record_type TEXT NOT NULL, -- e.g., 'Checkup', 'Treatment', 'Disease', 'Surgery'
    diagnosis TEXT NOT NULL,
    treatment TEXT,
    medicine_prescribed TEXT,
    veterinarian_name TEXT,
    cost NUMERIC(10,2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'resolved'
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    recorded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. VACCINATIONS TABLE
CREATE TABLE IF NOT EXISTS public.vaccinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cattle_id UUID NOT NULL REFERENCES public.cattle(id) ON DELETE CASCADE,
    vaccine_name TEXT NOT NULL,
    administered_date DATE NOT NULL,
    next_due_date DATE NOT NULL,
    batch_number TEXT,
    administered_by TEXT,
    status TEXT DEFAULT 'completed', -- 'completed', 'scheduled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. BREEDING & REPRODUCTION RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.breeding_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cattle_id UUID NOT NULL REFERENCES public.cattle(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'Heat', 'Insemination', 'Pregnancy Check', 'Calving'
    event_date DATE NOT NULL,
    sire_info TEXT,
    expected_calving_date DATE,
    actual_calving_date DATE,
    outcome TEXT, -- 'Successful', 'Failed', 'Pending'
    notes TEXT,
    technician_name TEXT,
    recorded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. FEED & INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Fodder', 'Supplements', 'Medicines', 'Equipment'
    quantity NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    unit TEXT NOT NULL, -- 'kg', 'liters', 'units', 'bags'
    reorder_level NUMERIC(10,2) NOT NULL DEFAULT 10.00,
    unit_cost NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    supplier TEXT,
    last_restocked DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. FINANCIAL TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type transaction_type NOT NULL,
    category TEXT NOT NULL, -- 'Milk Sale', 'Cattle Sale', 'Feed Purchase', 'Veterinary', 'Labor', 'Equipment'
    amount NUMERIC(12,2) NOT NULL,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    reference_id TEXT,
    recorded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. FARM TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES public.profiles(id),
    priority task_priority NOT NULL DEFAULT 'medium',
    status task_status NOT NULL DEFAULT 'todo',
    due_date DATE NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cattle ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milk_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breeding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view profiles
CREATE POLICY "Allow authenticated read profiles" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to cattle" ON public.cattle FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to milk_logs" ON public.milk_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to health_records" ON public.health_records FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to vaccinations" ON public.vaccinations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to breeding_records" ON public.breeding_records FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to inventory" ON public.inventory FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to financial_transactions" ON public.financial_transactions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users full access to tasks" ON public.tasks FOR ALL USING (auth.role() = 'authenticated');

-- AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Farm Employee'),
        COALESCE((new.raw_user_meta_data->>'role')::user_role, 'farmer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- PHASE 1: QR Digital Identity Foundation
-- Migration: Extend cattle table with Digital Identity fields
-- Run this migration on existing Supabase deployments
-- =============================================================================

-- Add Digital Identity columns to existing cattle table (idempotent)
ALTER TABLE public.cattle ADD COLUMN IF NOT EXISTS digital_identity_id TEXT UNIQUE;
ALTER TABLE public.cattle ADD COLUMN IF NOT EXISTS public_profile_slug TEXT UNIQUE;
ALTER TABLE public.cattle ADD COLUMN IF NOT EXISTS qr_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (qr_status IN ('pending', 'active', 'inactive'));
ALTER TABLE public.cattle ADD COLUMN IF NOT EXISTS qr_created_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.cattle ADD COLUMN IF NOT EXISTS qr_updated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.cattle ADD COLUMN IF NOT EXISTS last_qr_generated TIMESTAMP WITH TIME ZONE;

-- Index for fast lookups by Digital Identity ID
CREATE INDEX IF NOT EXISTS idx_cattle_digital_identity_id ON public.cattle(digital_identity_id);
-- Index for slug-based public profile URL lookups
CREATE INDEX IF NOT EXISTS idx_cattle_public_profile_slug ON public.cattle(public_profile_slug);

-- Auto-update qr_updated_at timestamp on any change to identity fields
CREATE OR REPLACE FUNCTION public.handle_cattle_identity_update()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.qr_status IS DISTINCT FROM OLD.qr_status) OR
       (NEW.digital_identity_id IS DISTINCT FROM OLD.digital_identity_id) OR
       (NEW.public_profile_slug IS DISTINCT FROM OLD.public_profile_slug) THEN
        NEW.qr_updated_at = timezone('utc'::text, now());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_cattle_identity_updated
    BEFORE UPDATE ON public.cattle
    FOR EACH ROW EXECUTE FUNCTION public.handle_cattle_identity_update();

-- =============================================================================
-- PHASE 2 PREPARATION: QR Identity Counter Table
-- This table will be used in Phase 2 to maintain persistent, atomic,
-- database-safe sequence counters for Digital Identity ID generation.
-- Created now so Phase 2 can use it without schema changes.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.identity_counters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER NOT NULL UNIQUE,
    last_sequence INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.identity_counters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admin full access to identity_counters"
    ON public.identity_counters FOR ALL USING (auth.role() = 'authenticated');

