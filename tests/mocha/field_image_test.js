/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
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

suite ('Image Fields', function() {
  function assertValue(imageField, expectedValue, expectedText) {
    var actualValue = imageField.getValue();
    var actualText = imageField.getText();
    assertEquals(actualValue, expectedValue);
    assertEquals(actualText, expectedText);
  }
  function assertValueDefault(imageField) {
    assertValue(imageField, '', '');
  }
  suite('Constructor', function() {
    test('Empty', function() {
      chai.assert.throws(function() {
        new Blockly.FieldImage();
      });
    });
    test('Null Src', function() {
      var imageField = new Blockly.FieldImage(null, 1, 1);
      assertValueDefault(imageField);
    });
    test('Undefined Src', function() {
      var imageField = new Blockly.FieldImage(undefined, 1, 1);
      assertValueDefault(imageField);
    });
    test('Null Size', function() {
      chai.assert.throws(function() {
        new Blockly.FieldImage('src', null, null);
      });
    });
    test('Undefined Size', function() {
      chai.assert.throws(function() {
        new Blockly.FieldImage('src', undefined, undefined);
      });
    });
    test('Zero Size', function() {
      chai.assert.throws(function() {
        new Blockly.FieldImage('src', 0, 0);
      });
    });
    test('Non-Parsable String for Size', function() {
      chai.assert.throws(function() {
        new Blockly.FieldImage('src', 'bad', 'bad');
      });
    });
    // Note: passing invalid an src path doesn't need to throw errors
    // because the developer can see they did it incorrectly when they view
    // the block.
    test('With Alt', function() {
      var imageField = new Blockly.FieldImage('src', 1, 1, 'alt');
      assertValue(imageField, 'src', 'alt');
    });
    test('Without Alt', function() {
      var imageField = new Blockly.FieldImage('src', 1, 1);
      assertValue(imageField, 'src', '');
    });
  });
  suite('fromJson', function() {
    test('Empty', function() {
      chai.assert.throws(function() {
        Blockly.FieldImage.fromJson({});
      });
    });
    test('Null Src', function() {
      var imageField = Blockly.FieldImage.fromJson({
        src: null,
        width: 1,
        height: 1
      });
      assertValueDefault(imageField);
    });
    test('Undefined Src', function() {
      var imageField = Blockly.FieldImage.fromJson({
        src: undefined,
        width: 1,
        height: 1
      });
      assertValueDefault(imageField);
    });
    test('Null Size', function() {
      chai.assert.throws(function() {
        Blockly.FieldImage.fromJson({
          src: 'src',
          width: null,
          height: null
        });
      });
    });
    test('Undefined Size', function() {
      chai.assert.throws(function() {
        Blockly.FieldImage.fromJson({
          src: 'src',
          width: undefined,
          height: undefined
        });
      });
    });
    test('Non-Parsable String for Size', function() {
      chai.assert.throws(function() {
        Blockly.FieldImage.fromJson({
          src: 'src',
          width: 'bad',
          height: 'bad'
        });
      });
    });
    test('With Alt', function() {
      var imageField = Blockly.FieldImage.fromJson({
        src: 'src',
        width: 1,
        height: 1,
        alt: 'alt'
      });
      assertValue(imageField, 'src', 'alt');
    });
    test('Without Alt', function() {
      var imageField = Blockly.FieldImage.fromJson({
        src: 'src',
        width: 1,
        height: 1
      });
      assertValue(imageField, 'src', '');
    });
  });
  suite('setValue', function() {
    setup(function() {
      this.imageField = new Blockly.FieldImage('src', 1, 1, 'alt');
    });
    test('Null', function() {
      this.imageField.setValue(null);
      assertValue(this.imageField, 'src', 'alt');
    });
    test('Undefined', function() {
      this.imageField.setValue(undefined);
      assertValue(this.imageField, 'src', 'alt');
    });
    test('New Src, New Alt', function() {
      this.imageField.setValue('newSrc');
      assertValue(this.imageField, 'newSrc', 'alt');
      this.imageField.setText('newAlt');
      assertValue(this.imageField, 'newSrc', 'newAlt');
    });
    test('New Alt, New Src', function() {
      this.imageField.setText('newAlt');
      assertValue(this.imageField, 'src', 'newAlt');
      this.imageField.setValue('newSrc');
      assertValue(this.imageField, 'newSrc', 'newAlt');
    });
  });
});
