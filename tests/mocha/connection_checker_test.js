/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

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
      var connection = new Blockly.Connection({}, Blockly.INPUT_VALUE);
      assertReasonHelper(
          this.checker,
          connection,
          null,
          Blockly.Connection.REASON_TARGET_NULL);
    });
    test('Target Self', function() {
      var block = {workspace: 1};
      var connection1 = new Blockly.Connection(block, Blockly.INPUT_VALUE);
      var connection2 = new Blockly.Connection(block, Blockly.OUTPUT_VALUE);

      assertReasonHelper(
          this.checker,
          connection1,
          connection2,
          Blockly.Connection.REASON_SELF_CONNECTION);
    });
    test('Different Workspaces', function() {
      var connection1 = new Blockly.Connection(
          {workspace: 1}, Blockly.INPUT_VALUE);
      var connection2 = new Blockly.Connection(
          {workspace: 2}, Blockly.OUTPUT_VALUE);

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
        var prevBlock = { isShadow: function() {}};
        var nextBlock = { isShadow: function() {}};
        var outBlock = { isShadow: function() {}};
        var inBlock = { isShadow: function() {}};
        this.previous = new Blockly.Connection(
            prevBlock, Blockly.PREVIOUS_STATEMENT);
        this.next = new Blockly.Connection(
            nextBlock, Blockly.NEXT_STATEMENT);
        this.output = new Blockly.Connection(
            outBlock, Blockly.OUTPUT_VALUE);
        this.input = new Blockly.Connection(
            inBlock, Blockly.INPUT_VALUE);
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
        var prevBlock = { isShadow: function() { return true; }};
        var nextBlock = { isShadow: function() { return false; }};
        var prev = new Blockly.Connection(prevBlock, Blockly.PREVIOUS_STATEMENT);
        var next = new Blockly.Connection(nextBlock, Blockly.NEXT_STATEMENT);

        assertReasonHelper(
            this.checker,
            prev,
            next,
            Blockly.Connection.CAN_CONNECT);
      });
      test('Next Shadow', function() {
        var prevBlock = { isShadow: function() { return false; }};
        var nextBlock = { isShadow: function() { return true; }};
        var prev = new Blockly.Connection(prevBlock, Blockly.PREVIOUS_STATEMENT);
        var next = new Blockly.Connection(nextBlock, Blockly.NEXT_STATEMENT);

        assertReasonHelper(
            this.checker,
            prev,
            next,
            Blockly.Connection.REASON_SHADOW_PARENT);
      });
      test('Prev and Next Shadow', function() {
        var prevBlock = { isShadow: function() { return true; }};
        var nextBlock = { isShadow: function() { return true; }};
        var prev = new Blockly.Connection(prevBlock, Blockly.PREVIOUS_STATEMENT);
        var next = new Blockly.Connection(nextBlock, Blockly.NEXT_STATEMENT);

        assertReasonHelper(
            this.checker,
            prev,
            next,
            Blockly.Connection.CAN_CONNECT);
      });
      test('Output Shadow', function() {
        var outBlock = { isShadow: function() { return true; }};
        var inBlock = { isShadow: function() { return false; }};
        var outCon = new Blockly.Connection(outBlock, Blockly.OUTPUT_VALUE);
        var inCon = new Blockly.Connection(inBlock, Blockly.INPUT_VALUE);

        assertReasonHelper(
            this.checker,
            outCon,
            inCon,
            Blockly.Connection.CAN_CONNECT);
      });
      test('Input Shadow', function() {
        var outBlock = { isShadow: function() { return false; }};
        var inBlock = { isShadow: function() { return true; }};
        var outCon = new Blockly.Connection(outBlock, Blockly.OUTPUT_VALUE);
        var inCon = new Blockly.Connection(inBlock, Blockly.INPUT_VALUE);

        assertReasonHelper(
            this.checker,
            outCon,
            inCon,
            Blockly.Connection.REASON_SHADOW_PARENT);
      });
      test('Output and Input Shadow', function() {
        var outBlock = { isShadow: function() { return true; }};
        var inBlock = { isShadow: function() { return true; }};
        var outCon = new Blockly.Connection(outBlock, Blockly.OUTPUT_VALUE);
        var inCon = new Blockly.Connection(inBlock, Blockly.INPUT_VALUE);

        assertReasonHelper(
            this.checker,
            outCon,
            inCon,
            Blockly.Connection.CAN_CONNECT);
      });
    });
  });
  suite('Check Types', function() {
    setup(function() {
      this.con1 = new Blockly.Connection({}, Blockly.PREVIOUS_STATEMENT);
      this.con2 = new Blockly.Connection({}, Blockly.NEXT_STATEMENT);
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
