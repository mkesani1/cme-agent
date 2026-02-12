# AI-Powered CME Course Recommendation Engine

## Technical Specification v1.0

### Executive Summary

Build an intelligent recommendation system that analyzes a physician's multi-state license requirements, identifies gaps, and recommends optimal CME courses that maximize credit coverage across multiple states simultaneously—saving time and money.

---

## 1. Problem Statement

Multi-state physicians face a complex optimization problem:
- 5-15 state licenses with different requirements
- Each state has unique category requirements (Ethics, Pain Management, Controlled Substances, etc.)
- Taking courses individually is inefficient—many courses satisfy multiple states
- Manual research takes 10+ hours/year

**The Solution:** An AI agent that automatically finds courses providing maximum "bang for your buck."

---

## 2. Core Features

### 2.1 Gap Analysis Engine
Automatically analyzes all user licenses and identifies:
- **Category gaps**: Where earned < required
- **Hours needed**: Exact deficit per category per state
- **Urgency score**: Based on license expiry date
- **Priority ranking**: Which gaps to fill first

### 2.2 Multi-State Course Optimizer
Finds courses that satisfy multiple requirements:
- Cross-references course accreditations against user's state requirements
- Calculates **efficiency score**: (total credits satisfied) / (course hours)
- Identifies courses that cover 3+ states simultaneously
- Factors in cost optimization (free vs. paid)

### 2.3 AI-Powered Insights (Claude API)
Generates natural language explanations:
- "This 10-hour course covers your TX pain management AND CA risk management requirements"
- "Taking this instead of 3 separate courses saves you $247 and 8 hours"
- Personalized recommendations based on specialty, time constraints, budget

### 2.4 Proactive Alerts
- Push notifications when new high-efficiency courses become available
- "A new free course just launched that covers 4 of your requirements"

---

## 3. Database Schema

### 3.1 New Tables

```sql
-- Course catalog
CREATE TABLE cme_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  description TEXT,
  hours DECIMAL(4,1) NOT NULL,
  price DECIMAL(8,2) DEFAULT 0,
  url TEXT,
  accreditation_type TEXT, -- 'AMA_PRA_1', 'AAFP', 'ACCME', etc.
  format TEXT, -- 'online', 'in_person', 'hybrid'
  is_active BOOLEAN DEFAULT true,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Which categories/states a course satisfies
CREATE TABLE course_state_coverage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES cme_courses(id) ON DELETE CASCADE,
  state_code TEXT NOT NULL, -- 'TX', 'CA', 'NY', etc. or 'ALL' for universal
  category TEXT NOT NULL,   -- 'general', 'ethics', 'pain_management', etc.
  credits_awarded DECIMAL(4,1) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(course_id, state_code, category)
);

-- Cache recommendations (for performance)
CREATE TABLE user_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES cme_courses(id) ON DELETE CASCADE,
  efficiency_score INTEGER, -- 0-100
  priority_rank INTEGER,
  ai_insight TEXT,
  states_covered TEXT[], -- ['TX', 'CA', 'NY']
  categories_covered TEXT[],
  total_credits_toward_gaps DECIMAL(4,1),
  generated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours'),

  UNIQUE(user_id, course_id)
);

-- Index for fast lookups
CREATE INDEX idx_course_coverage_state ON course_state_coverage(state_code);
CREATE INDEX idx_course_coverage_category ON course_state_coverage(category);
CREATE INDEX idx_user_recommendations_user ON user_recommendations(user_id);
```

### 3.2 Category Mapping (Standardized)

```typescript
const CATEGORIES = {
  general: 'General CME',
  ethics: 'Medical Ethics',
  pain_management: 'Pain Management',
  controlled_substances: 'Controlled Substances/Opioids',
  risk_management: 'Risk Management',
  cultural_competency: 'Cultural Competency',
  domestic_violence: 'Domestic Violence',
  infectious_disease: 'Infectious Disease',
  mental_health: 'Mental Health',
  end_of_life: 'End of Life Care',
  child_abuse: 'Child Abuse Recognition',
  human_trafficking: 'Human Trafficking',
  implicit_bias: 'Implicit Bias',
  suicide_prevention: 'Suicide Prevention',
} as const;
```

---

## 4. Recommendation Algorithm

### 4.1 Gap Analysis Function

