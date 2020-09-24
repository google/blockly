/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Gulp script to build Blockly for Node & NPM.
 */

var gulp = require('gulp');
gulp.replace = require('gulp-replace');
gulp.rename = require('gulp-rename');
gulp.sourcemaps = require('gulp-sourcemaps');

var path = require('path');
var fs = require('fs');
var execSync = require('child_process').execSync;
var through2 = require('through2');

var closureCompiler = require('google-closure-compiler').gulp();
var closureDeps = require('google-closure-deps');
var packageJson = require('../../package.json');
var argv = require('yargs').argv;


////////////////////////////////////////////////////////////
//                        Build                           //
////////////////////////////////////////////////////////////

const licenseRegex = `\\/\\*\\*
 \\* @license
 \\* (Copyright \\d+ (Google LLC|Massachusetts Institute of Technology))
( \\* All rights reserved.
)? \\* SPDX-License-Identifier: Apache-2.0
 \\*\\/`;

/**
 * Helper method for stripping the Google's and MIT's Apache Licenses.
 */
function stripApacheLicense() {
  // Strip out Google's and MIT's Apache licences.
  // Closure Compiler preserves dozens of Apache licences in the Blockly code.
  // Remove these if they belong to Google or MIT.
  // MIT's permission to do this is logged in Blockly issue #2412.
  return gulp.replace(new RegExp(licenseRegex, "g"), '\n\n\n\n');
  // Replace with the same number of lines so that source-maps are not affected.
}

/**
 * Closure compiler warning groups used to treat warnings as errors.
 * For a full list of closure compiler groups, consult:
 * https://github.com/google/closure-compiler/blob/master/src/com/google/javascript/jscomp/DiagnosticGroups.java#L113
 */
var JSCOMP_ERROR = [
  'accessControls',
  'checkPrototypalTypes',
  'checkRegExp',
  'checkTypes',
  'checkVars',
  'conformanceViolations',
  'const',
  'constantProperty',
  'deprecated',
  'deprecatedAnnotations',
  'duplicateMessage',
  'es5Strict',
  'externsValidation',
  'functionParams',
  'globalThis',
  'invalidCasts',
  'misplacedTypeAnnotation',
  'missingGetCssName',
  // 'missingOverride',
  'missingPolyfill',
  'missingProperties',
  'missingProvide',
  'missingRequire',
  'missingReturn',
  // 'missingSourcesWarnings',
  'moduleLoad',
  'msgDescriptions',
  'nonStandardJsDocs',
  // 'polymer',
  // 'reportUnknownTypes',
  // 'strictCheckTypes',
  // 'strictMissingProperties',
  'strictModuleDepCheck',
  // 'strictPrimitiveOperators',
  'suspiciousCode',
  'typeInvalidation',
  'undefinedNames',
  'undefinedVars',
  'underscore',
  'unknownDefines',
  'unusedLocalVariables',
  'unusedPrivateMembers',
  'uselessCode',
  'untranspilableFeatures',
  'visibility'
];

/**
 * Helper method for calling the Closure compiler.
 * @param {*} compilerOptions
 * @param {boolean=} opt_verbose Optional option for verbose logging
 * @param {boolean=} opt_warnings_as_error Optional option for treating warnings
 *     as errors.
 * @param {boolean=} opt_strict_typechecker Optional option for enabling strict
 *     type checking.
 */
function compile(compilerOptions, opt_verbose, opt_warnings_as_error,
    opt_strict_typechecker) {
  const options = {};
  options.compilation_level = 'SIMPLE_OPTIMIZATIONS';
  options.warning_level = opt_verbose ? 'VERBOSE' : 'DEFAULT';
  options.language_in = 'ECMASCRIPT5_STRICT';
  options.language_out = 'ECMASCRIPT5_STRICT';
  options.rewrite_polyfills = false;
  options.hide_warnings_for = 'node_modules';
  if (opt_warnings_as_error || opt_strict_typechecker) {
    options.jscomp_error = JSCOMP_ERROR;
    if (opt_strict_typechecker) {
      options.jscomp_error.push('strictCheckTypes');
    }
  }

  const platform = ['native', 'java', 'javascript'];

  return closureCompiler({...options, ...compilerOptions}, { platform });
}

/**
 * Helper method for possibly adding the Closure library into a sources array.
 * @param {Array.<string>} srcs
 */
