module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['prettier', 'eslint-plugin-react-compiler'],
  rules: {
    'prettier/prettier': 'error',
    'import/no-unresolved': 'off',
    'react-compiler/react-compiler': 'error',
  },
};