```typescript
interface LicenseGap {
  licenseId: string;
  state: string;
  expiryDate: Date;
  urgencyScore: number; // 0-100, higher = more urgent
  categoryGaps: {
    category: string;
    required: number;
    earned: number;
    deficit: number;
  }[];
}

function analyzeGaps(licenses: License[]): LicenseGap[] {
  return licenses.map(license => {
    const daysUntilExpiry = differenceInDays(license.expiryDate, new Date());
    const urgencyScore = calculateUrgency(daysUntilExpiry);

    const categoryGaps = license.requirements
      .filter(req => req.earned < req.required)
      .map(req => ({
        category: req.category,
        required: req.required,
        earned: req.earned,
        deficit: req.required - req.earned,
      }));

    return {
      licenseId: license.id,
      state: license.state,
      expiryDate: license.expiryDate,
      urgencyScore,
      categoryGaps,
    };
  }).filter(lg => lg.categoryGaps.length > 0);
}

function calculateUrgency(daysUntilExpiry: number): number {
  if (daysUntilExpiry <= 30) return 100;  // Critical
  if (daysUntilExpiry <= 90) return 80;   // High
  if (daysUntilExpiry <= 180) return 60;  // Medium
  if (daysUntilExpiry <= 365) return 40;  // Low
  return 20; // Very low
}
```

### 4.2 Course Matching Algorithm

```typescript
interface CourseMatch {
  course: Course;
  efficiencyScore: number;
  statesCovered: string[];
  categoriesCovered: string[];
  totalCreditsTowardGaps: number;
  costPerCredit: number;
  insight: string;
}

function findOptimalCourses(
  gaps: LicenseGap[],
  courses: Course[],
  limit: number = 5
): CourseMatch[] {
  const matches: CourseMatch[] = [];

  for (const course of courses) {
    const coverage = analyzeCourseAgainstGaps(course, gaps);

    if (coverage.totalCreditsTowardGaps > 0) {
      const efficiencyScore = calculateEfficiency(course, coverage);

      matches.push({
        course,
        efficiencyScore,
        statesCovered: coverage.statesCovered,
        categoriesCovered: coverage.categoriesCovered,
        totalCreditsTowardGaps: coverage.totalCreditsTowardGaps,
        costPerCredit: course.price / course.hours,
        insight: '', // Filled by Claude API
      });
    }
  }

  // Sort by efficiency score (higher is better)
  return matches
    .sort((a, b) => b.efficiencyScore - a.efficiencyScore)
    .slice(0, limit);
}

function calculateEfficiency(course: Course, coverage: CourseCoverage): number {
  // Factors:
  // 1. Multi-state coverage bonus (max 40 points)
  const stateCoverageScore = Math.min(coverage.statesCovered.length * 15, 40);

  // 2. Credits toward gaps ratio (max 30 points)
  const gapCoverageRatio = coverage.totalCreditsTowardGaps / course.hours;
  const gapScore = Math.min(gapCoverageRatio * 30, 30);

  // 3. Cost efficiency (max 20 points)
  const costScore = course.price === 0 ? 20 : Math.max(0, 20 - (course.price / 50));

  // 4. Urgency alignment (max 10 points)
  const urgencyScore = coverage.avgUrgencyOfCoveredGaps / 10;

  return Math.round(stateCoverageScore + gapScore + costScore + urgencyScore);
}
```

### 4.3 Claude API Integration for Insights

```typescript
async function generateInsight(
  match: CourseMatch,
  gaps: LicenseGap[],
  userProfile: Profile
): Promise<string> {
  const prompt = `You are an AI assistant helping physicians optimize their CME requirements.

Given this course match, generate a single compelling sentence explaining why this course is valuable for this physician.

**User Profile:**
- Specialty: ${userProfile.specialty}
- Has licenses in: ${gaps.map(g => g.state).join(', ')}

**Course:**
- Name: ${match.course.name}
- Hours: ${match.course.hours}
- Price: ${match.course.price === 0 ? 'Free' : '$' + match.course.price}
- Provider: ${match.course.provider}

**This course covers:**
- States: ${match.statesCovered.join(', ')}
- Categories: ${match.categoriesCovered.join(', ')}
- Total credits toward gaps: ${match.totalCreditsTowardGaps}

**Efficiency Score:** ${match.efficiencyScore}%

Generate a short, compelling insight (1-2 sentences max) that highlights the time/money savings or multi-state efficiency. Be specific with numbers. Example tone: "Covers your TX pain management AND CA risk management in one course—saving you 6 hours vs. separate courses."`;

  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307', // Fast and cheap for short insights
    max_tokens: 100,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.content[0].text;
}
```

---

## 5. API Design

### 5.1 Edge Function: `/recommend-courses`

**Request:**
```typescript
POST /functions/v1/recommend-courses
{
  "user_id": "uuid", // optional - uses auth if not provided
  "limit": 5,
  "include_insights": true, // whether to call Claude API
  "filters": {
    "max_price": 100,
    "format": "online",
    "max_hours": 10
  }
}
```

