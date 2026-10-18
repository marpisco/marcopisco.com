import {
  CONTACT_ROWS,
  HERO_COMMAND,
  NAME,
  PROMPT_HOST,
  SECTION_ORDER,
  STACK,
  type Content,
  type EducationItem,
  type WorkEntry,
} from './content';
import { LANGUAGES, type Language } from './i18n';
import type { PresenceView } from './lanyard';

export type RenderOptions = {
  language: Language;
  presence: PresenceView;
};

const CONTACT_LABEL_WIDTH = 10;

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function muted(text: string): string {
  return `<span class="muted">${text}</span>`;
}

function command(text: string): string {
  return `<div data-reveal><span class="prompt">$</span> ${escapeHtml(text)}</div>`;
}

function renderNav(content: Content, language: Language): string {
  const links = SECTION_ORDER.map((key) => {
    const { id } = content.sections[key];
    return `<a href="#${id}">./${id}</a>`;
  }).join('');
  const buttons = LANGUAGES.map(
    (code) =>
      `<button type="button" data-language="${code}" aria-pressed="${code === language}">${code}</button>`,
  ).join('<span aria-hidden="true">•</span>');

  return `
    <nav class="nav" aria-label="${content.navLabel}">
      <span class="nav-host">${PROMPT_HOST}</span>${links}
      <span class="lang" role="group" aria-label="${content.languageLabel}">${buttons}</span>
    </nav>`;
}

function renderHero(presence: PresenceView): string {
  return `
    <section class="section">
      <div data-reveal><span class="prompt">$</span> ${HERO_COMMAND}</div>
      <h1 class="name" data-reveal>${NAME}</h1>
      <p class="subtitle"><span id="typed-subtitle"></span><span class="cursor" aria-hidden="true"></span></p>
      ${renderPresence(presence)}
    </section>`;
}

function renderPresence({ status, text }: PresenceView): string {
  return `<div class="presence" id="presence" data-status="${status}"><span class="presence-dot"></span><span id="presence-text">${escapeHtml(text)}</span></div>`;
}

export function updatePresence({ status, text }: PresenceView): void {
  const root = document.querySelector<HTMLElement>('#presence');
  const label = document.querySelector<HTMLElement>('#presence-text');
  if (root && label) {
    root.dataset.status = status;
    label.textContent = text;
  }
}

function renderTags(tags: readonly string[], link?: EducationItem['link']): string {
  const items = tags.map(escapeHtml);
  if (link) {
    items.push(`<a href="${link.href}">${escapeHtml(link.label)}</a>`);
  }
  return items.length > 0 ? `<div class="tags">${items.join(' · ')}</div>` : '';
}

function renderAbout(content: Content): string {
  const { id, command: text } = content.sections.about;
  const paragraphs = content.about.map((paragraph) => `<p data-reveal>${escapeHtml(paragraph)}</p>`);
  return `
    <section id="${id}" class="section">
      ${command(text)}
      ${paragraphs.join('')}
    </section>`;
}

function renderStack(content: Content): string {
  const { id, command: text } = content.sections.stack;
  const items = STACK.map((item) => `<span>${item}</span>`).join('');
  return `
    <section id="${id}" class="section">
      ${command(text)}
      <div class="stack" data-reveal>${items}</div>
    </section>`;
}

function renderWorkEntry(entry: WorkEntry): string {
  const place = entry.place ? ` ${muted(`· ${escapeHtml(entry.place)}`)}` : '';
  return `
      <article class="entry" data-reveal>
        <div><span class="date">${escapeHtml(entry.dates)}</span>${place}</div>
        <div class="role">${escapeHtml(entry.role)} <span class="muted">@ ${escapeHtml(entry.company)}</span></div>
        <p class="summary">${escapeHtml(entry.summary)}</p>
        ${renderTags(entry.tags)}
      </article>`;
}

function renderWork(content: Content): string {
  const { id, command: text } = content.sections.work;
  return `
    <section id="${id}" class="section section-work">
      ${command(text)}
      <div class="entries">${content.work.map(renderWorkEntry).join('')}
      </div>
    </section>`;
}

function renderEducationItem(item: EducationItem, index: number, count: number): string {
  const branch = index === count - 1 ? '└─' : '├─';
  const subtitle = item.subtitle ? ` ${muted(item.subtitle)}` : '';
  return `
      <div class="entry tree-item" data-reveal>
        <div>${muted(branch)} <span class="date">${escapeHtml(item.years)}</span> ${escapeHtml(item.title)}${subtitle}</div>
        <p class="summary">${item.text}</p>
        ${renderTags(item.tags ?? [], item.link)}
      </div>`;
}

function renderEducation(content: Content): string {
  const { id, command: text } = content.sections.education;
  const { years, course, school, items } = content.education;
  return `
    <section id="${id}" class="section">
      ${command(text)}
      <div data-reveal><span class="date">${years}</span> ${escapeHtml(course)}</div>
      <div class="muted" data-reveal>${escapeHtml(school)}</div>
      <div class="tree">${items.map((item, index) => renderEducationItem(item, index, items.length)).join('')}
      </div>
    </section>`;
}

function renderContact(content: Content): string {
  const { id, command: text } = content.sections.contact;
  const rows = CONTACT_ROWS.map(
    ({ label, href, text: value }) =>
      `<div>${label.padEnd(CONTACT_LABEL_WIDTH)}<a href="${href}">${value}</a></div>`,
  ).join('');
  return `
    <section id="${id}" class="section">
      ${command(text)}
      <div class="contact" data-reveal>${rows}</div>
      <div class="final-prompt" data-reveal><span class="prompt">$</span> <span class="cursor" aria-hidden="true"></span></div>
    </section>`;
}

export function renderPage(content: Content, options: RenderOptions): string {
  return `
  <div class="page">
    ${renderNav(content, options.language)}
    ${renderHero(options.presence)}
    ${renderAbout(content)}
    ${renderStack(content)}
    ${renderWork(content)}
    ${renderEducation(content)}
    ${renderContact(content)}
  </div>`;
}
