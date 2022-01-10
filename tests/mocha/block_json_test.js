/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.blockJson');

const {Align} = goog.require('Blockly.Input');


suite('Block JSON initialization', function() {
  suite('validateTokens_', function() {
    setup(function() {
      this.assertError = function(tokens, count, error) {
        const block = {
          type: 'test',
          validateTokens_: Blockly.Block.prototype.validateTokens_,
        };
        chai.assert.throws(function() {
          block.validateTokens_(tokens, count);
        }, error);
      };

      this.assertNoError = function(tokens, count) {
        const block = {
          type: 'test',
          validateTokens_: Blockly.Block.prototype.validateTokens_,
        };
        chai.assert.doesNotThrow(function() {
          block.validateTokens_(tokens, count);
        });
      };
    });

    test('0 args, 0 tokens', function() {
      this.assertNoError(['test', 'test'], 0);
    });

    test('0 args, 1 token', function() {
      this.assertError(['test', 1, 'test'], 0,
          'Block "test": Message index %1 out of range.');
    });

    test('1 arg, 0 tokens', function() {
      this.assertError(['test', 'test'], 1,
          'Block "test": Message does not reference all 1 arg(s).');
    });

    test('1 arg, 1 token', function() {
      this.assertNoError(['test', 1, 'test'], 1);
    });

    test('1 arg, 2 tokens', function() {
      this.assertError(['test', 1, 1, 'test'], 1,
          'Block "test": Message index %1 duplicated.');
    });

    test('Token out of lower bound', function() {
      this.assertError(['test', 0, 'test'], 1,
          'Block "test": Message index %0 out of range.');
    });

    test('Token out of upper bound', function() {
      this.assertError(['test', 2, 'test'], 1,
          'Block "test": Message index %2 out of range.');
    });
  });

  suite('interpolateArguments_', function() {
    setup(function() {
      this.assertInterpolation = function(tokens, args, lastAlign, elements) {
        const block = {
          type: 'test',
          interpolateArguments_: Blockly.Block.prototype.interpolateArguments_,
          stringToFieldJson_: Blockly.Block.prototype.stringToFieldJson_,
          isInputKeyword_: Blockly.Block.prototype.isInputKeyword_,
        };
        chai.assert.deepEqual(
            block.interpolateArguments_(tokens, args, lastAlign),
            elements);
      };
    });

    test('Strings to labels', function() {
      this.assertInterpolation(
          ['test1', 'test2', 'test3', {'type': 'input_dummy'}],
          [],
          undefined,
          [
            {
              'type': 'field_label',
              'text': 'test1',
            },
            {
              'type': 'field_label',
              'text': 'test2',
            },
            {
              'type': 'field_label',
              'text': 'test3',
            },
            {
              'type': 'input_dummy',
            },
          ]);
    });

    test('Ignore empty strings', function() {
      this.assertInterpolation(
          ['test1', '', '    ', {'type': 'input_dummy'}],
          [],
          undefined,
          [
            {
              'type': 'field_label',
              'text': 'test1',
            },
            {
              'type': 'input_dummy',
            },
          ]);
    });

    test('Insert args', function() {
      this.assertInterpolation(
          [1, 2, 3, {'type': 'input_dummy'}],
          [
            {
              'type': 'field_number',
              'name': 'test1',
            },
            {
              'type': 'field_number',
              'name': 'test2',
            },
            {
              'type': 'field_number',
              'name': 'test3',
            },
          ],
          undefined,
          [
            {
              'type': 'field_number',
              'name': 'test1',
            },
            {
              'type': 'field_number',
              'name': 'test2',
            },
            {
              'type': 'field_number',
              'name': 'test3',
            },
            {
              'type': 'input_dummy',
            },
          ]);
    });

    test('String args to labels', function() {
      this.assertInterpolation(
          [1, 2, 3, {'type': 'input_dummy'}],
          ['test1', 'test2', 'test3'],
          undefined,
          [
            {
              'type': 'field_label',
              'text': 'test1',
            },
            {
              'type': 'field_label',
              'text': 'test2',
            },
            {
              'type': 'field_label',
              'text': 'test3',
            },
            {
              'type': 'input_dummy',
            },
          ]);
    });

    test('Ignore empty string args', function() {
      this.assertInterpolation(
          [1, 2, 3, {'type': 'input_dummy'}],
          ['test1', '     ', '     '],
          undefined,
          [
            {
              'type': 'field_label',
              'text': 'test1',
            },
            {
              'type': 'input_dummy',
            },
          ]);
    });

    test('Add last dummy', function() {
      this.assertInterpolation(
          ['test1', 'test2', 'test3'],
          [],
          undefined,
          [
            {
              'type': 'field_label',
              'text': 'test1',
            },
            {
              'type': 'field_label',
              'text': 'test2',
            },
            {
              'type': 'field_label',
              'text': 'test3',
            },
            {
              'type': 'input_dummy',
            },
          ]);
    });

    test('Add last dummy for no_field_prefix_field', function() {
      this.assertInterpolation(
          [
            {
              'type': 'no_field_prefix_field',
            },
          ],
          [],
          undefined,
          [
            {
              'type': 'no_field_prefix_field',
            },
            {
              'type': 'input_dummy',
            },
          ]);
    });

    test('Add last dummy for input_prefix_field', function() {
      this.assertInterpolation(
          [
            {
              'type': 'input_prefix_field',
            },
          ],
          [],
          undefined,
          [
            {
              'type': 'input_prefix_field',
            },
            {
              'type': 'input_dummy',
            },
          ]);
    });

    test('Set last dummy alignment', function() {
      this.assertInterpolation(
          ['test1', 'test2', 'test3'],
          [],
          'CENTER',
          [
            {
              'type': 'field_label',
              'text': 'test1',
            },
            {
              'type': 'field_label',
              'text': 'test2',
            },
            {
              'type': 'field_label',
              'text': 'test3',
            },
            {
              'type': 'input_dummy',
              'align': 'CENTER',
            },
          ]);
    });
  });

  suite('fieldFromJson_', function() {
    setup(function() {
      this.stub = sinon.stub(Blockly.fieldRegistry, 'fromJson')
          .callsFake(function(elem) {
            switch (elem['type']) {
              case 'field_label':
                return 'field_label';
              case 'field_number':
                return 'field_number';
              case 'no_field_prefix_field':
                return 'no_field_prefix_field';
              case 'input_prefix_field':
                return 'input_prefix_field';
              default:
                return null;
            }
          });

      this.assertField = function(json, expectedType) {
        const block = {
          type: 'test',
          fieldFromJson_: Blockly.Block.prototype.fieldFromJson_,
          stringToFieldJson_: Blockly.Block.prototype.stringToFieldJson_,
        };
        chai.assert.strictEqual(block.fieldFromJson_(json), expectedType);
      };
    });

    teardown(function() {
      this.stub.restore();
    });

    test('Simple field', function() {
      this.assertField({
        'type': 'field_label',
        'text': 'text',
      }, 'field_label');
    });

    test('Bad field', function() {
      this.assertField({
        'type': 'field_bad',
      }, null);
    });

    test('no_field_prefix_field', function() {
      this.assertField({
        'type': 'no_field_prefix_field',
      }, 'no_field_prefix_field');
    });

    test('input_prefix_field', function() {
      this.assertField({
        'type': 'input_prefix_field',
      }, 'input_prefix_field');
    });

    test('Alt string', function() {
      this.assertField({
        'type': 'field_undefined',
        'alt': 'alt text',
      }, 'field_label');
    });

    test('input_prefix_bad w/ alt string', function() {
      this.assertField({
        'type': 'input_prefix_bad',
        'alt': 'alt string',
      }, 'field_label');
    });

    test('Alt other field', function() {
      this.assertField({
        'type': 'field_undefined',
        'alt': {
          'type': 'field_number',
          'name': 'FIELDNAME',
        },
      }, 'field_number');
    });

    test('Deep alt string', function() {
      this.assertField({
        'type': 'field_undefined1',
        'alt': {
          'type': 'field_undefined2',
          'alt': {
            'type': 'field_undefined3',
            'alt': {
              'type': 'field_undefined4',
              'alt': {
                'type': 'field_undefined5',
                'alt': 'text',
              },
            },
          },
        },
      }, 'field_label');
    });

    test('Deep alt other field', function() {
      this.assertField({
        'type': 'field_undefined1',
        'alt': {
          'type': 'field_undefined2',
          'alt': {
            'type': 'field_undefined3',
            'alt': {
              'type': 'field_undefined4',
              'alt': {
                'type': 'field_undefined5',
                'alt': {
                  'type': 'field_number',
                  'name': 'FIELDNAME',
                },
              },
            },
          },
        },
      }, 'field_number');
    });

    test('No alt', function() {
      this.assertField({
        'type': 'field_undefined',
      }, null);
    });

    test('Bad alt', function() {
      this.assertField({
        'type': 'field_undefined',
        'alt': {
          'type': 'field_undefined',
        },
      }, null);
    });

    test('Spaces string alt', function() {
      this.assertField({
        'type': 'field_undefined',
        'alt': '        ',
      }, null);
    });
  });

  suite('inputFromJson_', function() {
    setup(function() {
      const Input = function(type) {
        this.type = type;
        this.setCheck = sinon.fake();
        this.setAlign = sinon.fake();
      };
      const Block = function() {
        this.type = 'test';
        this.appendDummyInput = sinon.fake.returns(new Input());
        this.appendValueInput = sinon.fake.returns(new Input());
        this.appendStatementInput = sinon.fake.returns(new Input());
        this.inputFromJson_ = Blockly.Block.prototype.inputFromJson_;
      };

      this.assertInput = function(json, type, check, align) {
        const block = new Block();
        const input = block.inputFromJson_(json);
        switch (type) {
          case 'input_dummy':
            chai.assert.isTrue(block.appendDummyInput.calledOnce,
                'Expected a dummy input to be created.');
            break;
          case 'input_value':
            chai.assert.isTrue(block.appendValueInput.calledOnce,
                'Expected a value input to be created.');
            break;
          case 'input_statement':
            chai.assert.isTrue(block.appendStatementInput.calledOnce,
                'Expected a statement input to be created.');
            break;
          default:
            chai.assert.isNull(input, 'Expected input to be null');
            chai.assert.isTrue(block.appendDummyInput.notCalled,
                'Expected no input to be created');
            chai.assert.isTrue(block.appendValueInput.notCalled,
                'Expected no input to be created');
            chai.assert.isTrue(block.appendStatementInput.notCalled,
                'Expected no input to be created');
            return;
        }
        if (check) {
          chai.assert.isTrue(input.setCheck.calledWith(check),
              'Expected setCheck to be called with', check);
        } else {
          chai.assert.isTrue(input.setCheck.notCalled,
              'Expected setCheck to not be called');
        }
        if (align !== undefined) {
          chai.assert.isTrue(input.setAlign.calledWith(align),
              'Expected setAlign to be called with', align);
        } else {
          chai.assert.isTrue(input.setAlign.notCalled,
              'Expected setAlign to not be called');
        }
      };
    });

    test('Dummy', function() {
      this.assertInput(
          {
            'type': 'input_dummy',
          },
          'input_dummy');
    });

    test('Value', function() {
      this.assertInput(
          {
            'type': 'input_value',
          },
          'input_value');
    });

    test('Statement', function() {
      this.assertInput(
          {
            'type': 'input_statement',
          },
          'input_statement');
    });

    test('Bad input type', function() {
      this.assertInput(
          {
            'type': 'input_bad',
          },
          'input_bad');
    });

    test('String Check', function() {
      this.assertInput(
          {
            'type': 'input_dummy',
            'check': 'Integer',
          },
          'input_dummy',
          'Integer');
    });

    test('Array check', function() {
      this.assertInput(
          {
            'type': 'input_dummy',
            'check': ['Integer', 'Number'],
          },
          'input_dummy',
          ['Integer', 'Number']);
    });

    test('Empty check', function() {
      this.assertInput(
          {
            'type': 'input_dummy',
            'check': '',
          },
          'input_dummy');
    });

    test('Null check', function() {
      this.assertInput(
          {
            'type': 'input_dummy',
            'check': null,
          },
          'input_dummy');
    });

    test('"Left" align', function() {
      this.assertInput(
          {
            'type': 'input_dummy',
            'align': 'LEFT',
          },
          'input_dummy', undefined, Align.LEFT);
    });

    test('"Right" align', function() {
      this.assertInput(
          {
            'type': 'input_dummy',
            'align': 'RIGHT',
          },
          'input_dummy', undefined, Align.RIGHT);
    });

    test('"Center" align', function() {
      this.assertInput(
          {
            'type': 'input_dummy',
            'align': 'CENTER',
          },
          'input_dummy', undefined, Align.CENTRE);
    });

    test('"Centre" align', function() {
      this.assertInput(
          {
            'type': 'input_dummy',
            'align': 'CENTRE',
          },
          'input_dummy', undefined, Align.CENTRE);
    });
  });
});
