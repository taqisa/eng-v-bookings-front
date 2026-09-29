-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    country text,
    timezone text,
    status text DEFAULT 'active',
    subscription_status text DEFAULT 'trial',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Alter providers table
ALTER TABLE providers 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id),
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS email text UNIQUE;

-- Create default organization for existing providers to avoid breaking existing data
DO $$
DECLARE 
    org_id uuid;
    provider_record RECORD;
BEGIN
    FOR provider_record IN SELECT id, name FROM providers WHERE organization_id IS NULL LOOP
        -- Generate a simple slug from name (this is basic, but prevents null constraints)
        -- Real production environments might need manual cleanup of slugs
        INSERT INTO organizations (name, slug, country, timezone) 
        VALUES (provider_record.name, 'org-' || substr(md5(random()::text), 1, 8), 'US', 'America/New_York') 
        RETURNING id INTO org_id;
        
        UPDATE providers 
        SET organization_id = org_id, 
            slug = 'provider-' || substr(md5(random()::text), 1, 8) 
        WHERE id = provider_record.id;
    END LOOP;
END $$;

-- Now that all providers have an organization, we could potentially make organization_id NOT NULL
-- ALTER TABLE providers ALTER COLUMN organization_id SET NOT NULL;

-- Set up Row Level Security (RLS)

-- Enable RLS on organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Public can read active organizations
CREATE POLICY "Public can view active organizations" 
ON organizations FOR SELECT 
USING (status = 'active');

-- Enable RLS on providers if not already enabled
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- Public can read providers
CREATE POLICY "Public can view providers" 
ON providers FOR SELECT 
USING (true);

-- Enable RLS on bookings if not already enabled
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookings
CREATE POLICY "Users can view their own bookings"
ON bookings FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own bookings
CREATE POLICY "Users can insert their own bookings"
ON bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings
CREATE POLICY "Users can update their own bookings"
ON bookings FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own bookings
CREATE POLICY "Users can delete their own bookings"
ON bookings FOR DELETE
USING (auth.uid() = user_id);

-- Create index for slugs to make routing fast
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_providers_slug ON providers(slug);
