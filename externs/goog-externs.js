/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Externs for goog.*
 *
 * These are needed because we use goog.module, goog.require etc. to
 * define our modules, but we don't actually include
 * closure/goog/base.js as input to the compiler.  Originally we only
 * needed the extern for goog, but some time between Closure Compiler
 * versions 20210601.0.0 and 20211006.0.0 we started getting
 * JSC_POSSIBLE_INEXISTENT_PROPERTY errors for goog.module /
 * goog.require / goog.requireType declarations involving modules
 * which used goog.module.declareLegacyNamespace.
 *
 * @externs
 */

/**
 * @type {!Object}
 */
var goog = {};

/**
 * @param {string} name
 * @return {void}
 */
goog.module = function(name) {};

/**
 * @return{void}
 */
goog.module.declareLegacyNamespace = function() {};

/**
 * @param {string} name
 * @return {?}
 */
goog.module.get = function(name) {};

/**
 * @param {string} name
 * @return {void}
 */
goog.provide = function(name) {};

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

/**
 * @param {string=} opt_message
 * @return{void}
 */
goog.setTestOnly = function(opt_message) {};
