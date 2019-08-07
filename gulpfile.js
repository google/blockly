/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Gulp script to build Blockly for Node & NPM.
 * Run this script by calling "npm install" in this directory.
 */

var gulp = require('gulp');
gulp.shell = require('gulp-shell');
gulp.concat = require('gulp-concat');
gulp.replace = require('gulp-replace');
gulp.rename = require('gulp-rename');
gulp.insert = require('gulp-insert');
gulp.umd = require('gulp-umd');

var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');
var execSync = require('child_process').execSync;


// Rebuilds Blockly, including the following:
//  - blockly_compressed.js
//  - blocks_compressed.js
//  - Localization string tables in msg/js/*.js
//  - Generators in generators/*.js
// These files are already up-to-date in the master branch.
gulp.task('build', gulp.shell.task([
  'python build.py'
]));

// Concatenates the necessary files to load Blockly in a Node.js VM.  Blockly's
// individual libraries target use in a browser, where globals (via the window
// objects) are used to share state and APIs.  By concatenating all the
// necessary components into a single file, Blockly can be loaded as a Node.js
// module.
//
// This task builds Node with the assumption that the app needs English blocks
// and JavaScript code generation.  If you need another localization or
// generator language, just copy and edit the srcs. Only one localization
// language can be included.
gulp.task('blockly_node_javascript_en', function() {
  var srcs = [
    'blockly_compressed.js',
    'blocks_compressed.js',
    'javascript_compressed.js',
    'msg/js/en.js'
  ];
  // Concatenate the sources, appending the module export at the bottom.
  // Override textToDomDocument, providing Node alternative to DOMParser.
  return gulp.src(srcs)
      .pipe(gulp.concat('blockly_node_javascript_en.js'))
      .pipe(gulp.insert.append(`
if (typeof DOMParser !== 'function') {
  var JSDOM = require('jsdom').JSDOM;
  var window = (new JSDOM()).window;
  var document = window.document;
  var Element = window.Element;
  Blockly.utils.xml.textToDomDocument = function(text) {
    var jsdom = new JSDOM(text, { contentType: 'text/xml' });
    return jsdom.window.document;
  };
}
if (typeof module === 'object') { module.exports = Blockly; }
if (typeof window === 'object') { window.Blockly = Blockly; }\n`))
      .pipe(gulp.dest('.'));
});

/**
 * Task-builder for the watch function. Currently any change invokes the whole
 * build script. Invoke with "gulp watch".
 *
 * @param {?string=} concatTask Name of the concatenating task for node usage.
 */
// TODO: Only run the necessary phases of the build script for a given change.
function buildWatchTaskFn(concatTask) {
  return function() {
    // Tasks to trigger.
    var tasks = ['build'];
    if (concatTask) {
      tasks.push(concatTask);
    }

    // Currently any changes invokes the whole build script. (To fix.)
    var srcs = [
      'core/**/*.js',                      // Blockly core code
      'blocks/*.js',                       // Block definitions
      'generators/**/*.js',                // Code generation
      'msg/messages.js', 'msg/json/*.json' // Localization data
    ];
    var options = {
      debounceDelay: 2000  // Milliseconds to delay rebuild.
    };
    gulp.watch(srcs, options, gulp.parallel(tasks));
  };
}

// Watch Blockly files for changes and trigger automatic rebuilds, including
// the Node-ready blockly_node_javascript_en.js file.
gulp.task('watch', buildWatchTaskFn('blockly_node_javascript_en'));

////////////////////////////////////////////////////////////
//                        Typings                         //
////////////////////////////////////////////////////////////

