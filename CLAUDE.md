# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MiScore Website is a Svelte-based single-page application that displays gaming records and statistics. The app fetches game data from a JSON file and presents it through a clean web interface with routing capabilities.

## Development Commands

- `npm run dev` - Start development server with hot reload (default port: 8080)
- `npm run build` - Create production build in `public/build/`
- `npm run start` - Serve production build locally

## Architecture

### Core Structure
- **Frontend Framework**: Svelte 3 with svelte-routing for navigation
- **Build Tool**: Rollup with plugins for Svelte, CSS extraction, and live reload
- **Data Source**: Static JSON file at `/records/data/records.json` (git submodule)
- **State Management**: Svelte stores (`stores.js`) for game records and loading state

### Key Files
- `src/main.js` - Application entry point
- `src/App.svelte` - Root component with router setup and data fetching
- `src/stores.js` - Global state management for game records
- `rollup.config.js` - Build configuration with development/production modes

### Routing Structure
- `/` - Home page (`src/routes/Home.svelte`) showing game overview table
- `/game/:id` - Game details page (`src/routes/GameDetails.svelte`) for individual games

### Components
- `src/components/RecordType.svelte` - Display record type information
- `src/components/Modal.svelte` - Modal dialog component

### Data Flow
1. App loads and fetches `/records/data/records.json` on mount
2. Data stored in `gameRecords` store, loading state in `isLoading` store
3. Home route aggregates record counts per game
4. GameDetails route displays detailed information for specific games

### Important Notes
- The `public/records` directory is a git submodule containing the data
- Application runs in SPA mode with `--single` flag for client-side routing
- CSS is extracted into separate bundle for performance
- Development server includes live reload functionality