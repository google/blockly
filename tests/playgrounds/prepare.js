/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Load this file in a <script> tag to prepare for
 *     importing Blockly into a web page.
 *
 *     You must use a <script> tag to load this script first, then
 *     import blockly.mjs in a <script type=module> to obtain the
 *     loaded value.
 *
 *     See tests/playground.html for example usage.
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
    window.CLOSURE_NO_DEPS = true;
    // Load the Closure Library's base.js (the only part of the
    // libary we use, mainly for goog.require / goog.provide /
    // goog.module).
    document.write('<script src="../../closure/goog/base.js"></script>');
    // Load dependency graph info from test/deps.js.  To update
    // deps.js, run `npm run build:deps`.
    document.write('<script src="../../tests/deps.js"></script>');

    // Msg loading kludge.  This should go away once #5409 and/or
    // #1895 are fixed.

    // Load messages into a temporary Blockly.Msg object, deleting it
    // afterwards (after saving the messages!)
    window.Blockly = {Msg: Object.create(null)};
    document.write('<script src="../../msg/messages.js"></script>');
    document.write(`
        <script>
          window.BlocklyMsg = window.Blockly.Msg;
          delete window.Blockly;
        </script>`);

    document.write(`
        <script>
          window.BlocklyLoader = new Promise((resolve, reject) => {
            goog.bootstrap(
                [
                  'Blockly',
                  'Blockly.libraryBlocks',
                  'Blockly.Dart.all',
                  'Blockly.JavaScript.all',
                  'Blockly.Lua.all',
                  'Blockly.PHP.all',
                  'Blockly.Python.all',
                ], resolve);
          }).then(() => {
            // Copy Messages from temporary Blockly.Msg object to the real one:
            Object.assign(goog.module.get('Blockly').Msg, window.BlocklyMsg);
          }).then(() => {
            return goog.module.get('Blockly');
          });
        </script>`);
  } else {
    // The below code is necessary for a few reasons:
    // - We need an absolute path instead of relative path because the
    //   advanced_playground the and regular playground are in different folders.
    // - We need to get the root directory for blockly because it is
    //   different for github.io, appspot and local.
    const files = [
      'blockly_compressed.js',
      'msg/messages.js',
      'blocks_compressed.js',
      'dart_compressed.js',
      'javascript_compressed.js',
      'lua_compressed.js',
      'php_compressed.js',
      'python_compressed.js',
    ];

    // We need to load Blockly in compiled mode.
    const hostName = window.location.host.replaceAll('.', '\\.');
    const matches = new RegExp(hostName + '\\/(.*)tests').exec(window.location.href);
    const root = matches && matches[1] ? matches[1] : '';

    // Load blockly_compressed.js et al. using <script> tags.
    for (let i = 0; i < files.length; i++) {
      document.write('<script src="/' + root + files[i] + '"></script>');
    }
  }
})();
