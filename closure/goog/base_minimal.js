/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A minimal implementation of base.js.
 *
 * This file is used in place of base.js (Closure library bootstrap
 * code) when building Blockly using the Closure Compiler.  Refer to
 * base.js for more information about items defined here.
 *
 * @provideGoog
 */

/** @define {boolean} Overridden to true by the compiler. */
var COMPILED = false;

/** @const */
var goog = goog || {};

/**
 * Reference to the global object.  This is provided as 'root' by the
 * UMD wrapper, but prefer globalThis if it is defined.
 * 
 * https://www.ecma-international.org/ecma-262/9.0/index.html#sec-global-object
 *
 * @const
 * @type {!Global}
 * @suppress {undefinedVars}
 */
goog.global = globalThis || root;

/** @type {Object<string, (string|number|boolean)>|undefined} */
goog.global.CLOSURE_DEFINES;

/**
 * Defines a named value.
 * When compiled the default can be overridden using the compiler options or the
 * value set in the CLOSURE_DEFINES object. Returns the defined value so that it
 * can be used safely in modules. Note that the value type MUST be either
 * boolean, number, or string.
 *
 * @param {string} name
 * @param {T} defaultValue
 * @return {T}
 * @template T
 */
goog.define = function(name, defaultValue) {
  return defaultValue;
};

/** @define {boolean} */
goog.DEBUG = goog.define('goog.DEBUG', false);

/** @define {boolean} */
goog.DISALLOW_TEST_ONLY_CODE =
    goog.define('goog.DISALLOW_TEST_ONLY_CODE', COMPILED && !goog.DEBUG);

/**
 * @param {string} name
 */
goog.provide = function(name) {};

/**
 * @param {string} name
 * @return {void}
 */
goog.module = function(name) {};

/**
 * @param {string} name
 * @return {?}
 * @suppress {missingProvide}
 */
goog.module.get = function(name) {};

/** @suppress {missingProvide} */
goog.module.declareLegacyNamespace = function() {};

/**
 * Marks that the current file should only be used for testing, and never for
 * live code in production.
 *
 * In the case of unit tests, the message may optionally be an exact namespace
 * for the test (e.g. 'goog.stringTest'). The linter will then ignore the extra
 * provide (if not explicitly defined in the code).
 *
 * @param {string=} opt_message Optional message to add to the error that's
 *     raised when used in production code.
 */
goog.setTestOnly = function(opt_message) {
  if (goog.DISALLOW_TEST_ONLY_CODE) {
    opt_message = opt_message || '';
    throw new Error(
        'Importing test-only code into non-debug environment' +
        (opt_message ? ': ' + opt_message : '.'));
  }
};

/**
 * @param {string} namespace
 * @return {?}
 */
goog.require = function(namespace) {};

/**
 * @param {string} namespace
 * @return {?}
 */
goog.requireType = function(namespace) {};
