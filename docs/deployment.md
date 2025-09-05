# Deployment Guide

This document explains how to deploy the MiScore Website to different hosting platforms and configure it for different URL structures.

## Overview

The MiScore Website is a Single Page Application (SPA) built with Svelte that uses hash-based routing. To support direct URL access (deep linking) on static hosting platforms like GitHub Pages, we implement a client-side routing fallback system.

## GitHub Pages Deployment

### Default Setup (username.github.io/repo-name)

The current configuration is set up for deployment to `https://username.github.io/MiScore-site/`.

#### Build Steps

1. **Build for subfolder deployment:**
   ```bash
   npm run build:subfolder
   ```

2. **Commit and push the built files:**
   ```bash
   git add public/
   git commit -m "Build for GitHub Pages deployment"
   git push origin main
   ```

3. **Configure GitHub Pages:**
   - Go to your repository's Settings > Pages
   - Set source to "Deploy from a branch"
   - Choose "main" branch and "/root" folder
   - Your site will be available at `https://username.github.io/MiScore-site/`

### How the SPA Routing Works

The deployment uses a two-file system to handle direct URL access:

1. **`public/404.html`** - Catches all missing routes and redirects them
2. **`public/index.html`** - Contains a script that processes the redirected URLs

#### The Process:
1. User visits `https://username.github.io/MiScore-site/game/doom-eternal`
2. GitHub Pages serves `404.html` (since that path doesn't exist)
3. `404.html` redirects to `/?/game/doom-eternal`
4. `index.html` loads and processes the redirect
5. JavaScript converts it to the proper hash route: `#/game/doom-eternal`

## Customizing for Different URLs

### Different Repository Name

If deploying to a different repository (e.g., `my-gaming-site`):

1. **Update package.json:**
   ```json
   {
     "scripts": {
       "build:subfolder": "BASE_URL=/my-gaming-site rollup -c",
       "start:subfolder": "sirv public --no-clear --single --port 8081 --host --base /my-gaming-site"
     }
   }
   ```

2. **Update 404.html:**
   ```javascript
   var pathSegmentsToKeep = 1; // Keep this as 1 for username.github.io/repo-name
   ```

3. **Build and deploy:**
   ```bash
   npm run build:subfolder
   ```

### Custom Domain (username.github.io)

If deploying to a custom domain or root GitHub Pages site:

1. **Update package.json:**
   ```json
   {
     "scripts": {
       "build": "rollup -c",
       "start": "sirv public --no-clear --single --port 8081 --host"
     }
   }
   ```

2. **Update 404.html:**
   ```javascript
   var pathSegmentsToKeep = 0; // Change to 0 for root domain deployment
   ```

3. **Build and deploy:**
   ```bash
   npm run build
   ```

### Using Environment Variables

You can also use environment variables for flexible deployment:

```bash
# For subfolder deployment
BASE_URL=/my-custom-folder npm run build

# For root deployment
npm run build
```

## Local Development

### Development Server
```bash
npm run dev              # Root URL (localhost:8080)
npm run dev:subfolder    # With BASE_URL set
```

### Production Testing
```bash
npm run start            # Root URL (localhost:8081)
npm run start:subfolder  # With subfolder simulation (localhost:8081/MiScore-site)
```

## Key Files to Modify

When changing deployment URLs, these files need attention:

1. **`package.json`** - Update build scripts with correct BASE_URL
2. **`public/404.html`** - Update `pathSegmentsToKeep` value
3. **`public/index.html`** - Generally no changes needed (handled by build process)

## Troubleshooting

### Direct URLs Don't Work
- Ensure `404.html` is properly configured
- Check `pathSegmentsToKeep` value matches your URL structure
- Verify the build script is using the correct BASE_URL

### Styles/Assets Not Loading
- Check that asset paths in `index.html` include the correct base path
- Ensure the build process is updating asset references correctly

### Hash Routing Issues
- Verify the Router component in `App.svelte` has `hash={true}`
- Check that Link components are using the correct base paths

## Build Script Reference

The build process uses Rollup with environment variables to set the correct base URL for assets. The `processHtml()` function in `rollup.config.js` automatically updates all asset paths in `index.html` based on the `BASE_URL` environment variable.