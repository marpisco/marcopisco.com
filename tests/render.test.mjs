import { describe, expect, test } from 'bun:test';
import { CONTENT } from '../src/content.ts';
import { escapeHtml, formatCdError, renderNotFound } from '../src/render.ts';

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
