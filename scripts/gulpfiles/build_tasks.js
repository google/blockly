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

const clangFormat = require('clang-format');
const clangFormatter = require('gulp-clang-format');
var closureCompiler = require('google-closure-compiler').gulp();
var closureDeps = require('google-closure-deps');
var argv = require('yargs').argv;
var rimraf = require('rimraf');

var {BUILD_DIR} = require('./config');
var {getPackageJson} = require('./helper_tasks');

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
  'extraRequire',
  'functionParams',
  'globalThis',
  'invalidCasts',
  'misplacedTypeAnnotation',
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
  options.language_in = 'ECMASCRIPT6_STRICT',
  options.language_out = 'ECMASCRIPT5_STRICT';
  options.rewrite_polyfills = true;
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
 * @param {Array<string>} srcs
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
 * @param {Array<Object>} dependencies An array of dependencies to inject.
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
  var packageJson = getPackageJson();
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
      .pipe(gulp.rename(function(p) {
        var dirname = p.dirname.replace(
            new RegExp(path.sep.replace(/\\/, '\\\\'), "g"), "-");
        p.dirname = "";
        p.basename = dirname + "-" + p.basename;
      }))
      .pipe(compile(
          {
            dependency_mode: 'PRUNE',
            entry_point: './core-requires.js',
            js_output_file: 'blockly_compressed.js',
            externs: ['./externs/svg-externs.js', './externs/goog-externs.js'],
            define: defines,
            output_wrapper: outputWrapperUMD('Blockly', [])
          },
          argv.verbose, argv.debug, argv.strict))
      .pipe(gulp.sourcemaps.mapSources(function(sourcePath, file) {
        return sourcePath.replace(/-/g, '/');
      }))
      .pipe(
          gulp.sourcemaps.write('.', {includeContent: false, sourceRoot: './'}))
      .pipe(gulp.dest(BUILD_DIR));
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
    .pipe(gulp.dest(BUILD_DIR));
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
    .pipe(gulp.dest(BUILD_DIR));
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
 * This task updates tests/deps.js, used by blockly_uncompressed.js
 * when loading Blockly in uncompiled mode.
 */
function buildDeps(done) {
  const closurePath = argv.closureLibrary ?
      'node_modules/google-closure-library/closure/goog' :
      'closure/goog';

  const roots = [
    closurePath,
    'core',
    'blocks',
  ];

  const testRoots = [
    ...roots,
    'generators',
    'tests/mocha'
  ];

  const args = roots.map(root => `--root '${root}' `).join('');
  execSync(`closure-make-deps ${args} > tests/deps.js`, {stdio: 'inherit'});

  const testArgs = testRoots.map(root => `--root '${root}' `).join('');
  execSync(`closure-make-deps ${testArgs} > tests/deps.mocha.js`,
      {stdio: 'inherit'});
  done();
};

/**
 * This task regenrates msg/json/en.js and msg/json/qqq.js from
 * msg/messages.js.
 */
function generateLangfiles(done) {
  // Run js_to_json.py
  const jsToJsonCmd = `python3 scripts/i18n/js_to_json.py \
      --input_file ${path.join('msg', 'messages.js')} \
      --output_dir ${path.join('msg', 'json')} \
      --quiet`;
  execSync(jsToJsonCmd, { stdio: 'inherit' });

  console.log(`
Regenerated several flies in msg/json/.  Now run

    git diff msg/json/*.json

and check that operation has not overwritten any modifications made to
hints, etc. by the TranslateWiki volunteers.  If it has, backport
their changes to msg/messages.js and re-run 'npm run generate:langfiles'.

Once you are satisfied that any new hints have been backported you may
go ahead and commit the changes, but note that the generate script
will have removed the translator credits - be careful not to commit
this removal!
`);

  done();
};

/**
 * This task builds Blockly's lang files.
 *     msg/*.js
 */
