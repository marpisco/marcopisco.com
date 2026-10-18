# marcopisco.com

Source of [marcopisco.com](https://marcopisco.com), Marco Pisco's personal site: a single terminal-style page in English and European Portuguese.

![GitHub last commit](https://img.shields.io/github/last-commit/marpisco/marcopisco.com)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/marpisco/marcopisco.com)

## Stack

- TypeScript and Vite, with no framework and no runtime dependencies
- Vanilla CSS
- Bun for installs, scripts and tests
- Cloudflare Pages for hosting

## Features

- Terminal-style layout: `whoami`, `cat about.txt`, `ls stack/`, `git log work`, `cat education.md`, `contact --list`
- English and pt-PT. The page follows the browser language, and an `en • pt` switch remembers your choice.
- Text streams in like a dial-up connection as you scroll. With reduced motion turned on, it appears at once.
- Live Discord status through [Lanyard](https://github.com/Phineas/lanyard)
- A terminal-style 404 page built from the same sources

## Development

```bash
bun install
bun run dev         # http://localhost:5173
bun test
bun run typecheck
bun run build       # output in dist/
bun run preview
```

## Deployment

Cloudflare Pages builds the repository on every push. The settings are:

- build command `bun run build`
- output directory `dist`
- `BUN_VERSION=1.3.10`

`main` deploys to production, and every other branch gets a preview URL on `*.marcopiscocom.pages.dev`.

## License

GNU General Public License v3.0. See [LICENSE](LICENSE).
