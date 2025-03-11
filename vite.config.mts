import {dirname} from 'path'
import {fileURLToPath} from 'url'

import {createViteConfig} from '@naverpay/pite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default createViteConfig({
    cwd: __dirname,
    outDir: ['dist/cjs', 'dist/esm'],
    formats: ['cjs', 'es'],
    entry: {
        index: './src/index.ts',
    },
    ignoredPolyfills: ['es.array.push'],
})
