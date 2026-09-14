import { supabase, supabaseConfigured } from './lib/supabase.js';
import { hashText } from './lib/crypto.js';

let renderCallback = null;

export function registerRender(cb) {
  renderCallback = cb;
}

export function notifyStateChange() {
  if (typeof renderCallback === 'function') {
    renderCallback();
  }
}

export const DEFAULT_OFFICERS = [
  {
    id: '996ad2d5-a5d1-437f-9716-e982e69d864d',
    name: 'Ashutosh Patil',
    rank: 'Superintendent of Police',
    cadre: 'IPS (MH Cadre)',
    badge_no: 'IPS-001',
    district: 'Pune HQ',
    state: 'Maharashtra',
    email: 'ashutosh.patil9750@gmail.com',
    phone: '+91 9112222108',
    role: 'admin',
    isYou: true
  }
];

export function loadSavedOfficers() {
  try {
    const raw = localStorage.getItem('netrakshak_officers');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const filtered = parsed.filter(o => !['off_anil', 'off_priya', 'off_vikas', 'off_neha', 'off_ashutosh'].includes(o.id));
        if (filtered.length > 0) return filtered;
      }
    }
    return [...DEFAULT_OFFICERS];
  } catch (e) {
    return [...DEFAULT_OFFICERS];
  }
}

