import {dirname} from 'path'
import {fileURLToPath} from 'url'

import {createViteConfig} from '@naverpay/pite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default createViteConfig({
    cwd: __dirname,
    entry: {
        index: './src/index.ts',
    },
    outputs: [
        {format: 'es', dist: 'dist/esm'},
        {format: 'cjs', dist: 'dist/cjs'},
    ],
    skipRequiredPolyfillCheck: ['es.array.push'],
})
