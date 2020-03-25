/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Gulp tasks to package Blockly for distribution on NPM.
 */

var gulp = require('gulp');
gulp.concat = require('gulp-concat');
gulp.replace = require('gulp-replace');
gulp.rename = require('gulp-rename');
gulp.insert = require('gulp-insert');
gulp.umd = require('gulp-umd');

var path = require('path');
var fs = require('fs');

var packageJson = require('../../package.json');
var argv = require('yargs').argv;

const upstream_url = "https://github.com/google/blockly.git";

const blocklyRoot = '../../';

// The destination path where all the NPM distribution files will go.
const packageDistribution = 'dist';


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
    template: path.join(__dirname, `${blocklyRoot}/package/templates/umd.template`)
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
    template: path.join(__dirname, `${blocklyRoot}/package/templates/node.template`)
  });
};

/**
 * This task wraps blockly_compressed.js into a UMD module.
 * @example import 'blockly/blockly';
 */
function packageBlockly() {
  return gulp.src('blockly_compressed.js')
    .pipe(packageUMD('Blockly', []))
    .pipe(gulp.rename('blockly.js'))
    .pipe(gulp.dest(packageDistribution));
};

/**
 * This task wraps blocks_compressed.js into a CommonJS module for Node.js.
 * This is an equivalent task to package-blockly but for Node.js.
 * @example import 'blockly/blockly-node';
 */
function packageBlocklyNode() {
  // Override textToDomDocument, providing a Node.js alternative to DOMParser.
  return gulp.src('blockly_compressed.js')
    .pipe(gulp.insert.append(`
      if (typeof DOMParser !== 'function') {
        var DOMParser = require("jsdom/lib/jsdom/living").DOMParser;
        var XMLSerializer = require("jsdom/lib/jsdom/living").XMLSerializer;
        var doc = Blockly.utils.xml.textToDomDocument(
          '<xml xmlns="https://developers.google.com/blockly/xml"></xml>');
        Blockly.utils.xml.document = function() {
          return doc;
        };
      }`))
    .pipe(packageCommonJS('Blockly', []))
    .pipe(gulp.rename('blockly-node.js'))
    .pipe(gulp.dest(packageDistribution));
};

/**
 * This task wraps blocks_compressed.js into a UMD module.
 * @example import 'blockly/blocks';
 */
function packageBlocks() {
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
};

/**
 * This task wraps package/index.js into a UMD module.
 * We implicitly require the Node entry point in CommonJS environments,
 * and the Browser entry point for AMD environments.
 * @example import * as Blockly from 'blockly';
 */
function packageIndex() {
  return gulp.src('package/index.js')
    .pipe(packageUMD('Blockly', [{
        name: 'Blockly',
        amd: './browser',
        cjs: './node',
      }]))
    .pipe(gulp.rename('index.js'))
    .pipe(gulp.dest(packageDistribution));
};

/**
 * This task wraps package/browser/index.js into a UMD module.
 * By default, the module includes Blockly core and built-in blocks,
 * as well as the JavaScript code generator and the English block
 * localization files.
 * This module is configured (in package.json) to replaces the module
 * built by package-node in browser environments.
 * @example import * as Blockly from 'blockly/browser';
 */
function packageBrowser() {
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
};

/**
 * This task wraps package/browser/core.js into a UMD module.
 * By default, the module includes the Blockly core package and a
 * helper method to set the locale.
 * This module is configured (in package.json) to replaces the module
 * built by package-node-core in browser environments.
 * @example import * as Blockly from 'blockly/core';
 */
function packageCore() {
  return gulp.src('package/browser/core.js')
    .pipe(packageUMD('Blockly', [{
        name: 'Blockly',
        amd: './blockly',
        cjs: './blockly',
      }]))
    .pipe(gulp.rename('core-browser.js'))
    .pipe(gulp.dest(packageDistribution));
};

/**
 * This task wraps package/node/index.js into a CommonJS module for Node.js.
 * By default, the module includes Blockly core and built-in blocks,
 * as well as all the code generators and the English block localization files.
 * This module is configured (in package.json) to be replaced by the module
 * built by package-browser in browser environments.
 * @example import * as Blockly from 'blockly/node';
 */