export function loadSavedAuditLogs() {
  try {
    const raw = localStorage.getItem('netrakshak_audit_logs');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export const DEFAULT_ENTITIES = [
  // Persons (10 Accused & Operatives)
  {
    id: 'e0000001-0000-0000-0000-000000000001',
    name: 'Sameer Khan',
    local: 'Baba Bhai, Sammy',
    type: 'Person',
    category: 'person',
    role: 'Syndicate Kingpin / Caller',
    risk: 'high',
    city: 'Pune City (Shivajinagar)',
    phone: '+91 98811 55421',
    identifiers: { alias: 'Baba Bhai, Sammy', aadhar: 'XXXX-XXXX-4912', status: 'Accused in 2 FIRs' },
    events: 14,
    recent: 96,
    x: 350,
    y: 260
  },
  {
    id: 'e0000001-0000-0000-0000-000000000002',
    name: 'Vikram Rathi',
    local: 'Vicky, Techno',
    type: 'Person',
    category: 'person',
    role: 'Technical Mule Manager',
    risk: 'high',
    city: 'Mumbai / Pune',
    phone: '+91 98199 44312',
    identifiers: { alias: 'Vicky', specialization: 'Forged bond portal & fake payment gateway developer' },
    events: 8,
    recent: 92,
    x: 480,
    y: 190
  },
  {
    id: 'e0000001-0000-0000-0000-000000000003',
    name: 'Ajay Deshmukh',
    local: 'Ajju, Deccan Rider',
    type: 'Person',
    category: 'person',
    role: 'Cash Courier / ATM Mule',
    risk: 'medium',
    city: 'Pune (Deccan)',
    phone: '+91 97655 88910',
    identifiers: { specialization: 'ATM cash withdrawal & SIM runner' },
    events: 6,
    recent: 88,
    x: 490,
    y: 350
  },
  {
    id: 'e0000001-0000-0000-0000-000000000004',
    name: 'Arjun Pawar',
    local: 'Pawar, Student Lead',
    type: 'Person',
    category: 'person',
    role: 'Mule Account Recruiter',
    risk: 'medium',
    city: 'Pune (Swargate)',
    phone: '+91 99230 44102',
    identifiers: { specialization: 'College student bank account recruiter' },
    events: 5,
    recent: 82,
    x: 180,
    y: 380
  },
  {
    id: 'e0000001-0000-0000-0000-000000000005',
    name: 'Suresh Shinde',
    local: 'Surya, Anna',
    type: 'Person',
    category: 'person',
    role: 'Hawala Operator / Extortionist',
    risk: 'high',
    city: 'Swargate / Market Yard',
    phone: '+91 94220 33190',
    identifiers: { specialization: 'Protection money & physical cash pooling' },
    events: 7,
    recent: 90,
    x: 120,
    y: 280
  },
  {
    id: 'e0000001-0000-0000-0000-000000000006',
    name: 'Rohit Salunkhe',
    local: 'Chhota Rohit',
    type: 'Person',
    category: 'person',
    role: 'Safehouse Custodian',
    risk: 'medium',
    city: 'Kothrud, Pune',
    phone: '+91 98224 50912',
    identifiers: { specialization: 'Burner phone storage & SIM distribution point' },
    events: 3,
    recent: 70,
    x: 580,
    y: 420
  },
  {
    id: 'e0000001-0000-0000-0000-000000000007',
    name: 'Pappu More',
    local: 'More Dada',
    type: 'Person',
    category: 'person',
    role: 'Muscle & Intimidation',
    risk: 'medium',
    city: 'Pimpri-Chinchwad',
    phone: '+91 97300 11209',
    identifiers: { specialization: 'Physical delivery of extortion notes' },
    events: 4,
    recent: 75,
    x: 110,
    y: 460
  },
  {
    id: 'e0000001-0000-0000-0000-000000000008',
    name: 'Maya Shelar',
    local: 'Madam, Consultant',
    type: 'Person',
    category: 'person',
    role: 'Shell Company Director',
    risk: 'high',
    city: 'Mumbai (BKC)',
    phone: '+91 98901 22345',
    identifiers: { specialization: 'Fake fintech corporate registration' },
    events: 5,
    recent: 89,
    x: 620,
    y: 130
  },
  {
    id: 'e0000001-0000-0000-0000-000000000009',
    name: 'Karan Mehra',
    local: 'Crypto Karan',
    type: 'Person',
    category: 'person',
    role: 'P2P Crypto Exchanger',
    risk: 'high',
    city: 'Thane / Mumbai',
    phone: '+91 98210 99812',
    identifiers: { specialization: 'USDT / INR off-ramp converter' },
    events: 6,
    recent: 91,
    x: 640,
    y: 240
  },
  {
    id: 'e0000001-0000-0000-0000-000000000010',
    name: 'Deepak Verma',
    local: 'DV',
    type: 'Person',
    category: 'person',
    role: 'Call Center Team Lead',
    risk: 'high',
    city: 'Noida / Pune',
    phone: '+91 98110 55432',
    identifiers: { specialization: 'VoIP spoofing & synthetic lure scripts' },
    events: 4,
    recent: 85,
    x: 420,
    y: 110
  },

  // Phone Numbers (6 Registered SIMs)
  {
    id: 'e0000002-0000-0000-0000-000000000001',
    name: '+91 98811 55421',
    local: 'Sameer Primary Burner',
    type: 'Phone',
    category: 'phone',
    role: 'Primary Suspect Burner Phone',
    risk: 'high',
    city: 'Shivajinagar Sector',
    phone: '+91 98811 55421',
    identifiers: { carrier: 'Reliance Jio 5G', imei: '864291048821902', activeTower: 'PN-CY-482 (FC Road)' },
    events: 142,
    recent: 98,
    x: 270,
    y: 190
  },
  {
    id: 'e0000002-0000-0000-0000-000000000002',
    name: '+91 98199 44312',
    local: 'Vikram Mumbai Line',
    type: 'Phone',
    category: 'phone',
    role: 'Technical Handler Mobile',
    risk: 'high',
    city: 'Mumbai Sector',
    phone: '+91 98199 44312',
    identifiers: { carrier: 'Airtel 4G', imei: '864291048821902', note: 'Shares IMEI with Sameer burner' },
    events: 89,
    recent: 92,
    x: 520,
    y: 140
  },
  {
    id: 'e0000002-0000-0000-0000-000000000003',
    name: '+91 97655 88910',
    local: 'Ajay Courier SIM',
    type: 'Phone',
    category: 'phone',
    role: 'Cash Courier Mobile',
    risk: 'medium',
    city: 'Deccan Sector',
    phone: '+91 97655 88910',
    identifiers: { carrier: 'Vodafone Idea', imei: '359128091823901', activeTower: 'PN-DEC-104' },
    events: 45,
    recent: 80,
    x: 440,
    y: 390
  },
  {
    id: 'e0000002-0000-0000-0000-000000000004',
    name: '+91 99230 44102',
    local: 'Arjun Mule Recruiter Line',
    type: 'Phone',
    category: 'phone',
    role: 'Recruiter Line',
    risk: 'medium',
    city: 'Swargate Sector',
    phone: '+91 99230 44102',
    identifiers: { carrier: 'BSNL', imei: '862190041289410', activeTower: 'PN-SWR-312' },
    events: 34,
    recent: 78,
    x: 230,
    y: 430
  },
  {
    id: 'e0000002-0000-0000-0000-000000000005',
    name: '+91 98210 99812',
    local: 'Karan Crypto P2P Line',
    type: 'Phone',
    category: 'phone',
    role: 'P2P Trading Line',
    risk: 'high',
    city: 'Mumbai BKC',
    phone: '+91 98210 99812',
    identifiers: { carrier: 'Reliance Jio', imei: '354001928391024', activeTower: 'MUM-BKC-901' },
    events: 62,
    recent: 88,
    x: 690,
    y: 200
  },
  {
    id: 'e0000002-0000-0000-0000-000000000006',
    name: '+91 94220 33190',
    local: 'Suresh Extortion Caller',
    type: 'Phone',
    category: 'phone',
    role: 'Extortion Caller Mobile',
    risk: 'high',
    city: 'Swargate Sector',
    phone: '+91 94220 33190',
    identifiers: { carrier: 'Airtel', imei: '869001928410291', activeTower: 'PN-SWR-312' },
    events: 55,
    recent: 89,
    x: 80,
    y: 230
  },

  // Vehicles (4 ANPR Tracked Assets)
  {
    id: 'e0000003-0000-0000-0000-000000000001',
    name: 'MH-12-PQ-9081',
    local: 'White Swift',
    type: 'Vehicle',
    category: 'vehicle',
    role: 'Suspect Mobility / Logistics Asset',
    risk: 'high',
    city: 'Pune City',
    identifiers: { make: 'Maruti Suzuki Swift', color: 'White', registeredOwner: 'Ajay Deshmukh', anprSightings: 14 },
    events: 14,
    recent: 92,
    x: 390,
    y: 380
  },
  {
    id: 'e0000003-0000-0000-0000-000000000002',
    name: 'MH-14-EA-7712',
    local: 'Black Pulsar',
    type: 'Vehicle',
    category: 'vehicle',
    role: 'Extortion Delivery Motorcycle',
    risk: 'medium',
    city: 'Pimpri / Swargate',
    identifiers: { make: 'Bajaj Pulsar 150', color: 'Black', registeredOwner: 'Pappu More', anprSightings: 8 },
    events: 8,
    recent: 80,
    x: 150,
    y: 500
  },
  {
    id: 'e0000003-0000-0000-0000-000000000003',
    name: 'MH-01-DK-3490',
    local: 'Black Fortuner',
    type: 'Vehicle',
    category: 'vehicle',
    role: 'Corporate Executive Asset',
    risk: 'high',
    city: 'Mumbai Central',
    identifiers: { make: 'Toyota Fortuner', color: 'Black', registeredOwner: 'Maya Shelar', anprSightings: 22 },
    events: 22,
    recent: 94,
    x: 680,
    y: 90
  },
  {
    id: 'e0000003-0000-0000-0000-000000000004',
    name: 'MH-12-TR-4401',
    local: 'White Creta',
    type: 'Vehicle',
    category: 'vehicle',
    role: 'Kingpin Personal Vehicle',
    risk: 'high',
    city: 'Pune (Shivajinagar)',
    identifiers: { make: 'Hyundai Creta', color: 'White', registeredOwner: 'Sameer Khan', anprSightings: 19 },
    events: 19,
    recent: 95,
    x: 310,
    y: 330
  },

  // Bank & Mule Accounts (5 Layering Accounts)
  {
    id: 'e0000004-0000-0000-0000-000000000001',
    name: 'HDFC-50100492817291',
    local: 'Tier-1 Layering Mule',
    type: 'Bank',
    category: 'bank',
    role: 'Primary Fraud Intake Account',
    risk: 'high',
    city: 'Shivajinagar, Pune',
    identifiers: { bank: 'HDFC Bank', branch: 'Shivajinagar', turnover: 'INR 14.50L', status: 'Freeze Recommended under PMLA' },
    events: 12,
    recent: 98,
    x: 440,
    y: 280
  },
  {
    id: 'e0000004-0000-0000-0000-000000000002',
    name: 'ICICI-0021948102',
    local: 'Tier-2 Split Account',
    type: 'Bank',
    category: 'bank',
    role: 'Layering Split Account',
    risk: 'high',
    city: 'Deccan Gymkhana, Pune',
    identifiers: { bank: 'ICICI Bank', branch: 'Deccan Gymkhana', turnover: 'INR 6.50L', status: 'Flagged for Intercept' },
    events: 8,
    recent: 89,
    x: 560,
    y: 290
  },
  {
    id: 'e0000004-0000-0000-0000-000000000003',
    name: 'AXIS-91201004812',
    local: 'Tier-2 ATM Cashout Account',
    type: 'Bank',
    category: 'bank',
    role: 'ATM Dispersal Account',
    risk: 'high',
    city: 'Kothrud, Pune',
    identifiers: { bank: 'Axis Bank', branch: 'Kothrud', turnover: 'INR 4.20L', status: 'Flagged for Cash Withdrawal' },
    events: 6,
    recent: 84,
    x: 520,
    y: 350
  },
  {
    id: 'e0000004-0000-0000-0000-000000000004',
    name: 'BOM-60129948102',
    local: 'Extortion Pool A/C',
    type: 'Bank',
    category: 'bank',
    role: 'Extortion Revenue Pool',
    risk: 'medium',
    city: 'Swargate, Pune',
    identifiers: { bank: 'Bank of Maharashtra', branch: 'Swargate', turnover: 'INR 8.90L', status: 'Under Investigation' },
    events: 7,
    recent: 82,
    x: 190,
    y: 320
  },
  {
    id: 'e0000004-0000-0000-0000-000000000005',
    name: 'KOTAK-9810284711',
    local: 'Fintech Gateway Aggregator',
    type: 'Bank',
    category: 'bank',
    role: 'Corporate Crypto Gateway',
    risk: 'high',
    city: 'Nariman Point, Mumbai',
    identifiers: { bank: 'Kotak Mahindra Bank', turnover: 'INR 54.00L', status: 'High Velocity Structuring' },
    events: 18,
    recent: 96,
    x: 620,
    y: 190
  },

  // Cell Towers & Locations (4 Telecom Sectors)
  {
    id: 'e0000005-0000-0000-0000-000000000001',
    name: 'Cell Tower PN-CY-482',
    local: 'FC Road Sector',
    type: 'Location',
    category: 'location',
    role: 'Cyber Hub Cell Tower',
    risk: 'high',
    city: 'Pune (Shivajinagar)',
    identifiers: { towerId: 'PN-CY-482', lat: 18.5284, lng: 73.8415, zone: 'Commercial Complex, Shivajinagar' },
    events: 142,
    recent: 98,
    x: 240,
    y: 100
  },
  {
    id: 'e0000005-0000-0000-0000-000000000002',
    name: 'Cell Tower PN-DEC-104',
    local: 'Deccan Sector',
    type: 'Location',
    category: 'location',
    role: 'ATM Hub Cell Tower',
    risk: 'medium',
    city: 'Pune (Deccan)',
    identifiers: { towerId: 'PN-DEC-104', lat: 18.5167, lng: 73.8410, zone: 'Deccan Gymkhana ATM Hub' },
    events: 85,
    recent: 87,
    x: 410,
    y: 440
  },
  {
    id: 'e0000005-0000-0000-0000-000000000003',
    name: 'Cell Tower PN-SWR-312',
    local: 'Swargate Sector',
    type: 'Location',
    category: 'location',
    role: 'Extortion Beat Cell Tower',
    risk: 'medium',
    city: 'Pune (Swargate)',
    identifiers: { towerId: 'PN-SWR-312', lat: 18.5018, lng: 73.8580, zone: 'Timber Market / Bus Stand' },
    events: 74,
    recent: 83,
    x: 80,
    y: 370
  },
  {
    id: 'e0000005-0000-0000-0000-000000000004',
    name: 'Cell Tower MUM-BKC-901',
    local: 'BKC Fintech Sector',
    type: 'Location',
    category: 'location',
    role: 'Corporate Hub Cell Tower',
    risk: 'high',
    city: 'Mumbai (BKC)',
    identifiers: { towerId: 'MUM-BKC-901', lat: 19.0674, lng: 72.8687, zone: 'Bandra Kurla Complex' },
    events: 96,
    recent: 93,
    x: 730,
    y: 140
  },

  // Shell Organizations (2 Corporate Fronts)
  {
    id: 'e0000006-0000-0000-0000-000000000001',
    name: 'Apex Digital Asset LLP',
    local: 'Apex Bond Portal',
    type: 'Organization',
    category: 'organization',
    role: 'Forged Investment Front',
    risk: 'high',
    city: 'BKC, Mumbai',
    identifiers: { cin: 'U72900MH2025PTC391024', directors: 'Maya Shelar, Vikram Rathi', status: 'Shell Company' },
    events: 10,
    recent: 95,
    x: 560,
    y: 110
  },
  {
    id: 'e0000006-0000-0000-0000-000000000002',
    name: 'Global Smart Solutions',
    local: 'Call Center Racket',
    type: 'Organization',
    category: 'organization',
    role: 'VoIP Boiler Room Front',
    risk: 'high',
    city: 'Pune / Noida',
    identifiers: { operatingHead: 'Deepak Verma', activities: 'VoIP boiler-room scam center' },
    events: 8,
    recent: 91,
    x: 370,
    y: 60
  }
];

export const DEFAULT_EDGES = [
  ['e0000001-0000-0000-0000-000000000001', 'e0000002-0000-0000-0000-000000000001', 'Registered User'],
  ['e0000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000002', 'Syndicate Lieutenant'],
  ['e0000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000003', 'Mule Coordinator'],
  ['e0000001-0000-0000-0000-000000000001', 'e0000003-0000-0000-0000-000000000004', 'Registered Owner'],
  ['e0000001-0000-0000-0000-000000000001', 'e0000005-0000-0000-0000-000000000001', 'Frequent Cell Tower'],
  ['e0000001-0000-0000-0000-000000000002', 'e0000002-0000-0000-0000-000000000002', 'Registered User'],
  ['e0000001-0000-0000-0000-000000000002', 'e0000006-0000-0000-0000-000000000001', 'Technical Director'],
  ['e0000001-0000-0000-0000-000000000002', 'e0000001-0000-0000-0000-000000000008', 'Co-Conspirator'],
  ['e0000002-0000-0000-0000-000000000001', 'e0000002-0000-0000-0000-000000000002', 'Shared Hardware (IMEI)'],
  ['e0000001-0000-0000-0000-000000000003', 'e0000002-0000-0000-0000-000000000003', 'Registered User'],
  ['e0000001-0000-0000-0000-000000000003', 'e0000003-0000-0000-0000-000000000001', 'Registered Owner / Driver'],
  ['e0000001-0000-0000-0000-000000000003', 'e0000004-0000-0000-0000-000000000002', 'ATM Cash-Out Handler'],
  ['e0000001-0000-0000-0000-000000000003', 'e0000005-0000-0000-0000-000000000002', 'ATM Cluster Location'],
  ['e0000001-0000-0000-0000-000000000004', 'e0000002-0000-0000-0000-000000000004', 'Registered User'],
  ['e0000001-0000-0000-0000-000000000004', 'e0000001-0000-0000-0000-000000000005', 'Sub-Syndicate Link'],
  ['e0000001-0000-0000-0000-000000000004', 'e0000004-0000-0000-0000-000000000004', 'Mule Recruiter'],
  ['e0000001-0000-0000-0000-000000000005', 'e0000002-0000-0000-0000-000000000006', 'Registered User'],
  ['e0000001-0000-0000-0000-000000000005', 'e0000001-0000-0000-0000-000000000007', 'Muscle Enforcer'],
  ['e0000001-0000-0000-0000-000000000007', 'e0000003-0000-0000-0000-000000000002', 'Motorcycle Rider'],
  ['e0000001-0000-0000-0000-000000000005', 'e0000005-0000-0000-0000-000000000003', 'Extortion Territory'],
  ['e0000004-0000-0000-0000-000000000001', 'e0000004-0000-0000-0000-000000000002', 'Fund Layering (INR 6,50,000)'],
  ['e0000004-0000-0000-0000-000000000001', 'e0000004-0000-0000-0000-000000000003', 'Fund Layering (INR 4,20,000)'],
  ['e0000004-0000-0000-0000-000000000002', 'e0000001-0000-0000-0000-000000000003', 'ATM Withdrawal (INR 3,80,000)'],
  ['e0000004-0000-0000-0000-000000000001', 'e0000004-0000-0000-0000-000000000005', 'Corporate Routing (INR 3,80,000)'],
  ['e0000004-0000-0000-0000-000000000005', 'e0000001-0000-0000-0000-000000000009', 'P2P Crypto Purchase (USDT)'],
  ['e0000006-0000-0000-0000-000000000001', 'e0000004-0000-0000-0000-000000000005', 'Corporate Bank Account'],
  ['e0000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000004', 'Inter-Syndicate Call Link'],
  ['e0000003-0000-0000-0000-000000000001', 'e0000005-0000-0000-0000-000000000001', 'ANPR Sighting at Crime Scene'],
  ['e0000002-0000-0000-0000-000000000001', 'e0000005-0000-0000-0000-000000000001', 'Connected Call at Crime Scene'],
  ['e0000001-0000-0000-0000-000000000006', 'e0000001-0000-0000-0000-000000000002', 'Safehouse Equipment Link'],
  // Fortuner MH-01-DK-3490 links
  ['e0000001-0000-0000-0000-000000000008', 'e0000003-0000-0000-0000-000000000003', 'Registered Owner'],
  ['e0000003-0000-0000-0000-000000000003', 'e0000006-0000-0000-0000-000000000001', 'Corporate Asset Sighting'],
  ['e0000003-0000-0000-0000-000000000003', 'e0000005-0000-0000-0000-000000000004', 'ANPR Sighting in BKC'],
  // Creta MH-12-TR-4401 links
  ['e0000001-0000-0000-0000-000000000001', 'e0000003-0000-0000-0000-000000000004', 'Registered Owner'],
  ['e0000003-0000-0000-0000-000000000004', 'e0000005-0000-0000-0000-000000000001', 'ANPR Sighting at FC Road'],
  // Crypto broker Kavita Nair & VoIP Lead Deepak Verma links
  ['e0000001-0000-0000-0000-000000000009', 'e0000004-0000-0000-0000-000000000005', 'USDT Liquidity Provider'],
  ['e0000001-0000-0000-0000-000000000009', 'e0000001-0000-0000-0000-000000000002', 'P2P Hawala Partner'],
  ['e0000001-0000-0000-0000-000000000010', 'e0000006-0000-0000-0000-000000000002', 'Boiler Room Manager'],
  ['e0000001-0000-0000-0000-000000000010', 'e0000002-0000-0000-0000-000000000002', 'VoIP SIM Operator'],
  ['e0000001-0000-0000-0000-000000000010', 'e0000001-0000-0000-0000-000000000001', 'Direct Syndicate Link'],
  ['e0000002-0000-0000-0000-000000000002', 'e0000005-0000-0000-0000-000000000001', 'CDR Tower Intersection'],
  ['e0000001-0000-0000-0000-000000000008', 'e0000005-0000-0000-0000-000000000004', 'Executive Office Cell Ping']
];

export let entities = [...DEFAULT_ENTITIES];
export function setEntities(val) {
  entities = val;
}

export let edges = [...DEFAULT_EDGES];
export function setEdges(val) {
  edges = val;
}

export function findCrossLinkedCases(entityIdOrName) {
  if (!entityIdOrName) return [];
  const entity = entities.find(e => e.id === entityIdOrName || e.name === entityIdOrName);
  const name = entity ? entity.name.toLowerCase() : String(entityIdOrName).toLowerCase();
  const phone = entity?.phone ? entity.phone.replace(/[^0-9]/g, '') : '';
  
  return firCases.filter(c => {
    const sName = (c.subject_name || c.subjectName || '').toLowerCase();
    const oName = (c.other_accused || c.otherAccused || '').toLowerCase();
    const cPhone = (c.phone || '').replace(/[^0-9]/g, '');
    const cVeh = (c.vehicle || '').toLowerCase();
    const cBank = (c.bank || '').toLowerCase();
    
    if (sName.includes(name) || oName.includes(name)) return true;
    if (entity?.type === 'Vehicle' && cVeh.includes(name)) return true;
    if (entity?.type === 'Bank' && cBank.includes(name)) return true;
    if (phone && cPhone && (phone.includes(cPhone) || cPhone.includes(phone))) return true;
    return false;
  });
}

export function getCaseForensicMatches(caseId) {
  const targetCase = firCases.find(c => c.id === caseId || c.fir_number === caseId || c.firNumber === caseId);
  if (!targetCase) return [];

  const matches = [];
  const targetPhone = (targetCase.phone || '').replace(/[^0-9]/g, '');
  const targetVeh = (targetCase.vehicle || '').toLowerCase().trim();
  const targetBank = (targetCase.bank || '').toLowerCase().trim();
  const targetSubject = (targetCase.subject_name || targetCase.subjectName || '').toLowerCase().trim();

  firCases.forEach(otherCase => {
    if (otherCase.id === targetCase.id || (otherCase.fir_number && otherCase.fir_number === targetCase.fir_number)) return;

    const shared = [];
    const otherPhone = (otherCase.phone || '').replace(/[^0-9]/g, '');
    const otherVeh = (otherCase.vehicle || '').toLowerCase().trim();
    const otherBank = (otherCase.bank || '').toLowerCase().trim();
    const otherSubject = (otherCase.subject_name || otherCase.subjectName || '').toLowerCase().trim();
    const otherAccused = (otherCase.other_accused || otherCase.otherAccused || '').toLowerCase();

    // Check shared vehicle
    if (targetVeh && otherVeh && (targetVeh.includes(otherVeh) || otherVeh.includes(targetVeh))) {
      shared.push({ type: 'Vehicle', label: targetCase.vehicle, detail: 'Identical vehicle asset cited across both cases' });
    }
    // Check shared burner phone
    if (targetPhone && otherPhone && (targetPhone.includes(otherPhone) || otherPhone.includes(targetPhone))) {
      shared.push({ type: 'Phone', label: targetCase.phone, detail: 'Shared burner mobile / IMEI hardware intersection' });
    }
    // Check shared mule bank
    if (targetBank && otherBank && (targetBank.includes(otherBank) || otherBank.includes(targetBank))) {
      shared.push({ type: 'Bank', label: targetCase.bank, detail: 'Common money laundering account destination' });
    }
    // Check shared subject / co-accused
    if (targetSubject && (otherSubject.includes(targetSubject) || otherAccused.includes(targetSubject))) {
      shared.push({ type: 'Person', label: targetCase.subject_name || targetCase.subjectName, detail: 'Cross-jurisdiction syndicate operative' });
    }

    if (shared.length > 0) {
      matches.push({
        matchedCase: otherCase,
        sharedEntities: shared
      });
    }
  });

  return matches;
}

export const DEFAULT_FIR_CASES = [
  {
    id: 'f0000001-0000-0000-0000-000000000001',
    firNumber: 'FIR-MH-2026-4821',
    fir_number: 'FIR-MH-2026-4821',
    policeStation: 'Cyber Crime Police Station, Shivajinagar',
    police_station: 'Cyber Crime Police Station, Shivajinagar',
    district: 'Pune City',
    incidentDate: '2026-08-14',
    incident_date: '2026-08-14',
    incidentTime: '14:30',
    sections: 'IPC 420, IPC 468, IPC 471, IT Act 66D',
    complainantName: 'Rajesh Kulkarni',
    complainantPhone: '+91 98220 11984',
    complainantAddress: 'Flat 402, Shivajinagar, Pune - 411005',
    subjectName: 'Sameer Khan',
    subject_name: 'Sameer Khan',
    alias: 'Baba Bhai, Sammy, SK',
    otherAccused: 'Vikram Rathi, Ajay Deshmukh',
    phone: '+91 98811 55421',
    vehicle: 'MH-12-PQ-9081',
    bank: 'HDFC-50100492817291',
    incidentLocation: 'FC Road Commercial Complex, Shivajinagar, Pune',
    incidentSummary: 'The complainant was approached under the guise of an investment scheme involving synthetic cryptocurrency routing. Accused Sameer Khan and associates forged digital bond certificates and facilitated fund transfers across unauthorized payment gateways.',
    incident_summary: 'The complainant was approached under the guise of an investment scheme involving synthetic cryptocurrency routing. Accused Sameer Khan and associates forged digital bond certificates and facilitated fund transfers across unauthorized payment gateways.',
    propertySummary: 'Seized items: 1x Jio Burner SIM (+91 98811 55421), White Swift (MH-12-PQ-9081), Bank transaction slips for INR 14,50,000.',
    extractionStatus: 'approved',
    extraction_status: 'approved',
    syndicateGroup: 'ShadowFlow Cyber Racket',
    sourceRefs: ['FIR-MH-2026-4821', 'CDR-JIO-PN', 'SFinDSet-Fraud-Batch']
  },
  {
    id: 'f0000001-0000-0000-0000-000000000002',
    firNumber: 'FIR-MH-2026-1940',
    fir_number: 'FIR-MH-2026-1940',
    policeStation: 'Kothrud Police Station',
    police_station: 'Kothrud Police Station',
    district: 'Pune City',
    incidentDate: '2026-07-22',
    incident_date: '2026-07-22',
    incidentTime: '11:15',
    sections: 'IPC 420, IPC 120B',
    complainantName: 'Sanjay Patil',
    complainantPhone: '+91 97655 44321',
    complainantAddress: 'Near MIT College, Paud Road, Kothrud, Pune',
    subjectName: 'Arjun Pawar',
    subject_name: 'Arjun Pawar',
    alias: 'Student Lead',
    otherAccused: 'Rohit Salunkhe, Deepak Verma',
    phone: '+91 99230 44102',
    vehicle: 'MH-14-EA-7712',
    bank: 'AXIS-91201004812',
    incidentLocation: 'Paud Road, Kothrud, Pune',
    incidentSummary: 'Fraudulent diversion of college admission security deposits through student mule accounts. Account credentials obtained under commission promises.',
    incident_summary: 'Fraudulent diversion of college admission security deposits through student mule accounts. Account credentials obtained under commission promises.',
    propertySummary: 'Seized items: 4x Student ID cards, 12x unlinked debit cards, 1x diary with UPI recovery handles.',
    extractionStatus: 'approved',
    extraction_status: 'approved',
    syndicateGroup: 'Kothrud Safehouse / Mule Hub',
    sourceRefs: ['FIR-MH-2026-1940', 'Kothrud-GD-Diary']
  },
  {
    id: 'f0000001-0000-0000-0000-000000000003',
    firNumber: 'FIR-MH-2026-2811',
    fir_number: 'FIR-MH-2026-2811',
    policeStation: 'Swargate Police Station',
    police_station: 'Swargate Police Station',
    district: 'Pune City',
    incidentDate: '2026-08-11',
    incident_date: '2026-08-11',
    incidentTime: '19:45',
    sections: 'IPC 384, IPC 386, IPC 120B, Arms Act 25',
    complainantName: 'Balasaheb Thorat',
    complainantPhone: '+91 94220 33190',
    complainantAddress: 'Ganesh Peth, Near Timber Market, Swargate, Pune - 411002',
    subjectName: 'Suresh Shinde',
    subject_name: 'Suresh Shinde',
    alias: 'Surya, Anna',
    otherAccused: 'Pappu More, Arjun Pawar',
    phone: '+91 98199 44312',
    vehicle: 'MH-14-EA-7712',
    bank: 'BOM-60129948102',
    incidentLocation: 'Timber Market Road, Swargate, Pune',
    incidentSummary: 'Handwritten extortion slips demanding protection money from timber merchants. Accused Suresh Shinde and bike-borne associates delivered threat notes.',
    incident_summary: 'Handwritten extortion slips demanding protection money from timber merchants. Accused Suresh Shinde and bike-borne associates delivered threat notes.',
    propertySummary: 'Seized items: 1x handwritten extortion demand slip, 1x countrymade firearm, 1x SIM packaging card.',
    extractionStatus: 'approved',
    extraction_status: 'approved',
    syndicateGroup: 'Swargate Extortion & Hawala Ring',
    sourceRefs: ['FIR-MH-2026-2811', 'Swargate-GD-Entry']
  },
  {
    id: 'f0000001-0000-0000-0000-000000000004',
    firNumber: 'FIR-MH-2026-0512',
    fir_number: 'FIR-MH-2026-0512',
    policeStation: 'Bandra Cyber Police Station',
    police_station: 'Bandra Cyber Police Station',
    district: 'Mumbai HQ',
    incidentDate: '2026-08-02',
    incident_date: '2026-08-02',
    incidentTime: '16:00',
    sections: 'IPC 420, IPC 467, IT Act 66C, PMLA 3',
    complainantName: 'Sunita Singhania',
    complainantPhone: '+91 98210 99812',
    complainantAddress: 'Bandra Kurla Complex, Mumbai - 400051',
    subjectName: 'Maya Shelar',
    subject_name: 'Maya Shelar',
    alias: 'Madam, Consultant',
    otherAccused: 'Karan Mehra, Vikram Rathi',
    phone: '+91 98901 22345',
    vehicle: 'MH-01-DK-3490',
    bank: 'KOTAK-9810284711',
    incidentLocation: 'Bandra Kurla Complex (BKC), Mumbai',
    incidentSummary: 'Corporate identity theft and deployment of fake digital bond certificates via Apex Digital Asset LLP. Multi-crore crypto off-ramping.',
    incident_summary: 'Corporate identity theft and deployment of fake digital bond certificates via Apex Digital Asset LLP. Multi-crore crypto off-ramping.',
    propertySummary: 'Seized items: Forged ROC Incorporation Certificates, 2x Ledger Crypto Wallets, Black Fortuner (MH-01-DK-3490).',
    extractionStatus: 'approved',
    extraction_status: 'approved',
    syndicateGroup: 'Apex Offshore Bond Syndicate',
    sourceRefs: ['FIR-MH-2026-0512', 'ROC-Records', 'PMLA-ED-2026']
  }
];

export let firCases = [...DEFAULT_FIR_CASES];

export function setFirCases(val) {
  firCases = val;
}

export const riskColor = { high: '#DC2626', medium: '#F59E0B', low: '#16A34A' };

export const state = {
  authChecking: true,
  locale: localStorage.getItem('locale') || 'en',
  loggedIn: false,
  view: 'overview',
  query: '',
  sort: 'risk',
  type: 'all',
  womenSafetyFilter: false,
  firActiveTab: 'register',
  firDraft: {
    policeStation: '',
    district: '',
    state: 'Maharashtra',
    firNumber: '',
    incidentDate: '',
    incidentTime: '',
    sections: '',
    complainantName: '',
    complainantAge: '',
    complainantFather: '',
    complainantPhone: '',
    complainantAddress: '',
    subjectName: '',
    alias: '',
    otherAccused: '',
    incidentLocation: '',
    phone: '',
    vehicle: '',
    bank: '',
    incidentSummary: '',
    propertySummary: ''
  },
  selected: null,
  activeFilter: 'all',
  file: null,
  fileHash: '',
  filePath: '',
  graphFullscreen: false,
  sidebarCollapsed: false,
  fontScale: parseFloat(localStorage.getItem('font_scale')) || 1,
  firMode: 'upload',
  manualEvidence: [],
  officers: loadSavedOfficers(),
  editingOfficerId: null,
  officerFormRole: 'case-officer',
  auditLogs: loadSavedAuditLogs(),
  auditLevelFilter: 'all',
  auditSearchQuery: '',
  auditActorFilter: 'all',
  auditActionFilter: 'all',
  loginError: '',
  loginEmail: '',
  previewModalFile: null,
  profileEntityId: null,
  profileHistory: [],
  previousViewBeforeProfile: 'network',
  graphSideTab: 'dossier',
  directorySearchQuery: '',
  directoryCategoryFilter: 'all',
  ocrEngine: 'auto', // 'auto', 'handwritten', 'printed'
  ocrScriptDetected: '',
  ocrConfidence: 0,
  graphExploration: {
    active: false, // false shows the full launchpad selection menu
    mode: 'focused', // 'focused' or 'all'
    seedId: null,
    previousSeedId: null,
    previousMode: 'focused',
    expandedNodeIds: [],
    hiddenNodeIds: []
  }
};

export function openEntityProfile(entityId) {
  if (state.view !== 'entity_profile') {
    state.previousViewBeforeProfile = state.view || 'network';
    state.profileHistory = [];
  } else if (state.profileEntityId && state.profileEntityId !== entityId) {
    state.profileHistory.push(state.profileEntityId);
  }
  state.profileEntityId = entityId;
  state.selected = entityId;
  state.view = 'entity_profile';
  notifyStateChange();
}

export function backEntityProfile() {
  if (state.profileHistory.length > 0) {
    const previousId = state.profileHistory.pop();
    state.profileEntityId = previousId;
    state.selected = previousId;
    notifyStateChange();
  } else {
    state.view = state.previousViewBeforeProfile || 'network';
    state.profileEntityId = null;
    notifyStateChange();
  }
}

export function getVisibleGraphNodeIds() {
  if (!state.graphExploration.active) {
    return new Set();
  }
  const hidden = new Set(state.graphExploration.hiddenNodeIds || []);
  let visible;
  if (state.graphExploration.mode === 'all') {
    visible = new Set(entities.map(e => e.id));
  } else {
    visible = new Set(state.graphExploration.expandedNodeIds || []);
    if (state.graphExploration.seedId) {
      visible.add(state.graphExploration.seedId);
    }
    // Include direct 1-hop neighbors of any expanded node
    (state.graphExploration.expandedNodeIds || []).forEach(nodeId => {
      edges.forEach(edge => {
        if (edge[0] === nodeId) visible.add(edge[1]);
        if (edge[1] === nodeId) visible.add(edge[0]);
      });
    });
  }
  // Exclude explicitly hidden nodes
  hidden.forEach(id => visible.delete(id));
  return visible;
}

export function startGraphInvestigation(seedId) {
  state.graphExploration.active = true;
  state.graphExploration.mode = 'focused';
  state.graphExploration.seedId = seedId;
  state.graphExploration.expandedNodeIds = [seedId];
  state.graphExploration.hiddenNodeIds = [];
  state.selected = seedId;
  notifyStateChange();
}

export function returnToGraphLaunchpad() {
  state.graphExploration.active = false;
  state.graphExploration.seedId = null;
  state.graphExploration.expandedNodeIds = [];
  state.graphExploration.hiddenNodeIds = [];
  state.selected = null;
  notifyStateChange();
}

export function expandGraphNode(nodeId) {
  if (!state.graphExploration.expandedNodeIds) {
    state.graphExploration.expandedNodeIds = [];
  }
  if (state.graphExploration.hiddenNodeIds) {
    state.graphExploration.hiddenNodeIds = state.graphExploration.hiddenNodeIds.filter(id => id !== nodeId);
  }
  if (!state.graphExploration.expandedNodeIds.includes(nodeId)) {
    state.graphExploration.expandedNodeIds.push(nodeId);
  }
  state.graphExploration.active = true;
  notifyStateChange();
}

export function collapseGraphNode(nodeId) {
  if (!state.graphExploration.hiddenNodeIds) {
    state.graphExploration.hiddenNodeIds = [];
  }
  if (!state.graphExploration.hiddenNodeIds.includes(nodeId)) {
    state.graphExploration.hiddenNodeIds.push(nodeId);
  }
  state.graphExploration.expandedNodeIds = (state.graphExploration.expandedNodeIds || []).filter(id => id !== nodeId);
  notifyStateChange();
}

export function setGraphSeed(seedId) {
  if (state.graphExploration.seedId !== seedId) {
    state.graphExploration.previousSeedId = state.graphExploration.seedId;
    state.graphExploration.previousMode = state.graphExploration.mode;
  }
  startGraphInvestigation(seedId);
}

export function toggleGraphSeed(seedId) {
  // If this entity is already the active focal seed, toggle it OFF!
  const isCurrentlySeed = state.graphExploration.active &&
    state.graphExploration.seedId === seedId &&
    state.graphExploration.mode === 'focused';

  if (isCurrentlySeed) {
    const prevSeed = state.graphExploration.previousSeedId;
    const prevMode = state.graphExploration.previousMode;

    if (prevSeed && prevSeed !== seedId) {
      state.graphExploration.previousSeedId = null;
      startGraphInvestigation(prevSeed);
    } else if (prevMode === 'all') {
      showFullGraphUniverse();
    } else {
      showFullGraphUniverse();
    }
  } else {
    // Turning it ON: remember current state before setting
    state.graphExploration.previousSeedId = state.graphExploration.seedId;
    state.graphExploration.previousMode = state.graphExploration.mode;
    startGraphInvestigation(seedId);
  }
}

export function resetGraphExploration() {
  const seed = state.graphExploration.seedId;
  state.customNodePositions = {};
  state.graphExploration.hiddenNodeIds = [];
  if (seed) {
    state.graphExploration.active = true;
    state.graphExploration.expandedNodeIds = [seed];
    state.graphExploration.mode = 'focused';
    state.selected = seed;
  } else {
    state.graphExploration.active = false;
  }
  notifyStateChange();
}

export function showFullGraphUniverse() {
  state.graphExploration.active = true;
  state.graphExploration.mode = 'all';
  state.graphExploration.hiddenNodeIds = [];
  if (!state.selected && entities.length > 0) {
    state.selected = entities[0].id;
  }
  notifyStateChange();
}

export function getActiveOfficer() {
  const you = state.officers.find(o => o.isYou);
  if (you) {
    const initials = (you.name || 'Officer').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'OF';
    return {
      id: you.id,
      name: you.name,
      initials,
      role: `${you.rank || 'Officer'} · ${you.district || 'Command'}`,
      rawRole: you.role || 'case-officer',
      isAdmin: you.role === 'admin'
    };
  }
  return {
    id: null,
    name: 'Investigator',
    initials: 'IN',
    role: 'Case Officer',
    rawRole: 'case-officer',
    isAdmin: false
  };
}

export function saveOfficers() {
  try {
    localStorage.setItem('netrakshak_officers', JSON.stringify(state.officers));
  } catch (e) {}
}

export async function recordAudit(action, summary, level = 'info', actionType = 'system', customActor = null) {
  const now = new Date();
  const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const selfOfficer = state.officers.find(o => o.isYou);
  const actorName = customActor || selfOfficer?.name || 'Officer';
  const actorInitials = selfOfficer ? selfOfficer.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'OF';
  const entry = {
    id: 'log_' + Date.now(),
    time: timeStr,
    actor: actorName,
    actorInitials: actorInitials,
    level,
    action,
    actionType,
    summary
  };
  state.auditLogs.unshift(entry);
  try {
    localStorage.setItem('netrakshak_audit_logs', JSON.stringify(state.auditLogs));
  } catch (e) {}

  if (supabaseConfigured) {
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const user = data?.session?.user;
        if (user) {
          const payload = JSON.stringify({ action, summary, level, at: now.toISOString() });
          const hash = await hashText(payload);
          await supabase.from('audit_events').insert({
            actor_id: user.id,
            action,
            resource_type: actionType,
            change_summary: { summary, level },
            event_hash: hash
          });
        }
      } catch (err) {
        console.warn('Supabase audit insert:', err);
      }
    })();
  }
}

