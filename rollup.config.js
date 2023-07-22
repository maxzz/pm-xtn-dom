import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

// This configuration expects environment parameters passed to the rollup:
// (e.g. "rollup -c rollup.config.js --environment target:es5,format:umd,minify",
const {
    minify,             // true: minify the bundle, false|undefined: do not minify the bundle (default)
    target,             // target syntax (es5, es6, ...). Default: es5
    format,             // bundle format (umd, cjs, ...). Default: umd
    npm_package_globalObject,
} = {
    target: "es2020",
    format: "es",
    ...process.env,
};

export default {
    input: `src/index.ts`,
    output: {
        format,
        extend: true,
        name: npm_package_globalObject,
        file: `dist/${target}/index${minify ? '.min' : ''}.mjs`,
        sourcemap: true,
    },
    plugins: [
        resolve(),
        commonjs(),
        typescript({ declaration: true }),
        (minify ? terser() : [])
    ]
};
