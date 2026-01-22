-- Create table for storing AI API keys
CREATE TABLE IF NOT EXISTS public.ai_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL UNIQUE CHECK (provider IN ('openai', 'gemini', 'anthropic', 'cohere')),
  api_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ai_api_keys_provider ON public.ai_api_keys(provider);
CREATE INDEX IF NOT EXISTS idx_ai_api_keys_is_active ON public.ai_api_keys(is_active);

-- Enable Row Level Security
ALTER TABLE public.ai_api_keys ENABLE ROW LEVEL SECURITY;

-- Create policies for API keys (Admin only access)
CREATE POLICY "Admin users can view API keys"
ON public.ai_api_keys
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role IN ('super_admin', 'admin')
  )
);

CREATE POLICY "Admin users can insert API keys"
ON public.ai_api_keys
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role IN ('super_admin', 'admin')
  )
);

CREATE POLICY "Admin users can update API keys"
ON public.ai_api_keys
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role IN ('super_admin', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role IN ('super_admin', 'admin')
  )
);

CREATE POLICY "Admin users can delete API keys"
ON public.ai_api_keys
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role IN ('super_admin', 'admin')
  )
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_ai_api_keys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS trigger_update_ai_api_keys_updated_at ON public.ai_api_keys;
CREATE TRIGGER trigger_update_ai_api_keys_updated_at
BEFORE UPDATE ON public.ai_api_keys
FOR EACH ROW
EXECUTE FUNCTION public.update_ai_api_keys_updated_at();

COMMENT ON TABLE public.ai_api_keys IS 'Stores API keys for various AI providers';
COMMENT ON COLUMN public.ai_api_keys.provider IS 'AI provider name: openai, gemini, anthropic, cohere';
COMMENT ON COLUMN public.ai_api_keys.api_key IS 'Encrypted API key for the provider';
COMMENT ON COLUMN public.ai_api_keys.is_active IS 'Whether this API key is currently active';
