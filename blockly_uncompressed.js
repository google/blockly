/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Bootstrap code to load Blockly in uncompiled mode.
 */
'use strict';


/* eslint-disable no-var */

/**
 * Blockly uncompiled-mode startup code.  If running in a browser
 * loads closure/goog/base.js and tests/deps.js, then (in any case)
 * requires Blockly.requires.
 */
(function(globalThis) {
  /* eslint-disable-next-line no-undef */
  var IS_NODE_JS = !!(typeof module !== 'undefined' && module.exports);

  if (IS_NODE_JS) {
    // Load Blockly.
    goog.require('Blockly.requires');
    /* eslint-disable no-undef */
    module.exports = Blockly;
  } else {
    var BLOCKLY_DIR = '';
    // Find name of current directory.
    var scripts = document.getElementsByTagName('script');
    var re = /(.+)[\\/]blockly_(?:.*)uncompressed\.js$/;
    for (var script, i = 0; (script = scripts[i]); i++) {
      var match = re.exec(script.src);
      if (match) {
        BLOCKLY_DIR = match[1];
        break;
      }
    }
    if (!BLOCKLY_DIR) {
      alert('Could not detect Blockly\'s directory name.');
    }
    // Disable loading of closure/goog/deps.js (which doesn't exist).
    globalThis.CLOSURE_NO_DEPS = true;
    // Load Closure Library base.js (the only part of the libary we use,
    // mainly for goog.require / goog.provide / goog.module).
    document.write(
        '<script src="' + BLOCKLY_DIR + '/closure/goog/base.js"></script>');
    // Load dependency graph info from test/deps.js.  To update
    // deps.js, run `npm run build:deps`.
    document.write(
        '<script src="' + BLOCKLY_DIR + '/tests/deps.js"></script>');
    // Load the rest of Blockly.
    document.write('<script>goog.require(\'Blockly\');</script>');
  }
  /* eslint-disable-next-line no-invalid-this */
})(this);
