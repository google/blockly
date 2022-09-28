/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Provides a reference to the global object.
 */
'use strict';

/**
 * Provides a reference to the global object.
 * @namespace Blockly.utils.global
 */
goog.module('Blockly.utils.global');


/* eslint-disable no-undef, no-invalid-this */

/**
 * Reference to the global object.
 *
 * More info on this implementation here:
 * https://docs.google.com/document/d/1NAeW4Wk7I7FV0Y2tcUFvQdGMc89k2vdgSXInw8_nvCI
 */
exports.globalThis = (function() {  // Not "let globalThis" to avoid shadowing.
  if (typeof globalThis === 'object') {
    return globalThis;
  }
  if (typeof self === 'object') {
    return self;
  }
  if (typeof window === 'object') {
    return window;
  }
  if (typeof global === 'object') {
    return global;
  }
  return this;
})();
