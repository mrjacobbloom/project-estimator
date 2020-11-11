import typescript from 'rollup-plugin-typescript2';

export default {
  input: './src/ts/index.tsx',
  output: {
    globals: {
      'react': 'React',
      'react-dom': 'ReactDOM',
      'redux': 'Redux',
      'react-redux': 'ReactRedux',
    },
    file: './dist/js/index.bundle.js',
    format: 'iife',
    sourcemap: true,
  },
  plugins: [
    typescript(),
  ]
};
