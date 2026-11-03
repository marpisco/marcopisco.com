import { GITHUB_URL, GITHUB_USER, HIDDEN_OWN_REPOS } from './content';

const GITHUB_API = 'https://api.github.com';
const PER_PAGE = 100;
// Bounds the requests per visit: the unauthenticated API allows 60 per hour per visitor IP.
const MAX_PAGES = 5;
const AVATAR_SIZE = 80;
const MAX_TOPICS = 5;

// GitHub's own language colors (github-linguist), for the languages seen in the repos and stars.
const LANGUAGE_COLORS: Record<string, string> = {
  AutoIt: '#1C3552',
  C: '#555555',
  'C#': '#178600',
  'C++': '#f34b7d',
  CSS: '#663399',
  Dart: '#00B4AB',
  Go: '#00ADD8',
  HTML: '#e34c26',
  Java: '#b07219',
  JavaScript: '#f1e05a',
  Kotlin: '#A97BFF',
  Markdown: '#083fa1',
  PHP: '#4F5D95',
  PowerShell: '#012456',
  Python: '#3572A5',
  Rust: '#dea584',
  Shell: '#89e051',
  Swift: '#F05138',
  TypeScript: '#3178c6',
  Vue: '#41b883',
};

export type Repo = {
  owner: string;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  topics: readonly string[];
  fork: boolean;
};

export type LanguageGroup = {
  language: string | null;
  repos: readonly Repo[];
};

// The fields used from GitHub's repository objects.
type ApiRepo = {
  owner: { login: string };
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  topics?: string[];
  fork: boolean;
};

export function toRepo(repo: ApiRepo): Repo {
  return {
    owner: repo.owner.login,
    name: repo.name,
    description: repo.description,
    language: repo.language,
    stars: repo.stargazers_count,
    topics: (repo.topics ?? []).slice(0, MAX_TOPICS),
    fork: repo.fork,
  };
}

export function languageColor(language: string): string | undefined {
  return LANGUAGE_COLORS[language];
}

export function formatStars(count: number): string {
  return count >= 1000 ? `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(count);
}

export function repoUrl(repo: Repo): string {
  return `${GITHUB_URL}/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.name)}`;
}

export function avatarUrl(repo: Repo): string {
  return `${GITHUB_URL}/${encodeURIComponent(repo.owner)}.png?size=${AVATAR_SIZE}`;
}

const byStars = (a: Repo, b: Repo): number => b.stars - a.stars;

// Own repos without forks or hidden ones, most starred first.
export function ownRepos(repos: readonly Repo[]): Repo[] {
  return repos.filter((repo) => !repo.fork && !HIDDEN_OWN_REPOS.includes(repo.name)).sort(byStars);
}

// Starred repos of other people, grouped by language: biggest group first, most starred repo first.
// Repos without a language end up in a last group with `language: null`.
export function groupByLanguage(repos: readonly Repo[]): LanguageGroup[] {
  const groups = new Map<string | null, Repo[]>();
  for (const repo of repos) {
    if (repo.owner !== GITHUB_USER) {
      groups.set(repo.language, [...(groups.get(repo.language) ?? []), repo]);
    }
  }

  return Array.from(groups, ([language, list]) => ({ language, repos: list.sort(byStars) })).sort((a, b) => {
    if ((a.language === null) !== (b.language === null)) {
      return a.language === null ? 1 : -1;
    }
    return b.repos.length - a.repos.length || (a.language ?? '').localeCompare(b.language ?? '');
  });
}

async function fetchAllPages(path: string): Promise<Repo[]> {
  const repos: Repo[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const response = await fetch(`${GITHUB_API}/${path}?per_page=${PER_PAGE}&page=${page}`);
    if (!response.ok) {
      throw new Error(`GitHub API answered ${response.status}`);
    }
    const batch: ApiRepo[] = await response.json();
    repos.push(...batch.map(toRepo));
    if (batch.length < PER_PAGE) {
      break;
    }
  }
  return repos;
}

export function fetchOwnRepos(): Promise<Repo[]> {
  return fetchAllPages(`users/${GITHUB_USER}/repos`);
}

export function fetchStarredRepos(): Promise<Repo[]> {
  return fetchAllPages(`users/${GITHUB_USER}/starred`);
}
