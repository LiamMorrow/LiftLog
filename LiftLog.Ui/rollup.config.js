import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const config = {
    input: 'index.js',
    output: {
        dir: 'wwwroot',
        entryFileNames: 'bundle.js',
        format: 'iife',
        inlineDynamicImports: true,
    },

    plugins: [

        nodeResolve(),
        babel({
            babelHelpers: 'inline',
            presets: [['@babel/preset-env', {
                targets: {
                    browsers: ['chrome 60', 'firefox 60', 'safari 10'],
                }
            }]], plugins: ['babel-plugin-transform-globalthis']
        }),],
};

export default config;
