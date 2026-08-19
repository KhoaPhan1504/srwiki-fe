import { useMemo } from 'react';
import { COMPLETION_FIELDS } from '~root/screens/dashboard/configs';
import { useGetProfile } from '~root/apis';

export const useDashboardHooks = () => {
  const { profile, isLoading, isError, refetch } = useGetProfile();

  const completionPercent = useMemo(() => {
    if (!profile) return 0;
    const filled = COMPLETION_FIELDS.filter((field) => Boolean(profile[field])).length;
    return Math.round((filled / COMPLETION_FIELDS.length) * 100);
  }, [profile]);
  return {
    profile,
    isLoading,
    isError,
    refetch,
    completionPercent,
  };
};
