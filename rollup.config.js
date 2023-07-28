import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import replaceRegex from 'rollup-plugin-replace-regex';


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
        replaceComments(),
        resolve(),
        commonjs(),
    ];
}

function replaceComments() {
    console.log('replaceComments()');
    return replaceRegex({
        preventAssignment: true,
        // values: {
        //     '(\/\*\{\}\*\/)': '//',
        //     'q.q': 'aa',
        // },
        delimiters: ['',''],
        values: {
            'never now': '"never how"',
            // '/*{}*/': '//',
            // '\/\*\{\}\*\/': '//',
            '\\/\\*\\{\\}\\*\\/': '//',
        },
        regexValues: {
            'q.q': 'qq',
            'k.k': 'kk',
            'a.a': 'aa',
            // '\/\*\{\}\*\/': '//',
            // '\\/\\*\\{\\}\\*\\/': '//',
            // '/*{}*/': '//',
        },
    });
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

function createConfing_def({ input, output, tsconfig }) {
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
            typescript({ tsconfig }),
            (minify ? terser() : [])
        ]
    };
}

/** @type import('rollup').RollupOptions[] */
export default [
    // createConfing_es({ input: '', output: '' }),
    //createConfing_def({ input: `src/index.ts`, output: `dist/es6/dom/index${minAppendix}.mjs` }),
    // createConfing_def({ input: 'src/vdom-builder/vdom-server-language.ts', output: `dist/es6/builder/index${minAppendix}.mjs` }),


    // createConfing_def({ input: 'src/vdom-builder/index.ts', output: `dist/index${minAppendix}.mjs`, tsconfig: './tsconfig-builder.json' }),
    createConfing_def({ input: 'src/utils/format-with.ts', output: `dist/index${minAppendix}.mjs`, tsconfig: './tsconfig.json' }),
];