**Response:**
```typescript
{
  "success": true,
  "data": {
    "gaps_summary": {
      "total_deficit_hours": 24,
      "licenses_with_gaps": 2,
      "most_urgent": {
        "state": "TX",
        "days_until_expiry": 75,
        "deficit": 16
      }
    },
    "recommendations": [
      {
        "id": "rec-1",
        "course": {
          "id": "course-uuid",
          "name": "Medical Ethics & Risk Management Comprehensive",
          "provider": "ACCME",
          "hours": 10,
          "price": 0,
          "url": "https://...",
          "format": "online"
        },
        "efficiency_score": 95,
        "states_covered": ["TX", "CA", "NY"],
        "categories_covered": ["ethics", "risk_management"],
        "total_credits_toward_gaps": 15,
        "ai_insight": "Covers ethics requirements for all 3 of your states in one course—this alone saves you 8 hours compared to state-specific courses.",
        "breakdown": [
          { "state": "TX", "category": "ethics", "credits": 4 },
          { "state": "CA", "category": "risk_management", "credits": 5 },
          { "state": "NY", "category": "ethics", "credits": 4 }
        ]
      }
      // ... more recommendations
    ],
    "generated_at": "2026-02-12T...",
    "cache_expires_at": "2026-02-13T..."
  }
}
```

---

## 6. Frontend Integration

### 6.1 Updated Courses Screen

```typescript
// app/(tabs)/courses.tsx
export default function CoursesScreen() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [gapsSummary, setGapsSummary] = useState<GapsSummary | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  async function fetchRecommendations() {
    const response = await supabase.functions.invoke('recommend-courses', {
      body: { limit: 5, include_insights: true }
    });

    if (response.data.success) {
      setRecommendations(response.data.data.recommendations);
      setGapsSummary(response.data.data.gaps_summary);
    }
    setLoading(false);
  }

  return (
    <ScrollView>
      {/* Gaps Summary Card */}
      <GapsSummaryCard summary={gapsSummary} />

      {/* Smart Recommendations */}
      <SmartSuggestions
        suggestions={recommendations.map(rec => ({
          id: rec.id,
          title: rec.course.name,
          provider: rec.course.provider,
          hours: rec.course.hours,
          categories: rec.categories_covered,
          efficiencyScore: rec.efficiency_score,
          insight: rec.ai_insight,
        }))}
        onSuggestionPress={handleCoursePress}
      />

      {/* All Courses Browser */}
      <AllCoursesList />
    </ScrollView>
  );
}
```

### 6.2 New Components

1. **GapsSummaryCard** - Shows deficit overview
2. **RecommendationCard** - Enhanced course card with multi-state badges
3. **EfficiencyBadge** - Visual score indicator
4. **StatesCoveredPills** - Shows which states the course satisfies

---

## 7. Course Data Sources

### 7.1 Initial Seed Data
Manually curated list of 50-100 high-quality courses from:
- AMA Ed Hub (free)
- AAFP CME (free for members)
- Stanford CME
- UpToDate
- MedPro
- State-specific providers

### 7.2 Future: Automated Ingestion
- ACCME PARS API integration
- Web scraping (with permission)
- Provider partnerships

---

## 8. Security & Privacy

- All data stays in Supabase (HIPAA-eligible)
- Claude API calls contain no PII (only aggregated gap data)
- RLS policies protect user recommendations
- API keys stored in Supabase Vault

---

## 9. Cost Analysis

### Per-User Monthly Cost:
- Supabase Edge Function: ~$0.001 per invocation
- Claude Haiku API (5 insights): ~$0.002 per request
- **Total: ~$0.01/user/month** for daily recommendations

### At Scale (10,000 users):
- ~$100/month total API costs
- Well within margins for $9.99/month subscription

---

## 10. Implementation Plan

### Phase 1: Core Engine (Tonight)
1. Create database schema
2. Seed initial course data (30+ courses)
3. Build Edge Function with matching algorithm
4. Basic frontend integration

### Phase 2: AI Insights (Tonight)
1. Integrate Claude Haiku API
2. Generate personalized insights
3. Cache recommendations for 24 hours

### Phase 3: Polish (Tonight)
1. Enhanced UI components
2. Loading states and error handling
3. Testing and deployment

---

## 11. Success Metrics

- **Efficiency Score > 70%** for top recommendation
- **3+ states covered** by top recommendation for multi-state users
- **< 500ms response time** for recommendations (with caching)
- **User engagement**: Click-through rate on recommendations

---

## Appendix: Sample Course Data

| Course | Provider | Hours | Price | States | Categories |
|--------|----------|-------|-------|--------|------------|
| Medical Ethics Essentials | ACCME | 4 | Free | ALL | ethics |
| Opioid Prescribing Safety | AMA | 3 | Free | TX,CA,FL | controlled_substances |
| Risk Management 2026 | MedPro | 5 | $49 | ALL | risk_management |
| Pain Management Update | Stanford | 10 | $99 | CA,TX,NY,FL | pain_management |
| Controlled Substances DEA | DEA | 2 | Free | ALL | controlled_substances |
