# MiScore - Website

## Get started

Install the dependencies...

```bash
git clone https://github.com/sepro/MiScore-site miscore-website
cd miscore-website
git submodule update --init
npm install
```

If you need to update the data, please run

```bash
git submodule foreach git pull origin main
```

...then start [Rollup](https://rollupjs.org):

```bash
npm run dev
```

Navigate to [localhost:8080](http://localhost:8080). You should see your app running. Edit a component file in `src`, save it, and reload the page to see your changes.

By default, the server will only respond to requests from localhost. To allow connections from other computers, edit the `sirv` commands in package.json to include the option `--host 0.0.0.0`.

If you're using [Visual Studio Code](https://code.visualstudio.com/) we recommend installing the official extension [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode). If you are using other editors you may need to install a plugin in order to get syntax highlighting and intellisense.

## Building and running in production mode

To create an optimised version of the app:

```bash
npm run build
```

You can run the newly built app with `npm run start`. This uses [sirv](https://github.com/lukeed/sirv), which is included in your package.json's `dependencies` so that the app will work when you deploy to platforms like [Heroku](https://heroku.com).

### Building for deployment in a subfolder

If you need to deploy the app to a subfolder (e.g., `https://example.com/myapp/`), use the subfolder build command:

```bash
npm run build:subfolder
```

This builds the app with `BASE_URL=/myapp`, ensuring all asset paths and navigation work correctly when hosted in the `/myapp` subfolder. You can also set a custom subfolder path:

```bash
BASE_URL=/your-subfolder npm run build
```

To test the subfolder build locally:

```bash
npm run test:subfolder
```

This serves the built app at `http://localhost:8081/myapp/` to verify everything works correctly.


## Single-page app mode

By default, sirv will only respond to requests that match files in `public`. This is to maximise compatibility with static fileservers, allowing you to deploy your app anywhere.

If you're building a single-page app (SPA) with multiple routes, sirv needs to be able to respond to requests for *any* path. You can make it so by editing the `"start"` command in package.json:

```js
"start": "sirv public --single"
```

## Deploying to the web

For detailed deployment instructions, including how to customize for different hosting platforms and URL structures, see the **[Deployment Guide](docs/deployment.md)**.