function maybeAddClosureLibrary(srcs) {
  if (argv.closureLibrary) {
    // If you require Google's Closure library, you can include it in your
    // build by adding the --closure-library flag.
    // You will also need to include the "google-closure-library" in your list
    // of devDependencies.
    console.log('Including the google-closure-library in your build.');
    if (!fs.existsSync('./node_modules/google-closure-library')) {
      throw Error('You must add the google-closure-library to your ' +
        'devDependencies in package.json, and run `npm install`.');
    }
    srcs.push('./node_modules/google-closure-library/closure/goog/**/**/*.js');
  }
  return srcs;
}

/**
 * A helper method to return an closure compiler output wrapper that wraps the
 * body in a Universal Module Definition.
 * @param {string} namespace The export namespace.
 * @param {Array.<Object>} dependencies An array of dependencies to inject.
 */
function outputWrapperUMD(namespace, dependencies) {
  const amdDeps = dependencies.map(d => '\'' + d.amd + '\'' ).join(', ');
  const cjsDeps = dependencies.map(d => `require('${d.cjs}')`).join(', ');
  const browserDeps = dependencies.map(d => 'root.' + d.name).join(', ');
  const imports = dependencies.map(d => d.name).join(', ');
  return `// Do not edit this file; automatically generated by gulp.

/* eslint-disable */
;(function(root, factory) {
  if (typeof define === 'function' && define.amd) { // AMD
    define([${amdDeps}], factory);
  } else if (typeof exports === 'object') { // Node.js
    module.exports = factory(${cjsDeps});
  } else { // Browser
    root.${namespace} = factory(${browserDeps});
  }
}(this, function(${imports}) {
  %output%
return ${namespace};
}));
`;
};

/**
 * This task builds Blockly's core files.
 *     blockly_compressed.js
 */
function buildCompressed() {
  const defines = 'Blockly.VERSION="' + packageJson.version + '"';
  return gulp.src(maybeAddClosureLibrary(['core/**/**/*.js']), {base: './'})
    .pipe(stripApacheLicense())
    .pipe(gulp.sourcemaps.init())
    // Directories in Blockly are used to group similar files together
    // but are not used to limit access with @package, instead the
    // method means something is internal to Blockly and not a public
    // API.
    // Flatten all files so they're in the same directory, but ensure that
    // files with the same name don't conflict.
    .pipe(gulp.rename(function (p) {
      var dirname = p.dirname.replace(
        new RegExp(path.sep.replace(/\\/, '\\\\'), "g"), "-");
      p.dirname = "";
      p.basename = dirname + "-" + p.basename;
    }))
    .pipe(compile({
      dependency_mode: 'PRUNE',
      entry_point: './core-requires.js',
      js_output_file: 'blockly_compressed.js',
      externs: ['./externs/svg-externs.js', './externs/goog-externs.js'],
      define: defines,
      language_in:
        argv.closureLibrary ? 'ECMASCRIPT_2015' : 'ECMASCRIPT5_STRICT',
      output_wrapper: outputWrapperUMD('Blockly', [])
    }, argv.verbose, argv.debug, argv.strict))
    .pipe(gulp.sourcemaps.mapSources(function (sourcePath, file) {
      return sourcePath.replace(/-/g, '/');
    }))
    .pipe(gulp.sourcemaps.write('.', {
      includeContent: false,
      sourceRoot: './'
    }))
    .pipe(gulp.dest('./'));
};

/**
 * This task builds the Blockly's built in blocks.
 *     blocks_compressed.js
 */
function buildBlocks() {
  return gulp.src(['blocks/*.js'], {base: './'})
    .pipe(stripApacheLicense())
    .pipe(gulp.sourcemaps.init())
    .pipe(compile({
      dependency_mode: 'NONE',
      externs: ['./externs/goog-externs.js', './externs/block-externs.js'],
      js_output_file: 'blocks_compressed.js',
      output_wrapper: outputWrapperUMD('Blockly.Blocks', [{
        name: 'Blockly',
        amd: './blockly_compressed.js',
        cjs: './blockly_compressed.js'
      }])
    }, argv.verbose, argv.debug, argv.strict))
    .pipe(gulp.sourcemaps.write('.', {
      includeContent: false,
      sourceRoot: './'
    }))
    .pipe(gulp.dest('./'));
};

