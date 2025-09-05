import { spawn } from 'child_process';
import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import css from 'rollup-plugin-css-only';
import replace from '@rollup/plugin-replace';
import { readFileSync, writeFileSync } from 'fs';

const production = !process.env.ROLLUP_WATCH;
const baseUrl = process.env.BASE_URL || '';

// Plugin to process HTML and inject BASE_URL for assets
function processHtml() {
	return {
		name: 'process-html',
		buildStart() {
			const htmlPath = 'public/index.html';
			let html = readFileSync(htmlPath, 'utf8');
			
			// Replace asset paths with BASE_URL prefixed paths
			if (baseUrl) {
				html = html.replace(/href='\.\/favicon\.png'/g, `href='${baseUrl}/favicon.png'`);
				html = html.replace(/href='\.\/global\.css'/g, `href='${baseUrl}/global.css'`);
				html = html.replace(/href='\.\/build\/bundle\.css'/g, `href='${baseUrl}/build/bundle.css'`);
				html = html.replace(/src='\.\/build\/bundle\.js'/g, `src='${baseUrl}/build/bundle.js'`);
			}
			
			writeFileSync(htmlPath, html);
		}
	};
}

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default {
	input: 'src/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/build/bundle.js'
	},
	plugins: [
		processHtml(),
		replace({
			preventAssignment: true,
			'import.meta.env.BASE_URL': JSON.stringify(process.env.BASE_URL || ''),
			'import.meta.env': JSON.stringify({ BASE_URL: process.env.BASE_URL || '' })
		}),
		svelte({
			compilerOptions: {
				// enable run-time checks when not in production
				dev: !production
			}
		}),
		// we'll extract any component CSS out into
		// a separate file - better for performance
		css({ output: 'bundle.css' }),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte'],
			exportConditions: ['svelte']
		}),
		commonjs(),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};
