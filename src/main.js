import App from './App.svelte';

console.log('main.js: Starting application initialization');
console.log('main.js: Document ready state:', document.readyState);
console.log('main.js: Target element (document.body):', document.body);

const app = new App({
  target: document.body
});

console.log('main.js: Svelte app created successfully');

export default app;
