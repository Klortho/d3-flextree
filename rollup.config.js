import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import commonjs from 'rollup-plugin-commonjs';
import copy from 'rollup-plugin-copy';
import json from 'rollup-plugin-json';

const configs = {
  dev: {
    input: 'index.js',
    output: {
      name: 'd3',
      extend: true,
      file: 'build/d3-flextree.js',
      format: 'umd',
      sourcemap: true,
    },
    plugins: [
      json({
        preferConst: true,
        indent: '  ',
      }),
      resolve(),
      commonjs(),
      babel({
        exclude: 'node_modules/**'
      }),
    ],
  },
  prod: {
    input: 'index.js',
    output: {
      name: 'd3',
      extend: true,
      file: 'build/d3-flextree.min.js',
      format: 'umd',
      sourcemap: true,
    },
    plugins: [
      json({
        preferConst: true,
        indent: '  ',
      }),
      resolve(),
      commonjs(),
      uglify(),
      babel({
        exclude: 'node_modules/**'
      }),
    ],
  },
  demo: {
    input: 'src/demo/script.js',
    output: {
      name: 'demo',
      file: 'demo/bundle.js',
      format: 'umd',
      sourcemap: true,
    },
    onwarn(warning, warn) {
      if (warning.code === 'CIRCULAR_DEPENDENCY') return;
      warn(warning);
    },
    plugins: [
      // FIXME: do we need this here?
      json({
        preferConst: true,
        indent: '  ',
      }),
      resolve(),
      commonjs(),
      babel(),
      copy({
        "src/demo/index.html": "demo/index.html",
        "src/demo/style.css": "demo/style.css",
        verbose: true,
      }),
    ],
  },
  test: {
    input: 'src/test/main.js',
    output: {
      name: 'test',
      file: 'test/bundle.js',
      format: 'umd',
      sourcemap: true,
    },
    plugins: [
      json({
        preferConst: true,
        indent: '  ',
      }),
      resolve(),
      commonjs(),
      copy({
        "src/test/test.html": "test/test.html",
        "src/test/browser-tests.js": "test/browser-tests.js",
        verbose: true,
      }),
    ],
  },
};

const product = process.env.BUILD || 'all';
const config = product === 'all' ? Object.values(configs) : configs[product];
export default config;
