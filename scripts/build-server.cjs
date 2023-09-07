require('esbuild').build({
  entryPoints: ['src/server.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node18',
  outfile: 'build/server.js',
  define: {
    'import.meta.env.DEV': 'false',
    'import.meta.env.PROD': 'true',
    'import.meta.env.VITE_HOST': `${process.env.VITE_HOST}`,
    'import.meta.env.VITE_DISCORD_GUILD_ID': `${process.env.VITE_DISCORD_GUILD_ID}`,
  },
  banner: {
    js: "import { handler } from './handler.js';import { createRequire } from 'node:module';const require = createRequire(import.meta.url)",
  },
  external: Object.keys(require('../package.json').dependencies),
})
