/**
 * Hook for AI Course Discovery Agent
 *
 * Manages the course discovery process and provides
 * real-time updates on discovered courses
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';
import {
  runCourseDiscoveryAgent,
  DiscoveredCourse,
  DoctorProfile,
  calculateCreditGaps,
  scoreCourserelevance,
  calculateEfficiencyScore,
} from '../services/agents/courseDiscoveryAgent';

interface DiscoveryState {
  isDiscovering: boolean;
  lastDiscoveryAt: Date | null;
  queriesUsed: string[];
  coursesFound: number;
  error: string | null;
}

interface UseCourseDiscoveryReturn {
  discoveredCourses: DiscoveredCourse[];
  discoveryState: DiscoveryState;
  runDiscovery: () => Promise<void>;
  getFilteredCourses: (filters: CourseFilters) => DiscoveredCourse[];
  loading: boolean;
}

interface CourseFilters {
  states?: string[];
  minCredits?: number;
  maxPrice?: number;
  format?: 'online' | 'in-person' | 'hybrid';
  creditTypes?: string[];
  specialty?: string;
}

export function useCourseDiscovery(): UseCourseDiscoveryReturn {
  const { profile, user } = useAuth();
  const [discoveredCourses, setDiscoveredCourses] = useState<DiscoveredCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [discoveryState, setDiscoveryState] = useState<DiscoveryState>({
    isDiscovering: false,
    lastDiscoveryAt: null,
    queriesUsed: [],
    coursesFound: 0,
    error: null,
  });

  // Load licenses
  useEffect(() => {
    async function loadLicenses() {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('licenses')
        .select('*')
        .eq('user_id', user.id);

      if (!error && data) {
        setLicenses(data);
      }
    }

    loadLicenses();
  }, [user?.id]);

  // Load discovered courses from database
  useEffect(() => {
    async function loadDiscoveredCourses() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('discovered_courses')
          .select('*')
          .order('relevance_score', { ascending: false })
          .limit(100);

        if (error) {
          console.error('Error loading discovered courses:', error);
          // If table doesn't exist yet, just return empty array
          setDiscoveredCourses([]);
        } else if (data) {
          // Score courses based on current profile
          const scoredCourses = data.map((course) => ({
            ...course,
            relevance_score: profile && licenses.length > 0
              ? scoreCourserelevance(course, profile as DoctorProfile, licenses)
              : course.relevance_score || 50,
            efficiency_score: calculateEfficiencyScore(course),
          }));

          // Sort by combined score
          scoredCourses.sort((a, b) => {
            const scoreA = (a.relevance_score || 0) + (a.efficiency_score || 0);
            const scoreB = (b.relevance_score || 0) + (b.efficiency_score || 0);
            return scoreB - scoreA;
          });

          setDiscoveredCourses(scoredCourses);
        }
      } catch (err) {
        console.error('Error in loadDiscoveredCourses:', err);
        setDiscoveredCourses([]);
      } finally {
        setLoading(false);
      }
    }

    loadDiscoveredCourses();
  }, [profile, licenses]);

  // Run the discovery agent
  const runDiscovery = useCallback(async () => {
    if (!profile || !user?.id || licenses.length === 0) {
      setDiscoveryState((prev) => ({
        ...prev,
        error: 'Please add your profile and at least one license first',
      }));
      return;
    }

    setDiscoveryState((prev) => ({
      ...prev,
      isDiscovering: true,
      error: null,
    }));

    try {
      const result = await runCourseDiscoveryAgent({
        profile: { ...profile, id: user.id } as DoctorProfile,
        licenses,
        maxResults: 30,
      });

      setDiscoveryState({
        isDiscovering: false,
        lastDiscoveryAt: new Date(),
        queriesUsed: result.queries,
        coursesFound: result.coursesFound,
        error: null,
      });

      // Update local state with new recommendations
      if (result.topRecommendations.length > 0) {
        setDiscoveredCourses(result.topRecommendations);
      }

      // Log the discovery
      await supabase.from('discovery_logs').insert({
        user_id: user.id,
        queries_used: result.queries,
        courses_found: result.coursesFound,
        status: 'completed',
        completed_at: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Discovery error:', err);
      setDiscoveryState((prev) => ({
        ...prev,
        isDiscovering: false,
        error: err.message || 'Discovery failed',
      }));

      // Log the failure
      if (user?.id) {
        await supabase.from('discovery_logs').insert({
          user_id: user.id,
          queries_used: [],
          courses_found: 0,
          status: 'failed',
          error_message: err.message,
        });
      }
    }
  }, [profile, user?.id, licenses]);

  // Filter courses
  const getFilteredCourses = useCallback(
    (filters: CourseFilters): DiscoveredCourse[] => {
      return discoveredCourses.filter((course) => {
        // State filter
        if (filters.states && filters.states.length > 0) {
          const hasMatchingState = course.states_accepted.some((s) =>
            filters.states!.includes(s)
          );
          if (!hasMatchingState) return false;
        }

        // Min credits
        if (filters.minCredits && course.credits < filters.minCredits) {
          return false;
        }

        // Max price
        if (filters.maxPrice !== undefined) {
          if (course.price && course.price > filters.maxPrice) {
            return false;
          }
        }

        // Format
        if (filters.format && course.format !== filters.format) {
          return false;
        }

        // Credit types
        if (filters.creditTypes && filters.creditTypes.length > 0) {
          const hasMatchingType = course.credit_types.some((t) =>
            filters.creditTypes!.includes(t)
          );
          if (!hasMatchingType) return false;
        }

        // Specialty
        if (filters.specialty) {
          const hasMatchingSpecialty = course.specialty_focus.some((s) =>
            s.toLowerCase().includes(filters.specialty!.toLowerCase())
          );
          if (!hasMatchingSpecialty) return false;
        }

        return true;
      });
    },
    [discoveredCourses]
  );

  return {
    discoveredCourses,
    discoveryState,
    runDiscovery,
    getFilteredCourses,
    loading,
  };
}

/**
 * Hook for course gap analysis
 */
export function useGapAnalysis() {
  const { user } = useAuth();
  const [gaps, setGaps] = useState<{
    totalGap: number;
    categoryGaps: Record<string, number>;
    licenses: { state: string; gap: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function analyzeGaps() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data: licenses } = await supabase
          .from('licenses')
          .select('*')
          .eq('user_id', user.id);

        if (!licenses || licenses.length === 0) {
          setGaps(null);
          setLoading(false);
          return;
        }

        let totalGap = 0;
        const allCategoryGaps: Record<string, number> = {};
        const licenseGaps: { state: string; gap: number }[] = [];

        for (const license of licenses) {
          const { totalGap: licenseTotal, categoryGaps } = calculateCreditGaps(license);
          totalGap += licenseTotal;

          licenseGaps.push({
            state: license.state,
            gap: licenseTotal,
          });

          for (const [category, gap] of Object.entries(categoryGaps)) {
            allCategoryGaps[category] = (allCategoryGaps[category] || 0) + gap;
          }
        }

        setGaps({
          totalGap,
          categoryGaps: allCategoryGaps,
          licenses: licenseGaps,
        });
      } catch (err) {
        console.error('Error analyzing gaps:', err);
      } finally {
        setLoading(false);
      }
    }

    analyzeGaps();
  }, [user?.id]);

  return { gaps, loading };
}
