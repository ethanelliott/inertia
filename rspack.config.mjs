// @ts-check
/** @type {import('@rspack/cli').Configuration} */
const config = {
  target: 'node',
  entry: {
    main: './dist/src/index.js',
  },
  watch: true,
};
export default config;
