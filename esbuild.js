const esbuild = require('esbuild');
const args = process.argv.slice(2);

esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  outfile: 'public/main.js',
  sourcemap: true,
  target: ['es2020'],
  platform: 'browser',
  minify: true,
}).then(() => {
  console.log('Build finished.');
}).catch((e) => {
  console.log(e);
  process.exit(1);
});