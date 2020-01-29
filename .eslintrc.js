module.exports = {
  env: {
    es6: true,
    node: true,
    mocha: true
  },
  extends: [
    'standard',
    'plugin:security/recommended',
    'plugin:json/recommended',
    'plugin:mocha/recommended'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    'no-return-await': [0, 'always'],
    'dot-notation': [0, 'always'],
    'import/first': [0, 'always'],
    'mocha/no-mocha-arrows': [0, 'always']
  },
  plugins: [
    'security',
    'mocha'
  ]
}
