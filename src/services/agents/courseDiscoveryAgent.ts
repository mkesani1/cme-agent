/**
 * CME Course Discovery Agent
 *
 * This agent searches for CME courses across the web based on a doctor's profile,
 * licenses, and specialty. It builds a personalized course database over time.
 *
 * The agent runs in the background and:
 * 1. Analyzes the doctor's profile and license requirements
 * 2. Searches CME providers for matching courses
 * 3. Evaluates courses for relevance and efficiency
 * 4. Stores discovered courses in Supabase for recommendations
 */

import { supabase } from '../../lib/supabase';

// Types for the agent system
export interface DoctorProfile {
  id: string;
  full_name: string;
  degree_type: string;
  specialty?: string;
  npi_number?: string;
}

export interface License {
  id: string;
  state: string;
  license_number: string;
  expiration_date: string;
  total_credits_required: number;
  credits_completed: number;
  category1_required?: number;
  ethics_required?: number;
  controlled_substance_required?: number;
  state_specific_required?: number;
}

export interface DiscoveredCourse {
  id?: string;
  title: string;
  provider: string;
  provider_url: string;
  credits: number;
  credit_types: string[];
  accreditation: string[];
  states_accepted: string[];
  specialty_focus: string[];
  price?: number;
  duration_hours?: number;
  format: 'online' | 'in-person' | 'hybrid';
  description: string;
  topics: string[];
  source_url: string;
  discovered_at: string;
  relevance_score?: number;
  efficiency_score?: number;
}

export interface AgentSearchConfig {
  profile: DoctorProfile;
  licenses: License[];
  prioritizeGaps?: boolean;
  maxResults?: number;
}

// Known CME provider endpoints (in production, these would be API integrations)
const CME_PROVIDERS = [
  {
    name: 'ACCME',
    baseUrl: 'https://accme.org',
    searchEndpoint: '/cme-activities',
    categories: ['Category 1', 'AMA PRA'],
  },
  {
    name: 'AMA',
    baseUrl: 'https://edhub.ama-assn.org',
    searchEndpoint: '/search',
    categories: ['AMA PRA Category 1', 'Ethics'],
  },
  {
    name: 'Medscape',
    baseUrl: 'https://www.medscape.org',
    searchEndpoint: '/cme',
    categories: ['Category 1', 'MOC'],
  },
  {
    name: 'UpToDate',
    baseUrl: 'https://www.uptodate.com',
    searchEndpoint: '/cme',
    categories: ['Category 1', 'MOC', 'Self-Assessment'],
  },
  {
    name: 'AudioDigest',
    baseUrl: 'https://www.audio-digest.org',
    searchEndpoint: '/courses',
    categories: ['Category 1'],
  },
  {
    name: 'Pri-Med',
    baseUrl: 'https://www.pri-med.com',
    searchEndpoint: '/cme-courses',
    categories: ['Category 1', 'AAFP', 'AANP'],
  },
  {
    name: 'BoardVitals',
    baseUrl: 'https://www.boardvitals.com',
    searchEndpoint: '/cme',
    categories: ['MOC', 'Board Review'],
  },
];

// State-specific CME requirements database
const STATE_REQUIREMENTS: Record<string, {
  totalCredits: number;
  renewalCycle: number;
  specialRequirements: { type: string; credits: number }[];
}> = {
  TX: {
    totalCredits: 48,
    renewalCycle: 24, // months
    specialRequirements: [
      { type: 'ethics', credits: 2 },
      { type: 'controlled_substance', credits: 2 },
    ],
  },
  CA: {
    totalCredits: 50,
    renewalCycle: 24,
    specialRequirements: [
      { type: 'pain_management', credits: 12 },
      { type: 'geriatric_medicine', credits: 4 },
    ],
  },
  NY: {
    totalCredits: 50,
    renewalCycle: 24,
    specialRequirements: [
      { type: 'infection_control', credits: 4 },
      { type: 'child_abuse', credits: 2 },
    ],
  },
  FL: {
    totalCredits: 40,
    renewalCycle: 24,
    specialRequirements: [
      { type: 'prevention_medical_errors', credits: 2 },
      { type: 'controlled_substance', credits: 2 },
      { type: 'domestic_violence', credits: 2 },
    ],
  },
  // Add more states as needed
};

/**
 * Calculate credit gaps for a license
 */
