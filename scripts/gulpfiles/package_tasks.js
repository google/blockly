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
var rimraf = require('rimraf');
var {getPackageJson} = require('./helper_tasks');
var {BUILD_DIR, RELEASE_DIR, TYPINGS_BUILD_DIR} = require('./config');

// Path to template files for gulp-umd.
const TEMPLATE_DIR = 'scripts/package/templates';

/**
 * A helper method for wrapping a file into a Universal Module Definition.
 * @param {string} namespace The export namespace.
 * @param {Array<Object>} dependencies An array of dependencies to inject.
 */
function packageUMD(namespace, dependencies, template = 'umd.template') {
  return gulp.umd({
    dependencies: function () { return dependencies; },
    namespace: function () { return namespace; },
    exports: function () { return namespace; },
    template: path.join(TEMPLATE_DIR, template)
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
    template: path.join(TEMPLATE_DIR, 'node.template')
  });
};

// Sanity check that the BUILD_DIR directory exists, and that certain
// files are in it.
function checkBuildDir(done) {
  // Check that directory exists.
  if (!fs.existsSync(BUILD_DIR)) {
    done(new Error(`The ${BUILD_DIR} directory does not exist.  ` +
        'Has packageTasks.build been run?'));
    return;
  }
  // Check files built by buildTasks.build exist in BUILD_DIR.
  for (const fileName of [
    'blockly_compressed.js',  // buildTasks.buildCompressed
    'blocks_compressed.js',  // buildTasks.buildBlocks
    'javascript_compressed.js',  // buildTasks.buildGenerators
    'msg/js/en.js',  // buildTaks.buildLangfiles
  ]) {
    if (!fs.existsSync(`${BUILD_DIR}/${fileName}`)) {
      done(new Error(
          `Your ${BUILD_DIR} directory does not contain ${fileName}.  ` +
          'Has packageTasks.build been run?  Try "npm run build".'));
      return;
    }
  }
  done();
}

/**
 * This task copies source files into the release directory.
 */
function packageSources() {
  return gulp.src(['core/**/**.js', 'blocks/**.js', 'generators/**/**.js'],
      {base: '.'})
    .pipe(gulp.dest(RELEASE_DIR));
};

/**
 * This task copies the compressed files and their source maps into
 * the release directory.
 */
function packageCompressed() {
  return gulp.src('*_compressed.js?(.map)', {cwd: BUILD_DIR})
    .pipe(gulp.dest(RELEASE_DIR));
};

/**
 * This task wraps scripts/package/blockly.js into a UMD module.
 * @example import 'blockly/blockly';
 */
function packageBlockly() {
  return gulp.src('scripts/package/blockly.js')
    .pipe(packageUMD('Blockly', [{
        name: 'Blockly',
        amd: './blockly_compressed',
        cjs: './blockly_compressed',
      }]))
    .pipe(gulp.rename('blockly.js'))
    .pipe(gulp.dest(RELEASE_DIR));
};

/**
 * This task wraps scripts/package/blocks.js into a UMD module.
 * @example import 'blockly/blocks';
 */
function packageBlocks() {
  return gulp.src('scripts/package/blocks.js')
    .pipe(packageUMD('BlocklyBlocks', [{
        name: 'BlocklyBlocks',
        amd: './blocks_compressed',
        cjs: './blocks_compressed',
      }]))
    .pipe(gulp.rename('blocks.js'))
    .pipe(gulp.dest(RELEASE_DIR));
};

/**
 * This task wraps scripts/package/index.js into a UMD module.
 * We implicitly require the Node entry point in CommonJS environments,
 * and the Browser entry point for AMD environments.
 * @example import * as Blockly from 'blockly';
 */
function packageIndex() {
  return gulp.src('scripts/package/index.js')
    .pipe(packageUMD('Blockly', [{
        name: 'Blockly',
        amd: './browser',
        cjs: './node',
      }]))
    .pipe(gulp.rename('index.js'))
    .pipe(gulp.dest(RELEASE_DIR));
};

