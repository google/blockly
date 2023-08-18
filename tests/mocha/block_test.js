/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {ConnectionType} from '../../build/src/core/connection_type.js';
import {createDeprecationWarningStub} from './test_helpers/warnings.js';
import {createRenderedBlock} from './test_helpers/block_definitions.js';
import * as eventUtils from '../../build/src/core/events/utils.js';
import {EndRowInput} from '../../build/src/core/inputs/end_row_input.js';
import {
  sharedTestSetup,
  sharedTestTeardown,
  workspaceTeardown,
} from './test_helpers/setup_teardown.js';
import {
  createChangeListenerSpy,
  createMockEvent,
} from './test_helpers/events.js';
import {MockIcon, MockBubbleIcon} from './test_helpers/icon_mocks.js';

suite('Blocks', function () {
  setup(function () {
    this.clock = sharedTestSetup.call(this, {fireEventsNow: false}).clock;
    this.workspace = new Blockly.Workspace();
    Blockly.defineBlocksWithJsonArray([
      {
        'type': 'empty_block',
        'message0': '',
      },
      {
        'type': 'stack_block',
        'message0': '',
        'previousStatement': null,
        'nextStatement': null,
      },
      {
        'type': 'row_block',
        'message0': '%1',
        'args0': [
          {
            'type': 'input_value',
            'name': 'INPUT',
          },
        ],
        'output': null,
      },
      {
        'type': 'statement_block',
        'message0': '%1',
        'args0': [
          {
            'type': 'input_statement',
            'name': 'STATEMENT',
          },
        ],
        'previousStatement': null,
        'nextStatement': null,
      },
    ]);
  });

  teardown(function () {
    sharedTestTeardown.call(this);
  });

  function createTestBlocks(workspace, isRow) {
    const blockType = isRow ? 'row_block' : 'stack_block';
    const blockA = workspace.newBlock(blockType);
    const blockB = workspace.newBlock(blockType);
    const blockC = workspace.newBlock(blockType);

    if (isRow) {
      blockA.inputList[0].connection.connect(blockB.outputConnection);
      blockB.inputList[0].connection.connect(blockC.outputConnection);
    } else {
      blockA.nextConnection.connect(blockB.previousConnection);
      blockB.nextConnection.connect(blockC.previousConnection);
    }

    chai.assert.equal(blockC.getParent(), blockB);

    return {
      A: blockA /* Parent */,
      B: blockB /* Middle */,
      C: blockC /* Child */,
    };
  }

  suite('Unplug', function () {
    function assertUnpluggedNoheal(blocks) {
      // A has nothing connected to it.
      chai.assert.equal(blocks.A.getChildren().length, 0);
      // B and C are still connected.
      chai.assert.equal(blocks.C.getParent(), blocks.B);
      // B is the top of its stack.
      chai.assert.isNull(blocks.B.getParent());
    }
    function assertUnpluggedHealed(blocks) {
      // A and C are connected.
      chai.assert.equal(blocks.A.getChildren().length, 1);
      chai.assert.equal(blocks.C.getParent(), blocks.A);
      // B has nothing connected to it.
      chai.assert.equal(blocks.B.getChildren().length, 0);
      // B is the top of its stack.
      chai.assert.isNull(blocks.B.getParent());
    }
    function assertUnpluggedHealFailed(blocks) {
      // A has nothing connected to it.
      chai.assert.equal(blocks.A.getChildren().length, 0);
      // B has nothing connected to it.
      chai.assert.equal(blocks.B.getChildren().length, 0);
      // B is the top of its stack.
      chai.assert.isNull(blocks.B.getParent());
      // C is the top of its stack.
      chai.assert.isNull(blocks.C.getParent());
    }

    suite('Row', function () {
      setup(function () {
        this.blocks = createTestBlocks(this.workspace, true);
      });

      test("Don't heal", function () {
        this.blocks.B.unplug(false);
        assertUnpluggedNoheal(this.blocks);
      });
      test('Heal', function () {
        this.blocks.B.unplug(true);
        // Each block has only one input, and the types work.
        assertUnpluggedHealed(this.blocks);
      });
      test('Heal with bad checks', function () {
        const blocks = this.blocks;

        // A and C can't connect, but both can connect to B.
        blocks.A.inputList[0].connection.setCheck('type1');
        blocks.C.outputConnection.setCheck('type2');

        // Each block has only one input, but the types don't work.
        blocks.B.unplug(true);
        assertUnpluggedHealFailed(blocks);
      });
      test('Parent has multiple inputs', function () {
        const blocks = this.blocks;
        // Add extra input to parent
        blocks.A.appendValueInput('INPUT').setCheck(null);
        blocks.B.unplug(true);
        assertUnpluggedHealed(blocks);
      });
      test('Middle has multiple inputs', function () {
        const blocks = this.blocks;
        // Add extra input to middle block
        blocks.B.appendValueInput('INPUT').setCheck(null);
        blocks.B.unplug(true);
        assertUnpluggedHealed(blocks);
      });
      test('Child has multiple inputs', function () {
        const blocks = this.blocks;
        // Add extra input to child block
        blocks.C.appendValueInput('INPUT').setCheck(null);
        // Child block input count doesn't matter.
        blocks.B.unplug(true);
        assertUnpluggedHealed(blocks);
      });
      test('Child is shadow', function () {
        const blocks = this.blocks;
        blocks.C.setShadow(true);
        blocks.B.unplug(true);
        // Even though we're asking to heal, it will appear as if it has not
        // healed because shadows always stay with the parent.
        assertUnpluggedNoheal(blocks);
      });
    });
    suite('Stack', function () {
      setup(function () {
        this.blocks = createTestBlocks(this.workspace, false);
      });

      test("Don't heal", function () {
        this.blocks.B.unplug();
        assertUnpluggedNoheal(this.blocks);
      });
      test('Heal', function () {
        this.blocks.B.unplug(true);
        assertUnpluggedHealed(this.blocks);
      });
      test('Heal with bad checks', function () {
        const blocks = this.blocks;
        // A and C can't connect, but both can connect to B.
        blocks.A.nextConnection.setCheck('type1');
        blocks.C.previousConnection.setCheck('type2');

        // The types don't work.
        blocks.B.unplug(true);

        assertUnpluggedHealFailed(blocks);
      });
      test('Child is shadow', function () {
        const blocks = this.blocks;
        blocks.C.setShadow(true);
        blocks.B.unplug(true);
        // Even though we're asking to heal, it will appear as if it has not
        // healed because shadows always stay with the parent.
        assertUnpluggedNoheal(blocks);
      });
    });
  });

  suite('Disposal', function () {
    suite('calling destroy', function () {
      setup(function () {
        Blockly.Blocks['destroyable_block'] = {
          init: function () {
            this.appendStatementInput('STATEMENT');
            this.setPreviousStatement(true);
            this.setNextStatement(true);
          },
          destroy: function () {},
        };
        this.block = this.workspace.newBlock('destroyable_block');
      });

      teardown(function () {
        delete Blockly.Blocks['destroyable_block'];
      });

      test('destroy is called', function () {
        const spy = sinon.spy(this.block, 'destroy');

        this.block.dispose();

        chai.assert.isTrue(spy.calledOnce, 'Expected destroy to be called.');
      });

      test('disposing is set before destroy', function () {
        let disposing = null;
        this.block.destroy = function () {
          disposing = this.disposing;
        };

        this.block.dispose();

        chai.assert.isTrue(
          disposing,
          'Expected disposing to be set to true before destroy is called.',
        );
      });

      test('disposed is not set before destroy', function () {
        let disposed = null;
        this.block.destroy = function () {
          disposed = this.disposed;
        };

        this.block.dispose();

        chai.assert.isFalse(
          disposed,
          'Expected disposed to be false when destroy is called',
        );
      });

      test('events can be fired from destroy', function () {
        const mockEvent = createMockEvent(this.workspace);
        this.block.destroy = function () {
          Blockly.Events.fire(mockEvent);
        };
        const spy = createChangeListenerSpy(this.workspace);

        this.block.dispose();
        this.clock.runAll();

        chai.assert.isTrue(
          spy.calledWith(mockEvent),
          'Expected to be able to fire events from destroy',
        );
      });

      test('child blocks can fire events from destroy', function () {
        const mockEvent = createMockEvent(this.workspace);
        const childBlock = this.workspace.newBlock('destroyable_block');
        this.block
          .getInput('STATEMENT')
          .connection.connect(childBlock.previousConnection);
        childBlock.destroy = function () {
          Blockly.Events.fire(mockEvent);
        };
        const spy = createChangeListenerSpy(this.workspace);

        this.block.dispose();
        this.clock.runAll();

        chai.assert.isTrue(
          spy.calledWith(mockEvent),
          'Expected to be able to fire events from destroy',
        );
      });
    });

    suite('stack/row healing', function () {
      function assertDisposedNoheal(blocks) {
        chai.assert.isFalse(blocks.A.disposed);
        // A has nothing connected to it.
        chai.assert.equal(blocks.A.getChildren().length, 0);
        // B is disposed.
        chai.assert.isTrue(blocks.B.disposed);
        // And C is disposed.
        chai.assert.isTrue(blocks.C.disposed);
      }

      function assertDisposedHealed(blocks) {
        chai.assert.isFalse(blocks.A.disposed);
        chai.assert.isFalse(blocks.C.disposed);
        // A and C are connected.
        chai.assert.equal(blocks.A.getChildren().length, 1);
        chai.assert.equal(blocks.C.getParent(), blocks.A);
        // B is disposed.
        chai.assert.isTrue(blocks.B.disposed);
      }

      function assertDisposedHealFailed(blocks) {
        chai.assert.isFalse(blocks.A.disposed);
        chai.assert.isFalse(blocks.C.disposed);
        // A has nothing connected to it.
        chai.assert.equal(blocks.A.getChildren().length, 0);
        // B is disposed.
        chai.assert.isTrue(blocks.B.disposed);
        // C is the top of its stack.
        chai.assert.isNull(blocks.C.getParent());
      }

      suite('Row', function () {
        setup(function () {
          this.blocks = createTestBlocks(this.workspace, true);
        });

        test("Don't heal", function () {
          this.blocks.B.dispose(false);
          assertDisposedNoheal(this.blocks);
        });

        test('Heal', function () {
          this.blocks.B.dispose(true);
          // Each block has only one input, and the types work.
          assertDisposedHealed(this.blocks);
        });

        test('Heal with bad checks', function () {
          const blocks = this.blocks;

          // A and C can't connect, but both can connect to B.
          blocks.A.inputList[0].connection.setCheck('type1');
          blocks.C.outputConnection.setCheck('type2');

          // Each block has only one input, but the types don't work.
          blocks.B.dispose(true);
          assertDisposedHealFailed(blocks);
        });

        test('Parent has multiple inputs', function () {
          const blocks = this.blocks;
          // Add extra input to parent
          blocks.A.appendValueInput('INPUT').setCheck(null);
          blocks.B.dispose(true);
          assertDisposedHealed(blocks);
        });

        test('Middle has multiple inputs', function () {
          const blocks = this.blocks;
          // Add extra input to middle block
          blocks.B.appendValueInput('INPUT').setCheck(null);
          blocks.B.dispose(true);
          assertDisposedHealed(blocks);
        });

        test('Child has multiple inputs', function () {
          const blocks = this.blocks;
          // Add extra input to child block
          blocks.C.appendValueInput('INPUT').setCheck(null);
          // Child block input count doesn't matter.
          blocks.B.dispose(true);
          assertDisposedHealed(blocks);
        });

        test('Child is shadow', function () {
          const blocks = this.blocks;
          blocks.C.setShadow(true);
          blocks.B.dispose(true);
          // Even though we're asking to heal, it will appear as if it has not
          // healed because shadows always get destroyed.
          assertDisposedNoheal(blocks);
        });
      });

      suite('Stack', function () {
        setup(function () {
          this.blocks = createTestBlocks(this.workspace, false);
        });

        test("Don't heal", function () {
          this.blocks.B.dispose();
          assertDisposedNoheal(this.blocks);
        });

        test('Heal', function () {
          this.blocks.B.dispose(true);
          assertDisposedHealed(this.blocks);
        });

        test('Heal with bad checks', function () {
          const blocks = this.blocks;
          // A and C can't connect, but both can connect to B.
          blocks.A.nextConnection.setCheck('type1');
          blocks.C.previousConnection.setCheck('type2');

          // The types don't work.
          blocks.B.dispose(true);

          assertDisposedHealFailed(blocks);
        });

        test('Child is shadow', function () {
          const blocks = this.blocks;
          blocks.C.setShadow(true);
          blocks.B.dispose(true);
          // Even though we're asking to heal, it will appear as if it has not
          // healed because shadows always get destroyed.
          assertDisposedNoheal(blocks);
        });
      });
    });
  });

  suite('Remove Input', function () {
    setup(function () {
      Blockly.defineBlocksWithJsonArray([
        {
          'type': 'value_block',
          'message0': '%1',
          'args0': [
            {
              'type': 'input_value',
              'name': 'VALUE',
            },
          ],
        },
      ]);
    });

    suite('Value', function () {
      setup(function () {
        this.blockA = this.workspace.newBlock('value_block');
      });

      test('No Connected', function () {
        this.blockA.removeInput('VALUE');
        chai.assert.isNull(this.blockA.getInput('VALUE'));
      });
      test('Block Connected', function () {
        const blockB = this.workspace.newBlock('row_block');
        this.blockA
          .getInput('VALUE')
          .connection.connect(blockB.outputConnection);

        this.blockA.removeInput('VALUE');
        chai.assert.isFalse(blockB.disposed);
        chai.assert.equal(this.blockA.getChildren().length, 0);
      });
      test('Shadow Connected', function () {
        const blockB = this.workspace.newBlock('row_block');
        blockB.setShadow(true);
        this.blockA
          .getInput('VALUE')
          .connection.connect(blockB.outputConnection);

        this.blockA.removeInput('VALUE');
        chai.assert.isTrue(blockB.disposed);
        chai.assert.equal(this.blockA.getChildren().length, 0);
      });
    });
    suite('Statement', function () {
      setup(function () {
        this.blockA = this.workspace.newBlock('statement_block');
      });

      test('No Connected', function () {
        this.blockA.removeInput('STATEMENT');
        chai.assert.isNull(this.blockA.getInput('STATEMENT'));
      });
      test('Block Connected', function () {
        const blockB = this.workspace.newBlock('stack_block');
        this.blockA
          .getInput('STATEMENT')
          .connection.connect(blockB.previousConnection);

        this.blockA.removeInput('STATEMENT');
        chai.assert.isFalse(blockB.disposed);
        chai.assert.equal(this.blockA.getChildren().length, 0);
      });
      test('Shadow Connected', function () {
        const blockB = this.workspace.newBlock('stack_block');
        blockB.setShadow(true);
        this.blockA
          .getInput('STATEMENT')
          .connection.connect(blockB.previousConnection);

        this.blockA.removeInput('STATEMENT');
        chai.assert.isTrue(blockB.disposed);
        chai.assert.equal(this.blockA.getChildren().length, 0);
      });
    });
  });

  suite('Connection Tracking', function () {
    setup(function () {
      this.workspace = Blockly.inject('blocklyDiv');

      this.getInputs = function () {
        return this.workspace.connectionDBList[ConnectionType.INPUT_VALUE]
          .connections;
      };
      this.getOutputs = function () {
        return this.workspace.connectionDBList[ConnectionType.OUTPUT_VALUE]
          .connections;
      };
      this.getNext = function () {
        return this.workspace.connectionDBList[ConnectionType.NEXT_STATEMENT]
          .connections;
      };
      this.getPrevious = function () {
        return this.workspace.connectionDBList[
          ConnectionType.PREVIOUS_STATEMENT
        ].connections;
      };

      this.assertConnectionsEmpty = function () {
        chai.assert.isEmpty(this.getInputs());
        chai.assert.isEmpty(this.getOutputs());
        chai.assert.isEmpty(this.getNext());
        chai.assert.isEmpty(this.getPrevious());
      };
    });
    teardown(function () {
      workspaceTeardown.call(this, this.workspace);
    });

    suite('Deserialization', function () {
      setup(function () {
        this.deserializationHelper = function (text) {
          const dom = Blockly.utils.xml.textToDom(text);
          Blockly.Xml.appendDomToWorkspace(dom, this.workspace);
          this.assertConnectionsEmpty();
          this.clock.runAll();
        };
      });
      test('Stack', function () {
        this.deserializationHelper(
          '<xml>' + '  <block type="stack_block"/>' + '</xml>',
        );
        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 1);
      });
      test('Multi-Stack', function () {
        this.deserializationHelper(
          '<xml>' +
            '  <block type="stack_block">' +
            '    <next>' +
            '      <block type="stack_block">' +
            '        <next>' +
            '          <block type="stack_block"/>' +
            '        </next>' +
            '      </block>' +
            '    </next>' +
            '  </block>' +
            '</xml>',
        );
        chai.assert.equal(this.getPrevious().length, 3);
        chai.assert.equal(this.getNext().length, 3);
      });
      test('Collapsed Stack', function () {
        this.deserializationHelper(
          '<xml>' + '  <block type="stack_block" collapsed="true"/>' + '</xml>',
        );
        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 1);
      });
      test('Collapsed Multi-Stack', function () {
        this.deserializationHelper(
          '<xml>' +
            '  <block type="stack_block" collapsed="true">' +
            '    <next>' +
            '      <block type="stack_block" collapsed="true">' +
            '        <next>' +
            '          <block type="stack_block" collapsed="true"/>' +
            '        </next>' +
            '      </block>' +
            '    </next>' +
            '  </block>' +
            '</xml>',
        );
        chai.assert.equal(this.getPrevious().length, 3);
        chai.assert.equal(this.getNext().length, 3);
      });
      test('Row', function () {
        this.deserializationHelper(
          '<xml>' + '  <block type="row_block"/>' + '</xml>',
        );
        chai.assert.equal(this.getOutputs().length, 1);
        chai.assert.equal(this.getInputs().length, 1);
      });
      test('Multi-Row', function () {
        this.deserializationHelper(
          '<xml>' +
            '  <block type="row_block">' +
            '    <value name="INPUT">' +
            '      <block type="row_block">' +
            '        <value name="INPUT">' +
            '          <block type="row_block"/>' +
            '        </value>' +
            '      </block>' +
            '    </value>' +
            '  </block>' +
            '</xml>',
        );
        chai.assert.equal(this.getOutputs().length, 3);
        chai.assert.equal(this.getInputs().length, 3);
      });
      test('Collapsed Row', function () {
        this.deserializationHelper(
          '<xml>' + '  <block type="row_block" collapsed="true"/>' + '</xml>',
        );
        chai.assert.equal(this.getOutputs().length, 1);
        chai.assert.equal(this.getInputs().length, 0);
      });
      test('Collapsed Multi-Row', function () {
        this.deserializationHelper(
          '<xml>' +
            '  <block type="row_block" collapsed="true">' +
            '    <value name="INPUT">' +
            '      <block type="row_block">' +
            '        <value name="INPUT">' +
            '          <block type="row_block"/>' +
            '        </value>' +
            '      </block>' +
            '    </value>' +
            '  </block>' +
            '</xml>',
        );
        chai.assert.equal(this.getOutputs().length, 1);
        chai.assert.equal(this.getInputs().length, 0);
      });
      test('Collapsed Multi-Row Middle', function () {
        Blockly.Xml.appendDomToWorkspace(
          Blockly.utils.xml.textToDom(
            '<xml>' +
              '  <block type="row_block">' +
              '    <value name="INPUT">' +
              '      <block type="row_block" collapsed="true">' +
              '        <value name="INPUT">' +
              '          <block type="row_block"/>' +
              '        </value>' +
              '      </block>' +
              '    </value>' +
              '  </block>' +
              '</xml>',
          ),
          this.workspace,
        );
        this.assertConnectionsEmpty();
        this.clock.runAll();
        chai.assert.equal(this.getOutputs().length, 2);
        chai.assert.equal(this.getInputs().length, 1);
      });
      test('Statement', function () {
        this.deserializationHelper(
          '<xml>' + '  <block type="statement_block"/>' + '</xml>',
        );
        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 2);
      });
      test('Multi-Statement', function () {
        this.deserializationHelper(
          '<xml>' +
            '  <block type="statement_block">' +
            '    <statement name="STATEMENT">' +
            '      <block type="statement_block">' +
            '        <statement name="STATEMENT">' +
            '          <block type="statement_block"/>' +
            '        </statement>' +
            '      </block>' +
            '    </statement>' +
            '  </block>' +
            '</xml>',
        );
        chai.assert.equal(this.getPrevious().length, 3);
        chai.assert.equal(this.getNext().length, 6);
      });
      test('Collapsed Statement', function () {
        this.deserializationHelper(
          '<xml>' +
            '  <block type="statement_block" collapsed="true"/>' +
            '</xml>',
        );
        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 1);
      });
      test('Collapsed Multi-Statement', function () {
        this.deserializationHelper(
          '<xml>' +
            '  <block type="statement_block" collapsed="true">' +
            '    <statement name="STATEMENT">' +
            '      <block type="statement_block">' +
            '        <statement name="STATEMENT">' +
            '          <block type="statement_block"/>' +
            '        </statement>' +
            '      </block>' +
            '    </statement>' +
            '  </block>' +
            '</xml>',
        );
        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 1);
      });
      test('Collapsed Multi-Statement Middle', function () {
        this.deserializationHelper(
          '<xml>' +
            '  <block type="statement_block">' +
            '    <statement name="STATEMENT">' +
            '      <block type="statement_block" collapsed="true">' +
            '        <statement name="STATEMENT">' +
            '          <block type="statement_block"/>' +
            '        </statement>' +
            '      </block>' +
            '    </statement>' +
            '  </block>' +
            '</xml>',
        );
        chai.assert.equal(this.getPrevious().length, 2);
        chai.assert.equal(this.getNext().length, 3);
      });
    });
    suite('Programmatic Block Creation', function () {
      test('Stack', function () {
        const block = this.workspace.newBlock('stack_block');
        this.assertConnectionsEmpty();
        block.initSvg();
        block.render();

        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 1);
      });
      test('Row', function () {
        const block = this.workspace.newBlock('row_block');
        this.assertConnectionsEmpty();
        block.initSvg();
        block.render();

        chai.assert.equal(this.getOutputs().length, 1);
        chai.assert.equal(this.getInputs().length, 1);
      });
      test('Statement', function () {
        const block = this.workspace.newBlock('statement_block');
        this.assertConnectionsEmpty();
        block.initSvg();
        block.render();

        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 2);
      });
    });
    suite('setCollapsed', function () {
      test('Stack', function () {
        const block = Blockly.Xml.domToBlock(
          Blockly.utils.xml.textToDom('<block type="stack_block"/>'),
          this.workspace,
        );
        this.clock.runAll();
        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 1);

        block.setCollapsed(true);
        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 1);

        block.setCollapsed(false);
        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 1);
      });
      test('Multi-Stack', function () {
        const block = Blockly.Xml.domToBlock(
          Blockly.utils.xml.textToDom(
            '<block type="stack_block">' +
              '  <next>' +
              '    <block type="stack_block">' +
              '      <next>' +
              '        <block type="stack_block"/>' +
              '      </next>' +
              '    </block>' +
              '  </next>' +
              '</block>',
          ),
          this.workspace,
        );
        this.assertConnectionsEmpty();
        this.clock.runAll();
        chai.assert.equal(this.getPrevious().length, 3);
        chai.assert.equal(this.getNext().length, 3);

        block.setCollapsed(true);
        chai.assert.equal(this.getPrevious().length, 3);
        chai.assert.equal(this.getNext().length, 3);

        block.setCollapsed(false);
        chai.assert.equal(this.getPrevious().length, 3);
        chai.assert.equal(this.getNext().length, 3);
      });
      test('Row', function () {
        const block = Blockly.Xml.domToBlock(
          Blockly.utils.xml.textToDom('<block type="row_block"/>'),
          this.workspace,
        );
        this.clock.runAll();
        chai.assert.equal(this.getOutputs().length, 1);
        chai.assert.equal(this.getInputs().length, 1);

        block.setCollapsed(true);
        chai.assert.equal(this.getOutputs().length, 1);
        chai.assert.equal(this.getInputs().length, 0);

        block.setCollapsed(false);
        chai.assert.equal(this.getOutputs().length, 1);
        chai.assert.equal(this.getInputs().length, 1);
      });
      test('Multi-Row', function () {
        const block = Blockly.Xml.domToBlock(
          Blockly.utils.xml.textToDom(
            '<block type="row_block">' +
              '  <value name="INPUT">' +
              '    <block type="row_block">' +
              '      <value name="INPUT">' +
              '        <block type="row_block"/>' +
              '      </value>' +
              '    </block>' +
              '  </value>' +
              '</block>',
          ),
          this.workspace,
        );
        this.clock.runAll();
        chai.assert.equal(this.getOutputs().length, 3);
        chai.assert.equal(this.getInputs().length, 3);

        block.setCollapsed(true);
        chai.assert.equal(this.getOutputs().length, 1);
        chai.assert.equal(this.getInputs().length, 0);

        block.setCollapsed(false);
        chai.assert.equal(this.getOutputs().length, 3);
        chai.assert.equal(this.getInputs().length, 3);
      });
      test('Multi-Row Middle', function () {
        let block = Blockly.Xml.domToBlock(
          Blockly.utils.xml.textToDom(
            '<block type="row_block">' +
              '  <value name="INPUT">' +
              '    <block type="row_block">' +
              '      <value name="INPUT">' +
              '        <block type="row_block"/>' +
              '      </value>' +
              '    </block>' +
              '  </value>' +
              '</block>',
          ),
          this.workspace,
        );
        this.clock.runAll();
        chai.assert.equal(this.getOutputs().length, 3);
        chai.assert.equal(this.getInputs().length, 3);

        block = block.getInputTargetBlock('INPUT');
        block.setCollapsed(true);
        chai.assert.equal(this.getOutputs().length, 2);
        chai.assert.equal(this.getInputs().length, 1);

        block.setCollapsed(false);
        chai.assert.equal(this.getOutputs().length, 3);
        chai.assert.equal(this.getInputs().length, 3);
      });
      test('Multi-Row Double Collapse', function () {
        // Collapse middle -> Collapse top ->
        // Uncollapse top -> Uncollapse middle
        const block = Blockly.Xml.domToBlock(
          Blockly.utils.xml.textToDom(
            '<block type="row_block">' +
              '  <value name="INPUT">' +
              '    <block type="row_block">' +
              '      <value name="INPUT">' +
              '        <block type="row_block"/>' +
              '      </value>' +
              '    </block>' +
              '  </value>' +
              '</block>',
          ),
          this.workspace,
        );
        this.clock.runAll();
        chai.assert.equal(this.getOutputs().length, 3);
        chai.assert.equal(this.getInputs().length, 3);

        const middleBlock = block.getInputTargetBlock('INPUT');
        middleBlock.setCollapsed(true);
        chai.assert.equal(this.getOutputs().length, 2);
        chai.assert.equal(this.getInputs().length, 1);

        block.setCollapsed(true);
        chai.assert.equal(this.getOutputs().length, 1);
        chai.assert.equal(this.getInputs().length, 0);

        block.setCollapsed(false);
        chai.assert.equal(this.getOutputs().length, 2);
        chai.assert.equal(this.getInputs().length, 1);

        middleBlock.setCollapsed(false);
        chai.assert.equal(this.getOutputs().length, 3);
        chai.assert.equal(this.getInputs().length, 3);
      });
      test('Statement', function () {
        const block = Blockly.Xml.domToBlock(
          Blockly.utils.xml.textToDom('<block type="statement_block"/>'),
          this.workspace,
        );
        this.clock.runAll();
        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 2);

        block.setCollapsed(true);
        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 1);

        block.setCollapsed(false);
        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 2);
      });
      test('Multi-Statement', function () {
        const block = Blockly.Xml.domToBlock(
          Blockly.utils.xml.textToDom(
            '<block type="statement_block">' +
              '  <statement name="STATEMENT">' +
              '    <block type="statement_block">' +
              '      <statement name="STATEMENT">' +
              '        <block type="statement_block"/>' +
              '      </statement>' +
              '    </block>' +
              '  </statement>' +
              '</block>',
          ),
          this.workspace,
        );
        this.assertConnectionsEmpty();
        this.clock.runAll();
        chai.assert.equal(this.getPrevious().length, 3);
        chai.assert.equal(this.getNext().length, 6);

        block.setCollapsed(true);
        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 1);

        block.setCollapsed(false);
        chai.assert.equal(this.getPrevious().length, 3);
        chai.assert.equal(this.getNext().length, 6);
      });
      test('Multi-Statement Middle', function () {
        let block = Blockly.Xml.domToBlock(
          Blockly.utils.xml.textToDom(
            '<block type="statement_block">' +
              '  <statement name="STATEMENT">' +
              '    <block type="statement_block">' +
              '      <statement name="STATEMENT">' +
              '        <block type="statement_block"/>' +
              '      </statement>' +
              '    </block>' +
              '  </statement>' +
              '</block>',
          ),
          this.workspace,
        );
        this.assertConnectionsEmpty();
        this.clock.runAll();
        chai.assert.equal(this.getPrevious().length, 3);
        chai.assert.equal(this.getNext().length, 6);

        block = block.getInputTargetBlock('STATEMENT');
        block.setCollapsed(true);
        chai.assert.equal(this.getPrevious().length, 2);
        chai.assert.equal(this.getNext().length, 3);

        block.setCollapsed(false);
        chai.assert.equal(this.getPrevious().length, 3);
        chai.assert.equal(this.getNext().length, 6);
      });
      test('Multi-Statement Double Collapse', function () {
        const block = Blockly.Xml.domToBlock(
          Blockly.utils.xml.textToDom(
            '<block type="statement_block">' +
              '  <statement name="STATEMENT">' +
              '    <block type="statement_block">' +
              '      <statement name="STATEMENT">' +
              '        <block type="statement_block"/>' +
              '      </statement>' +
              '    </block>' +
              '  </statement>' +
              '</block>',
          ),
          this.workspace,
        );
        this.assertConnectionsEmpty();
        this.clock.runAll();
        chai.assert.equal(this.getPrevious().length, 3);
        chai.assert.equal(this.getNext().length, 6);

        const middleBlock = block.getInputTargetBlock('STATEMENT');
        middleBlock.setCollapsed(true);
        chai.assert.equal(this.getPrevious().length, 2);
        chai.assert.equal(this.getNext().length, 3);

        block.setCollapsed(true);
        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 1);

        block.setCollapsed(false);
        chai.assert.equal(this.getPrevious().length, 2);
        chai.assert.equal(this.getNext().length, 3);

        middleBlock.setCollapsed(false);
        chai.assert.equal(this.getPrevious().length, 3);
        chai.assert.equal(this.getNext().length, 6);
      });
    });
    suite('Setting Parent Block', function () {
      setup(function () {
        this.printBlock = Blockly.Xml.domToBlock(
          Blockly.utils.xml.textToDom(
            '<block type="text_print">' +
              '  <value name="TEXT">' +
              '    <block type="text_join">' +
              '      <mutation items="2"></mutation>' +
              '      <value name="ADD0">' +
              '        <block type="text">' +
              '        </block>' +
              '      </value>' +
              '    </block>' +
              '  </value>' +
              '</block>',
          ),
          this.workspace,
        );
        this.textJoinBlock = this.printBlock.getInputTargetBlock('TEXT');
        this.textBlock = this.textJoinBlock.getInputTargetBlock('ADD0');
      });

      function assertBlockIsOnlyChild(parent, child, inputName) {
        chai.assert.equal(parent.getChildren().length, 1);
        chai.assert.equal(parent.getInputTargetBlock(inputName), child);
        chai.assert.equal(child.getParent(), parent);
      }
      function assertNonParentAndOrphan(nonParent, orphan, inputName) {
        chai.assert.equal(nonParent.getChildren().length, 0);
        chai.assert.isNull(nonParent.getInputTargetBlock('TEXT'));
        chai.assert.isNull(orphan.getParent());
      }
      function assertOriginalSetup() {
        assertBlockIsOnlyChild(this.printBlock, this.textJoinBlock, 'TEXT');
        assertBlockIsOnlyChild(this.textJoinBlock, this.textBlock, 'ADD0');
      }

      test('Setting to connected parent', function () {
        chai.assert.doesNotThrow(
          this.textJoinBlock.setParent.bind(
            this.textJoinBlock,
            this.printBlock,
          ),
        );
        assertOriginalSetup.call(this);
      });
      test('Setting to new parent after connecting to it', function () {
        this.textJoinBlock.outputConnection.disconnect();
        this.textBlock.outputConnection.connect(
          this.printBlock.getInput('TEXT').connection,
        );
        chai.assert.doesNotThrow(
          this.textBlock.setParent.bind(this.textBlock, this.printBlock),
        );
        assertBlockIsOnlyChild(this.printBlock, this.textBlock, 'TEXT');
      });
      test('Setting to new parent while connected to other block', function () {
        // Setting to grandparent with no available input connection.
        chai.assert.throws(
          this.textBlock.setParent.bind(this.textBlock, this.printBlock),
        );
        this.textJoinBlock.outputConnection.disconnect();
        // Setting to block with available input connection.
        chai.assert.throws(
          this.textBlock.setParent.bind(this.textBlock, this.printBlock),
        );
        assertNonParentAndOrphan(this.printBlock, this.textJoinBlock, 'TEXT');
        assertBlockIsOnlyChild(this.textJoinBlock, this.textBlock, 'ADD0');
      });
      test('Setting to same parent after disconnecting from it', function () {
        this.textJoinBlock.outputConnection.disconnect();
        chai.assert.throws(
          this.textJoinBlock.setParent.bind(
            this.textJoinBlock,
            this.printBlock,
          ),
        );
        assertNonParentAndOrphan(this.printBlock, this.textJoinBlock, 'TEXT');
      });
      test('Setting to new parent when orphan', function () {
        this.textBlock.outputConnection.disconnect();
        // When new parent has no available input connection.
        chai.assert.throws(
          this.textBlock.setParent.bind(this.textBlock, this.printBlock),
        );
        this.textJoinBlock.outputConnection.disconnect();
        // When new parent has available input connection.
        chai.assert.throws(
          this.textBlock.setParent.bind(this.textBlock, this.printBlock),
        );

        assertNonParentAndOrphan(this.printBlock, this.textJoinBlock, 'TEXT');
        assertNonParentAndOrphan(this.printBlock, this.textBlock, 'TEXT');
        assertNonParentAndOrphan(this.textJoinBlock, this.textBlock, 'ADD0');
      });
      test('Setting parent to null after disconnecting', function () {
        this.textBlock.outputConnection.disconnect();
        chai.assert.doesNotThrow(
          this.textBlock.setParent.bind(this.textBlock, null),
        );
        assertNonParentAndOrphan(this.textJoinBlock, this.textBlock, 'ADD0');
      });
      test('Setting parent to null without disconnecting', function () {
        chai.assert.throws(this.textBlock.setParent.bind(this.textBlock, null));
        assertOriginalSetup.call(this);
      });
    });
    suite('Remove Connections Programmatically', function () {
      test('Output', function () {
        const block = createRenderedBlock(this.workspace, 'row_block');

        block.setOutput(false);

        chai.assert.equal(this.getOutputs().length, 0);
        chai.assert.equal(this.getInputs().length, 1);
      });
      test('Value', function () {
        const block = createRenderedBlock(this.workspace, 'row_block');

        block.removeInput('INPUT');

        chai.assert.equal(this.getOutputs().length, 1);
        chai.assert.equal(this.getInputs().length, 0);
      });
      test('Previous', function () {
        const block = createRenderedBlock(this.workspace, 'stack_block');

        block.setPreviousStatement(false);

        chai.assert.equal(this.getPrevious().length, 0);
        chai.assert.equal(this.getNext().length, 1);
      });
      test('Next', function () {
        const block = createRenderedBlock(this.workspace, 'stack_block');

        block.setNextStatement(false);

        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 0);
      });
      test('Statement', function () {
        const block = createRenderedBlock(this.workspace, 'statement_block');

        block.removeInput('STATEMENT');

        chai.assert.equal(this.getPrevious().length, 1);
        chai.assert.equal(this.getNext().length, 1);
      });
    });
    suite('Add Connections Programmatically', function () {
      test('Output', async function () {
        const block = createRenderedBlock(this.workspace, 'empty_block');

        block.setOutput(true);
        this.clock.runAll();

        this.clock.runAll();
        chai.assert.equal(this.getOutputs().length, 1);
      });
      test('Value', function () {
        const block = createRenderedBlock(this.workspace, 'empty_block');

        block.appendValueInput('INPUT');

        this.clock.runAll();
        chai.assert.equal(this.getInputs().length, 1);
      });
      test('Previous', function () {
        const block = createRenderedBlock(this.workspace, 'empty_block');

        block.setPreviousStatement(true);
        this.clock.runAll();

        this.clock.runAll();
        chai.assert.equal(this.getPrevious().length, 1);
      });
      test('Next', function () {
        const block = createRenderedBlock(this.workspace, 'empty_block');

        block.setNextStatement(true);
        this.clock.runAll();

        this.clock.runAll();
        chai.assert.equal(this.getNext().length, 1);
      });
      test('Statement', function () {
        const block = createRenderedBlock(this.workspace, 'empty_block');

        block.appendStatementInput('STATEMENT');

        this.clock.runAll();
        chai.assert.equal(this.getNext().length, 1);
      });
    });
  });

  suite('Comments', function () {
    suite('Set/Get Text', function () {
      function assertCommentEvent(eventSpy, oldValue, newValue) {
        const calls = eventSpy.getCalls();
        const event = calls[calls.length - 1].args[0];
        chai.assert.equal(event.type, eventUtils.BLOCK_CHANGE);
        chai.assert.equal(
          event.element,
          'comment',
          'Expected the element to be a comment',
        );
        chai.assert.equal(
          event.oldValue,
          oldValue,
          'Expected the old values to match',
        );
        chai.assert.equal(
          event.newValue,
          newValue,
          'Expected the new values to match',
        );
      }
      function assertNoCommentEvent(eventSpy) {
        const calls = eventSpy.getCalls();
        const event = calls[calls.length - 1].args[0];
        chai.assert.notEqual(event.type, eventUtils.BLOCK_CHANGE);
      }
      setup(function () {
        this.eventsFireSpy = sinon.spy(eventUtils.TEST_ONLY, 'fireInternal');
      });
      teardown(function () {
        this.eventsFireSpy.restore();
      });
      suite('Headless', function () {
        setup(function () {
          this.block = Blockly.Xml.domToBlock(
            Blockly.utils.xml.textToDom('<block type="empty_block"/>'),
            this.workspace,
          );
        });
        test('Text', function () {
          this.block.setCommentText('test text');
          chai.assert.equal(this.block.getCommentText(), 'test text');
          assertCommentEvent(this.eventsFireSpy, null, 'test text');
        });
        test('Text Empty', function () {
          this.block.setCommentText('');
          chai.assert.equal(this.block.getCommentText(), '');
          assertCommentEvent(this.eventsFireSpy, null, '');
        });
        test('Text Null', function () {
          this.block.setCommentText(null);
          chai.assert.isNull(this.block.getCommentText());
          assertNoCommentEvent(this.eventsFireSpy);
        });
        test('Text -> Null', function () {
          this.block.setCommentText('first text');

          this.block.setCommentText(null);
          chai.assert.isNull(this.block.getCommentText());
          assertCommentEvent(this.eventsFireSpy, 'first text', null);
        });
      });
      suite('Rendered', function () {
        setup(function () {
          this.workspace = Blockly.inject('blocklyDiv', {
            comments: true,
            scrollbars: true,
          });
          this.block = Blockly.Xml.domToBlock(
            Blockly.utils.xml.textToDom('<block type="empty_block"/>'),
            this.workspace,
          );
        });
        teardown(function () {
          workspaceTeardown.call(this, this.workspace);
        });
        test('Text', function () {
          this.block.setCommentText('test text');
          chai.assert.equal(this.block.getCommentText(), 'test text');
          assertCommentEvent(this.eventsFireSpy, null, 'test text');
        });
        test('Text Empty', function () {
          this.block.setCommentText('');
          chai.assert.equal(this.block.getCommentText(), '');
          assertCommentEvent(this.eventsFireSpy, null, '');
        });
        test('Text Null', function () {
          this.block.setCommentText(null);
          chai.assert.isNull(this.block.getCommentText());
          assertNoCommentEvent(this.eventsFireSpy);
        });
        test('Text -> Null', function () {
          this.block.setCommentText('first text');

          this.block.setCommentText(null);
          chai.assert.isNull(this.block.getCommentText());
          assertCommentEvent(this.eventsFireSpy, 'first text', null);
        });
        test('Set While Visible - Editable', function () {
          this.block.setCommentText('test1');
          const icon = this.block.getIcon(Blockly.icons.CommentIcon.TYPE);
          icon.setBubbleVisible(true);

          this.block.setCommentText('test2');
          chai.assert.equal(this.block.getCommentText(), 'test2');
          assertCommentEvent(this.eventsFireSpy, 'test1', 'test2');
        });
        test('Set While Visible - NonEditable', function () {
          this.block.setCommentText('test1');
          // Restored up by call to sinon.restore() in sharedTestTeardown()
          sinon.stub(this.block, 'isEditable').returns(false);
          const icon = this.block.getIcon(Blockly.icons.CommentIcon.TYPE);
          icon.setBubbleVisible(true);

          this.block.setCommentText('test2');
          chai.assert.equal(this.block.getCommentText(), 'test2');
          assertCommentEvent(this.eventsFireSpy, 'test1', 'test2');
        });
      });
    });
  });

  suite('Getting/Setting Field (Values)', function () {
    setup(function () {
      this.workspace = Blockly.inject('blocklyDiv');
      this.block = Blockly.Xml.domToBlock(
        Blockly.utils.xml.textToDom(
          '<block type="text"><field name = "TEXT">test</field></block>',
        ),
        this.workspace,
      );
    });

    teardown(function () {
      workspaceTeardown.call(this, this.workspace);
    });

    test('Getting Field', function () {
      chai.assert.instanceOf(this.block.getField('TEXT'), Blockly.Field);
    });
    test('Getting Field without Name', function () {
      chai.assert.throws(this.block.getField.bind(this.block), TypeError);
    });
    test('Getting Value of Field without Name', function () {
      chai.assert.throws(this.block.getFieldValue.bind(this.block), TypeError);
    });
    test('Getting Field with Wrong Type', function () {
      const testFunction = function () {
        return 'TEXT';
      };
      const inputs = [
        1,
        null,
        testFunction,
        {toString: testFunction},
        ['TEXT'],
      ];
      for (let i = 0; i < inputs.length; i++) {
        chai.assert.throws(
          this.block.getField.bind(this.block, inputs[i]),
          TypeError,
        );
      }
    });
    test('Getting Value of Field with Wrong Type', function () {
      const testFunction = function () {
        return 'TEXT';
      };
      const inputs = [
        1,
        null,
        testFunction,
        {toString: testFunction},
        ['TEXT'],
      ];
      for (let i = 0; i < inputs.length; i++) {
        chai.assert.throws(
          this.block.getFieldValue.bind(this.block, inputs[i]),
          TypeError,
        );
      }
    });
    test('Getting/Setting Field Value', function () {
      chai.assert.equal(this.block.getFieldValue('TEXT'), 'test');
      this.block.setFieldValue('abc', 'TEXT');
      chai.assert.equal(this.block.getFieldValue('TEXT'), 'abc');
    });
    test('Setting Field without Name', function () {
      chai.assert.throws(this.block.setFieldValue.bind(this.block, 'test'));
    });
    test('Setting Field with Wrong Type', function () {
      const testFunction = function () {
        return 'TEXT';
      };
      const inputs = [
        1,
        null,
        testFunction,
        {toString: testFunction},
        ['TEXT'],
      ];
      for (let i = 0; i < inputs.length; i++) {
        chai.assert.throws(
          this.block.setFieldValue.bind(this.block, 'test', inputs[i]),
          TypeError,
        );
      }
    });
  });

  suite('Icon management', function () {
    class MockIconA extends MockIcon {
      getType() {
        return new Blockly.icons.IconType('A');
      }

      getWeight() {
        return 1;
      }
    }

    class MockIconB extends MockIcon {
      getType() {
        return new Blockly.icons.IconType('B');
      }

      getWeight() {
        return 2;
      }
    }

    suite('Adding icons', function () {
      setup(function () {
        this.workspace = Blockly.inject('blocklyDiv', {});

        this.block = this.workspace.newBlock('stack_block');
        this.block.initSvg();
        this.block.render();
        this.renderSpy = sinon.spy(this.block, 'queueRender');
      });

      teardown(function () {
        this.renderSpy.restore();
        workspaceTeardown.call(this, this.workspace);
      });

      test('icons get added to the block', function () {
        this.block.addIcon(new MockIconA());
        chai.assert.isTrue(
          this.block.hasIcon('A'),
          'Expected the icon to be added',
        );
      });

      test('adding two icons of the same type throws', function () {
        this.block.addIcon(new MockIconA());
        chai.assert.throws(
          () => {
            this.block.addIcon(new MockIconA());
          },
          Blockly.icons.DuplicateIconType,
          '',
          'Expected adding an icon of the same type to throw',
        );
      });

      test('adding an icon triggers a render', function () {
        this.renderSpy.resetHistory();
        this.block.addIcon(new MockIconA());
        chai.assert.isTrue(
          this.renderSpy.calledOnce,
          'Expected adding an icon to trigger a render',
        );
      });
    });

    suite('Removing icons', function () {
      setup(function () {
        this.workspace = Blockly.inject('blocklyDiv');

        this.block = this.workspace.newBlock('stack_block');
        this.block.initSvg();
        this.block.render();
        this.renderSpy = sinon.spy(this.block, 'queueRender');
      });

      teardown(function () {
        this.renderSpy.restore();
        workspaceTeardown.call(this, this.workspace);
      });

      test('icons get removed from the block', function () {
        this.block.addIcon(new MockIconA());
        chai.assert.isTrue(
          this.block.removeIcon(new Blockly.icons.IconType('A')),
          'Expected removeIcon to return true',
        );
        chai.assert.isFalse(
          this.block.hasIcon('A'),
          'Expected the icon to be removed',
        );
      });

      test('removing an icon that does not exist returns false', function () {
        chai.assert.isFalse(
          this.block.removeIcon(new Blockly.icons.IconType('B')),
          'Expected removeIcon to return false',
        );
      });

      test('removing an icon triggers a render', function () {
        this.block.addIcon(new MockIconA());
        this.renderSpy.resetHistory();
        this.block.removeIcon(new Blockly.icons.IconType('A'));
        chai.assert.isTrue(
          this.renderSpy.calledOnce,
          'Expected removing an icon to trigger a render',
        );
      });
    });

    suite('Getting icons', function () {
      setup(function () {
        this.block = this.workspace.newBlock('stack_block');
      });

      test('all icons are returned from getIcons, in order of weight', function () {
        const iconA = new MockIconA();
        const iconB = new MockIconB();
        this.block.addIcon(iconB);
        this.block.addIcon(iconA);
        chai.assert.sameOrderedMembers(
          this.block.getIcons(),
          [iconA, iconB],
          'Expected getIcon to return both icons in order of weight',
        );
      });

      test('if there are no icons, getIcons returns an empty array', function () {
        chai.assert.isEmpty(
          this.block.getIcons(),
          'Expected getIcons to return an empty array ' +
            'for a block with no icons',
        );
      });

      test('if there are no icons, getIcons returns an empty array', function () {
        chai.assert.isEmpty(
          this.block.getIcons(),
          'Expected getIcons to return an empty array ' +
            'for a block with no icons',
        );
      });

      test('specific icons are returned from getIcon', function () {
        const iconA = new MockIconA();
        const iconB = new MockIconB();
        this.block.addIcon(iconA);
        this.block.addIcon(iconB);
        chai.assert.equal(
          this.block.getIcon('B'),
          iconB,
          'Expected getIcon to return the icon with the given type',
        );
      });

      test('if there is no matching icon, getIcon returns undefined', function () {
        this.block.addIcon(new MockIconA());
        chai.assert.isUndefined(
          this.block.getIcon('B'),
          'Expected getIcon to return null if there is no ' +
            'icon with a matching type',
        );
      });
    });

    suite('Warning icons', function () {
      setup(function () {
        this.workspace = Blockly.inject('blocklyDiv');

        this.block = this.workspace.newBlock('stack_block');
        this.block.initSvg();
        this.block.render();
      });

      teardown(function () {
        workspaceTeardown.call(this, this.workspace);
      });

      test('Block with no warning text does not have warning icon', function () {
        const icon = this.block.getIcon(Blockly.icons.WarningIcon.TYPE);

        chai.assert.isUndefined(
          icon,
          'Block with no warning should not have warning icon',
        );
      });

      test('Set warning text creates new icon if none existed', function () {
        const text = 'Warning Text';

        this.block.setWarningText(text);

        const icon = this.block.getIcon(Blockly.icons.WarningIcon.TYPE);
        chai.assert.equal(
          icon.getText(),
          text,
          'Expected warning icon text to be set',
        );
      });

      test('Set warning text adds text to existing icon if needed', function () {
        const text1 = 'Warning Text 1';
        const text2 = 'Warning Text 2';

        this.block.setWarningText(text1, '1');
        this.block.setWarningText(text2, '2');

        const icon = this.block.getIcon(Blockly.icons.WarningIcon.TYPE);
        chai.assert.equal(icon.getText(), `${text1}\n${text2}`);
      });

      test('Clearing all warning text deletes the warning icon', function () {
        const text = 'Warning Text';
        this.block.setWarningText(text);

        this.block.setWarningText(null);

        const icon = this.block.getIcon(Blockly.icons.WarningIcon.TYPE);
        chai.assert.isUndefined(
          icon,
          'Expected warning icon to be undefined after deleting all warning text',
        );
      });

      test('Clearing specific warning does not delete the icon if other warnings present', function () {
        const text1 = 'Warning Text 1';
        const text2 = 'Warning Text 2';

        this.block.setWarningText(text1, '1');
        this.block.setWarningText(text2, '2');
        this.block.setWarningText(null, '1');

        const icon = this.block.getIcon(Blockly.icons.WarningIcon.TYPE);
        chai.assert.equal(
          icon.getText(),
          text2,
          'Expected first warning text to be deleted',
        );
      });

      test('Clearing specific warning removes icon if it was only warning present', function () {
        const text1 = 'Warning Text 1';
        const text2 = 'Warning Text 2';

        this.block.setWarningText(text1, '1');
        this.block.setWarningText(text2, '2');
        this.block.setWarningText(null, '1');
        this.block.setWarningText(null, '2');

        const icon = this.block.getIcon(Blockly.icons.WarningIcon.TYPE);
        chai.assert.isUndefined(
          icon,
          'Expected warning icon to be deleted after all warning text is cleared',
        );
      });
    });

    suite('Bubbles and collapsing', function () {
      setup(function () {
        this.workspace = Blockly.inject('blocklyDiv');
      });

      teardown(function () {
        workspaceTeardown.call(this, this.workspace);
      });

      test("Collapsing the block closes its contained children's bubbles", function () {
        const parentBlock = Blockly.serialization.blocks.append(
          {
            'type': 'statement_block',
            'inputs': {
              'STATEMENT': {
                'block': {
                  'type': 'statement_block',
                },
              },
            },
          },
          this.workspace,
        );
        const childBlock = parentBlock.getInputTargetBlock('STATEMENT');
        const icon = new MockBubbleIcon();
        childBlock.addIcon(icon);
        icon.setBubbleVisible(true);

        parentBlock.setCollapsed(true);

        chai.assert.isFalse(
          icon.bubbleIsVisible(),
          "Expected collapsing the parent block to hide the child block's " +
            "icon's bubble",
        );
      });

      test("Collapsing a block does not close its following childrens' bubbles", function () {
        const parentBlock = Blockly.serialization.blocks.append(
          {
            'type': 'statement_block',
            'next': {
              'block': {
                'type': 'statement_block',
              },
            },
          },
          this.workspace,
        );
        const nextBlock = parentBlock.getNextBlock();
        const icon = new MockBubbleIcon();
        nextBlock.addIcon(icon);
        icon.setBubbleVisible(true);

        parentBlock.setCollapsed(true);

        chai.assert.isTrue(
          icon.bubbleIsVisible(),
          'Expected collapsing the parent block to not hide the next ' +
            "block's bubble",
        );
      });
    });
  });

  suite('Collapsing and Expanding', function () {
    function assertCollapsed(block, opt_string) {
      chai.assert.isTrue(block.isCollapsed());
      for (let i = 0, input; (input = block.inputList[i]); i++) {
        if (input.name == Blockly.Block.COLLAPSED_INPUT_NAME) {
          continue;
        }
        chai.assert.isFalse(input.isVisible());
        for (let j = 0, field; (field = input.fieldRow[j]); j++) {
          chai.assert.isFalse(field.isVisible());
        }
      }
      const icons = block.getIcons();
      for (let i = 0, icon; (icon = icons[i]); i++) {
        chai.assert.isFalse(icon.bubbleIsVisible());
      }

      const input = block.getInput(Blockly.Block.COLLAPSED_INPUT_NAME);
      chai.assert.isNotNull(input);
      chai.assert.isTrue(input.isVisible());
      const field = block.getField(Blockly.Block.COLLAPSED_FIELD_NAME);
      chai.assert.isNotNull(field);
      chai.assert.isTrue(field.isVisible());

      if (opt_string) {
        chai.assert.equal(field.getText(), opt_string);
      }
    }
    function assertNotCollapsed(block) {
      chai.assert.isFalse(block.isCollapsed());
      for (let i = 0, input; (input = block.inputList[i]); i++) {
        chai.assert.isTrue(input.isVisible());
        for (let j = 0, field; (field = input.fieldRow[j]); j++) {
          chai.assert.isTrue(field.isVisible());
        }
      }

      const input = block.getInput(Blockly.Block.COLLAPSED_INPUT_NAME);
      chai.assert.isNull(input);
      const field = block.getField(Blockly.Block.COLLAPSED_FIELD_NAME);
      chai.assert.isNull(field);
    }
    function isBlockHidden(block) {
      let node = block.getSvgRoot();
      do {
        const visible = node.style.display != 'none';
        if (!visible) {
          return true;
        }
        node = node.parentNode;
      } while (node != document);
      return false;
    }

    setup(function () {
      eventUtils.disable();
      // We need a visible workspace.
      this.workspace = Blockly.inject('blocklyDiv', {});
      Blockly.defineBlocksWithJsonArray([
        {
          'type': 'variable_block',
          'message0': '%1',
          'args0': [
            {
              'type': 'field_variable',
              'name': 'NAME',
              'variable': 'x',
            },
          ],
        },
      ]);
    });
    teardown(function () {
      eventUtils.enable();
      workspaceTeardown.call(this, this.workspace);
    });
    suite('Connecting and Disconnecting', function () {
      test('Connect Block to Next', function () {
        const blockA = createRenderedBlock(this.workspace, 'stack_block');
        const blockB = createRenderedBlock(this.workspace, 'stack_block');

        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        blockA.nextConnection.connect(blockB.previousConnection);
        assertNotCollapsed(blockB);
      });
      test('Connect Block to Value Input', function () {
        const blockA = createRenderedBlock(this.workspace, 'row_block');
        const blockB = createRenderedBlock(this.workspace, 'row_block');

        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        blockA.getInput('INPUT').connection.connect(blockB.outputConnection);
        chai.assert.isTrue(isBlockHidden(blockB));
        blockA.setCollapsed(false);
        assertNotCollapsed(blockA);
        chai.assert.isFalse(isBlockHidden(blockB));
      });
      test('Connect Block to Statement Input', function () {
        const blockA = createRenderedBlock(this.workspace, 'statement_block');
        const blockB = createRenderedBlock(this.workspace, 'stack_block');

        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        blockA
          .getInput('STATEMENT')
          .connection.connect(blockB.previousConnection);
        chai.assert.isTrue(isBlockHidden(blockB));
        blockA.setCollapsed(false);
        assertNotCollapsed(blockA);
        chai.assert.isFalse(isBlockHidden(blockB));
      });
      test('Connect Block to Child of Collapsed - Input', function () {
        const blockA = createRenderedBlock(this.workspace, 'row_block');
        const blockB = createRenderedBlock(this.workspace, 'row_block');
        const blockC = createRenderedBlock(this.workspace, 'row_block');

        blockA.getInput('INPUT').connection.connect(blockB.outputConnection);
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        chai.assert.isTrue(isBlockHidden(blockB));
        blockB.getInput('INPUT').connection.connect(blockC.outputConnection);
        chai.assert.isTrue(isBlockHidden(blockC));

        blockA.setCollapsed(false);
        assertNotCollapsed(blockA);
        chai.assert.isFalse(isBlockHidden(blockB));
        chai.assert.isFalse(isBlockHidden(blockC));
      });
      test('Connect Block to Child of Collapsed - Next', function () {
        const blockA = createRenderedBlock(this.workspace, 'statement_block');
        const blockB = createRenderedBlock(this.workspace, 'stack_block');
        const blockC = createRenderedBlock(this.workspace, 'stack_block');

        blockA
          .getInput('STATEMENT')
          .connection.connect(blockB.previousConnection);
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        chai.assert.isTrue(isBlockHidden(blockB));
        blockB.nextConnection.connect(blockC.previousConnection);
        chai.assert.isTrue(isBlockHidden(blockC));

        blockA.setCollapsed(false);
        assertNotCollapsed(blockA);
        chai.assert.isFalse(isBlockHidden(blockB));
        chai.assert.isFalse(isBlockHidden(blockC));
      });
      test('Connect Block to Value Input Already Taken', function () {
        const blockA = createRenderedBlock(this.workspace, 'row_block');
        const blockB = createRenderedBlock(this.workspace, 'row_block');
        const blockC = createRenderedBlock(this.workspace, 'row_block');

        blockA.getInput('INPUT').connection.connect(blockB.outputConnection);
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        chai.assert.isTrue(isBlockHidden(blockB));
        blockA.getInput('INPUT').connection.connect(blockC.outputConnection);
        chai.assert.isTrue(isBlockHidden(blockC));
        // Still hidden after C is inserted between.
        chai.assert.isTrue(isBlockHidden(blockB));

        blockA.setCollapsed(false);
        assertNotCollapsed(blockA);
        chai.assert.isFalse(isBlockHidden(blockB));
        chai.assert.isFalse(isBlockHidden(blockC));
      });
      test('Connect Block to Statement Input Already Taken', function () {
        const blockA = createRenderedBlock(this.workspace, 'statement_block');
        const blockB = createRenderedBlock(this.workspace, 'stack_block');
        const blockC = createRenderedBlock(this.workspace, 'stack_block');

        blockA
          .getInput('STATEMENT')
          .connection.connect(blockB.previousConnection);
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        chai.assert.isTrue(isBlockHidden(blockB));
        blockA
          .getInput('STATEMENT')
          .connection.connect(blockC.previousConnection);
        chai.assert.isTrue(isBlockHidden(blockC));
        // Still hidden after C is inserted between.
        chai.assert.isTrue(isBlockHidden(blockB));

        blockA.setCollapsed(false);
        assertNotCollapsed(blockA);
        chai.assert.isFalse(isBlockHidden(blockB));
        chai.assert.isFalse(isBlockHidden(blockC));
      });
      test('Connect Block with Child - Input', function () {
        const blockA = createRenderedBlock(this.workspace, 'row_block');
        const blockB = createRenderedBlock(this.workspace, 'row_block');
        const blockC = createRenderedBlock(this.workspace, 'row_block');

        blockB.getInput('INPUT').connection.connect(blockC.outputConnection);
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        blockA.getInput('INPUT').connection.connect(blockB.outputConnection);
        chai.assert.isTrue(isBlockHidden(blockC));
        chai.assert.isTrue(isBlockHidden(blockB));

        blockA.setCollapsed(false);
        assertNotCollapsed(blockA);
        chai.assert.isFalse(isBlockHidden(blockB));
        chai.assert.isFalse(isBlockHidden(blockC));
      });
      test('Connect Block with Child - Statement', function () {
        const blockA = createRenderedBlock(this.workspace, 'statement_block');
        const blockB = createRenderedBlock(this.workspace, 'stack_block');
        const blockC = createRenderedBlock(this.workspace, 'stack_block');

        blockB.nextConnection.connect(blockC.previousConnection);
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        blockA
          .getInput('STATEMENT')
          .connection.connect(blockB.previousConnection);
        chai.assert.isTrue(isBlockHidden(blockC));
        chai.assert.isTrue(isBlockHidden(blockB));

        blockA.setCollapsed(false);
        assertNotCollapsed(blockA);
        chai.assert.isFalse(isBlockHidden(blockB));
        chai.assert.isFalse(isBlockHidden(blockC));
      });
      test('Disconnect Block from Value Input', function () {
        const blockA = createRenderedBlock(this.workspace, 'row_block');
        const blockB = createRenderedBlock(this.workspace, 'row_block');

        blockA.getInput('INPUT').connection.connect(blockB.outputConnection);
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        chai.assert.isTrue(isBlockHidden(blockB));
        blockB.outputConnection.disconnect();
        chai.assert.isFalse(isBlockHidden(blockB));
      });
      test('Disconnect Block from Statement Input', function () {
        const blockA = createRenderedBlock(this.workspace, 'statement_block');
        const blockB = createRenderedBlock(this.workspace, 'stack_block');

        blockA
          .getInput('STATEMENT')
          .connection.connect(blockB.previousConnection);
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        chai.assert.isTrue(isBlockHidden(blockB));
        blockB.previousConnection.disconnect();
        chai.assert.isFalse(isBlockHidden(blockB));
      });
      test('Disconnect Block from Child of Collapsed - Input', function () {
        const blockA = createRenderedBlock(this.workspace, 'row_block');
        const blockB = createRenderedBlock(this.workspace, 'row_block');
        const blockC = createRenderedBlock(this.workspace, 'row_block');

        blockA.getInput('INPUT').connection.connect(blockB.outputConnection);
        blockB.getInput('INPUT').connection.connect(blockC.outputConnection);
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        chai.assert.isTrue(isBlockHidden(blockB));
        chai.assert.isTrue(isBlockHidden(blockC));

        blockC.outputConnection.disconnect();
        chai.assert.isFalse(isBlockHidden(blockC));
      });
      test('Disconnect Block from Child of Collapsed - Next', function () {
        const blockA = createRenderedBlock(this.workspace, 'statement_block');
        const blockB = createRenderedBlock(this.workspace, 'stack_block');
        const blockC = createRenderedBlock(this.workspace, 'stack_block');

        blockA
          .getInput('STATEMENT')
          .connection.connect(blockB.previousConnection);
        blockB.nextConnection.connect(blockC.previousConnection);
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        chai.assert.isTrue(isBlockHidden(blockB));
        chai.assert.isTrue(isBlockHidden(blockC));

        blockC.previousConnection.disconnect();
        chai.assert.isFalse(isBlockHidden(blockC));
      });
      test('Disconnect Block with Child - Input', function () {
        const blockA = createRenderedBlock(this.workspace, 'row_block');
        const blockB = createRenderedBlock(this.workspace, 'row_block');
        const blockC = createRenderedBlock(this.workspace, 'row_block');

        blockB.getInput('INPUT').connection.connect(blockC.outputConnection);
        blockA.getInput('INPUT').connection.connect(blockB.outputConnection);
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        chai.assert.isTrue(isBlockHidden(blockB));
        chai.assert.isTrue(isBlockHidden(blockC));

        blockB.outputConnection.disconnect();
        chai.assert.isFalse(isBlockHidden(blockB));
        chai.assert.isFalse(isBlockHidden(blockC));
      });
      test('Disconnect Block with Child - Statement', function () {
        const blockA = createRenderedBlock(this.workspace, 'statement_block');
        const blockB = createRenderedBlock(this.workspace, 'stack_block');
        const blockC = createRenderedBlock(this.workspace, 'stack_block');

        blockB.nextConnection.connect(blockC.previousConnection);
        blockA
          .getInput('STATEMENT')
          .connection.connect(blockB.previousConnection);
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        chai.assert.isTrue(isBlockHidden(blockC));
        chai.assert.isTrue(isBlockHidden(blockB));

        blockB.previousConnection.disconnect();
        chai.assert.isFalse(isBlockHidden(blockB));
        chai.assert.isFalse(isBlockHidden(blockC));
      });
    });
    suite('Adding and Removing Block Parts', function () {
      test('Add Previous Connection', function () {
        const blockA = createRenderedBlock(this.workspace, 'empty_block');
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        blockA.setPreviousStatement(true);
        assertCollapsed(blockA);
        chai.assert.isNotNull(blockA.previousConnection);
      });
      test('Add Next Connection', function () {
        const blockA = createRenderedBlock(this.workspace, 'empty_block');
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        blockA.setNextStatement(true);
        assertCollapsed(blockA);
        chai.assert.isNotNull(blockA.nextConnection);
      });
      test('Add Input', function () {
        const blockA = createRenderedBlock(this.workspace, 'empty_block');
        blockA.setCollapsed(true);

        blockA.appendDummyInput('NAME');

        this.clock.runAll();
        assertCollapsed(blockA);
        chai.assert.isNotNull(blockA.getInput('NAME'));
      });
      test('Add Field', function () {
        const blockA = createRenderedBlock(this.workspace, 'empty_block');
        const input = blockA.appendDummyInput('NAME');
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        input.appendField(new Blockly.FieldLabel('test'), 'FIELD');
        assertCollapsed(blockA);
        const field = blockA.getField('FIELD');
        chai.assert.isNotNull(field);
        chai.assert.equal(field.getText(), 'test');
      });
      test('Add Icon', function () {
        const blockA = createRenderedBlock(this.workspace, 'empty_block');
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        blockA.setCommentText('test');
        assertCollapsed(blockA);
      });
      test('Remove Previous Connection', function () {
        const blockA = createRenderedBlock(this.workspace, 'empty_block');
        blockA.setPreviousStatement(true);
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        blockA.setPreviousStatement(false);
        assertCollapsed(blockA);
        chai.assert.isNull(blockA.previousConnection);
      });
      test('Remove Next Connection', function () {
        const blockA = createRenderedBlock(this.workspace, 'empty_block');
        blockA.setNextStatement(true);
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        blockA.setNextStatement(false);
        assertCollapsed(blockA);
        chai.assert.isNull(blockA.nextConnection);
      });
      test('Remove Input', function () {
        const blockA = createRenderedBlock(this.workspace, 'empty_block');
        blockA.appendDummyInput('NAME');
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        blockA.removeInput('NAME');
        assertCollapsed(blockA);
        chai.assert.isNull(blockA.getInput('NAME'));
      });
      test('Remove Field', function () {
        const blockA = createRenderedBlock(this.workspace, 'empty_block');
        const input = blockA.appendDummyInput('NAME');
        input.appendField(new Blockly.FieldLabel('test'), 'FIELD');
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        input.removeField('FIELD');
        assertCollapsed(blockA);
        const field = blockA.getField('FIELD');
        chai.assert.isNull(field);
      });
      test('Remove Icon', function () {
        const blockA = createRenderedBlock(this.workspace, 'empty_block');
        blockA.setCommentText('test');
        blockA.setCollapsed(true);
        assertCollapsed(blockA);
        blockA.setCommentText(null);
        assertCollapsed(blockA);
      });
    });
    suite('Renaming Vars', function () {
      test('Simple Rename', function () {
        const blockA = createRenderedBlock(this.workspace, 'variable_block');

        blockA.setCollapsed(true);
        const variable = this.workspace.getVariable('x', '');
        this.workspace.renameVariableById(variable.getId(), 'y');

        this.clock.runAll();
        assertCollapsed(blockA, 'y');
      });
      test('Coalesce, Different Case', function () {
        const blockA = createRenderedBlock(this.workspace, 'variable_block');

        blockA.setCollapsed(true);
        const variable = this.workspace.createVariable('y');
        this.workspace.renameVariableById(variable.getId(), 'X');

        this.clock.runAll();
        assertCollapsed(blockA, 'X');
      });
    });
    suite('Disabled Blocks', function () {
      test('Children of Collapsed Blocks Should Enable Properly', function () {
        const blockA = createRenderedBlock(this.workspace, 'statement_block');
        const blockB = createRenderedBlock(this.workspace, 'stack_block');
        blockA
          .getInput('STATEMENT')
          .connection.connect(blockB.previousConnection);
        // Disable the block and collapse it.
        blockA.setEnabled(false);
        blockA.setCollapsed(true);

        // Enable the block before expanding it.
        blockA.setEnabled(true);
        blockA.setCollapsed(false);

        // The child blocks should be enabled.
        chai.assert.isFalse(blockB.disabled);
        chai.assert.isFalse(
          blockB.getSvgRoot().classList.contains('blocklyDisabled'),
        );
      });
      test('Disabled Children of Collapsed Blocks Should Stay Disabled', function () {
        const blockA = createRenderedBlock(this.workspace, 'statement_block');
        const blockB = createRenderedBlock(this.workspace, 'stack_block');
        blockA
          .getInput('STATEMENT')
          .connection.connect(blockB.previousConnection);

        // Disable the child block.
        blockB.setEnabled(false);

        // Collapse and disable the parent block.
        blockA.setCollapsed(false);
        blockA.setEnabled(false);

        // Enable the parent block.
        blockA.setEnabled(true);
        blockA.setCollapsed(true);

        // Child blocks should stay disabled if they have been set.
        chai.assert.isTrue(blockB.disabled);
      });
      test('Disabled blocks from JSON should have proper disabled status', function () {
        const blockJson = {
          'type': 'controls_if',
          'enabled': false,
        };
        Blockly.serialization.blocks.append(blockJson, this.workspace);
        const block = this.workspace.getTopBlocks(false)[0];
        chai.assert.isTrue(
          block.visuallyDisabled,
          'block should have visuallyDisabled set because it is disabled',
        );
        chai.assert.isFalse(
          block.isEnabled(),
          'block should be marked disabled because enabled json property was set to false',
        );
      });
    });
  });

  suite('Style', function () {
    suite('Headless', function () {
      setup(function () {
        this.block = Blockly.Xml.domToBlock(
          Blockly.utils.xml.textToDom('<block type="empty_block"/>'),
          this.workspace,
        );
      });
      test('Set colour', function () {
        this.block.setColour('20');
        chai.assert.equal(this.block.getColour(), '#a5745b');
        chai.assert.equal(this.block.colour_, this.block.getColour());
        chai.assert.equal(this.block.hue_, '20');
      });
      test('Set style', function () {
        this.block.setStyle('styleOne');
        chai.assert.equal(this.block.getStyleName(), 'styleOne');
        chai.assert.isNull(this.block.hue_);
        // Calling setStyle does not update the colour on a headless block.
        chai.assert.equal(this.block.getColour(), '#000000');
      });
    });
    suite('Rendered', function () {
      setup(function () {
        this.workspace = Blockly.inject('blocklyDiv', {});
        this.block = Blockly.Xml.domToBlock(
          Blockly.utils.xml.textToDom('<block type="empty_block"/>'),
          this.workspace,
        );
        this.workspace.setTheme(
          new Blockly.Theme('test', {
            'styleOne': {
              'colourPrimary': '#000000',
              'colourSecondary': '#999999',
              'colourTertiary': '#4d4d4d',
              'hat': '',
            },
          }),
          {},
        );
      });
      teardown(function () {
        workspaceTeardown.call(this, this.workspace);
        // Clear all registered themes.
        Blockly.registry.TEST_ONLY.typeMap['theme'] = {};
      });
      test('Set colour hue', function () {
        this.block.setColour('20');
        chai.assert.equal(this.block.getStyleName(), 'auto_#a5745b');
        chai.assert.equal(this.block.getColour(), '#a5745b');
        chai.assert.equal(this.block.colour_, this.block.getColour());
        chai.assert.equal(this.block.hue_, '20');
      });
      test('Set colour hex', function () {
        this.block.setColour('#000000');
        chai.assert.equal(this.block.getStyleName(), 'auto_#000000');
        chai.assert.equal(this.block.getColour(), '#000000');
        chai.assert.equal(this.block.colour_, this.block.getColour());
        chai.assert.isNull(this.block.hue_);
      });
      test('Set style', function () {
        this.block.setStyle('styleOne');
        chai.assert.equal(this.block.getStyleName(), 'styleOne');
        chai.assert.equal(this.block.getColour(), '#000000');
        chai.assert.equal(this.block.colour_, this.block.getColour());
      });
    });
  });

  suite('toString', function () {
    const toStringTests = [
      {
        name: 'statement block',
        xml:
          '<block type="controls_repeat_ext">' +
          '<value name="TIMES">' +
          '<shadow type="math_number">' +
          '<field name="NUM">10</field>' +
          '</shadow>' +
          '</value>' +
          '</block>',
        toString: 'repeat 10 times do ?',
      },
      {
        name: 'nested statement blocks',
        xml:
          '<block type="controls_repeat_ext">' +
          '<value name="TIMES">' +
          '<shadow type="math_number">' +
          '<field name="NUM">10</field>' +
          '</shadow>' +
          '</value>' +
          '<statement name="DO">' +
          '<block type="controls_if"></block>' +
          '</statement>' +
          '</block>',
        toString: 'repeat 10 times do if ? do ?',
      },
      {
        name: 'nested Boolean output blocks',
        xml:
          '<block type="controls_if">' +
          '<value name="IF0">' +
          '<block type="logic_compare">' +
          '<field name="OP">EQ</field>' +
          '<value name="A">' +
          '<block type="logic_operation">' +
          '<field name="OP">AND</field>' +
          '</block>' +
          '</value>' +
          '</block>' +
          '</value>' +
          '</block>',
        toString: 'if ((? and ?) = ?) do ?',
      },
      {
        name: 'output block',
        xml:
          '<block type="math_single">' +
          '<field name="OP">ROOT</field>' +
          '<value name="NUM">' +
          '<shadow type="math_number">' +
          '<field name="NUM">9</field>' +
          '</shadow>' +
          '</value>' +
          '</block>',
        toString: 'square root 9',
      },
      {
        name: 'nested Number output blocks',
        xml:
          '<block type="math_arithmetic">' +
          '<field name="OP">ADD</field>' +
          '<value name="A">' +
          '<shadow type="math_number">' +
          '<field name="NUM">1</field>' +
          '</shadow>' +
          '<block type="math_arithmetic">' +
          '<field name="OP">MULTIPLY</field>' +
          '<value name="A">' +
          '<shadow type="math_number">' +
          '<field name="NUM">10</field>' +
          '</shadow>' +
          '</value>' +
          '<value name="B">' +
          '<shadow type="math_number">' +
          '<field name="NUM">5</field>' +
          '</shadow>' +
          '</value>' +
          '</block>' +
          '</value>' +
          '<value name="B">' +
          '<shadow type="math_number">' +
          '<field name="NUM">3</field>' +
          '</shadow>' +
          '</value>' +
          '</block>',
        toString: '(10 × 5) + 3',
      },
      {
        name: 'nested String output blocks',
        xml:
          '<block type="text_join">' +
          '<mutation items="2"></mutation>' +
          '<value name="ADD0">' +
          '<block type="text">' +
          '<field name="TEXT">Hello</field>' +
          '</block>' +
          '</value>' +
          '<value name="ADD1">' +
          '<block type="text">' +
          '<field name="TEXT">World</field>' +
          '</block>' +
          '</value>' +
          '</block>',
        toString: 'create text with “ Hello ” “ World ”',
      },
      {
        name: 'parentheses in string literal',
        xml:
          '<block type="text">' +
          '<field name="TEXT">foo ( bar ) baz</field>' +
          '</block>',
        toString: '“ foo ( bar ) baz ”',
      },
    ];
    // Create mocha test cases for each toString test.
    toStringTests.forEach(function (t) {
      test(t.name, function () {
        const block = Blockly.Xml.domToBlock(
          Blockly.utils.xml.textToDom(t.xml),
          this.workspace,
        );
        chai.assert.equal(block.toString(), t.toString);
      });
    });
  });

  suite('Initialization', function () {
    setup(function () {
      Blockly.defineBlocksWithJsonArray([
        {
          'type': 'init_test_block',
          'message0': '',
        },
      ]);
    });
    test('recordUndo is reset even if init throws', function () {
      // The test could pass if init is never called,
      // so we assert init was called to be safe.
      let initCalled = false;
      let recordUndoDuringInit;
      Blockly.Blocks['init_test_block'].init = function () {
        initCalled = true;
        recordUndoDuringInit = eventUtils.getRecordUndo();
        throw new Error();
      };
      chai.assert.throws(
        function () {
          this.workspace.newBlock('init_test_block');
        }.bind(this),
      );
      chai.assert.isFalse(
        recordUndoDuringInit,
        'recordUndo should be false during block init function',
      );
      chai.assert.isTrue(
        eventUtils.getRecordUndo(),
        'recordUndo should be reset to true after init',
      );
      chai.assert.isTrue(initCalled, 'expected init function to be called');
    });
  });

  suite('EndOfRow', function () {
    setup(function () {
      Blockly.defineBlocksWithJsonArray([
        {
          'type': 'end_row_test_block',
          'message0': 'Row1\nRow2',
          'inputsInline': true,
        },
      ]);
    });
    test('Newline is converted to an end-row input', function () {
      const block = this.workspace.newBlock('end_row_test_block');
      chai.assert.equal(block.inputList[0].fieldRow[0].getValue(), 'Row1');
      chai.assert.isTrue(
        block.inputList[0] instanceof EndRowInput,
        'newline should be converted to an end-row input',
      );
      chai.assert.equal(block.inputList[1].fieldRow[0].getValue(), 'Row2');
    });
  });
});
