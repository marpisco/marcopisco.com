import { GITHUB_URL } from './content';

const GITHUB_API = 'https://api.github.com/repos';
const AVATAR_SIZE = 80;
const STARS_LOADING = '…';
const STARS_UNAVAILABLE = '—';

// undefined: still loading, null: the request failed (e.g. the 60 requests/hour limit).
export type StarCount = number | null | undefined;

export function formatStars(count: StarCount): string {
  if (count === undefined) {
    return STARS_LOADING;
  }
  if (count === null) {
    return STARS_UNAVAILABLE;
  }
  return count >= 1000 ? `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(count);
}

export function repoUrl(repo: string): string {
  return `${GITHUB_URL}/${repo}`;
}

export function avatarUrl(repo: string): string {
  const [owner] = repo.split('/');
  return `${GITHUB_URL}/${owner}.png?size=${AVATAR_SIZE}`;
}

// Public data, so no token: the unauthenticated API allows 60 requests per hour per visitor IP.
export async function fetchStars(repo: string): Promise<number | null> {
  try {
    const response = await fetch(`${GITHUB_API}/${repo}`);
    if (!response.ok) {
      return null;
    }
    const data: { stargazers_count?: unknown } = await response.json();
    return typeof data.stargazers_count === 'number' ? data.stargazers_count : null;
  } catch {
    return null;
  }
}
