/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.require('Blockly.Dart');
goog.require('Blockly.JavaScript');
goog.require('Blockly.Lua');
goog.require('Blockly.PHP');
goog.require('Blockly.Python');

suite('Generator', function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = new Blockly.Workspace();
  });

  teardown(function() {
    sharedTestTeardown.call(this);
  });

  suite('prefix', function() {
    setup(function() {
      this.generator = new Blockly.Generator('INTERCAL');
    });

    test('Nothing', function() {
      chai.assert.equal(this.generator.prefixLines('', ''), '');
    });

    test('One word', function() {
      chai.assert.equal(this.generator.prefixLines('Hello', '@'), '@Hello') ;
    });

    test('One line', function() {
      chai.assert.equal(this.generator.prefixLines('Hello\n', '12'), '12Hello\n');
    });

    test('Two lines', function() {
      chai.assert.equal(this.generator.prefixLines('Hello\nWorld\n', '***'), '***Hello\n***World\n');
    });
  });

  suite('blockToCode', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([{
        "type": "stack_block",
        "message0": "",
        "previousStatement": null,
        "nextStatement": null
      },
      {
        "type": "row_block",
        "message0": "%1",
        "args0": [
          {
            "type": "input_value",
            "name": "INPUT"
          }
        ],
        "output": null,
        "nextStatement": null
      }]);
      var rowBlock = this.workspace.newBlock('row_block');
      var stackBlock = this.workspace.newBlock('stack_block');

      this.blockToCodeTest = function(
          generator, blockDisabled, opt_thisOnly,
          expectedCode, opt_message) {
        generator.row_block = function(_){return 'row_block';};
        generator.stack_block = function(_){return 'stack_block';};
        rowBlock.nextConnection.connect(stackBlock.previousConnection);
        rowBlock.disabled = blockDisabled;

        var code = generator.blockToCode(rowBlock, opt_thisOnly);
        chai.assert.equal(code, expectedCode, opt_message);
      };
    });

    var testCase = [
      [Blockly.Dart, 'Dart'],
      [Blockly.JavaScript, 'JavaScript'],
      [Blockly.Lua, 'Lua'],
      [Blockly.PHP, 'PHP'],
      [Blockly.Python, 'Python']];

    suite('Trivial', function() {
      testCase.forEach(function(testCase) {
        var generator = testCase[0];
        var name = testCase[1];
        test(name, function() {
          this.blockToCodeTest(generator, false, true, 'row_block');
          this.blockToCodeTest(
              generator, false, false, 'row_blockstack_block', 'thisOnly=false');
        });
      });
    });

    suite('Disabled block', function() {
      testCase.forEach(function(testCase) {
        var generator = testCase[0];
        var name = testCase[1];
        test(name, function() {
          this.blockToCodeTest(generator, true, true, '');
          this.blockToCodeTest(generator, true, false, 'stack_block', 'thisOnly=false');
        });
      });
    });

    suite('Nested block', function() {
      setup(function() {
        Blockly.defineBlocksWithJsonArray([{
          "type": "test_loop_block",
          "message0": "Repeat Loop",
          "message1": "%1",
          "args1": [{
            "type": "input_statement",
            "name": "DO"
          }],
          "previousStatement": null,
          "nextStatement": null
        }]);
        var blockA = this.workspace.newBlock('test_loop_block');
        var blockB = this.workspace.newBlock('test_loop_block');
        var blockC = this.workspace.newBlock('test_loop_block');
        this.loopTest = function(
            generator, opt_thisOnly, expectedCode, opt_message) {
          generator.test_loop_block = function(block){
            return '{' + generator.statementToCode(block, 'DO') + '}';
          };
          blockA.getInput('DO').connection.connect(blockB.previousConnection);
          blockA.nextConnection.connect(blockC.previousConnection);

          var code = generator.blockToCode(blockA, opt_thisOnly);
          chai.assert.equal(code, expectedCode, opt_message);
        };
      });

      testCase.forEach(function(testCase) {
        var generator = testCase[0];
        var name = testCase[1];
        test(name, function() {
          this.loopTest(generator, true, '{  {}}');
          this.loopTest(generator, false, '{  {}}{}', 'thisOnly=false');
        });
      });
    });
  });
});
