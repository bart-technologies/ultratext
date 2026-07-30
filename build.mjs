import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/utml.ts'],
  outfile: 'dist/ultratext.min.js',
  bundle: true,
  format: 'iife',
  minify: true,
  sourcemap: false,
  target: 'es2020',
});
