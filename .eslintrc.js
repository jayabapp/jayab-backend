module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: ['plugin:@typescript-eslint/recommended'],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],

  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars':'warn',
    '@typescript-eslint/naming-convention': [
      'warn',
      // {
      //   "selector": "variable",
      //   "format": ["camelCase","PascalCase","UPPER_CASE"],
      //   "leadingUnderscore": "allow"
      // },
      {
        selector: 'variable',
        types: ['boolean'],
        format: ['camelCase', 'PascalCase'],
        prefix: ['is', 'should', 'has', 'can', 'did', 'will'],
      },
      {
        selector: 'class',
        format: ['PascalCase'],
      },
      {
        selector: 'classMethod',
        format: ['camelCase'],
        leadingUnderscore: 'allow',
      },
      {
        selector: ['function'],
        format: ['camelCase'],
        leadingUnderscore: 'allow',
        // trailingUnderscore: 'allowMultiple',
      },
      {
        selector: 'parameter',
        format: ['camelCase'],
        leadingUnderscore: 'allow',
      },
      {
        selector: 'typeAlias',
        format: ['PascalCase'],
      },
      {
        selector: 'interface',
        format: ['PascalCase'],
        custom: {
          regex: '^I[A-Z]',
          match: false,
        },
      },
    ],
    '@typescript-eslint/ban-ts-comment': 'warn',
  },
};
