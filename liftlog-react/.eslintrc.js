module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['prettier', 'eslint-plugin-react-compiler', 'unused-imports'],
  rules: {
    'prettier/prettier': 'error',
    'import/no-unresolved': 'off',
    'react-compiler/react-compiler': 'error',
    'unused-imports/no-unused-imports': 'error',
    'no-redeclare': 'off',
    '@typescript-eslint/no-redeclare': 'off',
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'react-native-paper',
            importNames: ['Text'],
            message: 'Please use Text from react-native',
          },
        ],
      },
    ],
  },
};
