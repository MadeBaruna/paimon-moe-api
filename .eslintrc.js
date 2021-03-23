module.exports = {
  root: true,
  env: {
    node: true
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['standard-with-typescript'],
  parserOptions: {
    project: './tsconfig.json'
  },
  rules: {
    'semi': 'off',
    '@typescript-eslint/semi': ['error', 'always'],
    'no-void': ['error', { allowAsStatement: true }],
    'comma-dangle': ['error', 'always-multiline'],
    '@typescript-eslint/space-before-function-paren': 'off'
  }
}