// Generates the TypeScript definition file (d.ts) for Blockly.
// As well as generating the typings of each of the files under core/ and msg/,
// the script also pulls in a number of part files from typings/parts.
// This includes the header (incl License), additional useful interfaces
// including Blockly Options and Google Closure typings
gulp.task('typings', function (cb) {
  const tmpDir = './typings/tmp';
  const blocklySrcs = [
    "core/",
    "core/theme",
    "core/utils",
    "msg/"
  ];
  // Clean directory if exists
  if (fs.existsSync(tmpDir)) {
    rimraf.sync(tmpDir);
  }
  fs.mkdirSync(tmpDir);

  // Find all files that will be included in the typings file
  let files = [];
  blocklySrcs.forEach((src) => {
    files = files.concat(fs.readdirSync(src)
      .filter(fn => fn.endsWith('.js'))
      .map(fn => path.join(src, fn)));
  });

  // Generate typings file for each file
  files.forEach((file) => {
    const typescriptFileName = `${path.join(tmpDir, file)}.d.ts`;
    const cmd = `node ./node_modules/typescript-closure-tools/definition-generator/src/main.js ${file} ${typescriptFileName}`;
    console.log(`Generating typings for ${file}`);
    execSync(cmd, { stdio: 'inherit' });
  });

  const srcs = [
    'typings/parts/blockly-header.d.ts',
    'typings/parts/blockly-interfaces.d.ts',
    'typings/parts/goog-closure.d.ts',
    `${tmpDir}/core/**`,
    `${tmpDir}/core/utils/**`,
    `${tmpDir}/core/theme/**`,
    `${tmpDir}/msg/**`
  ];
  return gulp.src(srcs)
    .pipe(gulp.concat('blockly.d.ts'))
    .pipe(gulp.dest('typings'))
    .on('end', function () {
      // Clean up tmp directory
      if (fs.existsSync(tmpDir)) {
        rimraf.sync(tmpDir);
      }
    });
});

////////////////////////////////////////////////////////////
//                  NPM packaging tasks                   //
////////////////////////////////////////////////////////////

// The destination path where all the NPM distribution files will go.
const packageDistribution = './dist';

/**
 * A helper method for wrapping a file into a Universal Module Definition.
 * @param {string} namespace The export namespace.
 * @param {Array<Object>} dependencies An array of dependencies to inject.
 */
function packageUMD(namespace, dependencies) {
  return gulp.umd({
    dependencies: function () { return dependencies; },
    namespace: function () { return namespace; },
    exports: function () { return namespace; },
    template: path.join(__dirname, 'package/templates/umd.template')
  });
};

/**
 * A helper method for wrapping a file into a CommonJS module for Node.js.
 * @param {string} namespace The export namespace.
 * @param {Array<Object>} dependencies An array of dependencies to inject.
 */
function packageCommonJS(namespace, dependencies) {
  return gulp.umd({
    dependencies: function () { return dependencies; },
    namespace: function () { return namespace; },
    exports: function () { return namespace; },
    template: path.join(__dirname, 'package/templates/node.template')
  });
};

/**
 * This task wraps blockly_compressed.js into a UMD module.
 * @example import 'blockly/blockly';
 */
gulp.task('package-blockly', function() {
  return gulp.src('blockly_compressed.js')
    .pipe(gulp.insert.prepend(`
    var self = this;`))
    .pipe(packageUMD('Blockly', []))
    .pipe(gulp.rename('blockly.js'))
    .pipe(gulp.dest(packageDistribution));
});

/**
 * This task wraps blocks_compressed.js into a CommonJS module for Node.js.
 * This is an equivelant task to package-blockly but for Node.js.
 * @example import 'blockly/blockly-node';
 */
gulp.task('package-blockly-node', function() {
  // Override textToDomDocument, providing a Node.js alternative to DOMParser.
  return gulp.src('blockly_compressed.js')
    .pipe(gulp.insert.wrap(`
    var self = global;`,
      `if (typeof DOMParser !== 'function') {
        var JSDOM = require('jsdom').JSDOM;
        var window = (new JSDOM()).window;
        var document = window.document;
        var Element = window.Element;
        Blockly.utils.xml.textToDomDocument = function(text) {
          var jsdom = new JSDOM(text, { contentType: 'text/xml' });
          return jsdom.window.document;
        };
      }`))
    .pipe(packageCommonJS('Blockly', []))
    .pipe(gulp.rename('blockly-node.js'))
    .pipe(gulp.dest(packageDistribution));
})

/**
 * This task wraps blocks_compressed.js into a UMD module.
 * @example import 'blockly/blocks';
 */
gulp.task('package-blocks', function() {
  return gulp.src('blocks_compressed.js')
    .pipe(gulp.insert.prepend(`
    Blockly.Blocks={};`))
    .pipe(packageUMD('Blockly.Blocks', [{
        name: 'Blockly',
        amd: './core',
        cjs: './core',
      }]))
    .pipe(gulp.rename('blocks.js'))
    .pipe(gulp.dest(packageDistribution));
});

/**
 * This task wraps package/index.js into a UMD module.
 * We implicitly require the Node entry point in CommonJS environments,
 * and the Browser entry point for AMD environments.
 * @example import * as Blockly from 'blockly';
 */
