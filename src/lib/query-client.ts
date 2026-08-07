import { QueryClient } from '@tanstack/react-query';

/**
 * Single app-wide QueryClient instance. Exported (rather than created inline
 * in main.tsx) so call sites outside the React tree — e.g. logout and
 * delete-account handlers — can call `.clear()` on it directly.
 *
 * This matters because login/logout navigate client-side without a full page
 * reload, so this instance survives across the logout -> login boundary. If
 * it isn't cleared on logout, the next user to log in on the same tab can
 * briefly see the previous user's cached profile/settings data before the
 * background refetch lands.
 */
export const queryClient = new QueryClient();
