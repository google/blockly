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
 * non-module scripts (like msg/messages.js) that might have
 * undeclared dependencies on them.
 */

/* eslint-disable-next-line no-undef */
for (const require of window.bootstrapInfo.requires) {
  goog.require(require);

  // If require is a top-level chunk, create a global variable for it.
  // This replaces the goog.module.declareLegacyNamespace calls that
  // previously existed in each chunk entrypoint.
  const exportName = {
    'Blockly.Dart': 'dartGenerator',
    'Blockly.Dart.all': 'dartGenerator',
    'Blockly.JavaScript': 'javascriptGenerator',
    'Blockly.JavaScript.all': 'javascriptGenerator',
    'Blockly.Lua': 'luaGenerator',
    'Blockly.Lua.all': 'luaGenerator',
    'Blockly.PHP': 'phpGenerator',
    'Blockly.PHP.all': 'phpGenerator',
    'Blockly.Python': 'pythonGenerator',
    'Blockly.Python.all': 'pythonGenerator',
  }[require];
  if (exportName) {
    window[exportName] = goog.module.get(require)[exportName];
  } else if (require === 'Blockly') {
    window.Blockly = goog.module.get(require);
  } else if (require === 'Blockly.libraryBlocks') {
    window.libraryBlocks = goog.module.get(require);
  }
}