gulp.task('package-index', function() {
  return gulp.src('package/index.js')
    .pipe(packageUMD('Blockly', [{
        name: 'Blockly',
        amd: './browser',
        cjs: './node',
      }]))
    .pipe(gulp.rename('index.js'))
    .pipe(gulp.dest(packageDistribution));
});

/**
 * This task wraps package/browser/index.js into a UMD module.
 * By default, the module includes Blockly core and built-in blocks,
 * as well as the JavaScript code generator and the English block
 * localization files.
 * This module is configured (in package.json) to replaces the module
 * built by package-node in browser environments.
 * @example import * as Blockly from 'blockly/browser';
 */
gulp.task('package-browser', function() {
  return gulp.src('package/browser/index.js')
    .pipe(packageUMD('Blockly', [{
        name: 'Blockly',
        amd: './core-browser',
        cjs: './core-browser',
      },{
        name: 'En',
        amd: './msg/en',
        cjs: './msg/en',
      },{
        name: 'BlocklyBlocks',
        amd: './blocks',
        cjs: './blocks',
      },{
        name: 'BlocklyJS',
        amd: './javascript',
        cjs: './javascript',
      }]))
    .pipe(gulp.rename('browser.js'))
    .pipe(gulp.dest(packageDistribution));
});

/**
 * This task wraps package/browser/core.js into a UMD module.
 * By default, the module includes the Blockly core package and a
 * helper method to set the locale.
 * This module is configured (in package.json) to replaces the module
 * built by package-node-core in browser environments.
 * @example import * as Blockly from 'blockly/core';
 */
gulp.task('package-core', function() {
  return gulp.src('package/browser/core.js')
    .pipe(packageUMD('Blockly', [{
        name: 'Blockly',
        amd: './blockly',
        cjs: './blockly',
      }]))
    .pipe(gulp.rename('core-browser.js'))
    .pipe(gulp.dest(packageDistribution));
});

/**
 * This task wraps package/node/index.js into a CommonJS module for Node.js.
 * By default, the module includes Blockly core and built-in blocks,
 * as well as all the code generators and the English block localization files.
 * This module is configured (in package.json) to be replaced by the module
 * built by package-browser in browser environments.
 * @example import * as Blockly from 'blockly/node';
 */
gulp.task('package-node', function() {
  return gulp.src('package/node/index.js')
    .pipe(packageCommonJS('Blockly', [{
        name: 'Blockly',
        cjs: './core',
      },{
        name: 'En',
        cjs: './msg/en',
      },{
        name: 'BlocklyBlocks',
        cjs: './blocks',
      },{
        name: 'BlocklyJS',
        cjs: './javascript',
      },{
        name: 'BlocklyPython',
        cjs: './python',
      },{
        name: 'BlocklyPHP',
        cjs: './php',
      },{
        name: 'BlocklyLua',
        cjs: './lua',
      }, {
        name: 'BlocklyDart',
        cjs: './dart',
      }]))
    .pipe(gulp.rename('node.js'))
    .pipe(gulp.dest(packageDistribution));
});

/**
 * This task wraps package/node/core.js into a CommonJS module for Node.js.
 * By default, the module includes the Blockly core package for Node.js
 * and a helper method to set the locale.
 * This module is configured (in package.json) to be replaced by the module
 * built by package-core in browser environments.
 * @example import * as Blockly from 'blockly/core';
 */
gulp.task('package-node-core', function() {
  return gulp.src('package/node/core.js')
    .pipe(packageCommonJS('Blockly', [{
        name: 'Blockly',
        amd: './blockly-node',
        cjs: './blockly-node',
      }]))
    .pipe(gulp.rename('core.js'))
    .pipe(gulp.dest(packageDistribution));
});

/**
 * A helper method for packaging a Blockly code generator into a UMD module.
 * @param {string} file Source file name.
 * @param {string} rename Destination file name.
 * @param {string} generator Generator export namespace. 
 */
function packageGenerator(file, rename, generator) {
  return gulp.src(file)
    .pipe(packageUMD(generator, [{
        name: 'Blockly',
        amd: './core',
        cjs: './core',
      }]))
    .pipe(gulp.rename(rename))
    .pipe(gulp.dest(packageDistribution));
};

/**
 * This task wraps javascript_compressed.js into a UMD module.
 * @example import 'blockly/javascript';
 */
gulp.task('package-javascript', function() {
  return packageGenerator('javascript_compressed.js', 'javascript.js', 'Blockly.JavaScript');
});

