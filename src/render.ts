import {
  AWESOME_DIR,
  CONTACT_ROWS,
  HERO_COMMAND,
  NAME,
  NEW_TAB,
  PROMPT_HOST,
  SECTION_ORDER,
  STACK,
  type AwesomeCategory,
  type AwesomeProject,
  type Content,
  type EducationItem,
  type WorkEntry,
} from './content';
import { avatarUrl, formatStars, repoUrl, type StarCount } from './github';
import { LANGUAGES, type Language } from './i18n';
import type { PresenceView } from './lanyard';

export type RenderOptions = {
  language: Language;
  presence: PresenceView;
};

const CONTACT_LABEL_WIDTH = 10;
const HOME_PATH = '/';

export function escapeHtml(text: string): string {
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

function renderNav(content: Content, language: Language, host: string, links: string): string {
  const buttons = LANGUAGES.map(
    (code) =>
      `<button type="button" data-language="${code}" aria-pressed="${code === language}">${code}</button>`,
  ).join('<span aria-hidden="true">•</span>');

  return `
    <nav class="nav" aria-label="${content.navLabel}">
      <span class="nav-host">${host}</span>${links}
      <span class="lang" role="group" aria-label="${content.languageLabel}">${buttons}</span>
    </nav>`;
}

function renderSectionLinks(content: Content): string {
  return SECTION_ORDER.map((key) => {
    const { id } = content.sections[key];
    return `<a href="#${id}">./${id}</a>`;
  }).join('');
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
    items.push(`<a href="${link.href}" ${NEW_TAB}>${escapeHtml(link.label)}</a>`);
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
      `<div>${label.padEnd(CONTACT_LABEL_WIDTH)}<a href="${href}" ${NEW_TAB}>${value}</a></div>`,
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
    ${renderNav(content, options.language, PROMPT_HOST, renderSectionLinks(content))}
    ${renderHero(options.presence)}
    ${renderAbout(content)}
    ${renderStack(content)}
    ${renderWork(content)}
    ${renderEducation(content)}
    ${renderContact(content)}
  </div>`;
}

export function formatCdError(path: string, reason: string): string {
  return `bash: cd: ${path}: ${reason}`;
}

export function renderNotFound(content: Content, path: string): string {
  const { error, home } = content.notFound;
  return `
  <div class="page">
    <nav class="nav" aria-label="${content.navLabel}">
      <span class="nav-host">${PROMPT_HOST}</span>
    </nav>
    <section class="section">
      <div><span class="prompt">$</span> cd ${escapeHtml(path)}</div>
      <div class="error" role="alert">${escapeHtml(formatCdError(path, error))}</div>
      <div><span class="prompt">$</span> cd ~ <a href="${HOME_PATH}">${muted('#')} ${escapeHtml(home)}</a></div>
      <div class="final-prompt"><span class="prompt">$</span> <span class="cursor" aria-hidden="true"></span></div>
    </section>
  </div>`;
}

export type StarCounts = ReadonlyMap<string, StarCount>;

function renderProject(project: AwesomeProject, content: Content, stars: StarCounts): string {
  const [owner, name] = project.repo.split('/');
  const { viewOnGithub } = content.awesome;
  return `
        <article class="card" data-reveal>
          <div class="card-head">
            <img class="card-img" src="${avatarUrl(project.repo)}" alt="" width="40" height="40" loading="lazy" />
            <div>
              <div class="card-title">${escapeHtml(name)} <span class="stars">• ★ <span data-stars="${escapeHtml(project.repo)}">${formatStars(stars.get(project.repo))}</span></span></div>
              <div class="card-owner">${escapeHtml(owner)}</div>
            </div>
          </div>
          <a class="card-link" href="${repoUrl(project.repo)}" ${NEW_TAB}>${escapeHtml(viewOnGithub)}</a>
          <p>${escapeHtml(project.description)}</p>
        </article>`;
}

function renderCategory(category: AwesomeCategory, content: Content, stars: StarCounts): string {
  const projects = category.projects.map((project) => renderProject(project, content, stars)).join('');
  return `
    <section class="section">
      ${command(`ls ${category.name}/`)}
      <div class="cards">${projects}
      </div>
    </section>`;
}

export function renderAwesome(content: Content, language: Language, stars: StarCounts): string {
  const { title, command: text, intro, home, categories } = content.awesome;
  const homeLink = `<a href="${HOME_PATH}">${escapeHtml(home)}</a>`;
  return `
  <div class="page">
    ${renderNav(content, language, `${PROMPT_HOST}/${AWESOME_DIR}`, homeLink)}
    <section class="section">
      ${command(text)}
      <h1 class="name" data-reveal>${escapeHtml(title)}</h1>
      <p class="subtitle" data-reveal>${escapeHtml(intro)}</p>
    </section>
    ${categories.map((category) => renderCategory(category, content, stars)).join('')}
  </div>`;
}

export function updateStars(repo: string, count: StarCount): void {
  document.querySelectorAll<HTMLElement>('[data-stars]').forEach((label) => {
    if (label.dataset.stars === repo) {
      label.textContent = formatStars(count);
    }
  });
}
