import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Appends a cache-busting query param to an avatar (or any) URL, derived from
 * a version marker such as `profile.updatedAt`. The backend writes every
 * avatar upload to the same fixed path and returns the same public URL, so
 * without this the browser/CDN keeps serving the previously cached image
 * after a re-upload.
 */
export function withCacheBust(url?: string | null, version?: string | null) {
  if (!url) return undefined;
  if (!version) return url;
  return `${url}?v=${encodeURIComponent(version)}`;
}
