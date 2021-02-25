/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Gulp tasks to complete various clean up tasks.
 */

const gulp = require('gulp');
const through2 = require('through2');

/**
 * Sorts goog.requires in core, blocks and generators.
 */
function sortRequires() {
  const srcs = ['core/**/**/*.js', 'blocks/*.js', 'generators/**/*.js'];
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

        const contents = file.contents.toString();
        // Collect requires.
        const re = /goog\.(require|requireType)\('(.*)'\);/gm;
        const requiresList = [];
        const requireTypesList = [];
        contents.replace(re, (match, g1, g2) => {
          if (g1 == 'require') requiresList.push(g2);
          if (g1 == 'requireType') requireTypesList.push(g2);
        });

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

        // Find first and last line index of requires.
        let firstIndex;
        let lastIndex;
        while ((match = re.exec(contents)) != null) {
          if (firstIndex == undefined) {
            firstIndex = match.index;
          } else {
            lastIndex = re.lastIndex;
          }
        }
        if (firstIndex != undefined & lastIndex != undefined) {
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
