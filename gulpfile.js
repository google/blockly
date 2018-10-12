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
var insert = require('gulp-insert');

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
gulp.task('blockly_javascript_en', function() {
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
      .pipe(insert.append(`
if (typeof DOMParser !== 'function') {
  var JSDOM = require('jsdom').JSDOM;
  Blockly.Xml.utils.textToDomDocument = function(text) {
    var jsdom = new JSDOM(text, { contentType: 'text/xml' });
    return jsdom.window.document;
  };
}
if (typeof module === 'object') { module.exports = Blockly; }
if (typeof window === 'object') { window.Blockly = Blockly; }\n`))
      .pipe(gulp.dest(''));
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
      debounceDelay: 2000   // Milliseconds to delay rebuild.
    };
    gulp.watch(srcs, options, tasks);
  };
}

// Watch Blockly files for changes and trigger automatic rebuilds, including
// the Node-ready blockly_node_javascript_en.js file.
gulp.task('watch', buildWatchTaskFn('blockly_javascript_en'));

// The default task concatenates files for Node.js, using English language
// blocks and the JavaScript generator.
gulp.task('default', ['build', 'blockly_javascript_en']);
