/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Helper script for bootstrap.js
 *
 * This is loaded, via goog.bootstrap(), after the other top-level
 * Blockly modules.  It simply calls goog.require() for each of them,
 * to force the deubg module loader to finish loading them before any
 * non-module scripts (like msg/messages.js) that might have
 * undeclared dependencies on them.
 */

/* eslint-disable-next-line no-undef */
for (const require of BlocklyLoader.requires) {
  goog.require(require);
}
