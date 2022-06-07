/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Bootstrap code to load Blockly, typically in
 *     uncompressed mode.
 *
 *     Load this file in a <script> tag in a web page to use the
 *     Closure Library debug module loader to load Blockly in
 *     uncompressed mode.
 *
 *     You must use a <script> tag to load this script first, then
 *     import blockly.mjs in a <script type=module> to obtain the
 *     loaded module.
 *
 *     See tests/playground.html for example usage.
 *
 *     Exception: for speed and compatibility reasons, if this is
 *     script is loaded in Internet Explorer or from a host other than
 *     localhost, blockly_compressed.js (et al.) will be loaded
 *     instead.  IE 11 doesn't understand modern JavaScript, and
 *     because of the sequential module loading carried out by the
 *
 *     (Note also that this file eschews certain modern JS constructs,
 *     like template literals, for compatibility with IE 11.)
 *
 *     The bootstrap code will consult a BLOCKLY_BOOTSTRAP_OPTIONS
 *     global variable to determine what to load.  See further
 *     documentation inline.
 *
 */
'use strict';

(function() {
  // Values usedd to compute default bootstrap options.
  const isIe = navigator.userAgent.indexOf('MSIE') !== -1 ||
      navigator.appVersion.indexOf('Trident/') > -1;
  const localhosts = ['localhost', '127.0.0.1', '[::1]'];

  // Default bootstrap options.
  const options = {
    // Decide whether to use compmiled mode or not.  Please see issue
    // #5557 for more information.
    loadCompressed: isIe || !localhosts.includes(location.hostname),

    // URL of the blockly repository.  This is needed for a few reasons:
    //
    // - We need an absolute path instead of relative path because the
    //   advanced_playground the and regular playground are in
    //   different folders.
    // - We need to get the root directory for blockly because it is
    //   different for github.io, appspot and local.
    //
    // Default value will work so long as top-level page is loaded
    // from somewhere in tests/.
    root: window.location.href.replace(/\/tests\/.*$/, '/'),

    // List of goog.modules to goog.require.
    requires: [
      'Blockly',
      'Blockly.libraryBlocks',
      'Blockly.Dart.all',
      'Blockly.JavaScript.all',
      'Blockly.Lua.all',
      'Blockly.PHP.all',
      'Blockly.Python.all',
    ],

    // List of scripts to load in compressed mode, instead of requires.
    compressedScripts: [
      'blockly_compressed.js',
      'msg/messages.js',
      'blocks_compressed.js',
      'dart_compressed.js',
      'javascript_compressed.js',
      'lua_compressed.js',
      'php_compressed.js',
      'python_compressed.js',
    ],
  };
  if (typeof window.BLOCKLY_BOOTSTRAP_OPTIONS === 'object') {
    Object.assign(options, window.BLOCKLY_BOOTSTRAP_OPTIONS);
  }

  /* eslint-disable-next-line no-undef */
  if (typeof module === 'object' && typeof module.exports === 'object') {
    // Running in node.js.  Maybe we wish to support this.
    // blockly_uncompressed formerly did, though it appears that the
    // code had not been working for some time (at least since PR
    // #5718 back in December 2021.  For now just throw an error.
    throw new Error('Bootstrapping in node.js not implemented.');
  }

  if (!options.loadCompressed) {
    // We can load Blockly in uncompressed mode.  Note that this section
    // needs to parse in IE11 (mostly ES5.1, but allowing e.g. const),
    // but it does not need to be _executable_ in IE11 - it is safe to
    // use ES6 builtins.

    // Disable loading of closure/goog/deps.js (which doesn't exist).
    window.CLOSURE_NO_DEPS = true;
    // Load the Closure Library's base.js (the only part of the
    // libary we use, mainly for goog.require / goog.provide /
    // goog.module).
    document.write(
        '<script src="' + options.root + '/closure/goog/base.js"></script>');
    // Load dependency graph info from build/deps.js.  To update
    // deps.js, run `npm run build:deps`.
    document.write(
        '<script src="' + options.root + '/build/deps.js"></script>');

    // Msg loading kludge.  This should go away once #5409 and/or
    // #1895 are fixed.

    // Load messages into a temporary Blockly.Msg object, deleting it
    // afterwards (after saving the messages!)
    window.Blockly = {Msg: Object.create(null)};
    document.write(
        '<script src="' + options.root + 'msg/messages.js"></script>');
    document.write(
        '<script>\n' +
        '  window.BlocklyMsg = window.Blockly.Msg;\n' +
        '  delete window.Blockly;\n' +
        '</script>\n');
    const requires = options.requires.map(r => '\'' + r + '\'').join();
    document.write(
        '<script>\n' +
        '  window.BlocklyLoader = new Promise((resolve, reject) => {\n' +
        '    goog.bootstrap([' + requires + '], resolve);\n' +
        '  }).then(() => {\n' +
        '    // Copy Messages from temp Blockly.Msg object to the real one:\n' +
        '    Object.assign(goog.module.get(\'Blockly\').Msg,\n' +
        '                  window.BlocklyMsg);\n' +
        '  }).then(() => {\n' +
        '    return goog.module.get(\'Blockly\');\n' +
        '  });\n' +
        '</script>\n');
  } else {
    // We need to load Blockly in compressed mode.  Load
    // blockly_compressed.js et al. using <script> tags.
    const scripts = options.compressedScripts;
    for (let i = 0; i < scripts.length; i++) {
      document.write(
          '<script src="' + options.root + scripts[i] + '"></script>');
    }
  }
})();
