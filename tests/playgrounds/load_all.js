/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Loads uncompressed Blockly when running locally. Loads
 * compressed otherwise.
 */
'use strict';


/**
 * Loads all the compressed or uncompressed dependencies necessary to run the
 * playground. This is necessary since the goog.module conversion. Please see
 * issue #5557 for more information.
 */
(function() {
const isIe = navigator.userAgent.indexOf('MSIE') !== -1 ||
    navigator.appVersion.indexOf('Trident/') > -1;

if ((location.hostname === 'localhost' || location.hostname === '127.0.0.1' ||
     location.hostname === '[::1]') &&
    !isIe) {
  document.write(
      `<script src="../blockly_uncompressed.js" id="blockly-uncompressed-script"></script>`);
  document.write(`<script src="../msg/messages.js"></script>`);
  document.write(`<script src="../tests/themes/test_themes.js"></script>`);
  document.write(
      `<script src="../node_modules/@blockly/block-test/dist/index.js"></script>`);
  document.write(`<script>
                // Custom requires for the playground.
                goog.require('Blockly.libraryBlocks');
                goog.require('Blockly.Dart.all');
                goog.require('Blockly.JavaScript.all');
                goog.require('Blockly.Lua.all');
                goog.require('Blockly.PHP.all');
                goog.require('Blockly.Python.all');
                goog.require('Blockly.WorkspaceCommentSvg');
            </script>`);
} else {
  document.write(
      `<script src="../blockly_compressed.js" id="blockly-compressed-script"></script>`);
  document.write(`<script src="../blocks_compressed.js"></script>`);
  document.write(`<script src="../dart_compressed.js"></script>`);
  document.write(`<script src="../javascript_compressed.js"></script>`);
  document.write(`<script src="../lua_compressed.js"></script>`);
  document.write(`<script src="../php_compressed.js"></script>`);
  document.write(`<script src="../python_compressed.js"></script>`);
  document.write(`<script src="../msg/messages.js"></script>`);
}
})();
