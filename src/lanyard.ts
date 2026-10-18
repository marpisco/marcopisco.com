import { CONTENT } from './content';
import type { Language } from './i18n';

export type LanyardActivity = {
  type: number;
  name: string;
  details?: string | null;
  state?: string | null;
};

export type LanyardSpotify = {
  song: string;
  artist: string;
};

export type LanyardPresence = {
  discord_status: string;
  activities: readonly LanyardActivity[];
  spotify: LanyardSpotify | null;
};

type PresenceActivityInput = Pick<LanyardPresence, 'activities' | 'spotify'>;

export type PresenceState =
  | { kind: 'connecting' }
  | { kind: 'unavailable' }
  | { kind: 'ready'; presence: LanyardPresence };

export type PresenceView = {
  status: string;
  text: string;
};

function isKnownStatus(status: string): status is keyof typeof CONTENT.en.presence.status {
  return status in CONTENT.en.presence.status;
}

export function getStatusLabel(status: string, language: Language = 'en'): string {
  const labels = CONTENT[language].presence.status;
  return isKnownStatus(status) ? labels[status] : labels.offline;
}

export function getPresenceActivity(
  presence: PresenceActivityInput,
  language: Language = 'en',
): string | null {
  const wording = CONTENT[language].presence;
  const activities: string[] = [];

  if (presence.spotify?.song && presence.spotify.artist) {
    activities.push(`${wording.listeningTo} ${presence.spotify.song} — ${presence.spotify.artist}`);
  }

  for (const activity of presence.activities) {
    if (activities.length === 2 || activity.type === 4 || !activity.name) {
      continue;
    }

    if (presence.spotify && activity.name === 'Spotify') {
      continue;
    }

    const typeLabel = wording.activityTypes[activity.type] ?? wording.activityFallback;
    const details = [activity.details, activity.state].filter(Boolean).join(' · ');
    activities.push(
      details
        ? `${typeLabel} ${activity.name} — ${details}`
        : `${typeLabel} ${activity.name}`,
    );
  }

  return activities.length > 0 ? activities.join(' · ') : null;
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

export function getPresenceView(state: PresenceState, language: Language = 'en'): PresenceView {
  const wording = CONTENT[language].presence;

  if (state.kind === 'connecting') {
    return { status: 'connecting', text: `discord · ${lowerFirst(wording.connecting)}` };
  }

  if (state.kind === 'unavailable') {
    return { status: 'offline', text: `discord · ${lowerFirst(wording.unavailable)}` };
  }

  const { presence } = state;
  const activity = getPresenceActivity(presence, language);
  const parts = ['discord', getStatusLabel(presence.discord_status, language).toLowerCase()];
  if (activity) {
    parts.push(lowerFirst(activity));
  }

  return { status: presence.discord_status, text: parts.join(' · ') };
}
