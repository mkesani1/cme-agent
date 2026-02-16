// ─── Demo Mode Hook ───
// Centralizes the common `(!user && DEMO_MODE) ? demoX : realX` pattern.
// Each screen still loads its own data, but this avoids repeating the fallback check.

import { useAuth } from './useAuth';
import {
  DEMO_MODE,
  demoProfile,
  demoLicenses,
  demoCertificates,
  demoCourses,
} from '../lib/demoData';

export function useDemo() {
  const { user, profile } = useAuth();
  const isDemo = DEMO_MODE && !user;

  return {
    /** True when running in demo mode without a real user session. */
    isDemo,
    /** The effective profile (real or demo fallback). */
    displayProfile: isDemo ? demoProfile : profile,
    /** Demo license data (only meaningful when isDemo is true). */
    demoLicenses,
    /** Demo certificate data (only meaningful when isDemo is true). */
    demoCertificates,
    /** Demo course data (only meaningful when isDemo is true). */
    demoCourses,
    /** Re-exported for screens that still need the raw flag. */
    DEMO_MODE,
  };
}

export default useDemo;