export async function loadSupabaseData() {
  if (!supabaseConfigured) return;
  try {
    const { data } = await supabase.auth.getSession();
    const user = data?.session?.user;
    if (!user) return;

    // Load all data concurrently in parallel
    const [
      { data: events },
      { data: dbProfiles },
      { data: dbEntities },
      { data: dbRels },
      { data: dbCases },
      { data: dbCdrs },
      { data: dbFinances },
      { data: dbEvidence }
    ] = await Promise.all([
      supabase.from('audit_events').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('profiles').select('*').order('created_at', { ascending: true }),
      supabase.from('entities').select('*').order('created_at', { ascending: false }),
      supabase.from('relationships').select('*'),
      supabase.from('fir_cases').select('*').order('created_at', { ascending: false }),
      supabase.from('cdr_records').select('*').order('call_timestamp', { ascending: false }),
      supabase.from('financial_transactions').select('*').order('transaction_timestamp', { ascending: false }),
      supabase.from('evidence_items').select('*')
    ]);

    if (events && events.length > 0) {
      state.auditLogs = events.map(e => {
        const d = new Date(e.created_at);
        const timeStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
        const isSelf = e.actor_id === user.id;
        const actorName = isSelf ? (user.user_metadata?.display_name || user.email?.split('@')[0] || 'Officer') : 'Officer';
        const actorInitials = isSelf ? (actorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()) : 'OF';
        return {
          id: e.id,
          time: timeStr,
          actor: actorName,
          actorInitials: actorInitials,
          level: e.change_summary?.level || 'info',
          action: e.action || 'Audit event',
          actionType: e.resource_type || 'system',
          summary: e.change_summary?.summary || e.action || 'Event recorded'
        };
      });
      try {
        localStorage.setItem('netrakshak_audit_logs', JSON.stringify(state.auditLogs));
      } catch (e) {}
    }

    if (dbProfiles && dbProfiles.length > 0) {
      state.officers = dbProfiles.map(p => ({
        id: p.id,
        name: p.display_name || p.email?.split('@')[0] || 'Officer',
        rank: p.rank || 'Inspector',
        district: p.district || '',
        state: p.state || 'Maharashtra',
        email: p.email || '',
        phone: p.phone || '',
        role: p.role_name || 'case-officer',
        isYou: user.id === p.id || user.email === p.email
      }));
      saveOfficers();
    }

    if (dbEntities && dbEntities.length > 0) {
      const fetchedEntities = dbEntities.map((e, idx) => ({
        id: e.id,
        name: e.display_name,
        local: e.aliases?.[0] || e.display_name,
        type: e.entity_type ? (e.entity_type === 'bank_account' ? 'Bank' : e.entity_type.charAt(0).toUpperCase() + e.entity_type.slice(1)) : 'Entity',
        category: (e.entity_type || 'person').toLowerCase() === 'bank_account' ? 'bank' : (e.entity_type || 'person').toLowerCase(),
        risk: e.risk_level || 'low',
        city: e.identifiers?.city || e.identifiers?.address || e.identifiers?.location || e.identifiers?.zone || '',
        phone: e.identifiers?.phone || (e.entity_type === 'phone' ? e.display_name : ''),
        identifiers: e.identifiers || {},
        events: Array.isArray(e.source_refs) ? e.source_refs.length : 1,
        recent: 85,
        x: 350 + Math.cos(idx) * 180,
        y: 250 + Math.sin(idx) * 180
      }));

      entities = fetchedEntities;
    } else {
      entities = [...DEFAULT_ENTITIES];
    }

    if (dbRels && dbRels.length > 0) {
      edges = dbRels.map(r => [r.source_entity_id, r.target_entity_id, r.relationship_type || 'Link']);
    } else {
      edges = [...DEFAULT_EDGES];
    }

    if (dbCases && dbCases.length > 0) {
      firCases = dbCases;
    }

    if (dbCdrs && dbCdrs.length > 0) {
      state.cdrRecords = dbCdrs;
    }

    if (dbFinances && dbFinances.length > 0) {
      state.financialTransactions = dbFinances;
    }

    if (dbEvidence && dbEvidence.length > 0) {
      state.evidenceItems = dbEvidence;
    }

    notifyStateChange();
  } catch (err) {
    console.warn('Supabase load error:', err);
  }
}

