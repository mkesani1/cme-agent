import { useState, useEffect, useCallback } from 'react';
import { DEMO_MODE } from '../lib/demoData';
import { SUPABASE_ANON_KEY, EDGE_FUNCTIONS } from '../lib/config';
import { supabase } from '../lib/supabase';

export interface CourseRecommendation {
  id: string;
  course: {
    id: string;
    name: string;
    provider: string;
    description: string | null;
    hours: number;
    price: number;
    url: string | null;
    format: string;
  };
  efficiency_score: number;
  states_covered: string[];
  categories_covered: string[];
  total_credits_toward_gaps: number;
  ai_insight: string;
  breakdown: { state: string; category: string; credits: number }[];
}

export interface GapsSummary {
  total_deficit_hours: number;
  licenses_with_gaps: number;
  most_urgent: {
    state: string;
    days_until_expiry: number;
    deficit: number;
  } | null;
}

export interface RecommendationsData {
  gaps_summary: GapsSummary;
  recommendations: CourseRecommendation[];
  generated_at: string;
  message?: string;
}

export function useRecommendations() {
  const [data, setData] = useState<RecommendationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async (limit: number = 5) => {
    try {
      setLoading(true);
      setError(null);

      // Use demo endpoint for demo mode
      const endpoint = DEMO_MODE
        ? EDGE_FUNCTIONS.recommendCoursesDemoUrl
        : EDGE_FUNCTIONS.recommendCoursesUrl;

      // Get the user's auth token for JWT-protected edge functions
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          limit,
          include_insights: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch recommendations');
      }

      setData(result.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load recommendations';
      setError(message);
      console.error('Recommendations error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    data,
    loading,
    error,
    refetch: fetchRecommendations,
    gapsSummary: data?.gaps_summary || null,
    recommendations: data?.recommendations || [],
  };
}

export default useRecommendations;
