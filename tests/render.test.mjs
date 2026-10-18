import { describe, expect, test } from 'bun:test';
import { CONTENT } from '../src/content.ts';
import { escapeHtml, formatCdError, renderAwesome, renderNotFound } from '../src/render.ts';

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
  test('renders every category and project in both languages', () => {
    for (const language of ['en', 'pt']) {
      const content = CONTENT[language];
      const html = renderAwesome(content, language, new Map());
      for (const category of content.awesome.categories) {
        expect(html).toContain(`ls ${category.name}/`);
        for (const { repo } of category.projects) {
          expect(html).toContain(`href="https://github.com/${repo}" target="_blank"`);
        }
      }
    }
  });

  test('shows known star counts and a placeholder while loading', () => {
    const html = renderAwesome(CONTENT.en, 'en', new Map([['oven-sh/bun', 96_300]]));
    expect(html).toContain('<span data-stars="oven-sh/bun">96.3k</span>');
    expect(html).toContain('<span data-stars="vitejs/vite">…</span>');
  });
});
