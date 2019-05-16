var chai = require('chai');
var fs = require('fs'),
    PNG = require('pngjs').PNG,
    pixelmatch = require('pixelmatch');

var old_dir = 'tests/screenshot/outputs/old/';
var new_dir = 'tests/screenshot/outputs/new/';
var diff_dir = 'tests/screenshot/outputs/diff/';

// TODOs:
// - iterate over all test cases
// - use the name of the test case file as the name of the test
// - improve doneReading to not rely on globals like this
// - write or find basic html page that lets you open pairs of outputs + diffs

suite('Rendering', function() {
  test('math_addition', function(done) {
    function doneReading() {
      if (++filesRead < 2) return;
      var diff = new PNG({width: img1.width, height: img1.height});

      var mismatch_num = pixelmatch(
          img1.data,
          img2.data,
          diff.data,
          img1.width,
          img1.height, {threshold: 0.1});
      console.log('mismatch: ' + mismatch_num);

      diff.pack().pipe(fs.createWriteStream(diff_dir + 'math_addition.png'));
      chai.assert.equal(mismatch_num, 0);
      done();
    }

    var img1 = fs.createReadStream(old_dir + 'math_addition.png')
        .pipe(new PNG()).on('parsed', doneReading);
    var img2 = fs.createReadStream(new_dir + 'math_addition.png')
        .pipe(new PNG()).on('parsed', doneReading);
    var filesRead = 0;
  });
});