export async function verifyOfficerAuthorization(user) {
  if (!user) return { authorized: false, reason: 'Authentication required' };
  try {
    let profile = null;
    const { data: byId, error: errId } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (byId) {
      profile = byId;
    } else {
      const { data: byEmail, error: errEmail } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', user.email || '')
        .maybeSingle();

      if (byEmail) {
        profile = byEmail;
      } else if (errId || errEmail) {
        const errMsg = errId?.message || errEmail?.message || 'Unknown database error';
        console.warn('Profile authorization error:', errId || errEmail);
        return { authorized: false, reason: `Database error: ${errMsg}` };
      }
    }

    if (!profile) {
      return { authorized: false, reason: `Account "${user.email}" is not registered in the Law Enforcement Officer Directory.` };
    }
    if (profile.is_active === false) {
      return { authorized: false, reason: 'Officer credentials have been deactivated by system administrator.' };
    }
    return { authorized: true, profile };
  } catch (err) {
    return { authorized: false, reason: err.message || 'Authorization check failed.' };
  }
}

export let isAuthActionInProgress = false;

export function setLoginInlineError(message) {
  state.loginError = message;
  const form = document.querySelector('.login-form');
  if (!form) return;

  const emailInput = form.querySelector('input[type="email"]');
  const passInput = form.querySelector('input[type="password"]');
  const submitBtn = form.querySelector('button[type="submit"]');

  if (emailInput) emailInput.classList.add('input-error');
  if (passInput) passInput.classList.add('input-error');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');
  }

  let errorEl = form.querySelector('.login-inline-error');
  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.className = 'login-inline-error';
    errorEl.setAttribute('role', 'alert');
    errorEl.innerHTML = `<span class="error-icon">⚠</span><span class="error-text">${message}</span>`;
    const passLabel = passInput ? passInput.closest('label') : null;
    if (passLabel && passLabel.nextSibling) {
      form.insertBefore(errorEl, passLabel.nextSibling);
    } else if (submitBtn) {
      form.insertBefore(errorEl, submitBtn);
    } else {
      form.appendChild(errorEl);
    }
  } else {
    const textSpan = errorEl.querySelector('.error-text') || errorEl.querySelector('span:last-child');
    if (textSpan) textSpan.textContent = message;
    errorEl.style.display = 'flex';
  }
}

