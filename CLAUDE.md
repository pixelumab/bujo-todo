# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a SvelteKit-based Progressive Web App (PWA) for a todo application, using Svelte 5 with TypeScript, Tailwind CSS v4, and shadcn-svelte UI components.

## Development Commands

### Core Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Code Quality

```bash
# Type checking
pnpm check

# Type checking with watch mode
pnpm check:watch

# Lint code (Prettier + ESLint)
pnpm lint

# Format code
pnpm format
```

## Architecture

### Stack

- **Framework**: SvelteKit 2.x with adapter-auto
- **Svelte Version**: 5.x (uses runes: $props, $state, $derived, etc.)
- **Styling**: Tailwind CSS v4 with custom design tokens
- **UI Components**: shadcn-svelte (installed via components.json)
- **Build Tool**: Vite 7.x
- **Package Manager**: pnpm with workspaces

### Directory Structure

```
src/
├── lib/
│   ├── components/ui/     # shadcn-svelte UI components
│   ├── hooks/             # Custom hooks
│   ├── assets/            # Static assets like favicon
│   └── utils.ts           # Utility functions (cn, type helpers)
├── routes/
│   ├── layout.css         # Global styles with Tailwind and design tokens
│   ├── +layout.svelte     # Root layout
│   └── +page.svelte       # Home page
└── app.d.ts               # TypeScript declarations
```

### Key Configuration Files

#### components.json

Defines shadcn-svelte configuration with path aliases:

- `@/components` → `$lib/components`
- `@/ui` → `$lib/components/ui`
- `@/utils` → `$lib/utils`
- `@/hooks` → `$lib/hooks`

Note: The svelte.config.js has a placeholder alias (`'@/*': './path/to/lib/*'`) that should be updated if using @ imports.

#### Styling

The project uses Tailwind CSS v4 with:

- Custom CSS variables for theming (defined in layout.css)
- Dark mode support via `.dark` class
- `tw-animate-css` for animations
- Custom design tokens for colors, borders, and spacing
- The `cn()` utility function for merging Tailwind classes

#### TypeScript

- Strict mode enabled
- Using `rewriteRelativeImportExtensions: true`
- Path aliases managed through SvelteKit configuration
- Extended from `.svelte-kit/tsconfig.json`

### Svelte 5 Patterns

This project uses Svelte 5, which means:

- Use runes (`$props()`, `$state()`, `$derived()`, `$effect()`)
- Use `{@render children()}` instead of `<slot />`
- Component props are defined with `let { prop1, prop2 } = $props()`
- Reactivity uses `$state` instead of let declarations
- Always validate Svelte 5 code using the svelte-autofixer MCP tool

### ESLint Configuration

- Uses flat config format (eslint.config.js)
- TypeScript ESLint with recommended rules
- Svelte plugin with recommended + prettier rules
- `no-undef` disabled for TypeScript files (per typescript-eslint recommendations)
- Respects .gitignore via @eslint/compat

### Prettier

- Uses tabs for indentation
- Single quotes
- No trailing commas
- 100 character print width
- Tailwind class sorting enabled
- Tailwind stylesheet: `./src/routes/layout.css`
