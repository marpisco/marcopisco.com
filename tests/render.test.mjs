import { describe, expect, test } from 'bun:test';
import { CONTENT } from '../src/content.ts';
import { escapeHtml, formatCdError, renderAwesome, renderNotFound, renderPage } from '../src/render.ts';

describe('formatCdError', () => {
  test('builds the bash-style error line', () => {
    expect(formatCdError('/a/b', 'No such file or directory')).toBe(
      'bash: cd: /a/b: No such file or directory',
    );
  });
});

describe('renderNotFound', () => {
  test('escapes the requested path', () => {
    const html = renderNotFound(CONTENT.en, '/<script>"x"');
    expect(html).not.toContain('<script>');
    expect(html).toContain(escapeHtml('/<script>"x"'));
  });

  test('links back home in both languages', () => {
    expect(renderNotFound(CONTENT.en, '/x')).toContain('back to marcopisco.com');
    expect(renderNotFound(CONTENT.pt, '/x')).toContain('voltar a marcopisco.com');
  });
});

describe('renderAwesome', () => {
  const ready = {
    kind: 'ready',
    mine: [{ owner: 'marpisco', name: 'ClassLink', description: 'Rooms', language: 'PHP', stars: 3, topics: ['php'], fork: false }],
    starred: [
      {
        language: null,
        repos: [{ owner: 'x', name: '<b>', description: '<script>', language: null, stars: 1500, topics: [], fork: false }],
      },
    ],
  };

  test('renders own repos first, then starred groups, in both languages', () => {
    const en = renderAwesome(CONTENT.en, 'en', ready);
    expect(en.indexOf('ls mine/')).toBeLessThan(en.indexOf('ls starred/other/'));
    expect(en).toContain('href="https://github.com/marpisco/ClassLink" target="_blank"');
    expect(en).toContain('★ 1.5k');
    expect(en).toContain('<span class="card-language" style="--language-color: #4F5D95">• PHP</span>');
    expect(renderAwesome(CONTENT.pt, 'pt', ready)).toContain('ls estrelas/outras/');
  });

  test('escapes the data that comes from GitHub', () => {
    const html = renderAwesome(CONTENT.en, 'en', ready);
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<b>');
  });

  test('shows loading and error states', () => {
    expect(renderAwesome(CONTENT.en, 'en', { kind: 'loading' })).toContain('Loading from GitHub...');
    expect(renderAwesome(CONTENT.pt, 'pt', { kind: 'error' })).toContain('role="alert"');
  });
});

describe('renderPage', () => {
  test('lists the other pages after contact, linking in the same tab', () => {
    const presence = { status: 'offline', text: '' };
    for (const language of ['en', 'pt']) {
      const html = renderPage(CONTENT[language], { language, presence });
      expect(html).toContain('ls /var/www/');
      expect(html).toContain(`<a href="/awesome">awesome</a>   - ${CONTENT[language].awesome.title}`);
      expect(html.indexOf('ls /var/www/')).toBeGreaterThan(html.indexOf(CONTENT[language].sections.contact.command));
    }
  });
});