/**
 * This task wraps scripts/package/browser/index.js into a UMD module.
 * By default, the module includes Blockly core and built-in blocks,
 * as well as the JavaScript code generator and the English block
 * localization files.
 * This module is configured (in package.json) to replaces the module
 * built by package-node in browser environments.
 * @example import * as Blockly from 'blockly/browser';
 */
function packageBrowser() {
  return gulp.src('scripts/package/browser/index.js')
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
    .pipe(gulp.dest(RELEASE_DIR));
};

/**
 * This task wraps scripts/package/browser/core.js into a UMD module.
 * By default, the module includes the Blockly core package and a
 * helper method to set the locale.
 * This module is configured (in package.json) to replaces the module
 * built by package-node-core in browser environments.
 * @example import * as Blockly from 'blockly/core';
 */
function packageCore() {
  return gulp.src('scripts/package/browser/core.js')
    .pipe(packageUMD('Blockly', [{
        name: 'Blockly',
        amd: './blockly',
        cjs: './blockly',
      }]))
    .pipe(gulp.rename('core-browser.js'))
    .pipe(gulp.dest(RELEASE_DIR));
};

/**
 * This task wraps scripts/package/node/index.js into a CommonJS module for Node.js.
 * By default, the module includes Blockly core and built-in blocks,
 * as well as all the code generators and the English block localization files.
 * This module is configured (in package.json) to be replaced by the module
 * built by package-browser in browser environments.
 * @example import * as Blockly from 'blockly/node';
 */
function packageNode() {
  return gulp.src('scripts/package/node/index.js')
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
    .pipe(gulp.dest(RELEASE_DIR));
};

/**
 * This task wraps scripts/package/node/core.js into a CommonJS module for Node.js.
 * By default, the module includes the Blockly core package for Node.js
 * and a helper method to set the locale.
 * This module is configured (in package.json) to be replaced by the module
 * built by package-core in browser environments.
 * @example import * as Blockly from 'blockly/core';
 */
function packageNodeCore() {
  return gulp.src('scripts/package/node/core.js')
    .pipe(packageCommonJS('Blockly', [{
        name: 'Blockly',
        amd: './blockly',
        cjs: './blockly',
      }]))
    .pipe(gulp.rename('core.js'))
    .pipe(gulp.dest(RELEASE_DIR));
};

/**
 * A helper method for wrapping a generator file into a UMD module.
 * @param {string} file Source file name.
 * @param {string} rename Destination file name.
 * @param {string} namespace Export namespace.
 */
function packageGenerator(file, rename, namespace) {
  return gulp.src(`scripts/package/${rename}`)
    .pipe(packageUMD(`Blockly${namespace}`, [{
        name: 'Blockly',
        amd: './core',
        cjs: './core',
      }, {
        name: `Blockly${namespace}`,
        amd: `./${file}`,
        cjs: `./${file}`,
      }]))
    .pipe(gulp.rename(rename))
    .pipe(gulp.dest(RELEASE_DIR));
};

/**
 * This task wraps javascript_compressed.js into a UMD module.
 * @example import 'blockly/javascript';
 */
function packageJavascript() {
  return packageGenerator('javascript_compressed.js', 'javascript.js', 'JavaScript');
};

/**
 * This task wraps python_compressed.js into a UMD module.
 * @example import 'blockly/python';
 */
function packagePython() {
  return packageGenerator('python_compressed.js', 'python.js', 'Python');
};

/**
 * This task wraps lua_compressed.js into a UMD module.
 * @example import 'blockly/lua';
 */
function packageLua() {
  return packageGenerator('lua_compressed.js', 'lua.js', 'Lua');
};

/**
 * This task wraps dart_compressed.js into a UMD module.
 * @example import 'blockly/dart';
 */
function packageDart() {
  return packageGenerator('dart_compressed.js', 'dart.js', 'Dart');
};

