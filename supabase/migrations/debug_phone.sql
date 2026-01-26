-- Check exact phone format
SELECT id, email, phone, LENGTH(phone) as phone_length FROM public.users WHERE phone IS NOT NULL;

-- Also check if there's a format issue - search with LIKE
SELECT * FROM public.users WHERE phone LIKE '%8220115779%';
