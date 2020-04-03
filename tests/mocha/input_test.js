/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Inputs', function() {
  setup(function() {
    Blockly.defineBlocksWithJsonArray([
      {
        "type": "empty_block",
        "message0": "",
        "args0": []
      },
    ]);

    this.workspace = Blockly.inject('blocklyDiv');
    this.block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
        '<block type="empty_block"/>'
    ), this.workspace);

    this.renderStub = sinon.stub(this.block, 'render');
    this.bumpNeighboursStub = sinon.stub(this.block, 'bumpNeighbours');

    this.dummy = this.block.appendDummyInput('DUMMY');
    this.value = this.block.appendValueInput('VALUE');
    this.statement = this.block.appendStatementInput('STATEMENT');

    this.renderStub.resetHistory();
    this.bumpNeighboursStub.resetHistory();
  });
  teardown(function() {
    this.renderStub.restore();
    this.bumpNeighboursStub.restore();

    delete Blockly.Blocks['empty_block'];
    this.workspace.dispose();
  });
  suite('Insert Field At', function() {
    suite('Index Bounds', function() {
      test('< 0', function() {
        var field = new Blockly.FieldLabel('field');
        chai.assert.throws(function() {
          this.dummy.insertFieldAt(-1, field);
        });
      });
      test('> length', function() {
        var field = new Blockly.FieldLabel('field');
        chai.assert.throws(function() {
          this.dummy.insertFieldAt(1, field);
        });
      });
    });
    suite('Values', function() {
      // We're mostly just testing that it doesn't throw errors.
      test('Field', function() {
        var field = new Blockly.FieldLabel('field');
        this.dummy.insertFieldAt(0, field);
        chai.assert.equal(this.dummy.fieldRow[0], field);
      });
      test('String', function() {
        this.dummy.insertFieldAt(0, 'field');
        chai.assert.instanceOf(this.dummy.fieldRow[0], Blockly.FieldLabel);
      });
      test('Empty String', function() {
        this.dummy.insertFieldAt(0, '');
        chai.assert.isEmpty(this.dummy.fieldRow);
      });
      test('Empty String W/ Name', function() {
        this.dummy.insertFieldAt(0, '', 'NAME');
        chai.assert.instanceOf(this.dummy.fieldRow[0], Blockly.FieldLabel);
      });
      test('Null', function() {
        this.dummy.insertFieldAt(0, null);
        chai.assert.isEmpty(this.dummy.fieldRow);
      });
      test('Undefined', function() {
        this.dummy.insertFieldAt(0, undefined);
        chai.assert.isEmpty(this.dummy.fieldRow);
      });
    });
    suite('Prefixes and Suffixes', function() {
      test('Prefix', function() {
        var field = new Blockly.FieldLabel('field');
        var prefix = new Blockly.FieldLabel('prefix');
        field.prefixField = prefix;

        this.dummy.appendField(field);
        chai.assert.deepEqual(this.dummy.fieldRow, [prefix, field]);
      });
      test('Suffix', function() {
        var field = new Blockly.FieldLabel('field');
        var suffix = new Blockly.FieldLabel('suffix');
        field.suffixField = suffix;

        this.dummy.appendField(field);
        chai.assert.deepEqual(this.dummy.fieldRow, [field, suffix]);
      });
      test('Prefix and Suffix', function() {
        var field = new Blockly.FieldLabel('field');
        var prefix = new Blockly.FieldLabel('prefix');
        var suffix = new Blockly.FieldLabel('suffix');
        field.prefixField = prefix;
        field.suffixField = suffix;

        this.dummy.appendField(field);
        chai.assert.deepEqual(this.dummy.fieldRow, [prefix, field, suffix]);
      });
      test('Dropdown - Prefix', function() {
        var field = new Blockly.FieldDropdown(
            [
              ['prefix option1', 'OPTION1'],
              ['prefix option2', 'OPTION2']
            ]
        );

        this.dummy.appendField(field);
        chai.assert.equal(this.dummy.fieldRow.length, 2);
      });
      test('Dropdown - Suffix', function() {
        var field = new Blockly.FieldDropdown(
            [
              ['option1 suffix', 'OPTION1'],
              ['option2 suffix', 'OPTION2']
            ]
        );

        this.dummy.appendField(field);
        chai.assert.equal(this.dummy.fieldRow.length, 2);
      });
      test('Dropdown - Prefix and Suffix', function() {
        var field = new Blockly.FieldDropdown(
            [
              ['prefix option1 suffix', 'OPTION1'],
              ['prefix option2 suffix', 'OPTION2']
            ]
        );

        this.dummy.appendField(field);
        chai.assert.equal(this.dummy.fieldRow.length, 3);
      });
    });
    suite('Field Initialization', function() {
      test('Rendered', function() {
        var field = new Blockly.FieldLabel('field');
        var setBlockSpy = sinon.spy(field, 'setSourceBlock');
        var initSpy = sinon.spy(field, 'init');

        this.dummy.insertFieldAt(0, field);
        chai.assert(setBlockSpy.calledOnce);
        chai.assert.equal(setBlockSpy.getCall(0).args[0], this.block);
        chai.assert(initSpy.calledOnce);
        console.log(this.renderStub.callCount);
        chai.assert(this.renderStub.calledOnce);
        chai.assert(this.bumpNeighboursStub.calledOnce);

        setBlockSpy.restore();
        initSpy.restore();
      });
      // TODO: InsertFieldAt does not properly handle initialization in
      //  headless mode.
      test.skip('Headless', function() {
        var field = new Blockly.FieldLabel('field');
        var setBlockSpy = sinon.spy(field, 'setSourceBlock');
        var initModelSpy = sinon.spy(field, 'initModel');

        this.block.rendered = false;

        this.dummy.insertFieldAt(0, field);
        chai.assert(setBlockSpy.calledOnce);
        chai.assert.equal(setBlockSpy.getCall(0).args[0], this.block);
        chai.assert(initModelSpy.calledOnce);
        chai.assert(this.renderStub.notCalled);
        chai.assert(this.bumpNeighboursStub.notCalled);

        setBlockSpy.restore();
        initModelSpy.restore();
      });
    });
  });
  suite('Remove Field', function() {
    test('Field Not Found', function() {
      chai.assert.throws(function() {
        this.dummy.removeField('FIELD');
      });
    });
    test('Rendered', function() {
      var field = new Blockly.FieldLabel('field');
      var disposeSpy = sinon.spy(field, 'dispose');
      this.dummy.appendField(field, 'FIELD');

      this.renderStub.resetHistory();
      this.bumpNeighboursStub.resetHistory();

      this.dummy.removeField('FIELD');
      chai.assert(disposeSpy.calledOnce);
      chai.assert(this.renderStub.calledOnce);
      chai.assert(this.bumpNeighboursStub.calledOnce);
    });
    test('Headless', function() {
      var field = new Blockly.FieldLabel('field');
      var disposeSpy = sinon.spy(field, 'dispose');
      this.dummy.appendField(field, 'FIELD');

      this.renderStub.resetHistory();
      this.bumpNeighboursStub.resetHistory();

      this.block.rendered = false;

      this.dummy.removeField('FIELD');
      chai.assert(disposeSpy.calledOnce);
      chai.assert(this.renderStub.notCalled);
      chai.assert(this.bumpNeighboursStub.notCalled);
    });
  });
  suite('Field Ordering/Manipulation', function() {
    setup(function() {
      this.a = new Blockly.FieldLabel('a');
      this.b = new Blockly.FieldLabel('b');
      this.c = new Blockly.FieldLabel('c');
    });
    test('Append A, B, C', function() {
      this.dummy.appendField(this.a, 'A');
      this.dummy.appendField(this.b, 'B');
      this.dummy.appendField(this.c, 'C');

      chai.assert.deepEqual(this.dummy.fieldRow, [this.a, this.b, this.c]);
    });
    test('Append B, C; Insert A at Start', function() {
      this.dummy.appendField(this.b, 'B');
      this.dummy.appendField(this.c, 'C');
      this.dummy.insertFieldAt(0, this.a, 'A');

      chai.assert.deepEqual(this.dummy.fieldRow, [this.a, this.b, this.c]);
    });
    test('Append A, C; Insert B Between', function() {
      this.dummy.appendField(this.a, 'A');
      this.dummy.appendField(this.c, 'C');
      this.dummy.insertFieldAt(1, this.b, 'B');

      chai.assert.deepEqual(this.dummy.fieldRow, [this.a, this.b, this.c]);
    });
    test('Append A, B; Insert C at End', function() {
      this.dummy.appendField(this.a, 'A');
      this.dummy.appendField(this.b, 'B');
      this.dummy.insertFieldAt(2, this.c, 'C');

      chai.assert.deepEqual(this.dummy.fieldRow, [this.a, this.b, this.c]);
    });
    test('Append A, B, C; Remove A, B, C', function() {
      this.dummy.appendField(this.a, 'A');
      this.dummy.appendField(this.b, 'B');
      this.dummy.appendField(this.c, 'C');

      this.dummy.removeField('A');
      this.dummy.removeField('B');
      this.dummy.removeField('C');

      chai.assert.isEmpty(this.dummy.fieldRow);
    });
    test('Append A, B, C; Remove A', function() {
      this.dummy.appendField(this.a, 'A');
      this.dummy.appendField(this.b, 'B');
      this.dummy.appendField(this.c, 'C');

      this.dummy.removeField('A');

      chai.assert.deepEqual(this.dummy.fieldRow, [this.b, this.c]);
    });
    test('Append A, B, C; Remove B', function() {
      this.dummy.appendField(this.a, 'A');
      this.dummy.appendField(this.b, 'B');
      this.dummy.appendField(this.c, 'C');

      this.dummy.removeField('B');

      chai.assert.deepEqual(this.dummy.fieldRow, [this.a, this.c]);
    });
    test('Append A, B, C; Remove C', function() {
      this.dummy.appendField(this.a, 'A');
      this.dummy.appendField(this.b, 'B');
      this.dummy.appendField(this.c, 'C');

      this.dummy.removeField('C');

      chai.assert.deepEqual(this.dummy.fieldRow, [this.a, this.b]);
    });
    test('Append A, B; Remove A; Append C', function() {
      this.dummy.appendField(this.a, 'A');
      this.dummy.appendField(this.b, 'B');
      this.dummy.removeField('A');
      this.dummy.appendField(this.c, 'C');

      chai.assert.deepEqual(this.dummy.fieldRow, [this.b, this.c]);
    });
  });
});
