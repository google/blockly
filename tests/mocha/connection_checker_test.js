/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.connectionChecker');

const {ConnectionType} = goog.require('Blockly.ConnectionType');
const {sharedTestSetup, sharedTestTeardown} = goog.require('Blockly.test.helpers.setupTeardown');


suite('Connection checker', function() {
  setup(function() {
    sharedTestSetup.call(this);
  });
  teardown(function() {
    sharedTestTeardown.call(this);
  });
  suiteSetup(function() {
    this.checker = new Blockly.ConnectionChecker();
  });
  suite('Safety checks', function() {
    function assertReasonHelper(checker, one, two, reason) {
      chai.assert.equal(checker.canConnectWithReason(one, two), reason);
      // Order should not matter.
      chai.assert.equal(checker.canConnectWithReason(two, one), reason);
    }

    test('Target Null', function() {
      const connection = new Blockly.Connection({}, ConnectionType.INPUT_VALUE);
      assertReasonHelper(
          this.checker,
          connection,
          null,
          Blockly.Connection.REASON_TARGET_NULL);
    });
    test('Target Self', function() {
      const block = {workspace: 1};
      const connection1 = new Blockly.Connection(block, ConnectionType.INPUT_VALUE);
      const connection2 = new Blockly.Connection(block, ConnectionType.OUTPUT_VALUE);

      assertReasonHelper(
          this.checker,
          connection1,
          connection2,
          Blockly.Connection.REASON_SELF_CONNECTION);
    });
    test('Different Workspaces', function() {
      const connection1 = new Blockly.Connection(
          {workspace: 1}, ConnectionType.INPUT_VALUE);
      const connection2 = new Blockly.Connection(
          {workspace: 2}, ConnectionType.OUTPUT_VALUE);

      assertReasonHelper(
          this.checker,
          connection1,
          connection2,
          Blockly.Connection.REASON_DIFFERENT_WORKSPACES);
    });
    suite('Types', function() {
      setup(function() {
        // We have to declare each separately so that the connections belong
        // on different blocks.
        const prevBlock = {isShadow: function() {}};
        const nextBlock = {isShadow: function() {}};
        const outBlock = {isShadow: function() {}};
        const inBlock = {isShadow: function() {}};
        this.previous = new Blockly.Connection(
            prevBlock, ConnectionType.PREVIOUS_STATEMENT);
        this.next = new Blockly.Connection(
            nextBlock, ConnectionType.NEXT_STATEMENT);
        this.output = new Blockly.Connection(
            outBlock, ConnectionType.OUTPUT_VALUE);
        this.input = new Blockly.Connection(
            inBlock, ConnectionType.INPUT_VALUE);
      });
      test('Previous, Next', function() {
        assertReasonHelper(
            this.checker,
            this.previous,
            this.next,
            Blockly.Connection.CAN_CONNECT);
      });
      test('Previous, Output', function() {
        assertReasonHelper(
            this.checker,
            this.previous,
            this.output,
            Blockly.Connection.REASON_WRONG_TYPE);
      });
      test('Previous, Input', function() {
        assertReasonHelper(
            this.checker,
            this.previous,
            this.input,
            Blockly.Connection.REASON_WRONG_TYPE);
      });
      test('Next, Previous', function() {
        assertReasonHelper(
            this.checker,
            this.next,
            this.previous,
            Blockly.Connection.CAN_CONNECT);
      });
      test('Next, Output', function() {
        assertReasonHelper(
            this.checker,
            this.next,
            this.output,
            Blockly.Connection.REASON_WRONG_TYPE);
      });
      test('Next, Input', function() {
        assertReasonHelper(
            this.checker,
            this.next,
            this.input,
            Blockly.Connection.REASON_WRONG_TYPE);
      });
      test('Output, Previous', function() {
        assertReasonHelper(
            this.checker,
            this.previous,
            this.output,
            Blockly.Connection.REASON_WRONG_TYPE);
      });
      test('Output, Next', function() {
        assertReasonHelper(
            this.checker,
            this.output,
            this.next,
            Blockly.Connection.REASON_WRONG_TYPE);
      });
      test('Output, Input', function() {
        assertReasonHelper(
            this.checker,
            this.output,
            this.input,
            Blockly.Connection.CAN_CONNECT);
      });
      test('Input, Previous', function() {
        assertReasonHelper(
            this.checker,
            this.previous,
            this.input,
            Blockly.Connection.REASON_WRONG_TYPE);
      });
      test('Input, Next', function() {
        assertReasonHelper(
            this.checker,
            this.input,
            this.next,
            Blockly.Connection.REASON_WRONG_TYPE);
      });
      test('Input, Output', function() {
        assertReasonHelper(
            this.checker,
            this.input,
            this.output,
            Blockly.Connection.CAN_CONNECT);
      });
    });
    suite('Shadows', function() {
      test('Previous Shadow', function() {
        const prevBlock = {isShadow: function() {return true;}};
        const nextBlock = {isShadow: function() {return false;}};
        const prev = new Blockly.Connection(prevBlock, ConnectionType.PREVIOUS_STATEMENT);
        const next = new Blockly.Connection(nextBlock, ConnectionType.NEXT_STATEMENT);

        assertReasonHelper(
            this.checker,
            prev,
            next,
            Blockly.Connection.CAN_CONNECT);
      });
      test('Next Shadow', function() {
        const prevBlock = {isShadow: function() {return false;}};
        const nextBlock = {isShadow: function() {return true;}};
        const prev = new Blockly.Connection(prevBlock, ConnectionType.PREVIOUS_STATEMENT);
        const next = new Blockly.Connection(nextBlock, ConnectionType.NEXT_STATEMENT);

        assertReasonHelper(
            this.checker,
            prev,
            next,
            Blockly.Connection.REASON_SHADOW_PARENT);
      });
      test('Prev and Next Shadow', function() {
        const prevBlock = {isShadow: function() {return true;}};
        const nextBlock = {isShadow: function() {return true;}};
        const prev = new Blockly.Connection(prevBlock, ConnectionType.PREVIOUS_STATEMENT);
        const next = new Blockly.Connection(nextBlock, ConnectionType.NEXT_STATEMENT);

        assertReasonHelper(
            this.checker,
            prev,
            next,
            Blockly.Connection.CAN_CONNECT);
      });
      test('Output Shadow', function() {
        const outBlock = {isShadow: function() {return true;}};
        const inBlock = {isShadow: function() {return false;}};
        const outCon = new Blockly.Connection(outBlock, ConnectionType.OUTPUT_VALUE);
        const inCon = new Blockly.Connection(inBlock, ConnectionType.INPUT_VALUE);

        assertReasonHelper(
            this.checker,
            outCon,
            inCon,
            Blockly.Connection.CAN_CONNECT);
      });
      test('Input Shadow', function() {
        const outBlock = {isShadow: function() {return false;}};
        const inBlock = {isShadow: function() {return true;}};
        const outCon = new Blockly.Connection(outBlock, ConnectionType.OUTPUT_VALUE);
        const inCon = new Blockly.Connection(inBlock, ConnectionType.INPUT_VALUE);

        assertReasonHelper(
            this.checker,
            outCon,
            inCon,
            Blockly.Connection.REASON_SHADOW_PARENT);
      });
      test('Output and Input Shadow', function() {
        const outBlock = {isShadow: function() {return true;}};
        const inBlock = {isShadow: function() {return true;}};
        const outCon = new Blockly.Connection(outBlock, ConnectionType.OUTPUT_VALUE);
        const inCon = new Blockly.Connection(inBlock, ConnectionType.INPUT_VALUE);

        assertReasonHelper(
            this.checker,
            outCon,
            inCon,
            Blockly.Connection.CAN_CONNECT);
      });
    });
    suite('Output and Previous', function() {
      /**
       * Update two connections to target each other.
       * @param {Connection} first The first connection to update.
       * @param {Connection} second The second connection to update.
       */
      const connectReciprocally = function(first, second) {
        if (!first || !second) {
          throw Error('Cannot connect null connections.');
        }
        first.targetConnection = second;
        second.targetConnection = first;
      };
      test('Output connected, adding previous', function() {
        const outBlock = {
          isShadow: function() {
          },
        };
        const inBlock = {
          isShadow: function() {
          },
        };
        const outCon = new Blockly.Connection(outBlock, ConnectionType.OUTPUT_VALUE);
        const inCon = new Blockly.Connection(inBlock, ConnectionType.INPUT_VALUE);
        outBlock.outputConnection = outCon;
        inBlock.inputConnection = inCon;
        connectReciprocally(inCon, outCon);
        const prevCon = new Blockly.Connection(outBlock, ConnectionType.PREVIOUS_STATEMENT);
        const nextBlock = {
          isShadow: function() {
          },
        };
        const nextCon = new Blockly.Connection(nextBlock, ConnectionType.NEXT_STATEMENT);

        assertReasonHelper(
            this.checker,
            prevCon,
            nextCon,
            Blockly.Connection.REASON_PREVIOUS_AND_OUTPUT);
      });
      test('Previous connected, adding output', function() {
        const prevBlock = {
          isShadow: function() {
          },
        };
        const nextBlock = {
          isShadow: function() {
          },
        };
        const prevCon = new Blockly.Connection(prevBlock, ConnectionType.PREVIOUS_STATEMENT);
        const nextCon = new Blockly.Connection(nextBlock, ConnectionType.NEXT_STATEMENT);
        prevBlock.previousConnection = prevCon;
        nextBlock.nextConnection = nextCon;
        connectReciprocally(prevCon, nextCon);
        const outCon = new Blockly.Connection(prevBlock, ConnectionType.OUTPUT_VALUE);
        const inBlock = {
          isShadow: function() {
          },
        };
        const inCon = new Blockly.Connection(inBlock, ConnectionType.INPUT_VALUE);

        assertReasonHelper(
            this.checker,
            outCon,
            inCon,
            Blockly.Connection.REASON_PREVIOUS_AND_OUTPUT);
      });
    });
  });
  suite('Check Types', function() {
    setup(function() {
      this.con1 = new Blockly.Connection({}, ConnectionType.PREVIOUS_STATEMENT);
      this.con2 = new Blockly.Connection({}, ConnectionType.NEXT_STATEMENT);
    });
    function assertCheckTypes(checker, one, two) {
      chai.assert.isTrue(checker.doTypeChecks(one, two));
      // Order should not matter.
      chai.assert.isTrue(checker.doTypeChecks(one, two));
    }
    test('No Types', function() {
      assertCheckTypes(this.checker, this.con1, this.con2);
    });
    test('Same Type', function() {
      this.con1.setCheck('type1');
      this.con2.setCheck('type1');
      assertCheckTypes(this.checker, this.con1, this.con2);
    });
    test('Same Types', function() {
      this.con1.setCheck(['type1', 'type2']);
      this.con2.setCheck(['type1', 'type2']);
      assertCheckTypes(this.checker, this.con1, this.con2);
    });
    test('Single Same Type', function() {
      this.con1.setCheck(['type1', 'type2']);
      this.con2.setCheck(['type1', 'type3']);
      assertCheckTypes(this.checker, this.con1, this.con2);
    });
    test('One Typed, One Promiscuous', function() {
      this.con1.setCheck('type1');
      assertCheckTypes(this.checker, this.con1, this.con2);
    });
    test('No Compatible Types', function() {
      this.con1.setCheck('type1');
      this.con2.setCheck('type2');
      chai.assert.isFalse(this.checker.doTypeChecks(this.con1, this.con2));
    });
  });
});
