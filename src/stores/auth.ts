import { atom } from 'jotai';
import { isJsonString } from '~root/utils';
import { MembershipTier, Role } from '~root/constants';

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  membershipTier: MembershipTier | null;
};

export type AuthState = {
  token: string;
  user: AuthUser;
} | null;

const readInitialAuth = (): AuthState => {
  const raw = localStorage.getItem('auth');
  if (raw && isJsonString(raw)) {
    return JSON.parse(raw) as AuthState;
  }
  return null;
};

export const authAtom = atom<AuthState>(readInitialAuth());
