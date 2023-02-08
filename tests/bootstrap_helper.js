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
 * to force the debug module loader to finish loading them before any
 * non-module scripts (like msg/en.js) that might have
 * undeclared dependencies on them.
 */

(function() {
  const info = window.bootstrapInfo;

  if (!info.compressed) {
    // Force debug module loader to finish loading all modules.
    for (const require of info.requires) {
      goog.require(require);
    }
  }

  // Create global names for named and destructured imports.
  for (const varName in info.namedImports) {
    const id = info.namedImports[varName];
    const value = info.compressed ? get(id) : goog.module.get(id);
    if (value) {
      window[varName] = value;
    }
  }
  for (const varName in info.destructuredImports) {
    const id = info.destructuredImports[varName];
    const value = info.compressed ? get(id) : goog.module.get(id)[varName];
    if (value) {
      window[varName] = value;
    }
  }

  return;  // All done.  Only helper functions after this point.

  /**
   * Get the object referred to by a doted-itentifier path
   * (e.g. foo.bar.baz).
   * @param {string} path The path referring to the object.
   * @return {string|null} The object, or null if not found.
   */
  function get(path) {
    let obj = window;
    for (const part of path.split('.')) {
      obj = obj[part];
      if (!obj) return null;
    }
    return obj;
  }
})();
