module.exports = {
  extends: ['expo', 'prettier', 'plugin:@typescript-eslint/recommended-type-checked'],
  plugins: ['prettier', 'eslint-plugin-react-compiler', 'unused-imports', '@typescript-eslint'],
  rules: {
    'prettier/prettier': 'error',
    'import/no-unresolved': 'off',
    'react-compiler/react-compiler': 'error',
    'unused-imports/no-unused-imports': 'error',
    'no-redeclare': 'off',
    '@typescript-eslint/no-redeclare': 'off',
    '@typescript-eslint/unbound-method': 'off',
    '@typescript-eslint/require-await': 'off',
    'no-empty-pattern': 'off',
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'react-redux',
            importNames: ['useSelector'],
            message: 'Use useSelector from @/store',
          },
        ],
      },
    ],
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    projectService: true,
    tsconfigRootDir: __dirname,
  },
};
