module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es6': true,
    'node': true,
  },
  'extends': 'eslint:recommended',
  'parserOptions': {
    'sourceType': 'module',
  },
  'rules': {
    'comma-dangle': [
      'error',
      { 'arrays': 'always-multiline',
        'objects': 'always-multiline',
        'imports': 'always-multiline',
        'exports': 'always-multiline',
        'functions': 'never',
      },
    ],
    'complexity': [
      'error', 6
    ],
    'indent': [
      'error', 2,
    ],
    'linebreak-style': [
      'error', 'unix',
    ],
    'no-var': [
      'error',
    ],
    'quotes': [
      'error', 'single',
    ],
    'semi': [
      'error', 'always',
    ],
    strict: [
      'error', 'global',
    ],
  },
};
