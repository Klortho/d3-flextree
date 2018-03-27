import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import commonjs from 'rollup-plugin-commonjs';

export default [
  { input: 'src/flextree.js',
    output: {
      name: 'd3',
      extend: true,
      file: 'dist/d3-flextree.js',
      format: 'umd',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: 'node_modules/**'
      }),
    ],
  },
  { input: 'src/flextree.js',
    output: {
      name: 'd3',
      extend: true,
      file: 'dist/d3-flextree.min.js',
      format: 'umd',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      commonjs(),
      uglify(),
      babel({
        exclude: 'node_modules/**'
      }),
    ],
  },
  { input: 'demo/view-test-trees.js',
    output: {
      name: 'v',
      extend: true,
      file: 'demo/bundle.js',
      format: 'umd',
      sourcemap: true,
    },
    plugins: [
      resolve(),
      commonjs(),
      babel(),
    ],
  },
];