function packageNode() {
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
};

/**
 * This task wraps package/node/core.js into a CommonJS module for Node.js.
 * By default, the module includes the Blockly core package for Node.js
 * and a helper method to set the locale.
 * This module is configured (in package.json) to be replaced by the module
 * built by package-core in browser environments.
 * @example import * as Blockly from 'blockly/core';
 */
function packageNodeCore() {
  return gulp.src('package/node/core.js')
    .pipe(packageCommonJS('Blockly', [{
        name: 'Blockly',
        amd: './blockly-node',
        cjs: './blockly-node',
      }]))
    .pipe(gulp.rename('core.js'))
    .pipe(gulp.dest(packageDistribution));
};

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
function packageJavascript() {
  return packageGenerator('javascript_compressed.js', 'javascript.js', 'Blockly.JavaScript');
};

/**
 * This task wraps python_compressed.js into a UMD module.
 * @example import 'blockly/python';
 */
function packagePython() {
  return packageGenerator('python_compressed.js', 'python.js', 'Blockly.Python');
};

/**
 * This task wraps lua_compressed.js into a UMD module.
 * @example import 'blockly/lua';
 */
function packageLua() {
  return packageGenerator('lua_compressed.js', 'lua.js', 'Blockly.Lua');
};

/**
 * This task wraps dart_compressed.js into a UMD module.
 * @example import 'blockly/dart';
 */
function packageDart() {
  return packageGenerator('dart_compressed.js', 'dart.js', 'Blockly.Dart');
};

/**
 * This task wraps php_compressed.js into a UMD module.
 * @example import 'blockly/php';
 */
function packagePHP() {
  return packageGenerator('php_compressed.js', 'php.js', 'Blockly.PHP');
};

/**
 * This task wraps each of the msg/js/* files into a UMD module.
 * @example import * as En from 'blockly/msg/en';
 */
function packageLocales() {
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
};

/**
 * This task creates a UMD bundle of Blockly which includes the Blockly
 * core files, the built-in blocks, the JavaScript code generator and the
 * English localization files.
 * @example <script src="https://unpkg.com/blockly/blockly.min.js"></script>
 */
function packageUMDBundle() {
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
};

/**
 * This task copies all the media/* files into the distribution directory.
 */
function packageMedia() {
  return gulp.src('./media/*')
    .pipe(gulp.dest(`${packageDistribution}/media`));
};

/**
 * This task copies the package.json file into the distribution directory.
 */
function packageJSON(cb) {
  const json = Object.assign({}, packageJson);
  delete json['scripts'];
  if (!fs.existsSync(packageDistribution)) {
    fs.mkdirSync(packageDistribution);
  }
  fs.writeFileSync(`${packageDistribution}/package.json`,
      JSON.stringify(json, null, 2));
  cb();
};

/**
 * This task copies the package/README.md file into the distribution directory.
 * This file is what developers will see at https://www.npmjs.com/package/blockly.
 */
function packageReadme() {
  return gulp.src('./package/README.md')
    .pipe(gulp.dest(`${packageDistribution}`));
};

/**
 * This task copies the typings/blockly.d.ts TypeScript definition file into the
 * distribution directory.
 * The bundled declaration file is referenced in package.json in the types property.
 */
function packageDTS() {
  return gulp.src('./typings/blockly.d.ts')
    .pipe(gulp.dest(`${packageDistribution}`));
};

/**
 * This task prepares the NPM distribution files under the /dist directory.
 */
const package = gulp.parallel(
  packageIndex,
  packageBrowser,
  packageNode,
  packageCore,
  packageNodeCore,
  packageBlockly,
  packageBlocklyNode,
  packageBlocks,
  packageJavascript,
  packagePython,
  packageLua,
  packageDart,
  packagePHP,
  packageLocales,
  packageMedia,
  packageUMDBundle,
  packageJSON,
  packageReadme,
  packageDTS
);

module.exports = {
  package: package
};
