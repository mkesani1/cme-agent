// Demo mode flag - set to true to enable demo mode with mock data
export const DEMO_MODE = true;

// Demo credentials for auto-login (backed by real Supabase data)
export const DEMO_EMAIL = 'test.user.cme@example.com';
export const DEMO_PASSWORD = 'demo123456';

// Demo user profile (fallback while auth loads)
export const demoProfile = {
  id: '4dfed7c3-2512-4e35-9c18-22f523c1e69b',
  full_name: 'Geetha Chandrasekhar',
  degree_type: 'MD',
  specialty: 'Internal Medicine',
  email: DEMO_EMAIL,
};

// State code → full name mapping
export const stateNames: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas',
  CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware',
  FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho',
  IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas',
  KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada',
  NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York',
  NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
  OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah',
  VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia',
  WI: 'Wisconsin', WY: 'Wyoming', DC: 'District of Columbia',
};

export function getStateName(code: string | null): string {
  if (!code) return 'Unknown';
  const trimmed = code.trim();
  return stateNames[trimmed] || trimmed;
}

// Demo licenses with requirements — sorted by expiry (soonest first)
// Dates are relative to current: Feb 2026
export const demoLicenses = [
  {
    id: 'license-tx-1',
    state: 'Texas',
    license_number: 'TX-789012',
    expiry_date: '2026-04-30',      // ~2 months out → RED (within 3 months)
    total_credits_required: 48,
    creditsEarned: 32,
    requirements: [
      { id: 'req-4', category: 'general', required: 24, earned: 20 },
      { id: 'req-5', category: 'ethics', required: 4, earned: 4 },
      { id: 'req-6', category: 'pain_management', required: 10, earned: 4 },
      { id: 'req-7', category: 'controlled_substances', required: 10, earned: 4 },
    ],
  },
  {
    id: 'license-ca-1',
    state: 'California',
    license_number: 'A-123456',
    expiry_date: '2026-12-31',      // ~10 months out → YELLOW (due this year)
    total_credits_required: 50,
    creditsEarned: 35,
    requirements: [
      { id: 'req-1', category: 'general', required: 35, earned: 25 },
      { id: 'req-2', category: 'controlled_substances', required: 10, earned: 10 },
      { id: 'req-3', category: 'risk_management', required: 5, earned: 0 },
    ],
  },
  {
    id: 'license-ny-1',
    state: 'New York',
    license_number: 'NY-345678',
    expiry_date: '2027-09-30',      // Next year → Normal (no highlight)
    total_credits_required: 40,
    creditsEarned: 40,
    requirements: [
      { id: 'req-8', category: 'general', required: 40, earned: 40 },
    ],
  },
];

// Demo certificates
export const demoCertificates = [
  {
    id: 'cert-1',
    course_name: 'Opioid Prescribing: Safe Practices',
    provider: 'AMA Ed Hub',
    credits: 3,
    category: 'controlled_substances',
    completion_date: '2025-01-15',
    status: 'verified',
  },
  {
    id: 'cert-2',
    course_name: 'Pain Management Essentials',
    provider: 'AAFP',
    credits: 4,
    category: 'general',
    completion_date: '2025-01-10',
    status: 'verified',
  },
  {
    id: 'cert-3',
    course_name: 'Medical Ethics in Practice',
    provider: 'Texas Medical Association',
    credits: 4,
    category: 'ethics',
    completion_date: '2024-12-20',
    status: 'verified',
  },
];

// Helper function to format licenses for dashboard
export function getDemoLicensesFormatted() {
  return demoLicenses.map(license => ({
    id: license.id,
    state: license.state,
    license_number: license.license_number,
    expiry_date: license.expiry_date,
    total_credits_required: license.total_credits_required,
    creditsEarned: license.creditsEarned,
    requirements: license.requirements,
    progress: Math.round((license.creditsEarned / license.total_credits_required) * 100),
  }));
}
