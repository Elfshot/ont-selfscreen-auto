module.exports = {
  root: true,
  env: {
    'node': true
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  ignorePatterns: ['webpack.config.js'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'no-async-promise-executor': 'off',
    'indent': [
      'error',
      2
    ],
    'quotes': [
      'error',
      'single',
      'avoid-escape'
    ],
    'semi': [
      'error',
      'always'
    ],
    'object-curly-spacing': [
      'error', 
      'always'
    ],
    'no-warning-comments': [
      1, { 
        'terms': [
          'todo', 
          'change',
          'fixme', 
          'fix',
          'bug', 
          'buggy',
        ],
        'location': 'anywhere',
      }
    ]
  }
};