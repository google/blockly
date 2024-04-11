
import jsdoc from 'eslint-plugin-jsdoc';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import typescript from '@typescript-eslint/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';

// Used to convert the Google eslint config into flat config format.
const compat = new FlatCompat();

const testConfig =
{
    files: ['tests/mocha/**/*.js'],
    languageOptions: {
        globals: {
            ...globals.mocha,
            // TODO: Decide whether these should be globals.
            'chai': false,
            'sinon': false,
        },
    },
    rules: {
        // TODO: Reenable rules and fix errors they reveal.
        // TODO: Turn no-unused-vars back on.
        'no-unused-vars': ['off'],
        // TODO: Turn valid-jsdoc back on.
        'valid-jsdoc': ['off'],
        //'valid-jsdoc': ['error'],

        // TODO: Turn missing-jsdoc back on.
        'jsdoc/require-jsdoc': ['off'],
        // TODO: Turn require-returns back on.
        'jsdoc/require-returns': ['off'],
        // TODO: Reenable.
        'jsdoc/no-undefined-types': ['off'],
        // TODO: Reenable.
        'prefer-rest-params': ['off'],

        // 'no-unused-vars': [
        //     'error',
        //     {
        //         'args': 'after-used',
        //         // Ignore vars starting with an underscore.
        //         'varsIgnorePattern': '^_',
        //         // Ignore arguments starting with an underscore.
        //         'argsIgnorePattern': '^_',
        //     },
        // ],
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
    },
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

    linterOptions: {
        reportUnusedDisableDirectives: true,
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
        // http://eslint.org/docs/rules/
        'camelcase': 'warn',
        'new-cap': ['error', { capIsNewExceptionPattern: '^.*Error' }],
        // Allow TODO comments.
        'no-warning-comments': 'off',
        'no-invalid-this': 'off',
        // valid-jsdoc does not work properly for interface methods.
        // https://github.com/eslint/eslint/issues/9978
        'valid-jsdoc': 'off',

        // https://github.com/gajus/eslint-plugin-jsdoc#eslint-plugin-jsdoc-rules
        'require-jsdoc': 'off',
        'jsdoc/newline-after-description': 'off',
        // This should warn instead, but it's broken for long record type params.
        'jsdoc/require-description-complete-sentence': 'off',
        'jsdoc/require-returns': [
            'error',
            {
                forceRequireReturn: false,
            },
        ],
        'jsdoc/require-description': [
            'warn',
            {
                // Don't require descriptions if these tags are present.
                exemptedBy: ['inheritdoc', 'param', 'return', 'returns', 'type'],
            },
        ],
        'jsdoc/check-tag-names': 'off',
        'jsdoc/check-access': 'warn',
        'jsdoc/check-types': 'off',
        'jsdoc/check-values': 'off',
        'jsdoc/require-jsdoc': [
            'warn',
            {
                enableFixer: false,
                require: {
                    FunctionDeclaration: true,
                    ClassDeclaration: true,
                    MethodDefinition: true,
                },
            },
        ],
    },
};

const tsConfig = {
    files: ['**/*.ts'],
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
    rules: {
        // Copied from blockly-samples
        // The types are specified in TS rather than JsDoc.
        'jsdoc/no-types': 'warn',
        'jsdoc/require-param-type': 'off',
        'jsdoc/require-property-type': 'off',
        'jsdoc/require-returns-type': 'off',
        // Don't auto-add missing jsdoc. Only required on exported items.
        'jsdoc/require-jsdoc': [
            'warn',
            {
                enableFixer: false,
                publicOnly: true,
            },
        ],
        // params and returns docs are optional.
        'jsdoc/require-param-description': ['off'],
        'jsdoc/require-returns': ['off'],
        // Ensure there is a blank line between the body and any @tags,
        // as required by the tsdoc spec.
        'jsdoc/tag-lines': ['error', 'any', { startLines: 1 }],

        // Already handled by tsc.
        'no-dupe-class-members': 'off',
        'no-undef': 'off',

        // Add TypeScript specific rules (and turn off ESLint equivalents)
        '@typescript-eslint/array-type': [
            'error',
            {
                default: 'array-simple',
            },
        ],
        '@typescript-eslint/ban-ts-comment': 'error',
        '@typescript-eslint/ban-types': [
            'error',
            {
                types: {
                    Object: {
                        message: "Use {} or 'object' instead.",
                    },
                    String: {
                        message: "Use 'string' instead.",
                    },
                    Number: {
                        message: "Use 'number' instead.",
                    },
                    Boolean: {
                        message: "Use 'boolean' instead.",
                    },
                },
            },
        ],
        'camelcase': 'off',
        // TODO: Turn this back on.
        '@typescript-eslint/naming-convention': ['off'],
        // '@typescript-eslint/naming-convention': [
        //     'error',
        //     {
        //         selector: 'default',
        //         format: ['camelCase', 'PascalCase'],
        //     },
        //     {
        //         selector: 'class',
        //         format: ['PascalCase'],
        //     },
        //     {
        //         // Disallow starting interaces with 'I'
        //         selector: 'interface',
        //         format: ['PascalCase'],
        //         custom: {
        //             regex: '^I[A-Z]',
        //             match: false,
        //         },
        //     },
        //     {
        //         selector: 'variable',
        //         modifiers: ['const'],
        //         format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
        //     },
        // ],
        '@typescript-eslint/consistent-type-assertions': 'error',

        'no-array-constructor': 'off',
        '@typescript-eslint/no-array-constructor': 'error',

        '@typescript-eslint/no-empty-interface': 'error',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-inferrable-types': 'error',
        '@typescript-eslint/no-misused-new': 'error',
        '@typescript-eslint/no-namespace': 'error',
        '@typescript-eslint/no-non-null-assertion': 'warn',
        '@typescript-eslint/no-this-alias': 'error',

        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { args: 'none' }],

        '@typescript-eslint/no-var-requires': 'error',
        '@typescript-eslint/prefer-namespace-keyword': 'error',
        '@typescript-eslint/triple-slash-reference': 'error',
        '@typescript-eslint/consistent-type-definitions': 'error',
        '@typescript-eslint/explicit-member-accessibility': [
            'error',
            { accessibility: 'no-public' },
        ],
        '@typescript-eslint/no-require-imports': 'error',


        // Copied from blockly eslintrc

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
        // These are "types" because of Closure's @suppress {warningName}
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



        // Added April 2024 for migration. TODO: Reenable rules or make
        // exceptions more explicit.
        // Blockly uses capital letters for some non-constructor namespaces.
        // Keep them for legacy reasons.
        'new-cap': ['off'],
        // Added April 2024.
        '@typescript-eslint/consistent-type-definitions': ['off'],
        '@typescript-eslint/array-type': ['off'],
        '@typescript-eslint/no-inferrable-types': ['off'],
        'no-import-assign': ['off'],
        '@typescript-eslint/explicit-member-accessibility': ['off'],
    },
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
        'tests/typescript/**',
        'tests/node/*',
        'tests/scripts/*',
        'tests/browser/**/*.js',
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
        'eslint.config.mjs',
        'ignore.eslintrc.js',
        'ignore.eslintignore',
    ],
};

export default [
    ignoreConfig,

    // Imported configs. Order matters.
    js.configs.recommended, // eslint-recommended
    ...compat.extends('eslint-config-google'),
    jsdoc.configs['flat/recommended'], // jsdoc-recommended
    eslintConfigPrettier, // Must be last in the list of imported configs so it can override.

    // Default config that applies to all files
    blocklyDefaultConfig,
    testConfig,
    tsConfig,
];