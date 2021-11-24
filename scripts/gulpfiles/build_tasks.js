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

/**
 * Suffix to add to compiled output files.
 */
const COMPILED_SUFFIX = '_compressed';

/**
 * A list of chunks.  Order matters: later chunks can depend on
 * earlier ones, but not vice-versa.  All chunks are assumed to depend
 * on the first chunk.
 *
 * The function getChunkOptions will, after running
 * closure-calculate-chunks, update each chunk to add the following
 * properties:
 * 
 * - .dependencies: a list of the chunks the chunk depends upon.
 * - .wrapper: the chunk wrapper.
 *
 * Output files will be named <chunk.name><COMPILED_SUFFIX>.js.
 */
const chunks = [
  {
    name: 'blockly',
    entry: 'core/requires.js',
    namespace: 'Blockly',
  }, {
    name: 'blocks',
    entry: 'blocks/all.js',
    namespace: 'Blockly.blocks',
  }, {
    name: 'javascript',
    entry: 'generators/javascript/all.js',
    // dependsOn: ['blocks'],
    namespace: 'JavaScript',
  }, {
    name: 'python',
    entry: 'generators/python/all.js',
    // dependsOn: ['blocks'],
    namespace: 'Python',
  }, {
    name: 'php',
    entry: 'generators/php/all.js',
    // dependsOn: ['blocks'],
    namespace: 'PHP',
  }, {
    name: 'lua',
    entry: 'generators/lua/all.js',
    // dependsOn: ['blocks'],
    namespace: 'Lua',
  }, {
    name: 'dart',
    entry: 'generators/dart/all.js',
    // dependsOn: ['blocks'],
    namespace: 'Dart',
  }
];

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
 * This task updates tests/deps.js, used by blockly_uncompressed.js
 * when loading Blockly in uncompiled mode.
 *
 * Also updates tests/deps.mocha.js, used by the mocha test suite.
 */
