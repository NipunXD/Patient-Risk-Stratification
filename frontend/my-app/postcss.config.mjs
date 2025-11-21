/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {}, // This line is the fix
    autoprefixer: {},
  },
};

export default config;