/**
 * A helper method for building a Blockly code generator.
 * @param {string} language Generator language.
 * @param {string} namespace Language namespace.
 */
function buildGenerator(language, namespace) {
  return gulp.src([`generators/${language}.js`, `generators/${language}/*.js`], {base: './'})
    .pipe(stripApacheLicense())
    .pipe(gulp.sourcemaps.init())
    .pipe(compile({
      dependency_mode: 'NONE',
      externs: ['./externs/goog-externs.js', './externs/generator-externs.js'],
      js_output_file: `${language}_compressed.js`,
      output_wrapper: outputWrapperUMD(`Blockly.${namespace}`, [{
        name: 'Blockly',
        amd: './blockly_compressed.js',
        cjs: './blockly_compressed.js'
      }])
    }, argv.verbose, argv.debug, argv.strict))
    .pipe(gulp.sourcemaps.write('.', {
      includeContent: false,
      sourceRoot: './'
    }))
    .pipe(gulp.dest('./'));
};

/**
 * This task builds the javascript generator.
 *     javascript_compressed.js
 */
function buildJavascript() {
  return buildGenerator('javascript', 'JavaScript');
};

/**
 * This task builds the python generator.
 *     python_compressed.js
 */
function buildPython() {
  return buildGenerator('python', 'Python');
};

/**
 * This task builds the php generator.
 *     php_compressed.js
 */
function buildPHP() {
  return buildGenerator('php', 'PHP');
};

/**
 * This task builds the lua generator.
 *     lua_compressed.js
 */
function buildLua() {
  return buildGenerator('lua', 'Lua');
};

/**
 * This task builds the dart generator:
 *     dart_compressed.js
 */
function buildDart() {
  return buildGenerator('dart', 'Dart');
};

/**
 * This tasks builds all the generators:
 *     javascript_compressed.js
 *     python_compressed.js
 *     php_compressed.js
 *     lua_compressed.js
 *     dart_compressed.js
 */
const buildGenerators = gulp.parallel(
  buildJavascript,
  buildPython,
  buildPHP,
  buildLua,
  buildDart
);

/**
 * This task builds Blockly's uncompressed file.
 *     blockly_uncompressed.js
 */
function buildUncompressed() {
  const closurePath = argv.closureLibrary ?
    'node_modules/google-closure-library/closure/goog' :
    'closure/goog';
  const header = `// Do not edit this file; automatically generated by gulp.
'use strict';

this.IS_NODE_JS = !!(typeof module !== 'undefined' && module.exports);

this.BLOCKLY_DIR = (function(root) {
  if (!root.IS_NODE_JS) {
    // Find name of current directory.
    var scripts = document.getElementsByTagName('script');
    var re = new RegExp('(.+)[\\\/]blockly_(.*)uncompressed\\\.js$');
    for (var i = 0, script; script = scripts[i]; i++) {
      var match = re.exec(script.src);
      if (match) {
        return match[1];
      }
    }
    alert('Could not detect Blockly\\'s directory name.');
  }
  return '';
})(this);

this.BLOCKLY_BOOT = function(root) {
  // Execute after Closure has loaded.
`;
  const footer = `
delete root.BLOCKLY_DIR;
delete root.BLOCKLY_BOOT;
delete root.IS_NODE_JS;
};

if (this.IS_NODE_JS) {
  this.BLOCKLY_BOOT(this);
  module.exports = Blockly;
} else {
  document.write('<script src="' + this.BLOCKLY_DIR +
      '/${closurePath}/base.js"></script>');
  document.write('<script>this.BLOCKLY_BOOT(this);</script>');
}
`;

let deps = [];
return gulp.src(maybeAddClosureLibrary(['core/**/**/*.js']))
  .pipe(through2.obj((file, _enc, cb) => {
    const result = closureDeps.parser.parseFile(file.path);
    for (const dep of result.dependencies) {
      deps.push(dep);
    }
    cb(null);
  }))
  .on('end', () => {
    // Update the path to closure for any files that we don't know the full path
    // of (parsed from a goog.addDependency call).
    for (const dep of deps) {
      dep.setClosurePath(closurePath);
    }

    const addDependency = closureDeps.depFile.getDepFileText(closurePath, deps);

    const requires = `goog.addDependency("base.js", [], []);

// Load Blockly.
goog.require('Blockly.requires')
`;
    fs.writeFileSync('blockly_uncompressed.js',
      header +
      addDependency +
      requires +
      footer);
  });
};

