const esbuild = require('esbuild');
const path = require('path');

const arch = process.env.ESBUILD_ARCH || process.arch;

const commonExternal = [
  'electron',

  'fs',
  'path',
  'child_process',

  'node:fs',
  'node:path',
  'node:child_process',
  'node:fs/promises'
];

(async () => {
  try {
    console.log(`[esbuild] Bundling main process for arch: ${arch}`);

    await esbuild.build({
      entryPoints: [path.resolve(__dirname, '../main.js')],
      bundle: true,
      platform: 'node',
      outfile: path.resolve(__dirname, '../dist/main.js'),
      external: commonExternal,
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      sourcemap: true,
      minify: false,
      target: ['node22'],
      logLevel: 'info'
    });

    console.log('[esbuild] main.js bundled successfully');

    console.log(`[esbuild] Bundling preload process for arch: ${arch}`);

    await esbuild.build({
      entryPoints: [path.resolve(__dirname, '../preload.js')],
      bundle: true,
      platform: 'node',
      outfile: path.resolve(__dirname, '../dist/preload.js'),
      external: commonExternal,
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      sourcemap: true,
      minify: false,
      target: ['node22'],
      logLevel: 'info'
    });

    console.log('[esbuild] preload.js bundled successfully');
  } catch (err) {
    console.error('[esbuild] Build failed', err);
    process.exit(1);
  }
})();
