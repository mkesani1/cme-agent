import { useState, useEffect, useCallback } from 'react';
import { DEMO_MODE } from '../lib/demoData';

const SUPABASE_URL = 'https://drwpnasiqgzqdubmlwxj.supabase.co';

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
        ? `${SUPABASE_URL}/functions/v1/recommend-courses-demo`
        : `${SUPABASE_URL}/functions/v1/recommend-courses`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyd3BuYXNpcWd6cWR1Ym1sd3hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2OTQ3MzAsImV4cCI6MjA1NDI3MDczMH0.9FxALg7S1edvLhOLt6TL-3Ol3ZsJm-7P1p4hT0cR9rc',
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
