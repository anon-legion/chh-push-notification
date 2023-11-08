module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  plugins: ['import', 'n', 'security'],
  extends: [
    'standard-with-typescript',
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:n/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:security/recommended',
    'prettier',
  ],
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  root: true,
  rules: {
    'no-underscore-dangle': 0,
    // eslint-plugin-n unable to resolve import without file extensions bug conflicts with Ts
    'n/no-missing-import': 0,
    'lines-between-class-members': 'off',
    '@typescript-eslint/lines-between-class-members': 1,
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: {
          arguments: false,
        },
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/strict-boolean-expressions': 1,
  },
  settings: {
    node: {
      tryExtensions: ['.js', '.json', '.node', '.ts', '.d.ts'],
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
  ignorePatterns: ['node_modules/', 'dist/'],
};

// eslint packages implemented:
// -eslint-config-standard-with-typescript
// 	-@typescript-eslint/eslint-plugin
// 	-eslint-plugin-promise
// -eslint-config-airbnb-typescript
// 	-eslint-config-airbnb-base
// -eslint-plugin-import
// 	-eslint-import-resolver-typescript
// -eslint-plugin-n
// -eslint-plugin-security
// -eslint-config-prettier
