// Demo mode flag - set to true to enable demo mode with mock data
export const DEMO_MODE = true;

// Demo user profile
export const demoProfile = {
  id: 'demo-user-123',
  full_name: 'Chandrasekhar',
  degree_type: 'MD',
  specialty: 'Internal Medicine',
  email: 'demo@cmeagent.com',
};

// Demo licenses with requirements
export const demoLicenses = [
  {
    id: 'license-ca-1',
    state: 'California',
    license_number: 'MD-123456',
    expiry_date: '2026-12-15',
    total_credits_required: 50,
    creditsEarned: 35,
    requirements: [
      { id: 'req-1', category: 'General', required: 35, earned: 25 },
      { id: 'req-2', category: 'Controlled Substances', required: 10, earned: 10 },
      { id: 'req-3', category: 'Risk Management', required: 5, earned: 0 },
    ],
  },
  {
    id: 'license-tx-1',
    state: 'Texas',
    license_number: 'TX-789012',
    expiry_date: '2025-08-31',
    total_credits_required: 24,
    creditsEarned: 24,
    requirements: [
      { id: 'req-4', category: 'General', required: 20, earned: 20 },
      { id: 'req-5', category: 'Ethics', required: 4, earned: 4 },
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
    category: 'Controlled Substances',
    completion_date: '2025-01-15',
    status: 'verified',
  },
  {
    id: 'cert-2',
    course_name: 'Pain Management Essentials',
    provider: 'AAFP',
    credits: 4,
    category: 'General',
    completion_date: '2025-01-10',
    status: 'verified',
  },
  {
    id: 'cert-3',
    course_name: 'Medical Ethics in Practice',
    provider: 'Texas Medical Association',
    credits: 4,
    category: 'Ethics',
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
