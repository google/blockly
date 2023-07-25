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
 *     You must use a <script src=> tag to load this script first
 *     (after setting BLOCKLY_BOOTSTRAP_OPTIONS in a preceeding
 *     <script> tag, if desired - see below), then import
 *     bootstrap_done.mjs in a <script type=module> to wait for
 *     bootstrapping to finish.
 *
 *     See tests/playground.html for example usage.
 *
 *     Exception: for speed, if this is script is from a host other
 *     than localhost, blockly_compressed.js (et al.) will be loaded
 *     instead.  Because of the sequential, non-parallel module loading
 *     carried out by the debug module loader, loading can be painfully
 *     tedious over a slow network connection. (This can be overridden
 *     by the page if desired.)
 *
 *     The bootstrap code will consult a BLOCKLY_BOOTSTRAP_OPTIONS
 *     global variable to determine what to load.  This must be set
 *     before loading this script.  See documentation inline below.
 */
'use strict';

(function () {
  // Values used to compute default bootstrap options.
  const localhosts = ['localhost', '127.0.0.1', '[::1]'];
  const isLocalhost = localhosts.includes(location.hostname);
  const isFileUrl = location.origin === 'file://';

  // Default bootstrap options.  These can be overridden by setting
  // the same property on BLOCKLY_BOOTSTRAP_OPTIONS.
  const options = {
    // Decide whether to use compressed mode or not.  Please see issue
    // #5557 for more information.
    loadCompressed: !(isLocalhost || isFileUrl),

    // URL of the blockly repository.  This is needed for a few reasons:
    //
    // - We need an absolute path instead of relative path because the
    //   advanced_playground and the regular playground are in
    //   different folders.
    // - We need to get the root directory for blockly because it is
    //   different for github.io, appspot and local.
    //
    // Default value will work so long as top-level page is loaded
    // from somewhere in tests/.
    root: window.location.href.replace(/\/tests\/.*$/, '/'),

    // List of deps files to load.  Paths relative to root.
    depsFiles: ['build/deps.js'],

    // List of modules to load.
    // - id: goog.module ID to require in uncompressed mode.
    // - script: path, relative to root, to .js file to load via
    //   <script> in compressed mode.
    // - scriptExport: path at which script will save exports object
    //   (see chunks in build_tasks.js); defaults to id.
    // - importAt: gloal variable to set to export object.
    // - destructure: map of globalVariable: exportName; globals will
    //   be set to the corresponding exports.
    modules: [
      {
        id: 'Blockly',
        script: 'dist/blockly_compressed.js',
        scriptExport: 'Blockly',
        importAt: 'Blockly',
      },
      {
        id: 'Blockly.libraryBlocks',
        script: 'dist/blocks_compressed.js',
        scriptExport: 'Blockly.libraryBlocks',
        importAt: 'libraryBlocks',
      },
      {
        id: 'Blockly.Dart.all',
        script: 'dist/dart_compressed.js',
        scriptExport: 'dart',
        destructure: {dartGenerator: 'dartGenerator'},
      },
      {
        id: 'Blockly.JavaScript.all',
        script: 'dist/javascript_compressed.js',
        scriptExport: 'javascript',
        destructure: {javascriptGenerator: 'javascriptGenerator'},
      },
      {
        id: 'Blockly.Lua.all',
        script: 'dist/lua_compressed.js',
        scriptExport: 'lua',
        destructure: {luaGenerator: 'luaGenerator'},
      },
      {
        id: 'Blockly.PHP.all',
        script: 'dist/php_compressed.js',
        scriptExport: 'php',
        destructure: {phpGenerator: 'phpGenerator'},
      },
      {
        id: 'Blockly.Python.all',
        script: 'dist/python_compressed.js',
        scriptExport: 'python',
        destructure: {pythonGenerator: 'pythonGenerator'},
      },
    ],

    // Additional goog.modules to goog.require (for side-effects only,
    // in uncompressed mode only).
    requires: [],

    // Additional scripts to be loaded after Blockly is loaded,
    // whether Blockly is loaded from compressed or uncompressed.
    // Paths relative to root.
    scripts: ['build/msg/en.js'],
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

  // Create a global variable to remember some state that will be
  // needed by later scripts.
  window.bootstrapInfo = {
    /** boolean */ compressed: options.loadCompressed,
    /** Object<{id: string, script: string, scriptExport: string,
     *          destructure: Object<string>}> */ modules: options.modules,
    /** ?Array<string> */ requires: null,
    /** ?Promise */ done: null,
  };

  if (!options.loadCompressed) {
    // We can load Blockly in uncompressed mode.

    // Disable loading of closure/goog/deps.js (which doesn't exist).
    window.CLOSURE_NO_DEPS = true;
    // Load the Closure Library's base.js (the only part of the
    // library we use, mainly for goog.require / goog.provide /
    // goog.module).
    document.write(
      `<script src="${options.root}build/src/closure/goog/base.js"></script>`,
    );

    // Prevent spurious transpilation warnings.
    document.write('<script>goog.TRANSPILE = "never";</script>');

    // Load dependency graph info from the specified deps files -
    // typically just build/deps.js.  To update deps after changing
    // any module's goog.requires / imports, run `npm run build:deps`.
    for (const depsFile of options.depsFiles) {
      document.write(`<script src="${options.root + depsFile}"></script>`);
    }

    // Assemble a list of module targets to bootstrap.
    //
    // The first group of targets are those listed in options.modules
    // and options.requires.  These are recorded on bootstrapInfo so
    // so bootstrap_helper.js can goog.require() them to force loading
    // to complete.
    //
    // The next target is a fake one that will load
    // bootstrap_helper.js.  We generate a call to goog.addDependency
    // to tell the debug module loader that it can be loaded via a
    // fake module name, and that it depends on all the targets in the
    // first group (and indeed bootstrap_helper.js will make a call to
    // goog.require for each one).
    //
    // We then create another target for each of options.scripts,
    // again generating calls to goog.addDependency for each one
    // making it dependent on the previous one.
    let requires = (window.bootstrapInfo.requires = [
      ...options.modules.map((module) => module.id),
      ...options.requires,
    ]);

    const scripts = ['tests/bootstrap_helper.js', ...options.scripts];
    const scriptDeps = [];
    for (const script of scripts) {
      const fakeModuleName = `script.${script.replace(/[./]/g, '-')}`;
      scriptDeps.push(
        `goog.addDependency(${quote('../../../../' + script)}, ` +
          `[${quote(fakeModuleName)}], [${requires.map(quote).join()}], ` +
          `{'lang': 'es6'});`,
      );
      requires = [fakeModuleName];
    }

    // Finally, write out a script containing the generated
    // goog.addDependency calls and a call to goog.bootstrap
    // requesting the loading of the final target, which will cause
    // all the previous ones to be loaded recursively.  Wrap this in a
    // promise and save it so it can be awaited in bootstrap_done.mjs.
    document.write(`<script>
  ${scriptDeps.join('\n  ')}
  window.bootstrapInfo.done = new Promise((resolve, reject) => {
    goog.bootstrap([${requires.map(quote).join()}], resolve);
  });
</script>`);
  } else {
    // We need to load Blockly in compressed mode.  Load
    // blockly_compressed.js et al. using <script> tags.
    const scripts = [
      ...options.modules.map((module) => module.script),
      'tests/bootstrap_helper.js',
      ...options.scripts,
    ];
    for (const script of scripts) {
      document.write(`<script src="${options.root + script}"></script>`);
    }
  }

  return; // All done.  Only helper functions after this point.

  /**
   * Convert a string into a string literal.  Strictly speaking we
   * only need to escape backslash, \r, \n, \u2028 (line separator),
   * \u2029 (paragraph separator) and whichever quote character we're
   * using, but for simplicity we escape all the control characters.
   *
   * Based on https://github.com/google/CodeCity/blob/master/server/code.js
   *
   * @param {string} str The string to convert.
   * @return {string} The value s as a eval-able string literal.
   */
  function quote(str) {
    /* eslint-disable no-control-regex, no-multi-spaces */
    /** Regexp for characters to be escaped in a single-quoted string. */
    const singleRE = /[\x00-\x1f\\\u2028\u2029']/g;

    /** Map of control character replacements. */
    const replacements = {
      '\x00': '\\0',
      '\x01': '\\x01',
      '\x02': '\\x02',
      '\x03': '\\x03',
      '\x04': '\\x04',
      '\x05': '\\x05',
      '\x06': '\\x06',
      '\x07': '\\x07',
      '\x08': '\\b',
      '\x09': '\\t',
      '\x0a': '\\n',
      '\x0b': '\\v',
      '\x0c': '\\f',
      '\x0d': '\\r',
      '\x0e': '\\x0e',
      '\x0f': '\\x0f',
      '"': '\\"',
      "'": "\\'",
      '\\': '\\\\',
      '\u2028': '\\u2028',
      '\u2029': '\\u2029',
    };
    /* eslint-enable no-control-regex, no-multi-spaces */

    return "'" + str.replace(singleRE, (c) => replacements[c]) + "'";
  }
})();
