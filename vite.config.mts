import {createViteConfig} from '@naverpay/pite'

export default createViteConfig({
    cwd: '.',
    outDir: ['dist/cjs', 'dist/esm'],
    formats: ['cjs', 'es'],
    entry: {
        index: './src/index.ts',
    },
    allowedPolyfills: ['es.array.push'],
})
