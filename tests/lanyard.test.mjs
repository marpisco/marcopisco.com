import { describe, expect, test } from 'bun:test';
import {
  getPresenceActivity,
  getPresenceView,
  getStatusLabel,
} from '../src/lanyard.ts';

describe('Lanyard presence formatting', () => {
  test('formats Discord status labels', () => {
    expect(getStatusLabel('online')).toBe('Online');
    expect(getStatusLabel('idle')).toBe('Idle');
    expect(getStatusLabel('dnd')).toBe('Do Not Disturb');
    expect(getStatusLabel('offline')).toBe('Offline');
  });

  test('prefers a Spotify activity summary', () => {
    expect(
      getPresenceActivity({
        activities: [],
        spotify: { song: 'Satellite', artist: 'Måneskin' },
      }),
    ).toBe('Listening to Satellite — Måneskin');
  });

  test('formats a regular Discord activity with its type and details', () => {
    expect(
      getPresenceActivity({
        activities: [{ type: 0, name: 'Visual Studio Code', details: 'Editing main.ts', state: 'marpisco.com' }],
        spotify: null,
      }),
    ).toBe('Playing Visual Studio Code — Editing main.ts · marpisco.com');
  });

  test('shows two current activities and removes the duplicate Spotify record', () => {
    expect(
      getPresenceActivity({
        activities: [
          { type: 2, name: 'Spotify', details: 'Satellite', state: 'Måneskin' },
          { type: 0, name: 'Visual Studio Code', details: 'Editing Home.cs' },
          { type: 3, name: 'YouTube', details: 'Watching a tutorial' },
        ],
        spotify: { song: 'Satellite', artist: 'Måneskin' },
      }),
    ).toBe('Listening to Satellite — Måneskin · Playing Visual Studio Code — Editing Home.cs');
  });

  test('does not publish a custom Discord status as an activity', () => {
    expect(
      getPresenceActivity({
        activities: [{ type: 4, name: 'Custom Status', state: 'Building things' }],
        spotify: null,
      }),
    ).toBeNull();
  });

  test('formats Portuguese status labels', () => {
    expect(getStatusLabel('online', 'pt')).toBe('Online');
    expect(getStatusLabel('idle', 'pt')).toBe('Ausente');
    expect(getStatusLabel('dnd', 'pt')).toBe('Não incomodar');
    expect(getStatusLabel('offline', 'pt')).toBe('Offline');
  });

  test('formats Portuguese activities', () => {
    expect(
      getPresenceActivity(
        { activities: [], spotify: { song: 'Satellite', artist: 'Måneskin' } },
        'pt',
      ),
    ).toBe('A ouvir Satellite — Måneskin');
    expect(
      getPresenceActivity(
        {
          activities: [
            { type: 0, name: 'Visual Studio Code', details: 'A editar main.ts' },
            { type: 3, name: 'YouTube' },
            { type: 9, name: 'Other' },
          ],
          spotify: null,
        },
        'pt',
      ),
    ).toBe('A jogar Visual Studio Code — A editar main.ts · A ver YouTube');
    expect(getPresenceActivity({ activities: [{ type: 9, name: 'Other' }], spotify: null }, 'pt')).toBe(
      'Ativo em Other',
    );
  });

  test('builds the lowercase presence line in both languages', () => {
    const presence = {
      discord_status: 'online',
      activities: [],
      spotify: { song: 'Satellite', artist: 'Måneskin' },
    };
    expect(getPresenceView({ kind: 'ready', presence })).toEqual({
      status: 'online',
      text: 'discord · online · listening to Satellite — Måneskin',
    });
    expect(getPresenceView({ kind: 'ready', presence }, 'pt').text).toBe(
      'discord · online · a ouvir Satellite — Måneskin',
    );
    expect(getPresenceView({ kind: 'ready', presence: { ...presence, spotify: null, discord_status: 'dnd' } }, 'pt').text).toBe(
      'discord · não incomodar',
    );
  });

  test('describes connecting and unavailable states', () => {
    expect(getPresenceView({ kind: 'connecting' }).text).toBe('discord · connecting...');
    expect(getPresenceView({ kind: 'connecting' }, 'pt').text).toBe('discord · a ligar...');
    expect(getPresenceView({ kind: 'unavailable' }).text).toBe('discord · unavailable');
    expect(getPresenceView({ kind: 'unavailable' }, 'pt')).toEqual({
      status: 'offline',
      text: 'discord · indisponível',
    });
  });
});