function buildLangfiles(done) {
  // Create output directory.
  const outputDir = path.join(BUILD_DIR, 'msg', 'js');
  fs.mkdirSync(outputDir, {recursive: true});

  // Run create_messages.py.
  let json_files = fs.readdirSync(path.join('msg', 'json'));
  json_files = json_files.filter(file => file.endsWith('json') &&
      !(new RegExp(/(keys|synonyms|qqq|constants)\.json$/).test(file)));
  json_files = json_files.map(file => path.join('msg', 'json', file));
  const createMessagesCmd = `python3 ./scripts/i18n/create_messages.py \
  --source_lang_file ${path.join('msg', 'json', 'en.json')} \
  --source_synonym_file ${path.join('msg', 'json', 'synonyms.json')} \
  --source_constants_file ${path.join('msg', 'json', 'constants.json')} \
  --key_file ${path.join('msg', 'json', 'keys.json')} \
  --output_dir ${outputDir} \
  --quiet ${json_files.join(' ')}`;
  execSync(createMessagesCmd, {stdio: 'inherit'});

  done();
};

/**
 * This task builds Blockly core, blocks and generators together and uses
 * closure compiler's ADVANCED_COMPILATION mode.
 */
function buildAdvancedCompilationTest() {
  const srcs = [
    'tests/compile/main.js', 'tests/compile/test_blocks.js', 'core/**/**/*.js',
    'blocks/*.js', 'generators/**/*.js'
  ];
  return gulp.src(maybeAddClosureLibrary(srcs), {base: './'})
      .pipe(stripApacheLicense())
      .pipe(gulp.sourcemaps.init())
      // Directories in Blockly are used to group similar files together
      // but are not used to limit access with @package, instead the
      // method means something is internal to Blockly and not a public
      // API.
      // Flatten all files so they're in the same directory, but ensure that
      // files with the same name don't conflict.
      .pipe(gulp.rename(function(p) {
        if (p.dirname.indexOf('core') === 0) {
          var dirname = p.dirname.replace(
              new RegExp(path.sep.replace(/\\/, '\\\\'), "g"), "-");
          p.dirname = "";
          p.basename = dirname + "-" + p.basename;
        }
      }))
      .pipe(compile(
          {
            dependency_mode: 'PRUNE',
            compilation_level: 'ADVANCED_OPTIMIZATIONS',
            entry_point: './tests/compile/main.js',
            js_output_file: 'main_compressed.js',
            externs: ['./externs/svg-externs.js', './externs/goog-externs.js'],
          },
          argv.verbose, argv.strict))
      .pipe(gulp.sourcemaps.mapSources(function(sourcePath, file) {
        return sourcePath.replace(/-/g, '/');
      }))
      .pipe(gulp.sourcemaps.write(
          '.', {includeContent: false, sourceRoot: '../../'}))
      .pipe(gulp.dest('./tests/compile/'));
}

/**
 * This tasks builds Blockly's core files:
 *     blockly_compressed.js
 *     blocks_compressed.js
 *     blockly_uncompressed.js
 */
const buildCore = gulp.parallel(
    buildDeps,
    buildCompressed,
    buildBlocks,
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
    buildLangfiles,
    );

/**
 * This task copies built files from BUILD_DIR back to the repository
 * so they can be committed to git.
 */
function checkinBuilt() {
  return gulp.src([
    `${BUILD_DIR}/**.js`,
    `${BUILD_DIR}/**.js.map`,
    `${BUILD_DIR}/**/**.js`,
    `${BUILD_DIR}/**/**.js.map`,
  ]).pipe(gulp.dest('.'));
};

/**
 * This task cleans the build directory (by deleting it).
 */
function cleanBuildDir(done) {
  // Sanity check.
  if (BUILD_DIR === '.' || BUILD_DIR === '/') {
    throw new Error(`Refusing to rm -rf ${BUILD_DIR}`);
  }
  rimraf(BUILD_DIR, done);
}

/**
 * Runs clang format on all files in the core directory.
 */
function format() {
  return gulp.src(['core/**/*.js'], {base: '.'})
      .pipe(clangFormatter.format('file', clangFormat))
      .pipe(gulp.dest('.'));
};

module.exports = {
  build: build,
  deps: buildDeps,
  core: buildCore,
  blocks: buildBlocks,
  generateLangfiles: generateLangfiles,
  langfiles: buildLangfiles,
  compressed: buildCompressed,
  format: format,
  generators: buildGenerators,
  checkinBuilt: checkinBuilt,
  cleanBuildDir: cleanBuildDir,
  advancedCompilationTest: buildAdvancedCompilationTest,
}
