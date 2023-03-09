const rules = {
  'curly': ['error'],
  'eol-last': ['error'],
  'keyword-spacing': ['error'],
  'linebreak-style': ['error', 'unix'],
  'max-len': [
    'error',
    {
      'code': 100,
      'tabWidth': 4,
      'ignoreStrings': true,
      'ignoreRegExpLiterals': true,
      'ignoreUrls': true,
    },
  ],
  'no-trailing-spaces': ['error', {'skipBlankLines': true}],
  'no-unused-vars': [
    'warn',
    {
      'args': 'after-used',
      // Ignore vars starting with an underscore.
      'varsIgnorePattern': '^_',
      // Ignore arguments starting with an underscore.
      'argsIgnorePattern': '^_',
    },
  ],
  // Blockly uses for exporting symbols. no-self-assign added in eslint 5.
  'no-self-assign': ['off'],
  // Blockly uses single quotes except for JSON blobs, which must use double
  // quotes.
  'quotes': ['off'],
  'semi': ['error', 'always'],
  // Blockly doesn't have space before function paren when defining functions.
  'space-before-function-paren': ['error', 'never'],
  // Blockly doesn't have space before function paren when calling functions.
  'func-call-spacing': ['error', 'never'],
  'space-infix-ops': ['error'],
  // Blockly uses 'use strict' in files.
  'strict': ['off'],
  // Closure style allows redeclarations.
  'no-redeclare': ['off'],
  'valid-jsdoc': ['error'],
  'no-console': ['off'],
  'no-multi-spaces': ['error', {'ignoreEOLComments': true}],
  'operator-linebreak': ['error', 'after'],
  'spaced-comment': [
    'error',
    'always',
    {
      'block': {
        'balanced': true,
      },
      'exceptions': ['*'],
    },
  ],
  // Blockly uses prefixes for optional arguments and test-only functions.
  'camelcase': [
    'error',
    {
      'properties': 'never',
      'allow': ['^opt_', '^_opt_', '^testOnly_'],
    },
  ],
  // Use clang-format for indentation by running `npm run format`.
  'indent': ['off'],
  // Blockly uses capital letters for some non-constructor namespaces.
  // Keep them for legacy reasons.
  'new-cap': ['off'],
  // Mostly use default rules for brace style, but allow single-line blocks.
  'brace-style': ['error', '1tbs', {'allowSingleLine': true}],
  // Blockly uses objects as maps, but uses Object.create(null) to
  // instantiate them.
  'guard-for-in': ['off'],
  'prefer-spread': ['off'],
  'comma-dangle': [
    'error',
    {
      'arrays': 'always-multiline',
      'objects': 'always-multiline',
      'imports': 'always-multiline',
      'exports': 'always-multiline',
      'functions': 'ignore',
    },
  ],
};

/**
 * Build shared settings for TS linting and add in the config differences.
 * @return {Object} The override TS linting for given files and a given
 *     tsconfig.
 */
function buildTSOverride({files, tsconfig}) {
  return {
    'files': files,
    'plugins': [
      '@typescript-eslint/eslint-plugin',
      'jsdoc',
    ],
    'settings': {
      'jsdoc': {
        'mode': 'typescript',
      },
    },
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
      'project': tsconfig,
      'tsconfigRootDir': '.',
      'ecmaVersion': 2020,
      'sourceType': 'module',
    },
    'extends': [
      'plugin:@typescript-eslint/recommended',
      'plugin:jsdoc/recommended',
    ],
    'rules': {
      // TS rules
      // Blockly uses namespaces to do declaration merging in some cases.
      '@typescript-eslint/no-namespace': ['off'],
      // Use the updated TypeScript-specific rule.
      'no-invalid-this': ['off'],
      '@typescript-eslint/no-invalid-this': ['error'],
      // Needs decision. 601 problems.
      '@typescript-eslint/no-non-null-assertion': ['off'],
      // Use TS-specific rule.
      'no-unused-vars': ['off'],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          'argsIgnorePattern': '^_',
          'varsIgnorePattern': '^_',
        },
      ],
      'func-call-spacing': ['off'],
      '@typescript-eslint/func-call-spacing': ['warn'],
      // Temporarily disable. 23 problems.
      '@typescript-eslint/no-explicit-any': ['off'],
      // Temporarily disable. 128 problems.
      'require-jsdoc': ['off'],
      // Temporarily disable. 55 problems.
      '@typescript-eslint/ban-types': ['off'],
      // Temporarily disable. 33 problems.
      '@typescript-eslint/no-empty-function': ['off'],
      // Temporarily disable. 3 problems.
      '@typescript-eslint/no-empty-interface': ['off'],

      // TsDoc rules (using JsDoc plugin)
      // Disable built-in jsdoc verifier.
      'valid-jsdoc': ['off'],
      // Don't require types in params and returns docs.
      'jsdoc/require-param-type': ['off'],
      'jsdoc/require-returns-type': ['off'],
      // params and returns docs are optional.
      'jsdoc/require-param-description': ['off'],
      'jsdoc/require-returns': ['off'],
      // Disable for now (breaks on `this` which is not really a param).
      'jsdoc/require-param': ['off'],
      // Don't auto-add missing jsdoc. Only required on exported items.
      'jsdoc/require-jsdoc': [
        'warn',
        {
          'enableFixer': false,
          'publicOnly': true,
        },
      ],
      // Disable because of false alarms with Closure-supported tags.
      // Re-enable after Closure is removed.
      'jsdoc/check-tag-names': ['off'],
      // Re-enable after Closure is removed. There shouldn't even be
      // types in the TsDoc.
      // These are "types" because of Closure's @suppress {warningName}
      'jsdoc/no-undefined-types': ['off'],
      'jsdoc/valid-types': ['off'],
      // Disabled due to not handling `this`. If re-enabled,
      // checkDestructured option
      // should be left as false.
      'jsdoc/check-param-names': ['off', {'checkDestructured': false}],
      // Allow any text in the license tag. Other checks are not relevant.
      'jsdoc/check-values': ['off'],
      'jsdoc/newline-after-description': ['error'],
    },
  };
}

// NOTE: When this output is put directly in `module.exports`, the formatter
// does not align with the linter.
const eslintJSON = {
  'rules': rules,
  'env': {
    'es2020': true,
    'browser': true,
  },
  'globals': {
    'goog': true,
    'exports': true,
  },
  'extends': [
    'eslint:recommended',
    'google',
  ],
  // TypeScript-specific config. Uses above rules plus these.
  'overrides': [
    buildTSOverride({
      files: ['./core/**/*.ts', './core/**/*.tsx'],
      tsconfig: './tsconfig.json',
    }),
    buildTSOverride({
      files: [
        './tests/typescript/**/*.ts',
        './tests/typescript/**/*.tsx',
      ],
      tsconfig: './tests/typescript/tsconfig.json',
    }),
    {
      'files': ['./.eslintrc.js'],
      'env': {
        'node': true,
      },
    },
  ],
};

module.exports = eslintJSON;