export function calculateCreditGaps(license: License): {
  totalGap: number;
  categoryGaps: Record<string, number>;
} {
  const totalGap = license.total_credits_required - license.credits_completed;

  const categoryGaps: Record<string, number> = {};

  if (license.category1_required) {
    categoryGaps.category1 = Math.max(0, license.category1_required - (license.credits_completed * 0.6)); // Estimate
  }
  if (license.ethics_required) {
    categoryGaps.ethics = license.ethics_required; // Assume not completed
  }
  if (license.controlled_substance_required) {
    categoryGaps.controlled_substance = license.controlled_substance_required;
  }
  if (license.state_specific_required) {
    categoryGaps.state_specific = license.state_specific_required;
  }

  return { totalGap, categoryGaps };
}

/**
 * Generate search queries based on profile and gaps
 */
export function generateSearchQueries(
  profile: DoctorProfile,
  licenses: License[]
): string[] {
  const queries: string[] = [];

  // Add specialty-based queries
  if (profile.specialty) {
    queries.push(`CME ${profile.specialty}`);
    queries.push(`${profile.specialty} continuing education`);
  }

  // Add degree-based queries
  const degreeMap: Record<string, string> = {
    md: 'physician',
    do: 'osteopathic physician',
    np: 'nurse practitioner',
    pa: 'physician assistant',
    rn: 'registered nurse',
  };

  if (profile.degree_type && degreeMap[profile.degree_type.toLowerCase()]) {
    queries.push(`CME for ${degreeMap[profile.degree_type.toLowerCase()]}`);
  }

  // Add state-specific queries
  for (const license of licenses) {
    const stateReqs = STATE_REQUIREMENTS[license.state];
    if (stateReqs) {
      queries.push(`${license.state} medical CME requirements`);
      for (const req of stateReqs.specialRequirements) {
        queries.push(`${req.type.replace('_', ' ')} CME ${license.state}`);
      }
    }
  }

  // Add gap-specific queries
  for (const license of licenses) {
    const { categoryGaps } = calculateCreditGaps(license);
    for (const [category, gap] of Object.entries(categoryGaps)) {
      if (gap > 0) {
        queries.push(`${category.replace('_', ' ')} CME credits`);
      }
    }
  }

  return [...new Set(queries)]; // Remove duplicates
}

/**
 * Score a course for relevance to a profile
 */
export function scoreCourserelevance(
  course: DiscoveredCourse,
  profile: DoctorProfile,
  licenses: License[]
): number {
  let score = 0;

  // State acceptance (critical)
  const licenseStates = licenses.map((l) => l.state);
  const statesAccepted = course.states_accepted.filter((s) =>
    licenseStates.includes(s)
  );
  score += statesAccepted.length * 20;

  // Specialty match
  if (
    profile.specialty &&
    course.specialty_focus.some((s) =>
      s.toLowerCase().includes(profile.specialty!.toLowerCase())
    )
  ) {
    score += 30;
  }

  // Credit efficiency (more credits = higher score)
  score += Math.min(course.credits * 5, 25);

  // Multi-state acceptance bonus
  if (statesAccepted.length > 1) {
    score += statesAccepted.length * 10;
  }

  // Format preference (online is often more convenient)
  if (course.format === 'online') {
    score += 10;
  }

  // Price factor (free or low cost)
  if (!course.price || course.price === 0) {
    score += 15;
  } else if (course.price < 100) {
    score += 10;
  }

  return Math.min(score, 100); // Cap at 100
}

/**
 * Calculate efficiency score (credits per hour or dollar)
 */
export function calculateEfficiencyScore(course: DiscoveredCourse): number {
  let score = 50; // Base score

  // Credits per hour
  if (course.duration_hours && course.duration_hours > 0) {
    const creditsPerHour = course.credits / course.duration_hours;
    score += Math.min(creditsPerHour * 20, 30);
  }

  // Credits per dollar (if paid)
  if (course.price && course.price > 0) {
    const creditsPerDollar = course.credits / course.price;
    score += Math.min(creditsPerDollar * 100, 20);
  } else {
    score += 20; // Bonus for free courses
  }

  return Math.min(score, 100);
}

/**
 * Save discovered courses to Supabase
 */
export async function saveDiscoveredCourses(
  courses: DiscoveredCourse[],
  userId: string
): Promise<void> {
  const coursesToInsert = courses.map((course) => ({
    ...course,
    discovered_by: userId,
    discovered_at: new Date().toISOString(),
  }));

  // Upsert to avoid duplicates (based on source_url)
  const { error } = await supabase
    .from('discovered_courses')
    .upsert(coursesToInsert, {
      onConflict: 'source_url',
      ignoreDuplicates: true,
    });

  if (error) {
    console.error('Error saving discovered courses:', error);
    throw error;
  }
}

