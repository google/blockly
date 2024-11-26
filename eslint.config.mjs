import eslint from '@eslint/js';
import googleStyle from 'eslint-config-google';
import jsdoc from 'eslint-plugin-jsdoc';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// These rules are no longer supported, but the Google style package we depend
// on hasn't been updated in years to remove them, even though they have been
// removed from the repo. Manually delete them here to avoid breaking linting.
delete googleStyle.rules['valid-jsdoc'];
delete googleStyle.rules['require-jsdoc'];

const rules = {
  'no-unused-vars': [
    'error',
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
  // Blockly uses 'use strict' in files.
  'strict': ['off'],
  // Closure style allows redeclarations.
  'no-redeclare': ['off'],
  'no-console': ['off'],
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
  // Blockly uses capital letters for some non-constructor namespaces.
  // Keep them for legacy reasons.
  'new-cap': ['off'],
  // Blockly uses objects as maps, but uses Object.create(null) to
  // instantiate them.
  'guard-for-in': ['off'],
  'prefer-spread': ['off'],
};

/**
 * Build shared settings for TS linting and add in the config differences.
 * @return {Object} The override TS linting for given files and a given
 *     tsconfig.
 */
function buildTSOverride({files, tsconfig}) {
  return {
    'files': files,
    'plugins': {
      '@typescript-eslint': tseslint.plugin,
      jsdoc,
    },
    languageOptions: {
      parser: tseslint.parser,
      'ecmaVersion': 2020,
      'sourceType': 'module',
      parserOptions: {
        'project': tsconfig,
        'tsconfigRootDir': '.',
      },
      globals: {
        ...globals.browser,
      },
    },
    extends: [
      ...tseslint.configs.recommended,
      jsdoc.configs['flat/recommended-typescript'],
      eslintPluginPrettierRecommended,
    ],
    rules: {
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
        'error',
        {
          'argsIgnorePattern': '^_',
          'varsIgnorePattern': '^_',
        },
      ],
      // Temporarily disable. 23 problems.
      '@typescript-eslint/no-explicit-any': ['off'],
      // Temporarily disable. 55 problems.
      '@typescript-eslint/ban-types': ['off'],
      // Temporarily disable. 33 problems.
      '@typescript-eslint/no-empty-function': ['off'],
      // Temporarily disable. 3 problems.
      '@typescript-eslint/no-empty-interface': ['off'],
      // We use this pattern extensively for block (e.g. controls_if) interfaces.
      '@typescript-eslint/no-empty-object-type': ['off'],

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
      'jsdoc/check-tag-names': [
        'error',
        {
          'definedTags': [
            'sealed',
            'typeParam',
            'remarks',
            'define',
            'nocollapse',
            'suppress',
          ],
        },
      ],
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
      // Ensure there is a blank line between the body and any @tags,
      // as required by the tsdoc spec (see #6353).
      'jsdoc/tag-lines': ['error', 'any', {'startLines': 1}],
    },
  };
}

export default [
  {
    // Note: there should be no other properties in this object
    ignores: [
      // Build artifacts
      'msg/*',
      'build/*',
      'dist/*',
      'typings/*',
      'docs/*',
      // Tests other than mocha unit tests
      'tests/blocks/*',
      'tests/themes/*',
      'tests/compile/*',
      'tests/jsunit/*',
      'tests/generators/*',
      'tests/mocha/webdriver.js',
      'tests/screenshot/*',
      'tests/test_runner.js',
      'tests/workspace_svg/*',
      // Demos, scripts, misc
      'node_modules/*',
      'generators/*',
      'demos/*',
      'appengine/*',
      'externs/*',
      'closure/*',
      'scripts/gulpfiles/*',
      'CHANGELOG.md',
      'PULL_REQUEST_TEMPLATE.md',
    ],
  },
  eslint.configs.recommended,
  jsdoc.configs['flat/recommended'],
  googleStyle,
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        'goog': true,
        'exports': true,
      },
    },
    'settings': {
      // Allowlist some JSDoc tag aliases we use.
      'jsdoc': {
        'tagNamePreference': {
          'return': 'return',
          'fileoverview': 'fileoverview',
          'extends': 'extends',
          'constructor': 'constructor',
        },
      },
    },
    rules,
  },
  {
    files: [
      'eslint.config.mjs',
      '.prettierrc.js',
      'gulpfile.js',
      'scripts/helpers.js',
      'tests/mocha/.mocharc.js',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['tests/**'],
    languageOptions: {
      globals: {
        'Blockly': true,
        'dartGenerator': true,
        'javascriptGenerator': true,
        'luaGenerator': true,
        'phpGenerator': true,
        'pythonGenerator': true,
      },
    },
    rules: {
      'jsdoc/check-values': ['off'],
    },
  },
  {
    files: ['tests/browser/**'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        'chai': false,
        'sinon': false,
        ...globals.mocha,
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': ['off'],
      // Allow uncommented helper functions in tests.
      'jsdoc/require-jsdoc': ['off'],
      'jsdoc/require-returns-type': ['off'],
      'jsdoc/require-param-type': ['off'],
      'prefer-rest-params': ['off'],
      'no-invalid-this': ['off'],
    },
  },
  {
    files: ['tests/mocha/**'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        'chai': false,
        'sinon': false,
        ...globals.mocha,
        ...globals.browser,
      },
    },
    rules: {
      'no-unused-vars': ['off'],
      // Allow uncommented helper functions in tests.
      'jsdoc/require-jsdoc': ['off'],
      'prefer-rest-params': ['off'],
      'no-invalid-this': ['off'],
    },
  },
  {
    files: ['tests/node/**'],
    languageOptions: {
      globals: {
        'console': true,
        'require': true,
        ...globals.mocha,
        ...globals.node,
      },
    },
  },
  ...tseslint.config(
    buildTSOverride({
      files: ['**/*.ts', '**/*.tsx'],
      tsconfig: './tsconfig.json',
    }),
    buildTSOverride({
      files: ['tests/typescript/**/*.ts', 'tests/typescript/**/*.tsx'],
      tsconfig: './tests/typescript/tsconfig.json',
    }),
  ),
  // Per the docs, this should be at the end because it disables rules that
  // conflict with Prettier.
  eslintPluginPrettierRecommended,
];
