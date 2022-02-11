/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Load this file in a <script> tag to prepare for
 *     importing Blockly into a web page.
 */
'use strict';

(function() {
  // Decide whether we can load Blockly uncompiled, or must load the
  // compiled version.  Please see issue #5557 for more information.
  const isIe = navigator.userAgent.indexOf('MSIE') !== -1 ||
      navigator.appVersion.indexOf('Trident/') > -1;
  const localhosts = ['localhost', '127.0.0.1', '[::1]'];

  if (localhosts.includes(location.hostname) && !isIe) {
    // We can load Blockly in uncompiled mode.

    // Disable loading of closure/goog/deps.js (which doesn't exist).
    globalThis.CLOSURE_NO_DEPS = true;
    // Load the Closure Library's base.js (the only part of the
    // libary we use, mainly for goog.require / goog.provide /
    // goog.module).
    document.write('<script src="../../closure/goog/base.js"></script>');
    // Load dependency graph info from test/deps.js.  To update
    // deps.js, run `npm run build:deps`.
    document.write('<script src="../../tests/deps.js"></script>');
  } else {
    // We need to load Blockly in compiled mode.

    // Load blockly_compressed.js et al. using <script> tags.
    document.write('<script src="../../blockly_compressed.js"></script>');
    document.write('<script src="../../dart_compressed.js"></script>');
    document.write('<script src="../../javascript_compressed.js"></script>');
    document.write('<script src="../../lua_compressed.js"></script>');
    document.write('<script src="../../php_compressed.js"></script>');
    document.write('<script src="../../python_compressed.js"></script>');
    document.write('<script src="../../blocks_compressed.js"></script>');
    document.write('<script src="../../msg/messages.js"></script>');
  }
})();
