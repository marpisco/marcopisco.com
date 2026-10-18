# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`AGENTS.md` is a symlink to this file, so other agents read the same rules. Edit `CLAUDE.md` only.

## Project

Personal portfolio for [marcopisco.com](https://marcopisco.com): a single terminal-style page ("shell session") in English and European Portuguese. TypeScript + Vite + vanilla CSS, no framework, no runtime dependencies.

## Commands

```bash
bun install
bun run dev                        # http://localhost:5173
bun test                           # all tests (bun:test, tests/*.test.mjs)
bun test tests/i18n.test.mjs       # one file
bun test -t "detectLanguage"       # tests whose name matches
bun run typecheck                  # tsc --noEmit
bun run build                      # typecheck + vite build into dist/
bun run preview                    # serve dist/
```

`bun.lock` is the only lockfile; install with bun, not npm.

## Deployment

Cloudflare Pages, Git integration on `marpisco/marcopisco.com` (the repo was renamed from `marpisco.github.io`; GitHub Pages, its workflow and `CNAME` are gone).

- Production branch `main`, build command `bun run build`, output `dist`, env `BUN_VERSION=1.3.10` (matches `packageManager`). These live in the Cloudflare dashboard, not in the repo; there is no wrangler file.
- Every branch and PR gets a preview: `https://<branch>.marcopiscocom.pages.dev`, posted on the PR by the Cloudflare bot. Use it to check real fonts, live Discord status and animations, which a sandbox usually can't load.

## Architecture

`index.html` loads `src/main.ts`, which renders the whole page into `#app` as an HTML string and re-renders it on language switch.

- `src/content.ts`: all copy, as typed data: `CONTENT.en` and `CONTENT.pt` share the `Content` type. Also holds the shared `STACK`, `CONTACT_ROWS`, prompt host/name constants and the `tip()` helper that builds tooltip markup. `subtitle`/`text` fields may contain trusted inline HTML (tooltips, links); everything else is escaped in `render.ts`.
- `src/i18n.ts`: language choice. A valid saved choice in localStorage (`marcopisco-language`) wins, then the first `pt*`/`en*` entry of `navigator.languages`, otherwise `en`. Pure functions, unit tested.
- `src/render.ts`: builds the page HTML from a `Content` object (nav with the `en • pt` buttons, `$ whoami` hero, one section per `SECTION_ORDER` key) and updates the Discord line in place (`updatePresence`).
- `src/main.ts`: state (current language, presence state), `draw()`, the language switch (click delegation on `[data-language]`), and the single typing-subtitle loop driven by `nextTypingState` from `src/typing.ts`.
- `src/presence.ts`: Lanyard REST + WebSocket client for Discord presence. It publishes a `PresenceState` and never touches the DOM. `src/lanyard.ts` turns that state into localized labels (`getPresenceView`).
- `src/reveal.ts`: the "dial-up" scroll effect. Every `[data-reveal]` element is a unit. When units scroll into view they join one queue and stream their text nodes in character by character, one unit at a time in DOM order (`CHARS_PER_SECOND`, `UNIT_PAUSE_MS`). Height is locked while streaming so nothing below moves. Tooltips, `#typed-subtitle` and `#presence` are skipped. Units already streamed are tracked with `data-streamed`, so a language re-render shows them complete instead of hiding them again. `visiblePrefixes` is the pure, tested core.
- `src/styles.css`: color tokens on `:root`, dark-only (no theme toggle). Tooltip, cursor blink and `.pending` (not yet streamed) rules live here.

New content units should carry `data-reveal` so they stream like the rest.

## Content rules

The page copy was reviewed line by line with Marco. Keep these when editing:

- **Every copy change goes in both `en` and `pt`.** Portuguese is always pt-PT (European), never pt-BR vocabulary or constructions. Tool and protocol names stay in English (Single Sign-On, runners de CI, peering BGP).
- Use `Marco Pisco` as the name, without aliases. Don't describe Marco as a student; the IT Systems professional course ended in July 2026.
- Primavera ERP only appears in the Visão Lógica internship. Quantinfor work is Cegid PHC only.
- Security by omission: don't name specific network hardware vendors or internal infrastructure details beyond what's already there.
- `ls stack/` is a curated list. Don't add Primavera, C++, IIS, TeamCity, Jenkins, SIP, MySQL, PostgreSQL or Authentik.
- Education, under the AEJICS course:
  - ClassLink is the PAP (final course project). The school didn't adopt it, so don't say the school runs it. Link to `github.com/marpisco/ClassLink`. Name only Office 365 for its sign-on, not Authentik.
  - "IT help" is light, day-to-day help (inventory, Windows scripts). Don't claim account administration.
  - Media work is described generically as school events and news segments. No Erasmus mention.
  - In the student union, Marco was a Vogal (board member): audio, event help, small logistical and admin tasks.
- Abbreviations that need explaining use the custom tooltip (`tip()`), never a `title` attribute.

## Animations

Motion follows Emil Kowalski's `animate` skill (github.com/emilkowalski/skills):

- Animate only `transform` and `opacity`. Never use `transition: all`, `ease-in` or `scale(0)`.
- Strong ease-out `cubic-bezier(0.23, 1, 0.32, 1)`, UI durations of 300ms or less.
- Hover motion gated behind `@media (hover: hover) and (pointer: fine)`.
- `prefers-reduced-motion` ships with every animation: no streaming, no typing, no blink.

The scroll effect is plain text streaming in, with no screen effects such as flicker, scanlines, glow, fades or slides.

## Workflow

- Design changes start as a mockup that Marco comments on, then get implemented here. Don't commit visual changes he hasn't seen (screenshots or a Cloudflare preview).
- For visual checks, take Chromium screenshots (Playwright) at 1280px and 390px. The scroll reveal hides unreached text, so scroll the page to the bottom before a full-page screenshot.
- Commit after each requested change, only the related files, in Conventional Commits style: `type(scope): short message`, then a body saying what changed, why, and how it was tested.
