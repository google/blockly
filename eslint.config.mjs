
import jsdoc from 'eslint-plugin-jsdoc';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import typescript from '@typescript-eslint/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';

// Used to convert the Google eslint config into flat config format.
const compat = new FlatCompat();

const defaultConfigRules = {
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
    'valid-jsdoc': ['error'],
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

    // TODO: Undo this. Added April 2024 for flat-configging
    'no-array-constructor': ['off'],
    'no-undef': ['off'],
    'no-import-assign': ['off'],
    'no-dupe-class-members': ['off'],
};

const blocklyDefaultConfig = {
    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.commonjs,
            ...globals.node,
            ...globals.es5,
            Blockly: true,
            goog: true,
        },
    },

    // TODO: Reenable this after deleting unused disable directives.
    // linterOptions: {
    //     reportUnusedDisableDirectives: true,
    // },

    plugins: {
        jsdoc,
    },

    settings: {
        jsdoc: {
            tagNamePreference: {
                returns: 'returns',
            },
            mode: 'closure',
        },
    },

    rules: defaultConfigRules
};

const tsConfigRules = {
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
    // These are 'types' because of Closure's @suppress {warningName}
    'jsdoc/no-undefined-types': ['off'],
    'jsdoc/valid-types': ['off'],
    // Disabled due to not handling `this`. If re-enabled,
    // checkDestructured option
    // should be left as false.
    'jsdoc/check-param-names': ['off', { 'checkDestructured': false }],
    // Allow any text in the license tag. Other checks are not relevant.
    'jsdoc/check-values': ['off'],
    // Ensure there is a blank line between the body and any @tags,
    // as required by the tsdoc spec (see #6353).
    'jsdoc/tag-lines': ['error', 'any', { 'startLines': 1 }],
};

const tsConfig = {
    files: [
        '**/*.ts',
        './**/*.tsx',
        './tests/typescript/**/*.ts',
        './tests/typescript/**/*.tsx'
    ],
    languageOptions: {
        parser: tsParser,
        parserOptions: {
            ecmaVersion: 6,
            sourceType: 'module',
            warnOnUnsupportedTypeScriptVersion: true,
        },
    },
    settings: {
        jsdoc: {
            mode: 'typescript',
        },
    },
    plugins: {
        '@typescript-eslint': typescript,
    },
    rules: tsConfigRules,
};

const ignoreConfig =
{
    ignores: [
        // Build artifacts
        'msg/**',
        'build/**',
        'dist/**',
        'typings/**',
        'docs/**',

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
        'tests/migration/*',

        // Demos, scripts, misc
        'node_modules/*',
        'generators/*',
        'demos/*',
        'appengine/*',
        'externs/*',
        'closure/*',
        'scripts/gulpfiles/*',
        'scripts/*',
        'CHANGELOG.md',
        'PULL_REQUEST_TEMPLATE.md',
    ],
};

const mochaConfig = {
    files: ['tests/mocha/**/*.js'],
    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.mocha,
            // TODO: Decide whether these should be globals.
            'chai': false,
            'sinon': false,
        },
    },
    plugins: {
        jsdoc,
    },

    settings: {
        jsdoc: {
            tagNamePreference: {
                returns: 'returns',
            },
            mode: 'closure',
        },
    },

    rules: {
        'no-unused-vars': ['off'],
        // Allow uncommented helper functions in tests.
        'require-jsdoc': ['off'],
        'prefer-rest-params': ['off'],
        'no-invalid-this': ['off'],
    },
}

const browserTestConfig = {
    files: ['tests/browser/**/*.js'],
    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.mocha,
            ...globals.node,
            // TODO: Decide whether these should be globals.
            'chai': false,
            'sinon': false,
        },
    },
    plugins: {
        jsdoc,
    },

    settings: {
        jsdoc: {
            tagNamePreference: {
                returns: 'returns',
            },
            mode: 'closure',
        },
    },

    rules: {
        'no-unused-vars': ['off'],
        // Allow uncommented helper functions in tests.
        'require-jsdoc': ['off'],
        'prefer-rest-params': ['off'],
        'no-invalid-this': ['off'],
        'valid-jsdoc': [
            'error',
            {
                'requireReturnType': false,
                'requireParamType': false
            }
        ]
    },
}

const nodeTestConfig = {
    files: ['tests/node/**/*.js'],
    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.mocha,
            ...globals.node,
            // TODO: Decide whether these should be globals.
            'console': true,
            'require': true,
        },
    }
}

const rootTestConfig = {
    files: ['tests/**/*.js'],
    languageOptions: {
        globals: {
            'Blockly': true,
            'dartGenerator': true,
            'javascriptGenerator': true,
            'luaGenerator': true,
            'phpGenerator': true,
            'pythonGenerator': true
        }
    }
}

export default [
    ignoreConfig,

    // Imported configs. Order matters.
    js.configs.recommended, // eslint-recommended
    ...compat.extends('eslint-config-google'),
    // jsdoc.configs['flat/recommended'], // jsdoc-recommended
    eslintConfigPrettier, // Must be last in the list of imported configs so it can override.

    // Default config that applies to all files
    blocklyDefaultConfig,
    rootTestConfig,
    mochaConfig,
    browserTestConfig,
    nodeTestConfig,
    tsConfig,
];