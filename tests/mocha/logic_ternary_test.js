/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Logic ternary', function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = new Blockly.Workspace();
    this.block = this.workspace.newBlock('logic_ternary');
  });

  teardown(function() {
    sharedTestTeardown.call(this);
  });

  test('Structure', function() {
    chai.assert.exists(this.block.inputList, 'Has inputList');
    chai.assert.equal(this.block.inputList.length, 3);
    chai.assert.equal(this.block.getInput('IF').connection.check_.length, 1);
    chai.assert.equal(this.block.getInput('IF').connection.check_[0], 'Boolean');
    chai.assert.exists(this.block.onchangeWrapper_, 'Has onchange handler');
  });

  function connectParentAndCheckConnections(
      block, parent, parentInputName, opt_thenInput, opt_elseInput) {
    parent.getInput(parentInputName).connection.connect(block.outputConnection);
    Blockly.Events.fireNow_();  // Force synchronous onchange() call.
    chai.assert.equal(block.getParent(), parent,
        'Successful connection to parent');
    if (opt_thenInput) {
      chai.assert.equal(opt_thenInput.getParent(), block,
          'Input THEN still connected after connecting parent');
    }
    if (opt_elseInput) {
      chai.assert.equal(opt_elseInput.getParent(), block,
          'Input ELSE still connected after connecting parent');
    }
  }
  function connectThenInputAndCheckConnections(
      block, thenInput, opt_elseInput, opt_parent) {
    block.getInput('THEN').connection.connect(thenInput.outputConnection);
    Blockly.Events.fireNow_();  // Force synchronous onchange() call.
    chai.assert.equal(thenInput.getParent(), block, 'THEN is connected');
    if (opt_parent) {
      chai.assert.equal(block.getParent(), opt_parent,
          'Still connected to parent after connecting THEN');
    }
    if (opt_elseInput) {
      chai.assert.equal(opt_elseInput.getParent(), block,
          'Input ELSE still connected after connecting THEN');
    }
  }
  function connectElseInputAndCheckConnections(
      block, elseInput, opt_thenInput, opt_parent) {
    block.getInput('ELSE').connection.connect(elseInput.outputConnection);
    Blockly.Events.fireNow_();  // Force synchronous onchange() call.
    chai.assert.equal(elseInput.getParent(), block, 'ELSE is connected');
    if (opt_parent) {
      chai.assert.equal(block.getParent(), opt_parent,
          'Still connected to parent after connecting ELSE');
    }
    if (opt_thenInput) {
      chai.assert.equal(opt_thenInput.getParent(), block,
          'Input THEN still connected after connecting ELSE');
    }
  }
  function connectInputsAndCheckConnections(
      block, thenInput, elseInput, opt_parent) {
    connectThenInputAndCheckConnections(block, thenInput, null, opt_parent);
    connectElseInputAndCheckConnections(block, elseInput, thenInput, opt_parent);
  }
  suite('No parent', function() {
    test('Attach inputs same type', function() {
      var string1 = this.workspace.newBlock('text');
      var string2 = this.workspace.newBlock('text_charAt');

      connectInputsAndCheckConnections(this.block, string1, string2);
    });
    test('Attach inputs different types', function() {
      var string = this.workspace.newBlock('text');
      var number = this.workspace.newBlock('math_number');

      connectInputsAndCheckConnections(this.block, string, number);
    });
  });
  suite('With parent already attached', function() {
    test('Attach inputs same type with matching parent', function() {
      var parent = this.workspace.newBlock('text_trim');

      connectParentAndCheckConnections(this.block, parent, 'TEXT');

      var string1 = this.workspace.newBlock('text');
      var string2 = this.workspace.newBlock('text_charAt');

      connectInputsAndCheckConnections(this.block, string1, string2, parent);
    });
    test('Attach inputs different types with unchecked parent', function() {
      var parent = this.workspace.newBlock('text_print');

      connectParentAndCheckConnections(this.block, parent, 'TEXT');

      var string = this.workspace.newBlock('text');
      var number = this.workspace.newBlock('math_number');

      connectInputsAndCheckConnections(this.block, string, number, parent);
    });
    test('Attach inputs different types with permissive parent', function() {
      var parent = this.workspace.newBlock('text_length');  // Allows String or Array

      connectParentAndCheckConnections(this.block, parent, 'VALUE');

      var string = this.workspace.newBlock('text');
      var array = this.workspace.newBlock('lists_create_empty');

      connectInputsAndCheckConnections(this.block, string, array, parent);
    });
    test('Attach mismatch type to then causes break with parent', function() {
      var parent = this.workspace.newBlock('text_length');  // Allows String or Array

      connectParentAndCheckConnections(this.block, parent, 'VALUE');

      var string = this.workspace.newBlock('text');
      var number = this.workspace.newBlock('math_number');

      connectElseInputAndCheckConnections(this.block, string, null, parent);

      // Adding mismatching number.
      connectThenInputAndCheckConnections(this.block, number, string);
      chai.assert.equal(this.block.getRootBlock(), this.block,
          'Disconnected from parent');
    });
    test('Attach mismatch type to else causes break with parent', function() {
      var parent = this.workspace.newBlock('text_length');  // Allows String or Array

      connectParentAndCheckConnections(this.block, parent, 'VALUE');

      var string = this.workspace.newBlock('text');
      var number = this.workspace.newBlock('math_number');

      connectThenInputAndCheckConnections(this.block, string, null, parent);

      // Adding mismatching number.
      connectElseInputAndCheckConnections(this.block, number, string);
      chai.assert.equal(this.block.getRootBlock(), this.block,
          'Disconnected from parent');
    });
  });
  suite('Attaching parent after inputs', function() {
    test('Unchecked parent with inputs different types', function() {
      var string = this.workspace.newBlock('text');
      var number = this.workspace.newBlock('math_number');

      connectInputsAndCheckConnections(this.block, string, number);

      var parent = this.workspace.newBlock('text_print');
      connectParentAndCheckConnections(
          this.block, parent, 'TEXT', string, number);
    });
    test('Permissive parent with inputs different types', function() {
      var string = this.workspace.newBlock('text');
      var array = this.workspace.newBlock('lists_create_empty');

      connectInputsAndCheckConnections(this.block, string, array);

      var parent = this.workspace.newBlock('text_print');
      connectParentAndCheckConnections(
          this.block, parent, 'TEXT', string, array);
    });
    test('Mismatch with then causes break with then', function() {
      var number = this.workspace.newBlock('math_number');
      var string = this.workspace.newBlock('text');

      connectInputsAndCheckConnections(this.block, number, string);

      var parent = this.workspace.newBlock('text_trim');
      connectParentAndCheckConnections(
          this.block, parent, 'TEXT', null, string);
      chai.assert.equal(number.getRootBlock(), number,
          'Input THEN disconnected');
    });
    test('Mismatch with else causes break with else', function() {
      var string = this.workspace.newBlock('text');
      var number = this.workspace.newBlock('math_number');

      connectInputsAndCheckConnections(this.block, string, number);

      var parent = this.workspace.newBlock('text_trim');
      connectParentAndCheckConnections(this.block, parent, 'TEXT', string);
      chai.assert.equal(number.getRootBlock(), number,
          'Input ELSE disconnected');
    });
  });
});
