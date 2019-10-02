/**
 * @license
 * Copyright 2019 Google LLC
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

suite('Image Fields', function() {
  function assertValue(imageField, expectedValue, expectedText) {
    var actualValue = imageField.getValue();
    var actualText = imageField.getText();
    assertEquals(actualValue, expectedValue);
    assertEquals(actualText, expectedText);
  }
  suite('Constructor', function() {
    test('Empty', function() {
      chai.assert.throws(function() {
        new Blockly.FieldImage();
      });
    });
    test('Undefined Src', function() {
      chai.assert.throws(function() {
        new Blockly.FieldImage(undefined, 1, 1);
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
    test('Undefined Src', function() {
      chai.assert.throws(function() {
        Blockly.FieldImage.fromJson({
          src: undefined,
          width: 1,
          height: 1
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
    test('Good Src', function() {
      this.imageField.setValue('newSrc');
      assertValue(this.imageField, 'newSrc', 'alt');
    });
  });
  suite('Customizations', function() {
    suite('On Click Handler', function() {
      setup(function() {
        this.onClick = function() {
          console.log('on click');
        };
      });
      teardown(function() {
        delete this.onClick;
      });
      test('JS Constructor', function() {
        var field = new Blockly.FieldImage('src', 10, 10, null, this.onClick);
        chai.assert.equal(field.clickHandler_, this.onClick);
      });
      test('setOnClickHandler', function() {
        var field = new Blockly.FieldImage('src', 10, 10);
        field.setOnClickHandler(this.onClick);
        chai.assert.equal(field.clickHandler_, this.onClick);
      });
      test('Remove Click Handler', function() {
        var field = new Blockly.FieldImage('src', 10, 10, null, this.onClick);
        field.setOnClickHandler(null);
        chai.assert.equal(field.clickHandler_, null);
      });
    });
    suite('Alt', function() {
      test('JS Constructor', function() {
        var field = new Blockly.FieldImage('src', 10, 10, 'alt');
        chai.assert.equal(field.altText_, 'alt');
      });
      test('JSON Definition', function() {
        var field = Blockly.FieldImage.fromJson({
          src: 'src',
          width: 10,
          height: 10,
          alt: 'alt'
        });
        chai.assert.equal(field.altText_, 'alt');
      });
      test('Deprecated - setText', function() {
        var field = new Blockly.FieldImage('src', 10, 10, 'alt');
        chai.assert.throws(function() {
          field.setText('newAlt');
        });
      });
      suite('SetAlt', function() {
        setup(function() {
          this.imageField = new Blockly.FieldImage('src', 10, 10, 'alt');
        });
        test('Null', function() {
          this.imageField.setAlt(null);
          assertValue(this.imageField, 'src', '');
        });
        test('Empty String', function() {
          this.imageField.setAlt('');
          assertValue(this.imageField, 'src', '');
        });
        test('Good Alt', function() {
          this.imageField.setAlt('newAlt');
          assertValue(this.imageField, 'src', 'newAlt');
        });
      });
      test('JS Configuration - Simple', function() {
        var field = new Blockly.FieldImage('src', 10, 10, null, null, null, {
          alt: 'alt'
        });
        chai.assert.equal(field.altText_, 'alt');
      });
      test('JS Configuration - Ignore', function() {
        var field = new Blockly.FieldImage('src', 10, 10, 'alt', null, null, {
          alt: 'configAlt'
        });
        chai.assert.equal(field.altText_, 'configAlt');
      });
      test('JS Configuration - Ignore - \'\'', function() {
        var field = new Blockly.FieldImage('src', 10, 10, '', null, null, {
          alt: 'configAlt'
        });
        chai.assert.equal(field.altText_, 'configAlt');
      });
      test('JS Configuration - Ignore - Config \'\'', function() {
        var field = new Blockly.FieldImage('src', 10, 10, 'alt', null, null, {
          alt: ''
        });
        chai.assert.equal(field.altText_, '');
      });
    });
    suite('Flip RTL', function() {
      test('JS Constructor', function() {
        var field = new Blockly.FieldImage('src', 10, 10, null, null, true);
        chai.assert.isTrue(field.getFlipRtl());
      });
      test('JSON Definition', function() {
        var field = Blockly.FieldImage.fromJson({
          src: 'src',
          width: 10,
          height: 10,
          flipRtl: true
        });
        chai.assert.isTrue(field.getFlipRtl());
      });
      test('JS Configuration - Simple', function() {
        var field = new Blockly.FieldImage('src', 10, 10, null, null, null, {
          flipRtl: true
        });
        chai.assert.isTrue(field.getFlipRtl());
      });
      test('JS Configuration - Ignore - True', function() {
        var field = new Blockly.FieldImage('src', 10, 10, null, null, true, {
          flipRtl: false
        });
        chai.assert.isFalse(field.getFlipRtl());
      });
      test('JS Configuration - Ignore - False', function() {
        var field = new Blockly.FieldImage('src', 10, 10, null, null, false, {
          flipRtl: true
        });
        chai.assert.isTrue(field.getFlipRtl());
      });
    });
  });
});
