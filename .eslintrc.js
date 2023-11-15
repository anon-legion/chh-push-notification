module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  plugins: ['@typescript-eslint', 'import', 'n', 'promise', 'security'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:promise/recommended',
    'plugin:n/recommended',
    'plugin:security/recommended',
    'prettier',
  ],
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.js'],
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
    'lines-between-class-members': 0,
    '@typescript-eslint/lines-between-class-members': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-misused-promises': [
      2,
      {
        checksVoidReturn: {
          arguments: false,
        },
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      2,
      {
        argsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/strict-boolean-expressions': [
      2,
      {
        allowString: true,
        allowNumber: true,
        allowNullableObject: true,
        allowNullableString: true,
      },
    ],
    'linebreak-style': ['error', 'unix'],
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
// -@typescript-eslint/eslint-plugin
// -eslint-plugin-promise
// -eslint-config-airbnb-typescript
// 	-eslint-config-airbnb-base
// -eslint-plugin-import
// 	-eslint-import-resolver-typescript
// -eslint-plugin-n
// -eslint-plugin-security
// -eslint-config-prettier
