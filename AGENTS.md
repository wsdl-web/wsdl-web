# AGENTS.md

## Project

WSDL Web UI — a browser-based SOAP/WSDL explorer (like Swagger UI for WSDL). Single-page app built with TypeScript, React, Vite, shadcn/ui, Zustand.

## Tech stack

- **Runtime**: Node.js 18+
- **Build**: Vite 8, TypeScript 5.9
- **UI**: React 19, Tailwind CSS 4, shadcn/ui (New York style), Lucide icons
- **State**: Zustand
- **Test**: Vitest with jsdom environment
- **Syntax highlighting**: PrismJS (XML)

## Commands

```sh
npm run dev        # Start dev server
npm run build      # Type-check + production build
npm test           # Run tests once
npm run test:watch # Run tests in watch mode
```

## Architecture

The codebase is split into a pure TypeScript parsing/SOAP layer and a React UI layer:

- `src/lib/wsdl/` — WSDL 1.1 and 2.0 parsers, XSD type introspection, sample XML generation. No React dependencies. Uses browser DOMParser for XML.
- `src/lib/soap/` — SOAP 1.1/1.2 envelope builder, request sender (fetch), namespace constants.
- `src/lib/xml/` — Safe XML parser wrapper, pretty-printer.
- `src/store/` — Zustand store bridging parsing layer with UI.
- `src/components/` — React components: layout (TopBar, ServiceHeader), explorer (ServiceList, EndpointGroup, OperationCard, OperationDetail), shared (XmlHighlighter, ErrorAlert, LoadingSpinner).

## Key conventions

- Path alias `@/` maps to `src/`.
- All WSDL/SOAP/XML library code must remain framework-agnostic (no React imports).
- Tests live in `src/test/` with XML fixtures in `src/test/fixtures/`.
- shadcn/ui components are in `src/components/ui/` — do not edit these directly.
- CSS uses Tailwind with CSS custom properties defined in `src/index.css`. The design uses a warm light theme with teal (`--primary`) and coral (`--soap-badge`) accents.

## Commits

Use **conventional commit** format for all commits:

```
feat: add WSDL import support
fix: correct RPC envelope namespace
test: add WSDL 2.0 parser coverage
refactor: extract message resolution logic
chore: update dependencies
docs: update README with proxy instructions
```

Do **not** add `Co-Authored-By` trailers to commit messages.

## Testing

- Run `npm test` before committing. All tests must pass.
- Parser and envelope builder tests use fixture XML files — add new fixtures for new test scenarios.
- The test environment is jsdom, providing DOMParser for XML parsing tests.