function buildDeps(done) {
  const closurePath = argv.closureLibrary ?
      'node_modules/google-closure-library/closure/goog' :
      'closure/goog';

  const roots = [
    closurePath,
    'core',
    'blocks',
    'generators',
  ];

  const testRoots = [
    ...roots,
    'tests/mocha'
  ];

  const args = roots.map(root => `--root '${root}' `).join('');
  execSync(`closure-make-deps ${args} > tests/deps.js`, {stdio: 'inherit'});

  // Use grep to filter out the entries that are already in deps.js.
  const testArgs = testRoots.map(root => `--root '${root}' `).join('');
  execSync(`closure-make-deps ${testArgs} | grep 'tests/mocha'` +
      ' > tests/deps.mocha.js', {stdio: 'inherit'});
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
 * A helper method to return an closure compiler chunk wrapper that
 * wraps the compiler output for the given chunk in a Universal Module
 * Definition.
 */
function chunkWrapper(chunk) {
  const fileNames = chunk.dependencies.map(
      d => JSON.stringify(`./${d.name}${COMPILED_SUFFIX}.js`));
  const amdDeps = fileNames.join(', ');
  const cjsDeps = fileNames.map(f => `require(${f})`).join(', ');
  const browserDeps =
      chunk.dependencies.map(d => `root.${d.namespace}`).join(', ');
  const imports = chunk.dependencies.map(d => d.namespace).join(', ');
  return `// Do not edit this file; automatically generated.

/* eslint-disable */
;(function(root, factory) {
  if (typeof define === 'function' && define.amd) { // AMD
    define([${amdDeps}], factory);
  } else if (typeof exports === 'object') { // Node.js
    module.exports = factory(${cjsDeps});
  } else { // Browser
    root.${chunk.namespace} = factory(${browserDeps});
  }
}(this, function(${imports}) {
  %output%
return ${chunk.namespace};
}));
`;
};

/**
 * Get chunking options to pass to Closure Compiler by using
 * closure-calculate-chunks (hereafter "ccc") to generate them based
 * on the deps.js file (which must be up to date!).
 *
 * The generated options are modified to use the original chunk names
 * given in chunks instead of the entry-point based names used by ccc.
 *
 * @return {{chunk: !Array<string>, js: !Array<string>}} The chunking
 *     information, in the same form as emitted by
 *     closure-calculate-chunks.
 *
 * TODO(cpcallen): maybeAddClosureLibrary?  Or maybe remove base.js?
 */
function getChunkOptions() {
  const cccArgs = [
    '--closure-library-base-js-path ./closure/goog/base.js',
    '--deps-file ./tests/deps.js',
    ...(chunks.map(chunk => `--entrypoint '${chunk.entry}'`)),
  ];
  const cccCommand = `closure-calculate-chunks ${cccArgs.join(' ')}`;
  const rawOptions= JSON.parse(String(execSync(cccCommand)));

  // rawOptions should now be of the form:
  //
  // {
  //   chunk: [
  //     'requires:258',
  //     'all:10:requires',
  //     'all1:11:requires',
  //     'all2:11:requires',
  //     /* ... remaining handful of chunks */
  //   ],
  //   js: [
  //     '/Users/cpcallen/src/blockly/core/serialization/workspaces.js',
  //     '/Users/cpcallen/src/blockly/core/serialization/variables.js',
  //     /* ... remaining several hundred files */
  //   ],
  // }
  //
  // This is designed to be passed directly as-is as the options
  // object to the Closure Compiler node API, but we want to replace
  // the unhelpful entry-point based chunk names (let's call these
  // "nicknames") with the ones from chunks.  Luckily they will be in
  // the same order that the entry points were supplied in - i.e.,
  // they correspond 1:1 with the entries in chunks.
  const chunkByNickname = Object.create(null);
  const chunkList = rawOptions.chunk.map((element, index) => {
    const [nickname, numJsFiles, dependencyNicks] = element.split(':');
    const chunk = chunks[index];
    chunkByNickname[nickname] = chunk;
    if (!dependencyNicks) {  // Chunk has no dependencies.
      chunk.dependencies = [];
      return `${chunk.name}:${numJsFiles}`;
    }
    chunk.dependencies =
        dependencyNicks.split(',').map(nick => chunkByNickname[nick]);
    const dependencyNames =
        chunk.dependencies.map(dependency => dependency.name).join(',');
    return `${chunk.name}:${numJsFiles}:${dependencyNames}`;
  });

  // Generate a chunk wrapper for each chunk.
  for (const chunk of chunks) {
    chunk.wrapper = chunkWrapper(chunk);
  }

  const chunkWrappers = chunks.map(chunk => `${chunk.name}:${chunk.wrapper}`);
  return {chunk: chunkList, js: rawOptions.js, chunk_wrapper: chunkWrappers};
}

/** 
 * RegExp that globally matches path.sep (i.e., "/" or "\").
 */
const pathSepRegExp = new RegExp(path.sep.replace(/\\/, '\\\\'), "g");

/** 
 * Modify the supplied gulp.rename path object to relax @package
 * restrictions in core/.
 *
 * Background: subdirectories of core/ are used to group similar files
 * together but are not intended to limit access to names
 * marked @package; instead, that annotation is intended to mean only
 * that the annotated name not part of the public API.
 *
 * To make @package behave less strictly in core/, this function can
 * be used to as a gulp.rename filter, modifying the path object to
 * flatten all files in core/** so that they're in the same directory,
 * while ensuring that files with the same base name don't conflict.
 *
 * @param {{dirname: string, basename: string, extname: string}}
 *     pathObject The path argument supplied by gulp.rename to its
 *     callback.  Modified in place.
 */
function flattenCorePaths(pathObject) {
  const dirs = pathObject.dirname.split(path.sep);
  if (dirs[0] === 'core') {
    pathObject.dirname = dirs[0];
    pathObject.basename =
        dirs.slice(1).concat(pathObject.basename).join('-slash-');
  }
}

/**
 * Undo the effects of flattenCorePaths on a single path string.
 * @param string pathString The flattened path.
 * @return string  The path after unflattening.
 */
function unflattenCorePaths(pathString) {
  return pathString.replace(/-slash-/g, path.sep);
}

/**
 * This task compiles the core library, blocks and generators, creating 
 * blockly_compressed.js, blocks_compressed.js, etc.
 *
 * The deps.js file must be up-to-date.
 */
function buildCompiled(done) {
  // Get chunking.
  const chunkOptions = getChunkOptions();
  // Closure Compiler options.
  const packageJson = getPackageJson();  // For version number.
  const options = {
    compilation_level: 'SIMPLE_OPTIMIZATIONS',
    warning_level: argv.verbose ? 'VERBOSE' : 'DEFAULT',
    language_in: 'ECMASCRIPT6_STRICT',
    language_out: 'ECMASCRIPT5_STRICT',
    rewrite_polyfills: true,
    hide_warnings_for: 'node_modules',
    // dependency_mode: 'PRUNE',
    externs: ['./externs/svg-externs.js', /* './externs/goog-externs.js' */],
    define: 'Blockly.VERSION="' + packageJson.version + '"',
    chunk: chunkOptions.chunk,
    chunk_wrapper: chunkOptions.chunk_wrapper,
    // Don't supply the list of source files in chunkOptions.js as an
    // option to Closure Compiler; instead feed them as input via gulp.src.
  };
  if (argv.debug || argv.strict) {
    options.jscomp_error = [...JSCOMP_ERROR];
    if (argv.strict) {
      options.jscomp_error.push('strictCheckTypes');
    }
  }
  // Extra options for Closure Compiler gulp plugin.
  const pluginOptions = ['native', 'java', 'javascript'];

  // Fire up compilation pipline.
  return gulp.src(chunkOptions.js, {base: './'})
      .pipe(stripApacheLicense())
      .pipe(gulp.sourcemaps.init())
      .pipe(gulp.rename(flattenCorePaths))
      .pipe(closureCompiler(options, pluginOptions))
      .pipe(gulp.rename({suffix: COMPILED_SUFFIX}))
      .pipe(gulp.sourcemaps.mapSources(unflattenCorePaths))
      .pipe(
          gulp.sourcemaps.write('.', {includeContent: false, sourceRoot: './'}))
      .pipe(gulp.dest(BUILD_DIR));
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
 *     test/deps*.js
 */
const build = gulp.parallel(
    gulp.series(buildDeps, buildCompiled),
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
  generateLangfiles: generateLangfiles,
  langfiles: buildLangfiles,
  compiled: buildCompiled,
  format: format,
  checkinBuilt: checkinBuilt,
  cleanBuildDir: cleanBuildDir,
  advancedCompilationTest: buildAdvancedCompilationTest,
}
