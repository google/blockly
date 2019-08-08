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
  suite('Backwards-Compat - Constructor', function() {
    test('All Provided', function() {
      var onClick = function() {
        console.log('on click');
      };
      var field = new Blockly.FieldImage('scr', 10, 10, 'alt', onClick, true);

      chai.assert.equal(field.text_, 'alt');
      chai.assert.equal(field.clickHandler_, onClick);
      chai.assert.isTrue(field.flipRtl_);
    });
    test('Just Alt', function() {
      var field = new Blockly.FieldImage('scr', 10, 10, 'alt');
      chai.assert.equal(field.text_, 'alt');
      chai.assert.isNotOk(field.clickHandler_);
      chai.assert.isFalse(field.flipRtl_);
    });
    test('Just onClick', function() {
      var onClick = function() {
        console.log('on click');
      };
      var field = new Blockly.FieldImage('scr', 10, 10, null, onClick);
      chai.assert.equal(field.text_, '');
      chai.assert.equal(field.clickHandler_, onClick);
      chai.assert.isFalse(field.flipRtl_);
    });
    test('Just FlipRtl', function() {
      var field = new Blockly.FieldImage('scr', 10, 10, null, null, true);

      chai.assert.equal(field.text_, '');
      chai.assert.isNotOk(field.clickHandler_);
      chai.assert.isTrue(field.flipRtl_);
    });
    test('Alt & OnClick', function() {
      var onClick = function() {
        console.log('on click');
      };
      var field = new Blockly.FieldImage('scr', 10, 10, 'alt', onClick);

      chai.assert.equal(field.text_, 'alt');
      chai.assert.equal(field.clickHandler_, onClick);
      chai.assert.isFalse(field.flipRtl_);
    });
    test('Alt & FlipRtl', function() {
      var field = new Blockly.FieldImage('scr', 10, 10, 'alt', null, true);

      chai.assert.equal(field.text_, 'alt');
      chai.assert.isNotOk(field.clickHandler_);
      chai.assert.isTrue(field.flipRtl_);
    });
    test('OnClick & FlipRtl', function() {
      var onClick = function() {
        console.log('on click');
      };
      var field = new Blockly.FieldImage('scr', 10, 10, null, onClick, true);

      chai.assert.equal(field.text_, '');
      chai.assert.equal(field.clickHandler_, onClick);
      chai.assert.isTrue(field.flipRtl_);
    });
  });
  suite('Customizations', function() {
    suite('OnClick', function() {
      test('JS Constructor', function() {
        var onClick = function() {
          console.log('on click');
        };
        var field = new Blockly.FieldImage('src', 10, 10, onClick);
        chai.assert.equal(field.clickHandler_, onClick);
      });
      test('setOnClickHandler', function() {
        var onClick = function() {
          console.log('on click');
        };
        var field = new Blockly.FieldImage('src', 10, 10);
        field.setOnClickHandler(onClick);
        chai.assert.equal(field.clickHandler_, onClick);
      });
    });
    suite('Alt', function() {
      test('JS Constructor', function() {
        var field = new Blockly.FieldImage('src', 10, 10, null, {
          alt: 'alt'
        });
        chai.assert.equal(field.text_, 'alt');
      });
      test('JSON Definition', function() {
        var field = Blockly.FieldImage.fromJson({
          src: 'src',
          width: 10,
          height: 10,
          alt: 'alt'
        });
        chai.assert.equal(field.text_, 'alt');
      });
      suite('No Alt -> New Alt', function() {
        setup(function() {
          this.imageField = new Blockly.FieldImage('src', 1, 1);
        });
        test('Backwards Compat - setText', function() {
          this.imageField.setText('newAlt');
          assertValue(this.imageField, 'src', 'newAlt');
        });
        test('Null', function() {
          this.imageField.setText(null);
          assertValue(this.imageField, 'src', '');
        });
        test('Good Alt', function() {
          this.imageField.setText('newAlt');
          assertValue(this.imageField, 'src', 'newAlt');
        });
      });
      suite('Alt -> New Alt', function() {
        setup(function() {
          this.imageField = new Blockly.FieldImage('src', 1, 1, 'alt');
        });
        test('Backwards Compat - setText', function() {
          this.imageField.setText('newAlt');
          assertValue(this.imageField, 'src', 'newAlt');
        });
        test('Null', function() {
          this.imageField.setText(null);
          assertValue(this.imageField, 'src', 'alt');
        });
        test('Empty String', function() {
          this.imageField.setText('');
          assertValue(this.imageField, 'src', '');
        });
        test('Good Alt', function() {
          this.imageField.setText('newAlt');
          assertValue(this.imageField, 'src', 'newAlt');
        });
      });
    });
    suite('FlipRtl', function() {
      test('JS Constructor', function() {
        var field = new Blockly.FieldImage('src', 10, 10, null, {
          flipRtl: true
        });
        chai.assert.isTrue(field.flipRtl_);
      });
      test('JSON Definition', function() {
        var field = Blockly.FieldImage.fromJson({
          src: 'src',
          width: 10,
          height: 10,
          flipRtl: true
        });
        chai.assert.isTrue(field.flipRtl_);
      });
    });
  });
});