export function clearLoginInlineError() {
  state.loginError = '';
  const form = document.querySelector('.login-form');
  if (!form) return;
  const errorEl = form.querySelector('.login-inline-error');
  if (errorEl) errorEl.remove();
  const inputs = form.querySelectorAll('input');
  inputs.forEach(inp => inp.classList.remove('input-error'));
}

export async function signInOfficer(form) {
  if (isAuthActionInProgress) return;
  isAuthActionInProgress = true;

  const email = form.querySelector('input[type="email"]')?.value?.trim() || '';
  const password = form.querySelector('input[type="password"]')?.value || '';
  state.loginEmail = email;

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Verifying…</span>`;
  }

  try {
    if (supabaseConfigured) {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !authData?.user) {
        setLoginInlineError('Invalid email address or password. Please verify your credentials.');
        return;
      }

      const check = await verifyOfficerAuthorization(authData.user);
      if (!check.authorized) {
        supabase.auth.signOut().catch(() => {});
        state.loggedIn = false;
        setLoginInlineError(`Access Denied: ${check.reason}`);
        return;
      }

      state.loggedIn = true;
      state.loginError = '';
      notifyStateChange();
      recordAudit('Login event', `Signed in (${email}).`, 'info', 'login').catch(() => {});
      loadSupabaseData();
      return;
    }

    localStorage.setItem('demoSession', 'true');
    state.loggedIn = true;
    state.loginError = '';
    notifyStateChange();
    recordAudit('Login event', `Signed in (${email}).`, 'info', 'login').catch(() => {});
  } catch (err) {
    setLoginInlineError('An error occurred during authentication. Please try again.');
  } finally {
    isAuthActionInProgress = false;
    if (submitBtn && !state.loggedIn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Sign in <span>→</span>`;
    }
  }
}

