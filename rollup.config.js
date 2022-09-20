import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import dev from 'rollup-plugin-dev';

const env = process.env.ENV || 'prod';

export default {
  input: `demo/index.js`,
  plugins: plugins(env),
  output: {
    file: 'dist/umd/demo.js',
    format: 'iife',
    indent: true,
  },
};

function plugins(env) {
  let plugins = [
    commonjs(),
    nodeResolve(),
    babel({
      babelHelpers: 'bundled'
    }),
  ];
  if (env === 'dev') {
    plugins = [
      ...plugins,
      dev({
        port: 23456,
        dirs: ['dist'],
      }),
    ];
  }
  return plugins;
}