/**
 * This task builds Blockly's lang files.
 *     msg/*.js
 */
function buildLangfiles(done) {
  // Run js_to_json.py
  const jsToJsonCmd = `python ./scripts/i18n/js_to_json.py \
--input_file ${path.join('msg', 'messages.js')} \
--output_dir ${path.join('msg', 'json')} \
--quiet`;
  execSync(jsToJsonCmd, { stdio: 'inherit' });

  // Run create_messages.py
  let json_files = fs.readdirSync(path.join('msg', 'json'));
  json_files = json_files.filter(file => file.endsWith('json') &&
    !(new RegExp(/(keys|synonyms|qqq|constants)\.json$/).test(file)));
  json_files = json_files.map(file => path.join('msg', 'json', file));
  const createMessagesCmd = `python ./scripts/i18n/create_messages.py \
  --source_lang_file ${path.join('msg', 'json', 'en.json')} \
  --source_synonym_file ${path.join('msg', 'json', 'synonyms.json')} \
  --source_constants_file ${path.join('msg', 'json', 'constants.json')} \
  --key_file ${path.join('msg', 'json', 'keys.json')} \
  --output_dir ${path.join('msg', 'js')} \
  --quiet ${json_files.join(' ')}`;
    execSync(createMessagesCmd, { stdio: 'inherit' });

  done();
};

/**
 * This task builds Blockly core, blocks and generators together and uses
 * closure compiler's ADVANCED_COMPILATION mode.
 */
function buildAdvancedCompilationTest() {
  const srcs = [
    'tests/compile/main.js',
    'core/**/**/*.js',
    'blocks/*.js',
    'generators/**/*.js'];
  return gulp.src(maybeAddClosureLibrary(srcs), {base: './'})
    .pipe(stripApacheLicense())
    .pipe(gulp.sourcemaps.init())
    // Directories in Blockly are used to group similar files together
    // but are not used to limit access with @package, instead the
    // method means something is internal to Blockly and not a public
    // API.
    // Flatten all files so they're in the same directory, but ensure that
    // files with the same name don't conflict.
    .pipe(gulp.rename(function (p) {
      if (p.dirname.indexOf('core') === 0) {
        var dirname = p.dirname.replace(
          new RegExp(path.sep.replace(/\\/, '\\\\'), "g"), "-");
        p.dirname = "";
        p.basename = dirname + "-" + p.basename;
      }
    }))
    .pipe(compile({
      dependency_mode: 'PRUNE',
      compilation_level: 'ADVANCED_OPTIMIZATIONS',
      entry_point: './tests/compile/main.js',
      js_output_file: 'main_compressed.js',
      externs: ['./externs/svg-externs.js', './externs/goog-externs.js'],
      language_in:
        argv.closureLibrary ? 'ECMASCRIPT_2015' : 'ECMASCRIPT5_STRICT'
    }, argv.verbose, argv.strict))
    .pipe(gulp.sourcemaps.mapSources(function (sourcePath, file) {
      return sourcePath.replace(/-/g, '/');
    }))
    .pipe(gulp.sourcemaps.write('.', {
      includeContent: false,
      sourceRoot: '../../'
    }))
    .pipe(gulp.dest('./tests/compile/'));
}

/**
 * This tasks builds Blockly's core files:
 *     blockly_compressed.js
 *     blocks_compressed.js
 *     blockly_uncompressed.js
 */
const buildCore = gulp.parallel(
  buildCompressed,
  buildBlocks,
  buildUncompressed
);

/**
 * This task builds all of Blockly:
 *     blockly_compressed.js
 *     blocks_compressed.js
 *     javascript_compressed.js
 *     python_compressed.js
 *     php_compressed.js
 *     lua_compressed.js
 *     dart_compressed.js
 *     blockly_uncompressed.js
 *     msg/json/*.js
 */
const build = gulp.parallel(
  buildCore,
  buildGenerators,
  buildLangfiles
);

module.exports = {
  build: build,
  core: buildCore,
  blocks: buildBlocks,
  langfiles: buildLangfiles,
  uncompressed: buildUncompressed,
  compressed: buildCompressed,
  generators: buildGenerators,
  advancedCompilationTest: buildAdvancedCompilationTest,
}
