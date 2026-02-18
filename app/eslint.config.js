/* eslint-disable @typescript-eslint/no-require-imports */
const { defineConfig, globalIgnores } = require('eslint/config');

const prettier = require('eslint-plugin-prettier');
const reactCompiler = require('eslint-plugin-react-compiler');
const unusedImports = require('eslint-plugin-unused-imports');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const js = require('@eslint/js');

const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  // eslint-disable-next-line no-undef
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([
  {
    extends: compat.extends(
      'expo',
      'prettier',
      'plugin:@typescript-eslint/recommended-type-checked',
    ),
    ignores: [
      'gen',
      'vitest.config.ts',
      'metro.config.js',
      'babel.config.js',
      '.env.local',
      '.expo',
      'expo-env.d.ts',
      'dist',
      'node_modules',
      'types/dom.slim.d.ts',
    ],
    plugins: {
      prettier,
      'react-compiler': reactCompiler,
      'unused-imports': unusedImports,
      '@typescript-eslint': typescriptEslint,
    },

    rules: {
      'prettier/prettier': 'error',
      'import/no-unresolved': 'off',
      'react-compiler/react-compiler': 'error',
      'unused-imports/no-unused-imports': 'error',
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      'no-empty-pattern': 'off',

      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-redux',
              importNames: ['useSelector'],
              message: 'Use useAppSelector from @/store',
            },
            {
              name: '@material-symbols-react-native/outlined-400',
              message:
                'This import does not work on android -- too big. We need to use the individual imports',
            },
            {
              name: 'react-native-paper',
              importNames: ['IconButton', 'TouchableRipple', 'Button'],
              message:
                'Use our wrappers in @/components/presentation/gesture-wrappers/ - they are more reliable as they use GestureHandler',
            },
          ],
        },
      ],
    },

    languageOptions: {
      parser: tsParser,

      parserOptions: {
        projectService: {
          allowDefaultProject: ['eslint.config.js'],
        },
        // eslint-disable-next-line no-undef
        tsconfigRootDir: __dirname,
      },
    },
  },
  globalIgnores([
    '**/gen',
    '**/vitest.config.ts',
    '**/metro.config.js',
    '**/babel.config.js',
    '**/.eslintrc.js',
    '**/.env.local',
    '**/.expo',
    '**/expo-env.d.ts',
    '**/dist',
    '**/node_modules',
    'types/dom.slim.d.ts',
  ]),
]);