/**
 * This task wraps python_compressed.js into a UMD module.
 * @example import 'blockly/python';
 */
gulp.task('package-python', function() {
  return packageGenerator('python_compressed.js', 'python.js', 'Blockly.Python');
});

/**
 * This task wraps lua_compressed.js into a UMD module.
 * @example import 'blockly/lua';
 */
gulp.task('package-lua', function() {
  return packageGenerator('lua_compressed.js', 'lua.js', 'Blockly.Lua');
});

/**
 * This task wraps dart_compressed.js into a UMD module.
 * @example import 'blockly/dart';
 */
gulp.task('package-dart', function() {
  return packageGenerator('dart_compressed.js', 'dart.js', 'Blockly.Dart');
});

/**
 * This task wraps php_compressed.js into a UMD module.
 * @example import 'blockly/php';
 */
gulp.task('package-php', function() {
  return packageGenerator('php_compressed.js', 'php.js', 'Blockly.PHP');
});

/**
 * This task wraps each of the msg/js/* files into a UMD module.
 * @example import * as En from 'blockly/msg/en';
 */
gulp.task('package-locales', function() {
  // Remove references to goog.provide and goog.require.
  return gulp.src('msg/js/*.js')
      .pipe(gulp.replace(/goog\.[^\n]+/g, ''))
      .pipe(gulp.insert.prepend(`
      var Blockly = {};Blockly.Msg={};`))
      .pipe(packageUMD('Blockly.Msg', [{
          name: 'Blockly',
          amd: '../core',
          cjs: '../core',
        }]))
      .pipe(gulp.dest(`${packageDistribution}/msg`));
});

/**
 * This task creates a UMD bundle of Blockly which includes the Blockly
 * core files, the built-in blocks, the JavaScript code generator and the
 * English localization files.
 * @example <script src="https://unpkg.com/blockly/blockly.min.js"></script>
 */
gulp.task('package-umd-bundle', function() {
  var srcs = [
    'blockly_compressed.js',
    'msg/js/en.js',
    'blocks_compressed.js',
    'javascript_compressed.js'
  ];
  return gulp.src(srcs)
    .pipe(gulp.concat('blockly.min.js'))
    .pipe(packageUMD('Blockly', []))
    .pipe(gulp.dest(`${packageDistribution}`))
});

/**
 * This task copies all the media/* files into the distribution directory.
 */
gulp.task('package-media', function() {
  return gulp.src('./media/*')
    .pipe(gulp.dest(`${packageDistribution}/media`));
});

/**
 * This task copies the package.json file into the distribution directory.
 */
gulp.task('package-json', function() {
  return gulp.src('./package.json')
    .pipe(gulp.dest(`${packageDistribution}`))
});

/**
 * This task copies the package/README.md file into the distribution directory.
 * This file is what developers will see at https://www.npmjs.com/package/blockly.
 */
gulp.task('package-readme', function() {
  return gulp.src('./package/README.md')
    .pipe(gulp.dest(`${packageDistribution}`))
});

/**
 * This task copies the typings/blockly.d.ts TypeScript definition file into the
 * distribution directory.
 * The bundled declaration file is referenced in package.json in the types property.
 */
gulp.task('package-dts', function() {
  return gulp.src('./typings/blockly.d.ts')
    .pipe(gulp.dest(`${packageDistribution}`))
});

/**
 * This task prepares the NPM distribution files under the /dist directory.
 */
gulp.task('package', gulp.parallel(
  'package-index',
  'package-browser',
  'package-node',
  'package-core',
  'package-node-core',
  'package-blockly',
  'package-blockly-node',
  'package-blocks',
  'package-javascript',
  'package-python',
  'package-lua',
  'package-dart',
  'package-php',
  'package-locales',
  'package-media',
  'package-umd-bundle',
  'package-json',
  'package-readme',
  'package-dts'
  ));

// The release task prepares Blockly for an npm release.
// It rebuilds the Blockly compressed files and updates the TypeScript
// typings, and then packages all the npm release files into the /dist directory
gulp.task('release', gulp.series(['build', /*'typings',*/ function() {
  // Clean directory if exists
  if (fs.existsSync(packageDistribution)) {
    rimraf.sync(packageDistribution);
  }
  fs.mkdirSync(packageDistribution);
}, 'package']));

// The default task concatenates files for Node.js, using English language
// blocks and the JavaScript generator.
gulp.task('default', gulp.series(['build', 'blockly_node_javascript_en']));
