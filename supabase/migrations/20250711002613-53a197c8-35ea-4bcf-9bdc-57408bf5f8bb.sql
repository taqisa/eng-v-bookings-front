-- Create RLS policies for google_accounts table

-- Allow reading Google accounts for providers (used by calendar service)
CREATE POLICY "Allow reading google accounts for providers" 
ON public.google_accounts 
FOR SELECT 
USING (true);

-- Allow inserting Google accounts (for OAuth callback)
CREATE POLICY "Allow inserting google accounts" 
ON public.google_accounts 
FOR INSERT 
WITH CHECK (true);

-- Allow updating Google accounts (for token refresh)
CREATE POLICY "Allow updating google accounts" 
ON public.google_accounts 
FOR UPDATE 
USING (true);

-- Allow deleting Google accounts (for disconnection)
CREATE POLICY "Allow deleting google accounts" 
ON public.google_accounts 
FOR DELETE 
USING (true);