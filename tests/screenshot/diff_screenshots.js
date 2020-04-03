/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Mocha tests that diff images and save the diffs as artifacts.
 */

var chai = require('chai');
var fs = require('fs'),
    PNG = require('pngjs').PNG,
    pixelmatch = require('pixelmatch');

var old_dir = 'tests/screenshot/outputs/old/';
var new_dir = 'tests/screenshot/outputs/new/';
var diff_dir = 'tests/screenshot/outputs/diff/';
var test_list_location ='tests/screenshot/test_cases/test_cases.json';

if (!fs.existsSync(diff_dir)){
  fs.mkdirSync(diff_dir);
}

function getTestList() {
  var file = fs.readFileSync(test_list_location);
  var json = JSON.parse(file);
  var testSpecArr = json.tests;
  var testList = [];
  for (var i = 0, testSpec; testSpec = testSpecArr[i]; i++) {
    if (!testSpec.skip) {
      testList.push(testSpec.title);
    }
  }
  return testList;
}

var test_list = getTestList();

suite('Rendering', function() {
  /**
   * - Load the old and new files as PNGs
   * - Diff the files
   * - Assert that the files are the same
   * - Save the visual diff to a file.
   */
  function diffScreenshots(name) {

    var file1 = fs.readFileSync(old_dir + name  + '.png');
    var img1 = PNG.sync.read(file1);

    var file2 = fs.readFileSync(new_dir + name + '.png');
    var img2 = PNG.sync.read(file2);

    var diff = new PNG({width: img1.width, height: img1.height});

    var mismatch_num = pixelmatch(
        img1.data,
        img2.data,
        diff.data,
        img1.width,
        img1.height, {threshold: 0.1});
    diff.pack().pipe(fs.createWriteStream(diff_dir + name + '.png'));
    chai.assert.equal(mismatch_num, 0);
  }

  test_list.forEach(function(testName) {
    test(testName, function() {
      diffScreenshots(testName);
    })
  });
});
