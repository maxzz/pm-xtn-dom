import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

// This configuration expects environment parameters passed to the rollup:
// (e.g. "rollup -c rollup.config.js --environment target:es5,format:umd,minify",
const {
    minify,             // true: minify the bundle, false|undefined: do not minify the bundle (default)
    format,             // bundle format (umd, cjs, ...). Default: umd
} = {
    target: "es2020",
    format: "es",
    ...process.env,
};

const minAppendix = minify ? '.min' : '';

function commonPlugins() {
    return [
        resolve(),
        commonjs(),
    ];
}

function createConfing_es({ input, output }) {
    return {
        input,
        output: { file: output, format: "es", },
        plugins: [
            ...commonPlugins,
            // typescript({ compilerOptions: { declaration: true, outDir: './es6ts', rootDir: './src/vdom-builder' }, tsconfig: 'tsconfig-builder.json' }),
            typescript({ tsconfig: './tsconfig-builder.json' }),
            (minify ? terser() : [])
        ],
    };
}

function createConfing_def({ input, output }) {
    return {
        input,
        output: {
            format,
            extend: true,
            file: output,
            // sourcemap: true,
        },
        plugins: [
            ...commonPlugins(),
            typescript({ tsconfig: './tsconfig-builder.json' }),
            (minify ? terser() : [])
        ]
    };
}

export default [
    // createConfing_es({ input: '', output: '' }),
    //createConfing_def({ input: `src/index.ts`, output: `dist/es6/dom/index${minAppendix}.mjs` }),
    // createConfing_def({ input: 'src/vdom-builder/vdom-server-language.ts', output: `dist/es6/builder/index${minAppendix}.mjs` }),
    createConfing_def({ input: 'src/vdom-builder/index.ts', output: `dist/index${minAppendix}.mjs` }),
];
