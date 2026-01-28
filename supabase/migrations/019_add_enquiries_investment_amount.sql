-- Add investment_amount to enquiries table to support Invest Now form
ALTER TABLE public.enquiries 
ADD COLUMN IF NOT EXISTS investment_amount DECIMAL(15, 2);

-- Also add to validation schema in comments if needed, but DB is primary blocker for 400 error
-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'enquiries' AND column_name = 'investment_amount';
