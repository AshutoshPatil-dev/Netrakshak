-- Run through the Supabase SQL editor using a privileged database role.
-- These rows have no owner and remain invisible through the authenticated client until explicitly granted.
insert into public.entities (entity_type, display_name, aliases, identifiers, risk_level)
values
  ('person', 'Arjun Pawar', array['अर्जुन पवार'], '{"phone":"+91 98••• 4421","city":"Pune, Maharashtra"}', 'high'),
  ('organization', 'Meera Logistics', array['मीरा लॉजिस्टिक्स'], '{"city":"Nashik, Maharashtra"}', 'medium'),
  ('vehicle', 'MH-12-QR-7742', '{}', '{"city":"Pune, Maharashtra"}', 'medium'),
  ('location', 'Bhosari Industrial Area', array['भोसरी औद्योगिक क्षेत्र'], '{"city":"Pune, Maharashtra"}', 'low')
on conflict do nothing;
