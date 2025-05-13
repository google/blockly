/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {assert} from '../../node_modules/chai/chai.js';
import {
  sharedTestSetup,
  sharedTestTeardown,
  workspaceTeardown,
} from './test_helpers/setup_teardown.js';

suite('Navigation', function () {
  setup(function () {
    sharedTestSetup.call(this);
    Blockly.defineBlocksWithJsonArray([
      {
        'type': 'input_statement',
        'message0': '%1 %2 %3 %4',
        'args0': [
          {
            'type': 'field_input',
            'name': 'NAME',
            'text': 'default',
          },
          {
            'type': 'field_input',
            'name': 'NAME',
            'text': 'default',
          },
          {
            'type': 'input_value',
            'name': 'NAME',
          },
          {
            'type': 'input_statement',
            'name': 'NAME',
          },
        ],
        'previousStatement': null,
        'nextStatement': null,
        'colour': 230,
        'tooltip': '',
        'helpUrl': '',
      },
      {
        'type': 'value_input',
        'message0': '%1',
        'args0': [
          {
            'type': 'input_value',
            'name': 'NAME',
          },
        ],
        'colour': 230,
        'tooltip': '',
        'helpUrl': '',
      },
      {
        'type': 'field_input',
        'message0': '%1',
        'args0': [
          {
            'type': 'field_input',
            'name': 'NAME',
            'text': 'default',
          },
        ],
        'output': null,
        'colour': 230,
        'tooltip': '',
        'helpUrl': '',
      },
    ]);
    this.workspace = Blockly.inject('blocklyDiv', {});
    this.navigator = this.workspace.getNavigator();
    const statementInput1 = this.workspace.newBlock('input_statement');
    const statementInput2 = this.workspace.newBlock('input_statement');
    const statementInput3 = this.workspace.newBlock('input_statement');
    const statementInput4 = this.workspace.newBlock('input_statement');
    const fieldWithOutput = this.workspace.newBlock('field_input');
    const valueInput = this.workspace.newBlock('value_input');

    statementInput1.nextConnection.connect(statementInput2.previousConnection);
    statementInput1.inputList[0].connection.connect(
      fieldWithOutput.outputConnection,
    );
    statementInput2.inputList[1].connection.connect(
      statementInput3.previousConnection,
    );

    this.blocks = {
      statementInput1: statementInput1,
      statementInput2: statementInput2,
      statementInput3: statementInput3,
      statementInput4: statementInput4,
      fieldWithOutput: fieldWithOutput,
      valueInput: valueInput,
    };
  });
  teardown(function () {
    sharedTestTeardown.call(this);
  });

  suite('NavigationFunctions', function () {
    setup(function () {
      Blockly.defineBlocksWithJsonArray([
        {
          'type': 'top_connection',
          'message0': '',
          'previousStatement': null,
          'colour': 230,
          'tooltip': '',
          'helpUrl': '',
        },
        {
          'type': 'start_block',
          'message0': '',
          'nextStatement': null,
          'colour': 230,
          'tooltip': '',
          'helpUrl': '',
        },
        {
          'type': 'fields_and_input',
          'message0': '%1 hi %2 %3 %4',
          'args0': [
            {
              'type': 'field_input',
              'name': 'NAME',
              'text': 'default',
            },
            {
              'type': 'input_dummy',
            },
            {
              'type': 'field_input',
              'name': 'NAME',
              'text': 'default',
            },
            {
              'type': 'input_value',
              'name': 'NAME',
            },
          ],
          'previousStatement': null,
          'nextStatement': null,
          'colour': 230,
          'tooltip': '',
          'helpUrl': '',
        },
        {
          'type': 'two_fields',
          'message0': '%1 hi',
          'args0': [
            {
              'type': 'field_input',
              'name': 'NAME',
              'text': 'default',
            },
          ],
          'colour': 230,
          'tooltip': '',
          'helpUrl': '',
        },
        {
          'type': 'fields_and_input2',
          'message0': '%1 %2 %3 %4 bye',
          'args0': [
            {
              'type': 'input_value',
              'name': 'NAME',
            },
            {
              'type': 'field_input',
              'name': 'NAME',
              'text': 'default',
            },
            {
              'type': 'input_value',
              'name': 'NAME',
            },
            {
              'type': 'input_statement',
              'name': 'NAME',
            },
          ],
          'colour': 230,
          'tooltip': '',
          'helpUrl': '',
        },
        {
          'type': 'dummy_input',
          'message0': 'Hello',
          'colour': 230,
          'tooltip': '',
          'helpUrl': '',
        },
        {
          'type': 'dummy_inputValue',
          'message0': 'Hello %1  %2',
          'args0': [
            {
              'type': 'input_dummy',
            },
            {
              'type': 'input_value',
              'name': 'NAME',
            },
          ],
          'colour': 230,
          'tooltip': '',
          'helpUrl': '',
        },
        {
          'type': 'output_next',
          'message0': '',
          'output': null,
          'colour': 230,
          'tooltip': '',
          'helpUrl': '',
          'nextStatement': null,
        },
      ]);
      const noNextConnection = this.workspace.newBlock('top_connection');
      const fieldAndInputs = this.workspace.newBlock('fields_and_input');
      const twoFields = this.workspace.newBlock('two_fields');
      const fieldAndInputs2 = this.workspace.newBlock('fields_and_input2');
      const noPrevConnection = this.workspace.newBlock('start_block');
      this.blocks.noNextConnection = noNextConnection;
      this.blocks.fieldAndInputs = fieldAndInputs;
      this.blocks.twoFields = twoFields;
      this.blocks.fieldAndInputs2 = fieldAndInputs2;
      this.blocks.noPrevConnection = noPrevConnection;

      const dummyInput = this.workspace.newBlock('dummy_input');
      const dummyInputValue = this.workspace.newBlock('dummy_inputValue');
      const fieldWithOutput2 = this.workspace.newBlock('field_input');
      this.blocks.dummyInput = dummyInput;
      this.blocks.dummyInputValue = dummyInputValue;
      this.blocks.fieldWithOutput2 = fieldWithOutput2;

      const secondBlock = this.workspace.newBlock('input_statement');
      const outputNextBlock = this.workspace.newBlock('output_next');
      this.blocks.secondBlock = secondBlock;
      this.blocks.outputNextBlock = outputNextBlock;
      this.workspace.cleanUp();
    });
    suite('Next', function () {
      setup(function () {
        this.singleBlockWorkspace = new Blockly.Workspace();
        const singleBlock = this.singleBlockWorkspace.newBlock('two_fields');
        this.blocks.singleBlock = singleBlock;
      });
      teardown(function () {
        workspaceTeardown.call(this, this.singleBlockWorkspace);
      });

      test('fromPreviousToBlock', function () {
        const prevConnection = this.blocks.statementInput1.previousConnection;
        const nextNode = this.navigator.getNextSibling(prevConnection);
        assert.equal(nextNode, this.blocks.statementInput1);
      });
      test('fromBlockToNextBlock', function () {
        const nextNode = this.navigator.getNextSibling(
          this.blocks.statementInput1,
        );
        assert.equal(nextNode, this.blocks.statementInput2);
      });
      test('fromNextToPrevious', function () {
        const nextConnection = this.blocks.statementInput1.nextConnection;
        const prevConnection = this.blocks.statementInput2.previousConnection;
        const nextNode = this.navigator.getNextSibling(nextConnection);
        assert.equal(nextNode, prevConnection);
      });
      test('fromInputToInput', function () {
        const input = this.blocks.statementInput1.inputList[0];
        const inputConnection =
          this.blocks.statementInput1.inputList[1].connection;
        const nextNode = this.navigator.getNextSibling(input.connection);
        assert.equal(nextNode, inputConnection);
      });
      test('fromInputToStatementInput', function () {
        const input = this.blocks.fieldAndInputs2.inputList[1];
        const inputConnection =
          this.blocks.fieldAndInputs2.inputList[2].connection;
        const nextNode = this.navigator.getNextSibling(input.connection);
        assert.equal(nextNode, inputConnection);
      });
      test('fromInputToField', function () {
        const input = this.blocks.fieldAndInputs2.inputList[0];
        const field = this.blocks.fieldAndInputs2.inputList[1].fieldRow[0];
        const nextNode = this.navigator.getNextSibling(input.connection);
        assert.equal(nextNode, field);
      });
      test('fromInputToNull', function () {
        const input = this.blocks.fieldAndInputs2.inputList[2];
        const nextNode = this.navigator.getNextSibling(input.connection);
        assert.isNull(nextNode);
      });
      test('fromOutputToBlock', function () {
        const output = this.blocks.fieldWithOutput.outputConnection;
        const nextNode = this.navigator.getNextSibling(output);
        assert.equal(nextNode, this.blocks.fieldWithOutput);
      });
      test('fromFieldToNestedBlock', function () {
        const field = this.blocks.statementInput1.inputList[0].fieldRow[1];
        const inputConnection =
          this.blocks.statementInput1.inputList[0].connection;
        const nextNode = this.navigator.getNextSibling(field);
        assert.equal(nextNode, this.blocks.fieldWithOutput);
      });
      test('fromFieldToField', function () {
        const field = this.blocks.fieldAndInputs.inputList[0].fieldRow[0];
        const field2 = this.blocks.fieldAndInputs.inputList[1].fieldRow[0];
        const nextNode = this.navigator.getNextSibling(field);
        assert.equal(nextNode, field2);
      });
      test('fromFieldToNull', function () {
        const field = this.blocks.twoFields.inputList[0].fieldRow[0];
        const nextNode = this.navigator.getNextSibling(field);
        assert.isNull(nextNode);
      });
    });

    suite('Previous', function () {
      test('fromPreviousToNext', function () {
        const prevConnection = this.blocks.statementInput2.previousConnection;
        const prevNode = this.navigator.getPreviousSibling(prevConnection);
        const nextConnection = this.blocks.statementInput1.nextConnection;
        assert.equal(prevNode, nextConnection);
      });
      test('fromPreviousToInput', function () {
        const prevConnection = this.blocks.statementInput3.previousConnection;
        const prevNode = this.navigator.getPreviousSibling(prevConnection);
        assert.isNull(prevNode);
      });
      test('fromBlockToPrevious', function () {
        const prevNode = this.navigator.getPreviousSibling(
          this.blocks.statementInput2,
        );
        const previousBlock = this.blocks.statementInput1;
        assert.equal(prevNode, previousBlock);
      });
      test('fromOutputBlockToPreviousField', function () {
        const prevNode = this.navigator.getPreviousSibling(
          this.blocks.fieldWithOutput,
        );
        const outputConnection = this.blocks.fieldWithOutput.outputConnection;
        assert.equal(prevNode, [...this.blocks.statementInput1.getFields()][1]);
      });
      test('fromNextToBlock', function () {
        const nextConnection = this.blocks.statementInput1.nextConnection;
        const prevNode = this.navigator.getPreviousSibling(nextConnection);
        assert.equal(prevNode, this.blocks.statementInput1);
      });
      test('fromInputToField', function () {
        const input = this.blocks.statementInput1.inputList[0];
        const prevNode = this.navigator.getPreviousSibling(input.connection);
        assert.equal(prevNode, input.fieldRow[1]);
      });
      test('fromInputToNull', function () {
        const input = this.blocks.fieldAndInputs2.inputList[0];
        const prevNode = this.navigator.getPreviousSibling(input.connection);
        assert.isNull(prevNode);
      });
      test('fromInputToInput', function () {
        const input = this.blocks.fieldAndInputs2.inputList[2];
        const inputConnection =
          this.blocks.fieldAndInputs2.inputList[1].connection;
        const prevNode = this.navigator.getPreviousSibling(input.connection);
        assert.equal(prevNode, inputConnection);
      });
      test('fromOutputToNull', function () {
        const output = this.blocks.fieldWithOutput.outputConnection;
        const prevNode = this.navigator.getPreviousSibling(output);
        assert.isNull(prevNode);
      });
      test('fromFieldToNull', function () {
        const field = this.blocks.statementInput1.inputList[0].fieldRow[0];
        const prevNode = this.navigator.getPreviousSibling(field);
        assert.isNull(prevNode);
      });
      test('fromFieldToInput', function () {
        const outputBlock = this.workspace.newBlock('field_input');
        this.blocks.fieldAndInputs2.inputList[0].connection.connect(
          outputBlock.outputConnection,
        );

        const field = this.blocks.fieldAndInputs2.inputList[1].fieldRow[0];
        const inputConnection =
          this.blocks.fieldAndInputs2.inputList[0].connection;
        const prevNode = this.navigator.getPreviousSibling(field);
        assert.equal(prevNode, outputBlock);
      });
      test('fromFieldToField', function () {
        const field = this.blocks.fieldAndInputs.inputList[1].fieldRow[0];
        const field2 = this.blocks.fieldAndInputs.inputList[0].fieldRow[0];
        const prevNode = this.navigator.getPreviousSibling(field);
        assert.equal(prevNode, field2);
      });
    });

    suite('In', function () {
      setup(function () {
        this.emptyWorkspace = Blockly.inject(document.createElement('div'), {});
      });
      teardown(function () {
        workspaceTeardown.call(this, this.emptyWorkspace);
      });

      test('fromInputToOutput', function () {
        const input = this.blocks.statementInput1.inputList[0];
        const inNode = this.navigator.getFirstChild(input.connection);
        const outputConnection = this.blocks.fieldWithOutput.outputConnection;
        assert.equal(inNode, outputConnection);
      });
      test('fromInputToNull', function () {
        const input = this.blocks.statementInput2.inputList[0];
        const inNode = this.navigator.getFirstChild(input.connection);
        assert.isNull(inNode);
      });
      test('fromInputToPrevious', function () {
        const input = this.blocks.statementInput2.inputList[1];
        const previousConnection =
          this.blocks.statementInput3.previousConnection;
        const inNode = this.navigator.getFirstChild(input.connection);
        assert.equal(inNode, previousConnection);
      });
      test('fromBlockToField', function () {
        const field = this.blocks.valueInput.getField('NAME');
        const inNode = this.navigator.getFirstChild(this.blocks.valueInput);
        assert.equal(inNode, field);
      });
      test('fromBlockToField', function () {
        const inNode = this.navigator.getFirstChild(
          this.blocks.statementInput1,
        );
        const field = this.blocks.statementInput1.inputList[0].fieldRow[0];
        assert.equal(inNode, field);
      });
      test('fromBlockToNull_DummyInput', function () {
        const inNode = this.navigator.getFirstChild(this.blocks.dummyInput);
        assert.isNull(inNode);
      });
      test('fromBlockToInput_DummyInputValue', function () {
        const inNode = this.navigator.getFirstChild(
          this.blocks.dummyInputValue,
        );
        assert.equal(inNode, null);
      });
      test('fromOuputToNull', function () {
        const output = this.blocks.fieldWithOutput.outputConnection;
        const inNode = this.navigator.getFirstChild(output);
        assert.isNull(inNode);
      });
      test('fromFieldToNull', function () {
        const field = this.blocks.statementInput1.inputList[0].fieldRow[0];
        const inNode = this.navigator.getFirstChild(field);
        assert.isNull(inNode);
      });
      test('fromWorkspaceToBlock', function () {
        const inNode = this.navigator.getFirstChild(this.workspace);
        assert.equal(inNode, this.workspace.getTopBlocks(true)[0]);
      });
      test('fromWorkspaceToNull', function () {
        const inNode = this.navigator.getFirstChild(this.emptyWorkspace);
        assert.isNull(inNode);
      });
    });

    suite('Out', function () {
      setup(function () {
        const secondBlock = this.blocks.secondBlock;
        const outputNextBlock = this.blocks.outputNextBlock;
        this.blocks.noPrevConnection.nextConnection.connect(
          secondBlock.previousConnection,
        );
        secondBlock.inputList[0].connection.connect(
          outputNextBlock.outputConnection,
        );
      });

      test('fromInputToBlock', function () {
        const input = this.blocks.statementInput1.inputList[0];
        const outNode = this.navigator.getParent(input.connection);
        assert.equal(outNode, this.blocks.statementInput1);
      });
      test('fromOutputToInput', function () {
        const output = this.blocks.fieldWithOutput.outputConnection;
        const outNode = this.navigator.getParent(output);
        assert.equal(
          outNode,
          this.blocks.statementInput1.inputList[0].connection,
        );
      });
      test('fromOutputToBlock', function () {
        const output = this.blocks.fieldWithOutput2.outputConnection;
        const outNode = this.navigator.getParent(output);
        assert.equal(outNode, this.blocks.fieldWithOutput2);
      });
      test('fromFieldToBlock', function () {
        const field = this.blocks.statementInput1.inputList[0].fieldRow[0];
        const outNode = this.navigator.getParent(field);
        assert.equal(outNode, this.blocks.statementInput1);
      });
      test('fromPreviousToInput', function () {
        const previous = this.blocks.statementInput3.previousConnection;
        const inputConnection =
          this.blocks.statementInput2.inputList[1].connection;
        const outNode = this.navigator.getParent(previous);
        assert.equal(outNode, inputConnection);
      });
      test('fromPreviousToBlock', function () {
        const previous = this.blocks.statementInput2.previousConnection;
        const outNode = this.navigator.getParent(previous);
        assert.equal(outNode, this.blocks.statementInput1);
      });
      test('fromNextToInput', function () {
        const next = this.blocks.statementInput3.nextConnection;
        const inputConnection =
          this.blocks.statementInput2.inputList[1].connection;
        const outNode = this.navigator.getParent(next);
        assert.equal(outNode, inputConnection);
      });
      test('fromNextToBlock', function () {
        const next = this.blocks.statementInput2.nextConnection;
        const outNode = this.navigator.getParent(next);
        assert.equal(outNode, this.blocks.statementInput1);
      });
      test('fromNextToBlock_NoPreviousConnection', function () {
        const next = this.blocks.secondBlock.nextConnection;
        const outNode = this.navigator.getParent(next);
        assert.equal(outNode, this.blocks.noPrevConnection);
      });
      /**
       * This is where there is a block with both an output connection and a
       * next connection attached to an input.
       */
      test('fromNextToInput_OutputAndPreviousConnection', function () {
        const next = this.blocks.outputNextBlock.nextConnection;
        const outNode = this.navigator.getParent(next);
        assert.equal(outNode, this.blocks.secondBlock.inputList[0].connection);
      });
      test('fromBlockToWorkspace', function () {
        const outNode = this.navigator.getParent(this.blocks.statementInput2);
        assert.equal(outNode, this.workspace);
      });
      test('fromBlockToEnclosingStatement', function () {
        const enclosingStatement = this.blocks.statementInput2;
        const outNode = this.navigator.getParent(this.blocks.statementInput3);
        assert.equal(outNode, enclosingStatement);
      });
      test('fromTopBlockToWorkspace', function () {
        const outNode = this.navigator.getParent(this.blocks.statementInput1);
        assert.equal(outNode, this.workspace);
      });
      test('fromOutputBlockToWorkspace', function () {
        const outNode = this.navigator.getParent(this.blocks.fieldWithOutput2);
        assert.equal(outNode, this.workspace);
      });
      test('fromOutputNextBlockToWorkspace', function () {
        const inputConnection = this.blocks.secondBlock;
        const outNode = this.navigator.getParent(this.blocks.outputNextBlock);
        assert.equal(outNode, inputConnection);
      });
    });
  });
});