/**
 * Get personalized course recommendations
 */
export async function getRecommendedCourses(
  profile: DoctorProfile,
  licenses: License[],
  limit: number = 10
): Promise<DiscoveredCourse[]> {
  // First, get all courses from the database
  const { data: courses, error } = await supabase
    .from('discovered_courses')
    .select('*')
    .order('relevance_score', { ascending: false })
    .limit(50);

  if (error || !courses) {
    console.error('Error fetching courses:', error);
    return [];
  }

  // Score and sort courses
  const scoredCourses = courses.map((course) => ({
    ...course,
    relevance_score: scoreCourserelevance(course, profile, licenses),
    efficiency_score: calculateEfficiencyScore(course),
  }));

  // Sort by combined score
  scoredCourses.sort((a, b) => {
    const scoreA = (a.relevance_score || 0) + (a.efficiency_score || 0);
    const scoreB = (b.relevance_score || 0) + (b.efficiency_score || 0);
    return scoreB - scoreA;
  });

  return scoredCourses.slice(0, limit);
}

/**
 * Main agent function - runs discovery process
 */
export async function runCourseDiscoveryAgent(
  config: AgentSearchConfig
): Promise<{
  queries: string[];
  coursesFound: number;
  topRecommendations: DiscoveredCourse[];
}> {
  const { profile, licenses, maxResults = 20 } = config;

  // Generate search queries
  const queries = generateSearchQueries(profile, licenses);

  // In production, this would make actual API calls to CME providers
  // For now, we'll simulate discovered courses based on the queries
  const discoveredCourses = await simulateDiscovery(queries, profile, licenses);

  // Save to database
  if (discoveredCourses.length > 0) {
    await saveDiscoveredCourses(discoveredCourses, profile.id);
  }

  // Get top recommendations
  const topRecommendations = await getRecommendedCourses(
    profile,
    licenses,
    maxResults
  );

  return {
    queries,
    coursesFound: discoveredCourses.length,
    topRecommendations,
  };
}

/**
 * Simulate course discovery (in production, replace with actual API calls)
 */
async function simulateDiscovery(
  queries: string[],
  profile: DoctorProfile,
  licenses: License[]
): Promise<DiscoveredCourse[]> {
  // This is a simulation - in production, this would make real HTTP requests
  // to CME provider APIs or scrape their websites

  const simulatedCourses: DiscoveredCourse[] = [];
  const licenseStates = licenses.map((l) => l.state);

  // Generate some simulated courses based on queries
  for (let i = 0; i < Math.min(queries.length * 2, 10); i++) {
    const provider = CME_PROVIDERS[i % CME_PROVIDERS.length];

    simulatedCourses.push({
      title: `${profile.specialty || 'Medical'} CME Course ${i + 1}`,
      provider: provider.name,
      provider_url: provider.baseUrl,
      credits: Math.floor(Math.random() * 10) + 1,
      credit_types: provider.categories.slice(0, 2),
      accreditation: ['ACCME', 'AMA PRA'],
      states_accepted: licenseStates,
      specialty_focus: profile.specialty ? [profile.specialty] : ['General'],
      price: Math.random() > 0.3 ? Math.floor(Math.random() * 200) : 0,
      duration_hours: Math.floor(Math.random() * 8) + 1,
      format: 'online',
      description: `Comprehensive CME course covering latest developments in ${profile.specialty || 'medicine'}`,
      topics: queries.slice(0, 3).map((q) => q.replace('CME ', '')),
      source_url: `${provider.baseUrl}/course-${Date.now()}-${i}`,
      discovered_at: new Date().toISOString(),
    });
  }

  return simulatedCourses;
}

/**
 * Schedule periodic discovery (call this on app startup or periodically)
 */
export async function schedulePeriodicDiscovery(
  userId: string,
  intervalHours: number = 24
): Promise<NodeJS.Timeout> {
  // Get user profile and licenses
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  const { data: licenses } = await supabase
    .from('licenses')
    .select('*')
    .eq('user_id', userId);

  if (!profile || !licenses) {
    throw new Error('Could not load profile or licenses');
  }

  // Run initial discovery
  await runCourseDiscoveryAgent({ profile, licenses });

  // Schedule periodic runs
  const interval = setInterval(async () => {
    try {
      await runCourseDiscoveryAgent({ profile, licenses });
      console.log('Completed periodic course discovery');
    } catch (err) {
      console.error('Error in periodic discovery:', err);
    }
  }, intervalHours * 60 * 60 * 1000);

  return interval;
}
