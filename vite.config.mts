import {babel} from '@rollup/plugin-babel'
import browserslistToEsbuild from 'browserslist-to-esbuild'
import {defineConfig} from 'vite'

export default defineConfig({
    plugins: [
        babel({
            babelHelpers: 'runtime',
            plugins: [
                ['@babel/plugin-transform-runtime'],
                [
                    'babel-plugin-polyfill-corejs3',
                    {
                        method: 'usage-pure',
                        version: '3.39.0',
                        proposals: true,
                        exclude: ['es.array.push'],
                    },
                ],
            ],
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            exclude: 'node_modules/**',
        }),
    ],
    build: {
        target: browserslistToEsbuild(),
        outDir: 'dist',
        sourcemap: true,
        lib: {
            entry: {
                index: './src/index.ts',
            },
        },
        rollupOptions: {
            // external: [...Object.keys(pkg.dependencies)].flatMap((dep) => [dep, new RegExp(`^${dep}/.*`)]),
            output: [
                {
                    format: 'es',
                    dir: 'dist/esm',
                },
                {
                    format: 'cjs',
                    dir: 'dist/cjs',
                },
            ],
        },
    },
})
