-- Insert sample testimonials
-- This must be run AFTER 008_testimonials_table.sql and 009_testimonials_policies.sql

INSERT INTO public.testimonials (name, role, company, rating, testimonial, is_featured, is_active, display_order) 
VALUES
('Gabrielle Williams', 'CEO and Co-founder', 'ABC Company', 5, 'Creative geniuses who listen, understand, and craft captivating visuals - an agency that truly understands our needs.', true, true, 1),
('Samantha Johnson', 'CTO and Co-founder', 'ABC Company', 5, 'Exceeded our expectations with innovative designs that brought our vision to life - a truly remarkable creative agency.', true, true, 2),
('Isabella Rodriguez', 'CEO and Co-founder', 'ABC Company', 5, 'Their ability to capture our brand essence in every project is unparalleled - an invaluable creative collaborator.', true, true, 3),
('Natalie Martinez', 'CEO and Co-founder', 'ABC Company', 5, 'From concept to execution, their creativity knows no bounds - a game-changer for our brand''s success.', true, true, 4),
('Victoria Thompson', 'CEO and Co-founder', 'ABC Company', 5, 'A refreshing and imaginative agency that consistently delivers exceptional results - highly recommended for any project.', true, true, 5),
('John Peterson', 'CEO and Co-founder', 'ABC Company', 5, 'Their team''s artistic approach and strategic thinking created remarkable campaigns - a reliable creative partner.', true, true, 6)
ON CONFLICT DO NOTHING;
