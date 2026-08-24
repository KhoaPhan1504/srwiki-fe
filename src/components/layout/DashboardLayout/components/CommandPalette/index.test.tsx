import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import '~root/i18n';
import { ThemeProvider } from '~root/providers/ThemeProvider';
import { authAtom } from '~root/stores';
import type { AuthState } from '~root/stores';
import { MembershipTier, Role } from '~root/constants';
import { CommandPalette } from '.';

const memberAuth: AuthState = {
  token: 'tok',
  user: { id: '1', email: 'a@b.com', role: Role.MEMBER, membershipTier: MembershipTier.REGULAR },
};

// jsdom doesn't implement matchMedia, which ThemeProvider calls on mount to
// resolve the "system" theme preference.
window.matchMedia =
  window.matchMedia ||
  (((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia);

const renderPalette = () => {
  const store = createStore();
  store.set(authAtom, memberAuth);
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <JotaiProvider store={store}>
        <ThemeProvider>
          <MemoryRouter>
            <CommandPalette open onOpenChange={vi.fn()} />
          </MemoryRouter>
        </ThemeProvider>
      </JotaiProvider>
    </QueryClientProvider>,
  );
};

describe('CommandPalette', () => {
  // Regression test: navItems.ts registered `labelKey: 'nav.headersInspector'`
  // for the HTTP Headers Inspector entry, but the key only ever existed in the
  // `header` i18n namespace (used by the sidebar) — not in `command-palette`
  // (used here, via useTranslation('command-palette')) — and there's no
  // fallbackNS, so this label used to render the raw i18n key string.
  it('renders the translated label for the HTTP Headers Inspector nav item, not the raw i18n key', () => {
    renderPalette();
    expect(screen.getByText('Trình kiểm tra Header HTTP')).toBeInTheDocument();
    expect(screen.queryByText('nav.headersInspector')).not.toBeInTheDocument();
  });
});
