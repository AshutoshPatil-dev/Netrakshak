-- =============================================================================
-- NETRAKSHAK (नेत्ररक्षक) - Master Intelligence Dataset
-- Problem Statement ID: 26189 · Ministry of Home Affairs / NCRB
-- Comprehensive Criminal Network Dataset: Persons, CDRs, SFinDSet Financials,
-- ANPR Vehicles, Mule Accounts, Cell Towers & Multi-Jurisdiction FIRs.
-- =============================================================================

DO $$
DECLARE
  uid uuid := '996ad2d5-a5d1-437f-9716-e982e69d864d';
  
  -- Entity UUIDs
  e_sameer uuid := 'e0000001-0000-0000-0000-000000000001';
  e_vikram uuid := 'e0000001-0000-0000-0000-000000000002';
  e_ajay uuid   := 'e0000001-0000-0000-0000-000000000003';
  e_arjun uuid  := 'e0000001-0000-0000-0000-000000000004';
  e_suresh uuid := 'e0000001-0000-0000-0000-000000000005';
  e_rohit uuid  := 'e0000001-0000-0000-0000-000000000006';
  e_pappu uuid  := 'e0000001-0000-0000-0000-000000000007';
  e_maya uuid   := 'e0000001-0000-0000-0000-000000000008';
  e_karan uuid  := 'e0000001-0000-0000-0000-000000000009';
  e_deepak uuid := 'e0000001-0000-0000-0000-000000000010';

  -- Phones
  e_ph1 uuid := 'e0000002-0000-0000-0000-000000000001';
  e_ph2 uuid := 'e0000002-0000-0000-0000-000000000002';
  e_ph3 uuid := 'e0000002-0000-0000-0000-000000000003';
  e_ph4 uuid := 'e0000002-0000-0000-0000-000000000004';
  e_ph5 uuid := 'e0000002-0000-0000-0000-000000000005';
  e_ph6 uuid := 'e0000002-0000-0000-0000-000000000006';

  -- Vehicles
  e_veh1 uuid := 'e0000003-0000-0000-0000-000000000001';
  e_veh2 uuid := 'e0000003-0000-0000-0000-000000000002';
  e_veh3 uuid := 'e0000003-0000-0000-0000-000000000003';
  e_veh4 uuid := 'e0000003-0000-0000-0000-000000000004';

  -- Bank Accounts
  e_bnk1 uuid := 'e0000004-0000-0000-0000-000000000001';
  e_bnk2 uuid := 'e0000004-0000-0000-0000-000000000002';
  e_bnk3 uuid := 'e0000004-0000-0000-0000-000000000003';
  e_bnk4 uuid := 'e0000004-0000-0000-0000-000000000004';
  e_bnk5 uuid := 'e0000004-0000-0000-0000-000000000005';

  -- Locations & Cell Towers
  e_loc1 uuid := 'e0000005-0000-0000-0000-000000000001';
  e_loc2 uuid := 'e0000005-0000-0000-0000-000000000002';
  e_loc3 uuid := 'e0000005-0000-0000-0000-000000000003';
  e_loc4 uuid := 'e0000005-0000-0000-0000-000000000004';

  -- Organizations / Shell Entities
  e_org1 uuid := 'e0000006-0000-0000-0000-000000000001';
  e_org2 uuid := 'e0000006-0000-0000-0000-000000000002';

  -- FIR Cases
  f_case1 uuid := 'f0000001-0000-0000-0000-000000000001';
  f_case2 uuid := 'f0000001-0000-0000-0000-000000000002';
  f_case3 uuid := 'f0000001-0000-0000-0000-000000000003';
  f_case4 uuid := 'f0000001-0000-0000-0000-000000000004';

