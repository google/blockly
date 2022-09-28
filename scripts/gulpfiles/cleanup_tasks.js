/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Gulp tasks to complete various clean up tasks.
 */

const gulp = require('gulp');
const path = require('path');
const through2 = require('through2');

/**
 * Sorts goog.requires in core, blocks and generators.
 */
function sortRequires() {
  const srcs = ['core/**/**/*.js', 'blocks/*.js', 'generators/**/*.js'];
  const excludes = ['core/requires.js'];
  return gulp.src(srcs, {base: './'})
      .pipe(through2.obj((file, _enc, next) => {
        if (file.isNull() || file.isDirectory()) {
          next(null, file);
          return;
        }

        if (file.extname !== '.js' && path.extname(file.history[0]) !== '.js') {
          next(null, file);
          return;
        }

        const relPath = path.relative(path.join(file.cwd, file.base), file.path);
        if (excludes.indexOf(relPath) > -1) {
          next(null, file);
          return;
        }

        const contents = file.contents.toString();

        // Capture requires.
        const re = /goog\.(require|requireType)\('(.*)'\);/gm;
        const requiresList = [];
        const requireTypesList = [];
        let firstIndex;
        let lastIndex;
        while ((match = re.exec(contents)) !== null) {
          if (match[1] === 'require') requiresList.push(match[2]);
          if (match[1] === 'requireType') requireTypesList.push(match[2]);
          if (firstIndex === undefined) {
            firstIndex = match.index;
          } else {
            lastIndex = re.lastIndex;
          }
        }

        // Sort requires.
        requiresList.sort(
            (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        requireTypesList.sort(
            (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

        // Replace in file.
        const requiresSection = requiresList.length ?
            requiresList.map(r => `goog.require('${r}');`).join('\n') + '\n\n' :
            '';
        const requireTypesSection = requireTypesList.length ?
            requireTypesList.map(r => `goog.requireType('${r}');`).join('\n') +
                '\n\n' :
            '';
        const requires = `${requiresSection}${requireTypesSection}\n`;

        if (firstIndex !== undefined & lastIndex !== undefined) {
          file.contents = Buffer.from(
              contents.substring(0, firstIndex) + requires +
              contents.substring(lastIndex).trimStart());
        }
        next(null, file);
      }))
      .pipe(gulp.dest('./'));
};

module.exports = {
  sortRequires: sortRequires
};