export async function signOutOfficer() {
  recordAudit('Logoff event', 'Signed out of session.', 'info', 'logoff').catch(() => {});
  localStorage.removeItem('demoSession');
  state.loggedIn = false;
  state.loginError = '';
  notifyStateChange();
  if (supabaseConfigured) {
    supabase.auth.signOut().catch(() => {});
  }
}

export async function bootstrapAuth() {
  try {
    if (supabaseConfigured) {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        const check = await verifyOfficerAuthorization(data.session.user);
        if (check.authorized) {
          state.loggedIn = true;
          await loadSupabaseData();
        } else {
          await supabase.auth.signOut().catch(() => {});
          state.loggedIn = false;
          if (check.reason) state.loginError = check.reason;
        }
      } else {
        state.loggedIn = false;
      }
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (isAuthActionInProgress) return;

        if (session?.user) {
          const check = await verifyOfficerAuthorization(session.user);
          if (!check.authorized) {
            await supabase.auth.signOut().catch(() => {});
            if (state.loggedIn) {
              state.loggedIn = false;
              setLoginInlineError(`Access Denied: ${check.reason}`);
            }
            return;
          }
          if (!state.loggedIn) {
            state.loggedIn = true;
            state.loginError = '';
            await loadSupabaseData();
            notifyStateChange();
          }
        } else {
          if (state.loggedIn) {
            state.loggedIn = false;
            notifyStateChange();
          }
        }
      });
    } else if (localStorage.getItem('demoSession') === 'true') {
      state.loggedIn = true;
    } else {
      state.loggedIn = false;
    }
  } catch (err) {
    console.warn('Auth bootstrap error:', err);
    state.loggedIn = false;
  } finally {
    state.authChecking = false;
    notifyStateChange();
  }
}