/**
 * This task wraps php_compressed.js into a UMD module.
 * @example import 'blockly/php';
 */
function packagePHP() {
  return packageGenerator('php_compressed.js', 'php.js', 'PHP');
};

/**
 * This task wraps each of the ${BUILD_DIR}/msg/js/* files into a UMD module.
 * @example import * as En from 'blockly/msg/en';
 */
function packageLocales() {
  // Remove references to goog.provide and goog.require.
  return gulp.src(`${BUILD_DIR}/msg/js/*.js`)
      .pipe(gulp.replace(/goog\.[^\n]+/g, ''))
      .pipe(packageUMD('Blockly.Msg', [], 'umd-msg.template'))
      .pipe(gulp.dest(`${RELEASE_DIR}/msg`));
};

/**
 * This task creates a UMD bundle of Blockly which includes the Blockly
 * core files, the built-in blocks, the JavaScript code generator and the
 * English localization files.
 * @example <script src="https://unpkg.com/blockly/blockly.min.js"></script>
 */
function packageUMDBundle() {
  var srcs = [
    `${BUILD_DIR}/blockly_compressed.js`,
    `${BUILD_DIR}/msg/js/en.js`,
    `${BUILD_DIR}/blocks_compressed.js`,
    `${BUILD_DIR}/javascript_compressed.js`,
  ];
  return gulp.src(srcs)
      .pipe(gulp.concat('blockly.min.js'))
      .pipe(gulp.dest(`${RELEASE_DIR}`));
};

/**
 * This task copies all the media/* files into the release directory.
 */
function packageMedia() {
  return gulp.src('media/*')
    .pipe(gulp.dest(`${RELEASE_DIR}/media`));
};

/**
 * This task copies the package.json file into the release directory.
 */
function packageJSON(cb) {
  const packageJson = getPackageJson();
  const json = Object.assign({}, packageJson);
  delete json['scripts'];
  if (!fs.existsSync(RELEASE_DIR)) {
    fs.mkdirSync(RELEASE_DIR, {recursive: true});
  }
  fs.writeFileSync(`${RELEASE_DIR}/package.json`,
      JSON.stringify(json, null, 2));
  cb();
};

/**
 * This task copies the scripts/package/README.md file into the
 * release directory.  This file is what developers will see at
 * https://www.npmjs.com/package/blockly .
 */
function packageReadme() {
  return gulp.src('scripts/package/README.md')
    .pipe(gulp.dest(RELEASE_DIR));
};

/**
 * This task copies the typings/blockly.d.ts TypeScript definition
 * file into the release directory.  The bundled declaration file is
 * referenced in package.json in the types property.
 * As of Q4 2021 this simply copies the existing ts definition files, since
 * generation through typescript-closure-tools does not work with goog.module.
 * TODO(5621): Regenerate definition files and copy them into the release dir as
 * needed.
 */
function packageDTS() {
  const handwrittenSrcs = [
    'typings/*.d.ts',
    'typings/msg/msg.d.ts',
  ];
  return gulp.src(handwrittenSrcs, {base: 'typings'})
      .pipe(gulp.dest(RELEASE_DIR));
};

/**
 * This task cleans the release directory (by deleting it).
 */
function cleanReleaseDir(done) {
  // Sanity check.
  if (RELEASE_DIR === '.' || RELEASE_DIR === '/') {
    throw new Error(`Refusing to rm -rf ${RELEASE_DIR}`);
  }
  rimraf(RELEASE_DIR, done);
}

/**
 * This task prepares the files to be included in the NPM by copying
 * them into the release directory.
 */
const package = gulp.series(
    checkBuildDir,
    cleanReleaseDir,
    gulp.parallel(
        packageIndex,
        packageSources,
        packageCompressed,
        packageBrowser,
        packageNode,
        packageCore,
        packageNodeCore,
        packageBlockly,
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
        packageDTS)
    );

module.exports = {
  cleanReleaseDir: cleanReleaseDir,
  package: package,
};