BEGIN

  -- 1. CLEAR PREVIOUS SEED DATA (Cascade cleanly)
  DELETE FROM public.relationships;
  DELETE FROM public.fir_entities;
  DELETE FROM public.evidence_items;
  DELETE FROM public.cdr_records;
  DELETE FROM public.financial_transactions;
  DELETE FROM public.fir_cases;
  DELETE FROM public.entities;

  -- 2. INSERT MASTER ENTITIES
  -- Persons (Key suspects, Kingpins, Mule Handlers, Couriers)
  INSERT INTO public.entities (id, entity_type, display_name, aliases, identifiers, risk_level, source_refs, created_by) VALUES
  (e_sameer, 'person', 'Sameer Khan', ARRAY['Baba Bhai', 'Sammy', 'SK'], '{"role": "Syndicate Kingpin / Caller", "phone": "+91 98811 55421", "city": "Pune City (Shivajinagar)", "aadhar": "XXXX-XXXX-4912", "status": "Accused in 2 FIRs"}', 'high', '["FIR-MH-2026-4821", "CDR-JIO-PN"]', uid),
  (e_vikram, 'person', 'Vikram Rathi', ARRAY['Vicky', 'Techno'], '{"role": "Technical Mule Manager", "phone": "+91 98199 44312", "city": "Mumbai / Pune", "specialization": "Forged bond portal & fake payment gateway developer"}', 'high', '["FIR-MH-2026-4821"]', uid),
  (e_ajay, 'person', 'Ajay Deshmukh', ARRAY['Ajju', 'Deccan Rider'], '{"role": "Cash Courier / ATM Mule", "phone": "+91 97655 88910", "city": "Pune (Deccan)", "specialization": "ATM cash withdrawal & SIM runner"}', 'medium', '["FIR-MH-2026-4821", "ANPR-PUNE"]', uid),
  (e_arjun, 'person', 'Arjun Pawar', ARRAY['Pawar', 'Student Lead'], '{"role": "Mule Account Recruiter", "phone": "+91 99230 44102", "city": "Pune (Swargate)", "specialization": "College student bank account recruiter"}', 'medium', '["FIR-MH-2026-2811"]', uid),
  (e_suresh, 'person', 'Suresh Shinde', ARRAY['Surya', 'Anna'], '{"role": "Hawala Operator / Extortionist", "phone": "+91 94220 33190", "city": "Swargate / Market Yard", "specialization": "Protection money & physical cash pooling"}', 'high', '["FIR-MH-2026-2811", "Swargate GD"]', uid),
  (e_rohit, 'person', 'Rohit Salunkhe', ARRAY['Chhota Rohit'], '{"role": "Safehouse Custodian", "phone": "+91 98224 50912", "city": "Kothrud", "specialization": "Burner phone storage & SIM card distribution point"}', 'medium', '["FIR-MH-2026-1940"]', uid),
  (e_maya, 'person', 'Maya Shelar', ARRAY['Madam', 'Consultant'], '{"role": "Shell Company Director", "phone": "+91 98901 22345", "city": "Mumbai (BKC)", "specialization": "Fake fintech corporate registration"}', 'high', '["PMLA-ED-2026"]', uid),
  (e_karan, 'person', 'Karan Mehra', ARRAY['Crypto Karan'], '{"role": "P2P Crypto Exchanger", "phone": "+91 98210 99812", "city": "Thane / Mumbai", "specialization": "USDT / INR off-ramp converter"}', 'high', '["CYBER-MUMBAI-09"]', uid),
  (e_pappu, 'person', 'Pappu More', ARRAY['More Dada'], '{"role": "Muscle & Intimidation", "phone": "+91 97300 11209", "city": "Pimpri-Chinchwad", "specialization": "Physical delivery of handwritten extortion notes"}', 'medium', '["FIR-MH-2026-2811"]', uid),
  (e_deepak, 'person', 'Deepak Verma', ARRAY['DV'], '{"role": "Call Center Team Lead", "phone": "+91 98110 55432", "city": "Noida / Pune", "specialization": "VoIP spoofing & synthetic lure scripts"}', 'high', '["FIR-MH-2026-4821"]', uid);

  -- Phone Numbers
  INSERT INTO public.entities (id, entity_type, display_name, aliases, identifiers, risk_level, source_refs, created_by) VALUES
  (e_ph1, 'phone', '+91 98811 55421', ARRAY['Sameer Primary Burner'], '{"carrier": "Reliance Jio 5G", "imei": "864291048821902", "circle": "Maharashtra & Goa", "activeTower": "PN-CY-482 (FC Road)"}', 'high', '["CDR-Dump"]', uid),
  (e_ph2, 'phone', '+91 98199 44312', ARRAY['Vikram Mumbai Line'], '{"carrier": "Airtel 4G", "imei": "864291048821902", "circle": "Mumbai", "note": "Shares same IMEI with Sameer burner (Dual-SIM / swapped)"}', 'high', '["CDR-Dump"]', uid),
  (e_ph3, 'phone', '+91 97655 88910', ARRAY['Ajay Courier SIM'], '{"carrier": "Vodafone Idea", "imei": "359128091823901", "circle": "Maharashtra", "activeTower": "PN-DEC-104 (Deccan)"}', 'medium', '["CDR-Dump"]', uid),
  (e_ph4, 'phone', '+91 99230 44102', ARRAY['Arjun Mule Recruiter Line'], '{"carrier": "BSNL", "imei": "862190041289410", "circle": "Maharashtra", "activeTower": "PN-SWR-312 (Swargate)"}', 'medium', '["FIR-MH-2026-2811"]', uid),
  (e_ph5, 'phone', '+91 98210 99812', ARRAY['Karan Crypto P2P Line'], '{"carrier": "Reliance Jio", "imei": "354001928391024", "circle": "Mumbai", "activeTower": "MUM-BKC-901"}', 'high', '["P2P-Telegram"]', uid),
  (e_ph6, 'phone', '+91 94220 33190', ARRAY['Suresh Extortion Caller'], '{"carrier": "Airtel", "imei": "869001928410291", "circle": "Maharashtra", "activeTower": "PN-SWR-312"}', 'high', '["FIR-MH-2026-2811"]', uid);

  -- Vehicles (ANPR Tracked Assets)
  INSERT INTO public.entities (id, entity_type, display_name, aliases, identifiers, risk_level, source_refs, created_by) VALUES
  (e_veh1, 'vehicle', 'MH-12-PQ-9081', ARRAY['White Swift'], '{"make": "Maruti Suzuki Swift", "color": "White", "registeredOwner": "Ajay Deshmukh", "rto": "Pune (MH-12)", "anprSightings": 14}', 'high', '["Traffic-ANPR"]', uid),
  (e_veh2, 'vehicle', 'MH-14-EA-7712', ARRAY['Black Pulsar'], '{"make": "Bajaj Pulsar 150", "color": "Black", "registeredOwner": "Pappu More", "rto": "Pimpri-Chinchwad (MH-14)", "anprSightings": 8}', 'medium', '["Traffic-ANPR"]', uid),
  (e_veh3, 'vehicle', 'MH-01-DK-3490', ARRAY['Black Fortuner'], '{"make": "Toyota Fortuner", "color": "Black", "registeredOwner": "Maya Shelar", "rto": "Mumbai Central (MH-01)", "anprSightings": 22}', 'high', '["Mumbai-CCTV"]', uid),
  (e_veh4, 'vehicle', 'MH-12-TR-4401', ARRAY['White Creta'], '{"make": "Hyundai Creta", "color": "White", "registeredOwner": "Sameer Khan", "rto": "Pune (MH-12)", "anprSightings": 19}', 'high', '["Traffic-ANPR"]', uid);

  -- Bank Accounts (SFinDSet Layering / Mule Accounts)
  INSERT INTO public.entities (id, entity_type, display_name, aliases, identifiers, risk_level, source_refs, created_by) VALUES
  (e_bnk1, 'bank_account', 'HDFC-50100492817291', ARRAY['Tier-1 Layering Mule'], '{"bank": "HDFC Bank", "branch": "Shivajinagar, Pune", "ifsc": "HDFC0000052", "turnover": "INR 14.50L", "status": "Freeze Recommended under PMLA"}', 'high', '["Bank-Audit"]', uid),
  (e_bnk2, 'bank_account', 'ICICI-0021948102', ARRAY['Tier-2 Split Account'], '{"bank": "ICICI Bank", "branch": "Deccan Gymkhana, Pune", "ifsc": "ICIC0000021", "turnover": "INR 6.50L", "status": "Flagged for Intercept"}', 'high', '["Bank-Audit"]', uid),
  (e_bnk3, 'bank_account', 'AXIS-91201004812', ARRAY['Tier-2 ATM Cashout Account'], '{"bank": "Axis Bank", "branch": "Kothrud, Pune", "ifsc": "UTIB0000142", "turnover": "INR 4.20L", "status": "Flagged for Cash Withdrawal"}', 'high', '["Bank-Audit"]', uid),
  (e_bnk4, 'bank_account', 'BOM-60129948102', ARRAY['Extortion Pool A/C'], '{"bank": "Bank of Maharashtra", "branch": "Swargate, Pune", "ifsc": "MAHB0000109", "turnover": "INR 8.90L", "status": "Under Investigation"}', 'medium', '["FIR-MH-2026-2811"]', uid),
  (e_bnk5, 'bank_account', 'KOTAK-9810284711', ARRAY['Fintech Gateway Aggregator'], '{"bank": "Kotak Mahindra Bank", "branch": "Nariman Point, Mumbai", "ifsc": "KKBK0000421", "turnover": "INR 54.00L", "status": "High Velocity Structuring"}', 'high', '["ED-Intelligence"]', uid);

  -- Locations & Cell Towers
  INSERT INTO public.entities (id, entity_type, display_name, aliases, identifiers, risk_level, source_refs, created_by) VALUES
  (e_loc1, 'location', 'Cell Tower PN-CY-482', ARRAY['FC Road Sector'], '{"towerId": "PN-CY-482", "lat": 18.5284, "lng": 73.8415, "zone": "Commercial Complex, Shivajinagar", "city": "Pune"}', 'high', '["Telecom-Dump"]', uid),
  (e_loc2, 'location', 'Cell Tower PN-DEC-104', ARRAY['Deccan Sector'], '{"towerId": "PN-DEC-104", "lat": 18.5167, "lng": 73.8410, "zone": "Deccan Gymkhana ATM Hub", "city": "Pune"}', 'medium', '["Telecom-Dump"]', uid),
  (e_loc3, 'location', 'Cell Tower PN-SWR-312', ARRAY['Swargate Sector'], '{"towerId": "PN-SWR-312", "lat": 18.5018, "lng": 73.8580, "zone": "Timber Market / Swargate Bus Stand", "city": "Pune"}', 'medium', '["Telecom-Dump"]', uid),
  (e_loc4, 'location', 'Cell Tower MUM-BKC-901', ARRAY['BKC Fintech Sector'], '{"towerId": "MUM-BKC-901", "lat": 19.0674, "lng": 72.8687, "zone": "Bandra Kurla Complex", "city": "Mumbai"}', 'high', '["Telecom-Dump"]', uid);

  -- Shell Organizations
  INSERT INTO public.entities (id, entity_type, display_name, aliases, identifiers, risk_level, source_refs, created_by) VALUES
  (e_org1, 'organization', 'Apex Digital Asset LLP', ARRAY['Apex Bond Portal'], '{"cin": "U72900MH2025PTC391024", "registeredOffice": "BKC, Mumbai", "directors": "Maya Shelar, Vikram Rathi", "status": "Shell Company"}', 'high', '["ROC-Records"]', uid),
  (e_org2, 'organization', 'Global Smart Solutions', ARRAY['Call Center Racket'], '{"city": "Pune / Noida", "operatingHead": "Deepak Verma", "activities": "VoIP boiler-room scam center"}', 'high', '["FIR-MH-2026-4821"]', uid);

  -- 3. INSERT REGISTERED FIR CASES
  INSERT INTO public.fir_cases (id, fir_number, police_station, district, incident_date, sections, incident_summary, extraction_status, created_by) VALUES
  (f_case1, 'FIR-MH-2026-4821', 'Cyber Crime Police Station, Shivajinagar', 'Pune City', '2026-08-14', ARRAY['IPC 420', 'IPC 468', 'IPC 471', 'IT Act 66D'], 'The complainant was approached under the guise of an investment scheme involving synthetic cryptocurrency routing. Accused Sameer Khan and associates forged digital bond certificates and facilitated fund transfers across unauthorized payment gateways.', 'approved', uid),
  (f_case2, 'FIR-MH-2026-1940', 'Kothrud Police Station', 'Pune City', '2026-07-22', ARRAY['IPC 420', 'IPC 120B'], 'Fraudulent diversion of college admission security deposits through student mule accounts. Account credentials obtained under commission promises.', 'approved', uid),
  (f_case3, 'FIR-MH-2026-2811', 'Swargate Police Station', 'Pune City', '2026-08-11', ARRAY['IPC 384', 'IPC 386', 'IPC 120B', 'Arms Act 25'], 'Handwritten extortion slips demanding protection money from timber merchants. Accused Suresh Shinde and bike-borne associates delivered threat notes.', 'approved', uid),
  (f_case4, 'FIR-MH-2026-0512', 'Bandra Cyber Police Station', 'Mumbai HQ', '2026-08-02', ARRAY['IPC 420', 'IPC 467', 'IT Act 66C', 'PMLA 3'], 'Corporate identity theft and deployment of fake digital bond certificates via Apex Digital Asset LLP. Multi-crore crypto off-ramping.', 'approved', uid);

  -- FIR Entity Associations
  INSERT INTO public.fir_entities (fir_id, entity_id, involvement) VALUES
  (f_case1, e_sameer, 'Primary Accused Kingpin'),
  (f_case1, e_vikram, 'Technical Co-Accused'),
  (f_case1, e_ajay, 'Cash Runner Mule'),
  (f_case1, e_ph1, 'Extortion Burner SIM'),
  (f_case1, e_veh1, 'Getaway Vehicle'),
  (f_case1, e_bnk1, 'Primary Layering Account'),
  (f_case2, e_arjun, 'Primary Accused Recruiter'),
  (f_case2, e_rohit, 'Safehouse Custodian'),
  (f_case3, e_suresh, 'Primary Accused Extortionist'),
  (f_case3, e_pappu, 'Delivery Associate'),
  (f_case3, e_veh2, 'Incident Motorcycle'),
  (f_case4, e_maya, 'Accused Shell Director'),
  (f_case4, e_karan, 'P2P Crypto Converter'),
  (f_case4, e_org1, 'Forged Entity');

  -- 4. INSERT GRAPH RELATIONSHIPS (Multi-Hop Links)
  INSERT INTO public.relationships (source_entity_id, target_entity_id, relationship_type, weight, source_refs, created_by) VALUES
  -- Sameer Syndicate Core
  (e_sameer, e_ph1, 'Registered User', 95, '["CDR-Dump"]', uid),
  (e_sameer, e_vikram, 'Syndicate Lieutenant', 90, '["CDR-Dump", "FIR-MH-2026-4821"]', uid),
  (e_sameer, e_ajay, 'Mule Coordinator', 85, '["CDR-Dump", "Bank-Trail"]', uid),
  (e_sameer, e_veh4, 'Registered Owner', 90, '["RTO-Vahan"]', uid),
  (e_sameer, e_loc1, 'Frequent Cell Tower', 80, '["Tower-Dump"]', uid),

  -- Vikram Technical Operations
  (e_vikram, e_ph2, 'Registered User', 90, '["CDR-Dump"]', uid),
  (e_vikram, e_org1, 'Technical Director', 88, '["ROC-Filing"]', uid),
  (e_vikram, e_maya, 'Co-Conspirator', 85, '["ROC-Filing", "CDR-Dump"]', uid),
  (e_ph1, e_ph2, 'Shared Device Hardware (IMEI)', 99, '["Telecom-Forensics"]', uid),

  -- Ajay Logistics & Cash
  (e_ajay, e_ph3, 'Registered User', 85, '["CDR-Dump"]', uid),
  (e_ajay, e_veh1, 'Registered Owner / Driver', 95, '["RTO-Vahan", "ANPR"]', uid),
  (e_ajay, e_bnk2, 'ATM Cash-Out Handler', 90, '["CCTV-ATM", "Bank-Trail"]', uid),
  (e_ajay, e_loc2, 'ATM Cluster Location', 85, '["ANPR-CCTV"]', uid),

  -- Arjun & Suresh (Extortion & Mule Ring)
  (e_arjun, e_ph4, 'Registered User', 80, '["FIR-MH-2026-2811"]', uid),
  (e_arjun, e_suresh, 'Sub-Syndicate Link', 85, '["CDR-Dump"]', uid),
  (e_arjun, e_bnk4, 'Mule Recruiter', 80, '["Bank-Records"]', uid),
  (e_suresh, e_ph6, 'Registered User', 90, '["FIR-MH-2026-2811"]', uid),
  (e_suresh, e_pappu, 'Muscle Enforcer', 85, '["Swargate-GD"]', uid),
  (e_pappu, e_veh2, 'Motorcycle Rider', 90, '["ANPR-Sightings"]', uid),
  (e_suresh, e_loc3, 'Extortion Territory', 80, '["Police-Beat"]', uid),

  -- Financial Layering Edges (Rupee Flow)
  (e_bnk1, e_bnk2, 'Fund Layering (INR 6,50,000)', 95, '["IMPS-Log"]', uid),
  (e_bnk1, e_bnk3, 'Fund Layering (INR 4,20,000)', 92, '["IMPS-Log"]', uid),
  (e_bnk2, e_ajay, 'ATM Cash Withdrawal (INR 3,80,000)', 98, '["Bank-Slip", "CCTV"]', uid),
  (e_bnk1, e_bnk5, 'Corporate Routing (INR 3,80,000)', 88, '["RTGS-Log"]', uid),
  (e_bnk5, e_karan, 'P2P Crypto Purchase (USDT)', 94, '["Telegram-P2P"]', uid),
  (e_org1, e_bnk5, 'Corporate Bank Account', 90, '["Bank-KYC"]', uid),

  -- Cross-Case Bridges (Connecting Station A & Station B)
  (e_sameer, e_arjun, 'Inter-Syndicate Call Contact', 75, '["CDR-14-Calls"]', uid),
  (e_veh1, e_loc1, 'ANPR Sighting at Crime Scene', 85, '["Traffic-Camera"]', uid),
  (e_ph1, e_loc1, 'Connected Call at Crime Scene', 90, '["Tower-Log"]', uid),
  (e_rohit, e_vikram, 'Safehouse Equipment Link', 78, '["FIR-MH-2026-1940"]', uid);

  -- 5. INSERT CALL DETAIL RECORDS (CDRs)
  INSERT INTO public.cdr_records (calling_number, called_number, call_timestamp, duration_seconds, call_type, cell_tower_id, imei, source_file, created_by) VALUES
  ('+91 98811 55421', '+91 98199 44312', '2026-08-14 01:14:00+00', 340, 'voice', 'PN-CY-482', '864291048821902', 'CDR_Jio_Aug2026.csv', uid),
  ('+91 98811 55421', '+91 98199 44312', '2026-08-14 02:45:00+00', 180, 'voice', 'PN-CY-482', '864291048821902', 'CDR_Jio_Aug2026.csv', uid),
  ('+91 98811 55421', '+91 97655 88910', '2026-08-14 14:32:00+00', 95, 'voice', 'PN-CY-482', '864291048821902', 'CDR_Jio_Aug2026.csv', uid),
  ('+91 97655 88910', '+91 98811 55421', '2026-08-14 15:10:00+00', 45, 'voice', 'PN-DEC-104', '359128091823901', 'CDR_Vi_Aug2026.csv', uid),
  ('+91 98811 55421', '+91 99230 44102', '2026-08-13 23:40:00+00', 210, 'voice', 'PN-CY-482', '864291048821902', 'CDR_Jio_Aug2026.csv', uid),
  ('+91 99230 44102', '+91 94220 33190', '2026-08-11 19:20:00+00', 125, 'voice', 'PN-SWR-312', '862190041289410', 'CDR_BSNL_Aug2026.csv', uid),
  ('+91 94220 33190', '+91 97300 11209', '2026-08-11 19:40:00+00', 88, 'voice', 'PN-SWR-312', '869001928410291', 'CDR_Airtel_Aug2026.csv', uid),
  ('+91 98199 44312', '+91 98901 22345', '2026-08-12 11:30:00+00', 420, 'voice', 'MUM-BKC-901', '864291048821902', 'CDR_Airtel_Aug2026.csv', uid),
  ('+91 98901 22345', '+91 98210 99812', '2026-08-12 16:15:00+00', 290, 'voice', 'MUM-BKC-901', '354001928391024', 'CDR_Jio_Aug2026.csv', uid),
  ('+91 98811 55421', '+91 98224 50912', '2026-07-22 14:05:00+00', 160, 'voice', 'PN-CY-482', '864291048821902', 'CDR_Jio_Jul2026.csv', uid);

  -- 6. INSERT SFinDSet FINANCIAL TRANSACTIONS
  INSERT INTO public.financial_transactions (source_account, destination_account, amount, currency, transaction_timestamp, bank_name, transaction_type, source_file, created_by) VALUES
  ('COMPLAINANT-VICTIM', 'HDFC-50100492817291', 1450000.00, 'INR', '2026-08-14 14:28:00+00', 'HDFC Bank', 'transfer', 'SFinDSet_Fraud_Batch_2026.csv', uid),
  ('HDFC-50100492817291', 'ICICI-0021948102', 650000.00, 'INR', '2026-08-14 14:35:00+00', 'ICICI Bank', 'transfer', 'SFinDSet_Fraud_Batch_2026.csv', uid),
  ('HDFC-50100492817291', 'AXIS-91201004812', 420000.00, 'INR', '2026-08-14 14:38:00+00', 'Axis Bank', 'transfer', 'SFinDSet_Fraud_Batch_2026.csv', uid),
  ('HDFC-50100492817291', 'KOTAK-9810284711', 380000.00, 'INR', '2026-08-14 14:41:00+00', 'Kotak Mahindra Bank', 'transfer', 'SFinDSet_Fraud_Batch_2026.csv', uid),
  ('ICICI-0021948102', 'DECCAN-ATM-04', 380000.00, 'INR', '2026-08-14 15:12:00+00', 'ICICI Bank', 'cash_withdrawal', 'SFinDSet_Fraud_Batch_2026.csv', uid),
  ('AXIS-91201004812', 'KOTHRUD-ATM-01', 200000.00, 'INR', '2026-08-14 15:30:00+00', 'Axis Bank', 'cash_withdrawal', 'SFinDSet_Fraud_Batch_2026.csv', uid),
  ('KOTAK-9810284711', 'BINANCE-P2P-ESCROW', 380000.00, 'INR', '2026-08-14 16:00:00+00', 'Kotak Mahindra Bank', 'upi', 'SFinDSet_Fraud_Batch_2026.csv', uid),
  ('BOM-60129948102', 'SWARGATE-ATM-02', 150000.00, 'INR', '2026-08-11 20:10:00+00', 'Bank of Maharashtra', 'cash_withdrawal', 'SFinDSet_Fraud_Batch_2026.csv', uid);

  -- 7. INSERT EVIDENCE ITEMS (Digital Artifacts)
  INSERT INTO public.evidence_items (fir_id, evidence_type, description, storage_path, sha256, created_by) VALUES
  (f_case1, 'document', 'Forged Bond Certificate PDF (Apex Digital Asset)', 'evidence/forged_bond_apex.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', uid),
  (f_case1, 'device', 'Tower Dump CDR Sector PN-CY-482 (FC Road)', 'evidence/cdr_dump_pn_cy_482.csv', '8a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f809', uid),
  (f_case3, 'document', 'Original Handwritten Threat Slip (Swargate PS GD Entry)', 'evidence/swargate_extortion_slip.png', '660badfabf7fdeced2a0dd07b8435a44388261c2655fb0e156fd662cd8440791', uid);

END $$;
