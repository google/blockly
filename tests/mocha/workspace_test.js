/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Workspace', function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = new Blockly.Workspace();
  });

  teardown(function() {
    sharedTestTeardown.call(this);
  });

  // eslint-disable-next-line no-use-before-define
  testAWorkspace();
});

function testAWorkspace() {
  setup(function() {
    Blockly.defineBlocksWithJsonArray([{
      "type": "get_var_block",
      "message0": "%1",
      "args0": [
        {
          "type": "field_variable",
          "name": "VAR",
          "variableTypes": ["", "type1", "type2"]
        }
      ]
    }]);
  });

  teardown(function() {
    // Clear Blockly.Event state.
    Blockly.Events.setGroup(false);
    Blockly.Events.disabled_ = 0;
    sinon.restore();
  });

  function assertBlockVarModelName(workspace, blockIndex, name) {
    var block = workspace.topBlocks_[blockIndex];
    chai.assert.exists(block, 'Block at topBlocks_[' + blockIndex + ']');
    var varModel = block.getVarModels()[0];
    chai.assert.exists(varModel,
        'VariableModel for block at topBlocks_[' + blockIndex + ']');
    var blockVarName = varModel.name;
    chai.assert.equal(blockVarName, name,
        'VariableModel name for block at topBlocks_[' + blockIndex + ']');
  }

  function createVarBlocksNoEvents(workspace, ids) {
    var blocks = [];
    // Turn off events to avoid testing XML at the same time.
    Blockly.Events.disable();
    for (var i = 0, id; (id = ids[i]); i++) {
      var block = new Blockly.Block(workspace, 'get_var_block');
      block.inputList[0].fieldRow[0].setValue(id);
      blocks.push(block);
    }
    Blockly.Events.enable();
    return blocks;
  }

  suite('clear', function() {
    test('Trivial', function() {
      sinon.stub(Blockly.Events, "setGroup").returns(null);
      this.workspace.createVariable('name1', 'type1', 'id1');
      this.workspace.createVariable('name2', 'type2', 'id2');
      this.workspace.newBlock('');

      this.workspace.clear();
      chai.assert.equal(this.workspace.topBlocks_.length, 0);
      var varMapLength =
          Object.keys(this.workspace.variableMap_.variableMap_).length;
      chai.assert.equal(varMapLength, 0);
    });

    test('No variables', function() {
      sinon.stub(Blockly.Events, "setGroup").returns(null);
      this.workspace.newBlock('');

      this.workspace.clear();
      chai.assert.equal(this.workspace.topBlocks_.length, 0);
      var varMapLength =
          Object.keys(this.workspace.variableMap_.variableMap_).length;
      chai.assert.equal(varMapLength, 0);
    });
  });

  suite('deleteVariable', function() {
    setup(function() {
      // Create two variables of different types.
      this.var1 = this.workspace.createVariable('name1', 'type1', 'id1');
      this.var2 = this.workspace.createVariable('name2', 'type2', 'id2');
      // Create blocks to refer to both of them.
      createVarBlocksNoEvents(this.workspace, ['id1', 'id1', 'id2']);
    });

    test('deleteVariableById(id2) one usage', function() {
      // Deleting variable one usage should not trigger confirm dialog.
      var stub =
          sinon.stub(Blockly, "confirm").callsArgWith(1, true);
      this.workspace.deleteVariableById('id2');

      sinon.assert.notCalled(stub);
      var variable = this.workspace.getVariableById('id2');
      chai.assert.isNull(variable);
      assertVariableValues(this.workspace, 'name1', 'type1', 'id1');
      assertBlockVarModelName(this.workspace, 0, 'name1');
    });

    test('deleteVariableById(id1) multiple usages confirm', function() {
      // Deleting variable with multiple usages triggers confirm dialog.
      var stub =
          sinon.stub(Blockly, "confirm").callsArgWith(1, true);
      this.workspace.deleteVariableById('id1');

      sinon.assert.calledOnce(stub);
      var variable = this.workspace.getVariableById('id1');
      chai.assert.isNull(variable);
      assertVariableValues(this.workspace, 'name2', 'type2', 'id2');
      assertBlockVarModelName(this.workspace, 0, 'name2');
    });

    test('deleteVariableById(id1) multiple usages cancel', function() {
      // Deleting variable with multiple usages triggers confirm dialog.
      var stub =
          sinon.stub(Blockly, "confirm").callsArgWith(1, false);
      this.workspace.deleteVariableById('id1');

      sinon.assert.calledOnce(stub);
      assertVariableValues(this.workspace, 'name1', 'type1', 'id1');
      assertVariableValues(this.workspace, 'name2', 'type2', 'id2');
      assertBlockVarModelName(this.workspace, 0, 'name1');
      assertBlockVarModelName(this.workspace, 1, 'name1');
      assertBlockVarModelName(this.workspace, 2, 'name2');
    });
  });

  suite('renameVariableById', function() {
    setup(function() {
      this.workspace.createVariable('name1', 'type1', 'id1');
    });

    test('No references rename to name2', function() {
      this.workspace.renameVariableById('id1', 'name2');
      assertVariableValues(this.workspace, 'name2', 'type1', 'id1');
      // Renaming should not have created a new variable.
      chai.assert.equal(this.workspace.getAllVariables().length, 1);
    });

    test('Reference exists rename to name2', function() {
      createVarBlocksNoEvents(this.workspace, ['id1']);

      this.workspace.renameVariableById('id1', 'name2');
      assertVariableValues(this.workspace, 'name2', 'type1', 'id1');
      // Renaming should not have created a new variable.
      chai.assert.equal(this.workspace.getAllVariables().length, 1);
      assertBlockVarModelName(this.workspace, 0, 'name2');
    });

    test('Reference exists different capitalization rename to Name1', function() {
      createVarBlocksNoEvents(this.workspace, ['id1']);

      this.workspace.renameVariableById('id1', 'Name1');
      assertVariableValues(this.workspace, 'Name1', 'type1', 'id1');
      // Renaming should not have created a new variable.
      chai.assert.equal(this.workspace.getAllVariables().length, 1);
      assertBlockVarModelName(this.workspace, 0, 'Name1');
    });

    suite('Two variables rename overlap', function() {
      test('Same type rename variable with id1 to name2', function() {
        this.workspace.createVariable('name2', 'type1', 'id2');
        createVarBlocksNoEvents(this.workspace, ['id1', 'id2']);

        this.workspace.renameVariableById('id1', 'name2');

        // The second variable should remain unchanged.
        assertVariableValues(this.workspace, 'name2', 'type1', 'id2');
        // The first variable should have been deleted.
        var variable = this.workspace.getVariableById('id1');
        chai.assert.isNull(variable);
        // There should only be one variable left.
        chai.assert.equal(this.workspace.getAllVariables().length, 1);

        // Both blocks should now reference variable with name2.
        assertBlockVarModelName(this.workspace, 0, 'name2');
        assertBlockVarModelName(this.workspace, 1, 'name2');
      });

      test('Different type rename variable with id1 to name2', function() {
        this.workspace.createVariable('name2', 'type2', 'id2');
        createVarBlocksNoEvents(this.workspace, ['id1', 'id2']);

        this.workspace.renameVariableById('id1', 'name2');

        // Variables with different type are allowed to have the same name.
        assertVariableValues(this.workspace, 'name2', 'type1', 'id1');
        assertVariableValues(this.workspace, 'name2', 'type2', 'id2');

        // Both blocks should now reference variable with name2.
        assertBlockVarModelName(this.workspace, 0, 'name2');
        assertBlockVarModelName(this.workspace, 1, 'name2');
      });

      test('Same type different capitalization rename variable with id1 to Name2', function() {
        this.workspace.createVariable('name2', 'type1', 'id2');
        createVarBlocksNoEvents(this.workspace, ['id1', 'id2']);

        this.workspace.renameVariableById('id1', 'Name2');

        // The second variable should be updated.
        assertVariableValues(this.workspace, 'Name2', 'type1', 'id2');
        // The first variable should have been deleted.
        var variable = this.workspace.getVariableById('id1');
        chai.assert.isNull(variable);
        // There should only be one variable left.
        chai.assert.equal(this.workspace.getAllVariables().length, 1);

        // Both blocks should now reference variable with Name2.
        assertBlockVarModelName(this.workspace, 0, 'Name2');
        assertBlockVarModelName(this.workspace, 1, 'Name2');
      });

      test('Different type different capitalization rename variable with id1 to Name2', function() {
        this.workspace.createVariable('name2', 'type2', 'id2');
        createVarBlocksNoEvents(this.workspace, ['id1', 'id2']);

        this.workspace.renameVariableById('id1', 'Name2');

        // Variables with different type are allowed to have the same name.
        assertVariableValues(this.workspace, 'Name2', 'type1', 'id1');
        // Second variable should remain unchanged.
        assertVariableValues(this.workspace, 'name2', 'type2', 'id2');

        // Only first block should use new capitalization.
        assertBlockVarModelName(this.workspace, 0, 'Name2');
        assertBlockVarModelName(this.workspace, 1, 'name2');
      });
    });
  });

  suite('getTopBlocks(ordered=true)', function() {
    test('Empty workspace', function() {
      chai.assert.equal(this.workspace.getTopBlocks(true).length, 0);
    });

    test('Flat workspace one block', function() {
      this.workspace.newBlock('');
      chai.assert.equal(this.workspace.getTopBlocks(true).length, 1);
    });

    test('Flat workspace one block after dispose', function() {
      var blockA = this.workspace.newBlock('');
      this.workspace.newBlock('');
      blockA.dispose();
      chai.assert.equal(this.workspace.getTopBlocks(true).length, 1);
    });

    test('Flat workspace two blocks', function() {
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      chai.assert.equal(this.workspace.getTopBlocks(true).length, 2);
    });

    test('Clear', function() {
      this.workspace.clear();
      chai.assert.equal(this.workspace.getTopBlocks(true).length, 0,
          'Clear empty workspace');
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.clear();
      chai.assert.equal(this.workspace.getTopBlocks(true).length, 0);
    });
  });

  suite('getTopBlocks(ordered=false)', function() {
    test('Empty workspace', function() {
      chai.assert.equal(this.workspace.getTopBlocks(false).length, 0);
    });

    test('Flat workspace one block', function() {
      this.workspace.newBlock('');
      chai.assert.equal(this.workspace.getTopBlocks(false).length, 1);
    });

    test('Flat workspace one block after dispose', function() {
      var blockA = this.workspace.newBlock('');
      this.workspace.newBlock('');
      blockA.dispose();
      chai.assert.equal(this.workspace.getTopBlocks(false).length, 1);
    });

    test('Flat workspace two blocks', function() {
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      chai.assert.equal(this.workspace.getTopBlocks(false).length, 2);
    });

    test('Clear empty workspace', function() {
      this.workspace.clear();
      chai.assert.equal(this.workspace.getTopBlocks(false).length, 0);
    });

    test('Clear non-empty workspace', function() {
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.clear();
      chai.assert.equal(this.workspace.getTopBlocks(false).length, 0);
    });
  });

  suite('getAllBlocks', function() {
    test('Empty workspace', function() {
      chai.assert.equal(this.workspace.getAllBlocks(true).length, 0);
    });

    test('Flat workspace one block', function() {
      this.workspace.newBlock('');
      chai.assert.equal(this.workspace.getAllBlocks(true).length, 1);
    });

    test('Flat workspace one block after dispose', function() {
      var blockA = this.workspace.newBlock('');
      this.workspace.newBlock('');
      blockA.dispose();
      chai.assert.equal(this.workspace.getAllBlocks(true).length, 1);
    });

    test('Flat workspace two blocks', function() {
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      chai.assert.equal(this.workspace.getAllBlocks(true).length, 2);
    });

    test('Clear', function() {
      this.workspace.clear();
      chai.assert.equal(this.workspace.getAllBlocks(true).length, 0,
          'Clear empty workspace');
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.clear();
      chai.assert.equal(this.workspace.getAllBlocks(true).length, 0);
    });
  });

  suite('remainingCapacity', function() {
    setup(function() {
      this.workspace.newBlock('');
      this.workspace.newBlock('');
    });

    test('No block limit', function() {
      chai.assert.equal(this.workspace.remainingCapacity(), Infinity);
    });

    test('Under block limit', function() {
      this.workspace.options.maxBlocks = 3;
      chai.assert.equal(this.workspace.remainingCapacity(), 1);
      this.workspace.options.maxBlocks = 4;
      chai.assert.equal(this.workspace.remainingCapacity(), 2);
    });

    test('At block limit', function() {
      this.workspace.options.maxBlocks = 2;
      chai.assert.equal(this.workspace.remainingCapacity(), 0);
    });

    test('At block limit of 0 after clear', function() {
      this.workspace.options.maxBlocks = 0;
      this.workspace.clear();
      chai.assert.equal(this.workspace.remainingCapacity(), 0);
    });

    test('Over block limit', function() {
      this.workspace.options.maxBlocks = 1;
      chai.assert.equal(this.workspace.remainingCapacity(), -1);
    });

    test('Over block limit of 0', function() {
      this.workspace.options.maxBlocks = 0;
      chai.assert.equal(this.workspace.remainingCapacity(), -2);
    });
  });

  suite('remainingCapacityOfType', function() {
    setup(function() {
      this.workspace.newBlock('get_var_block');
      this.workspace.newBlock('get_var_block');
      this.workspace.options.maxInstances = {};
    });

    test('No instance limit', function() {
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          Infinity);
    });

    test('Under instance limit', function() {
      this.workspace.options.maxInstances['get_var_block'] = 3;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          1, 'With maxInstances limit 3');
      this.workspace.options.maxInstances['get_var_block'] = 4;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          2, 'With maxInstances limit 4');
    });

    test('Under instance limit with multiple block types', function() {
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.options.maxInstances['get_var_block'] = 3;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          1, 'With maxInstances limit 3');
      this.workspace.options.maxInstances['get_var_block'] = 4;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          2, 'With maxInstances limit 4');
    });

    test('At instance limit', function() {
      this.workspace.options.maxInstances['get_var_block'] = 2;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          0, 'With maxInstances limit 2');
    });

    test('At instance limit of 0 after clear', function() {
      this.workspace.clear();
      this.workspace.options.maxInstances['get_var_block'] = 0;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          0);
    });

    test('At instance limit with multiple block types', function() {
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.options.maxInstances['get_var_block'] = 2;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          0, 'With maxInstances limit 2');
    });

    test('At instance limit of 0 with multiple block types', function() {
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.options.maxInstances['get_var_block'] = 0;
      this.workspace.clear();
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          0);
    });

    test('Over instance limit', function() {
      this.workspace.options.maxInstances['get_var_block'] = 1;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          -1,'With maxInstances limit 1');
    });

    test('Over instance limit of 0', function() {
      this.workspace.options.maxInstances['get_var_block'] = 0;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          -2,'With maxInstances limit 0');
    });

    test('Over instance limit with multiple block types', function() {
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.options.maxInstances['get_var_block'] = 1;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          -1,'With maxInstances limit 1');
    });

    test('Over instance limit of 0 with multiple block types', function() {
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.options.maxInstances['get_var_block'] = 0;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          -2,'With maxInstances limit 0');
    });
  });

  suite('isCapacityAvailable', function() {
    setup(function() {
      this.workspace.newBlock('get_var_block');
      this.workspace.newBlock('get_var_block');
      this.workspace.options.maxInstances = {};
    });

    test('Under block limit and no instance limit', function() {
      this.workspace.options.maxBlocks = 3;
      var typeCountsMap = {'get_var_block': 1};
      chai.assert.isTrue(this.workspace.isCapacityAvailable(typeCountsMap));
    });

    test('At block limit and no instance limit', function() {
      this.workspace.options.maxBlocks = 2;
      var typeCountsMap = {'get_var_block': 1};
      chai.assert.isFalse(this.workspace.isCapacityAvailable(typeCountsMap));
    });

    test('Over block limit of 0 and no instance limit', function() {
      this.workspace.options.maxBlocks = 0;
      var typeCountsMap = {'get_var_block': 1};
      chai.assert.isFalse(this.workspace.isCapacityAvailable(typeCountsMap));
    });

    test('Over block limit but under instance limit', function() {
      this.workspace.options.maxBlocks = 1;
      this.workspace.options.maxInstances['get_var_block'] = 3;
      var typeCountsMap = {'get_var_block': 1};
      chai.assert.isFalse(this.workspace.isCapacityAvailable(typeCountsMap),
          'With maxBlocks limit 1 and maxInstances limit 3');
    });

    test('Over block limit of 0 but under instance limit', function() {
      this.workspace.options.maxBlocks = 0;
      this.workspace.options.maxInstances['get_var_block'] = 3;
      var typeCountsMap = {'get_var_block': 1};
      chai.assert.isFalse(this.workspace.isCapacityAvailable(typeCountsMap),
          'With maxBlocks limit 0 and maxInstances limit 3');
    });

    test('Over block limit but at instance limit', function() {
      this.workspace.options.maxBlocks = 1;
      this.workspace.options.maxInstances['get_var_block'] = 2;
      var typeCountsMap = {'get_var_block': 1};
      chai.assert.isFalse(this.workspace.isCapacityAvailable(typeCountsMap),
          'With maxBlocks limit 1 and maxInstances limit 2');
    });

    test('Over block limit and over instance limit', function() {
      this.workspace.options.maxBlocks = 1;
      this.workspace.options.maxInstances['get_var_block'] = 1;
      var typeCountsMap = {'get_var_block': 1};
      chai.assert.isFalse(this.workspace.isCapacityAvailable(typeCountsMap),
          'With maxBlocks limit 1 and maxInstances limit 1');
    });

    test('Over block limit of 0 and over instance limit', function() {
      this.workspace.options.maxBlocks = 0;
      this.workspace.options.maxInstances['get_var_block'] = 1;
      var typeCountsMap = {'get_var_block': 1};
      chai.assert.isFalse(this.workspace.isCapacityAvailable(typeCountsMap),
          'With maxBlocks limit 0 and maxInstances limit 1');
    });

    test('Over block limit and over instance limit of 0', function() {
      this.workspace.options.maxBlocks = 1;
      this.workspace.options.maxInstances['get_var_block'] = 0;
      var typeCountsMap = {'get_var_block': 1};
      chai.assert.isFalse(this.workspace.isCapacityAvailable(typeCountsMap),
          'With maxBlocks limit 1 and maxInstances limit 0');
    });

    test('Over block limit of 0 and over instance limit of 0', function() {
      this.workspace.options.maxBlocks = 0;
      this.workspace.options.maxInstances['get_var_block'] = 0;
      var typeCountsMap = {'get_var_block': 1};
      chai.assert.isFalse(this.workspace.isCapacityAvailable(typeCountsMap));
    });
  });

  suite('getById', function() {
    setup(function() {
      this.workspaceB = this.workspace.rendered ?
          new Blockly.WorkspaceSvg(new Blockly.Options({})) :
          new Blockly.Workspace();
    });

    teardown(function() {
      workspaceTeardown.call(this, this.workspaceB);
    });

    test('Trivial', function() {
      chai.assert.equal(Blockly.Workspace.getById(
          this.workspace.id), this.workspace, 'Find workspace');
      chai.assert.equal(Blockly.Workspace.getById(
          this.workspaceB.id), this.workspaceB, 'Find workspaceB');
    });

    test('Null id', function() {
      chai.assert.isNull(Blockly.Workspace.getById(null));
    });

    test('Non-existent id', function() {
      chai.assert.isNull(Blockly.Workspace.getById('badId'));
    });

    test('After dispose', function() {
      this.workspaceB.dispose();
      chai.assert.isNull(Blockly.Workspace.getById(this.workspaceB.id));
    });
  });

  suite('getBlockById', function() {
    setup(function() {
      this.blockA = this.workspace.newBlock('');
      this.blockB = this.workspace.newBlock('');
      this.workspaceB = this.workspace.rendered ?
          new Blockly.WorkspaceSvg(new Blockly.Options({})) :
          new Blockly.Workspace();
    });

    teardown(function() {
      workspaceTeardown.call(this, this.workspaceB);
    });

    test('Trivial', function() {
      chai.assert.equal(
          this.workspace.getBlockById(this.blockA.id),this.blockA);
      chai.assert.equal(
          this.workspace.getBlockById(this.blockB.id), this.blockB);
    });

    test('Null id', function() {
      chai.assert.isNull(this.workspace.getBlockById(null));
    });

    test('Non-existent id', function() {
      chai.assert.isNull(this.workspace.getBlockById('badId'));
    });

    test('After dispose', function() {
      this.blockA.dispose();
      chai.assert.isNull(this.workspace.getBlockById(this.blockA.id));
      chai.assert.equal(
          this.workspace.getBlockById(this.blockB.id), this.blockB);
    });

    test('After clear', function() {
      this.workspace.clear();
      chai.assert.isNull(this.workspace.getBlockById(this.blockA.id));
      chai.assert.isNull(this.workspace.getBlockById(this.blockB.id));
    });
  });

  suite('Undo/Redo', function() {

    /**
     * Assert that two nodes are equal.
     * @param {!Element} actual the actual node.
     * @param {!Element} expected the expected node.
     */
    function assertNodesEqual(actual, expected) {
      var actualString = '\n' + Blockly.Xml.domToPrettyText(actual) + '\n';
      var expectedString = '\n' + Blockly.Xml.domToPrettyText(expected) + '\n';

      chai.assert.equal(actual.tagName, expected.tagName);
      for (var i = 0, attr; (attr = expected.attributes[i]); i++) {
        chai.assert.equal(actual.getAttribute(attr.name), attr.value,
            `expected attribute ${attr.name} on ${actualString} to match ` +
            `${expectedString}`);
      }
      chai.assert.equal(actual.childElementCount, expected.childElementCount,
          `expected node ${actualString} to have the same children as node ` +
          `${expectedString}`);
      for (var i = 0; i < expected.childElementCount; i++) {
        assertNodesEqual(actual.children[i], expected.children[i]);
      }
    }

    suite('Undo Delete', function() {
      setup(function() {
        Blockly.defineBlocksWithJsonArray([
          {
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
            "output": null
          },
          {
            "type": "statement_block",
            "message0": "%1",
            "args0": [
              {
                "type": "input_statement",
                "name": "STATEMENT"
              }
            ],
            "previousStatement": null,
            "nextStatement": null
          }]);
      });

      teardown(function() {
        delete Blockly.Blocks['stack_block'];
        delete Blockly.Blocks['row_block'];
        delete Blockly.Blocks['statement_block'];
      });

      function testUndoDelete(xmlText) {
        var xml = Blockly.Xml.textToDom(xmlText);
        Blockly.Xml.domToBlock(xml, this.workspace);
        this.workspace.getTopBlocks()[0].dispose(false);
        this.workspace.undo();
        var newXml = Blockly.Xml.workspaceToDom(this.workspace);
        assertNodesEqual(newXml.firstChild, xml);
      }

      test('Stack', function() {
        testUndoDelete.call(this, '<block type="stack_block" id="1"/>');
      });

      test('Row', function() {
        testUndoDelete.call(this, '<block type="row_block" id="1"/>');
      });

      test('Statement', function() {
        testUndoDelete.call(this, '<block type="statement_block" id="1"/>');
      });

      test('Stack w/ child', function() {
        testUndoDelete.call(this,
            '<block type="stack_block" id="1">' +
            '  <next>' +
            '    <block type="stack_block" id="2"></block>' +
            '  </next>' +
            '</block>'
        );
      });

      test('Row w/ child', function() {
        testUndoDelete.call(this,
            '<block type="row_block" id="1">' +
            '  <value name="INPUT">' +
            '    <block type="row_block" id="2"></block>' +
            '  </value>' +
            '</block>'
        );
      });

      test('Statement w/ child', function() {
        testUndoDelete.call(this,
            '<block type="statement_block" id="1">' +
            '  <statement name="STATEMENT">' +
            '    <block type="stack_block" id="2"></block>' +
            '  </statement>' +
            '</block>'
        );
      });

      test('Stack w/ shadow', function() {
        testUndoDelete.call(this,
            '<block type="stack_block" id="1">' +
            '  <next>' +
            '    <shadow type="stack_block" id="2"></shadow>' +
            '  </next>' +
            '</block>'
        );
      });

      test('Row w/ shadow', function() {
        testUndoDelete.call(this,
            '<block type="row_block" id="1">' +
            '  <value name="INPUT">' +
            '    <shadow type="row_block" id="2"></shadow>' +
            '  </value>' +
            '</block>'
        );
      });

      test('Statement w/ shadow', function() {
        testUndoDelete.call(this,
            '<block type="statement_block" id="1">' +
            '  <statement name="STATEMENT">' +
            '    <shadow type="stack_block" id="2"></shadow>' +
            '  </statement>' +
            '</block>'
        );
      });
    });

    suite('Undo Connect', function() {

      setup(function() {
        Blockly.defineBlocksWithJsonArray([
          {
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
            "output": null
          },
          {
            "type": "statement_block",
            "message0": "%1",
            "args0": [
              {
                "type": "input_statement",
                "name": "STATEMENT"
              }
            ],
            "previousStatement": null,
            "nextStatement": null
          }]);
      });

      teardown(function() {
        delete Blockly.Blocks['stack_block'];
        delete Blockly.Blocks['row_block'];
        delete Blockly.Blocks['statement_block'];
      });

      function testUndoConnect(xmlText, parentId, childId, func) {
        var xml = Blockly.Xml.textToDom(xmlText);
        Blockly.Xml.domToWorkspace(xml, this.workspace);

        var parent = this.workspace.getBlockById(parentId);
        var child = this.workspace.getBlockById(childId);
        func.call(this, parent, child);
        this.workspace.undo();

        var newXml = Blockly.Xml.workspaceToDom(this.workspace);
        assertNodesEqual(newXml, xml);
      }

      test('Stack', function() {
        var xml =
            '<xml>' +
            '  <block type="stack_block" id="1"></block>' +
            '  <block type="stack_block" id="2"></block>' +
            '</xml>';

        testUndoConnect.call(this, xml, 1, 2, (parent, child) => {
          parent.nextConnection.connect(child.previousConnection);
        });
      });

      test('Row', function() {
        var xml =
            '<xml>' +
            '  <block type="row_block" id="1"></block>' +
            '  <block type="row_block" id="2"></block>' +
            '</xml>';

        testUndoConnect.call(this, xml, 1, 2, (parent, child) => {
          parent.getInput('INPUT').connection.connect(child.outputConnection);
        });
      });

      test('Statement', function() {
        var xml =
            '<xml>' +
            '  <block type="statement_block" id="1"></block>' +
            '  <block type="stack_block" id="2"></block>' +
            '</xml>';

        testUndoConnect.call(this, xml, 1, 2, (parent, child) => {
          parent.getInput('STATEMENT').connection
              .connect(child.previousConnection);
        });
      });

      test('Stack w/ child', function() {
        var xml =
            '<xml>' +
            '  <block type="stack_block" id="1">' +
            '    <next>' +
            '      <block type="stack_block" id="3"></block>' +
            '    </next>' +
            '  </block>' +
            '  <block type="stack_block" id="2"></block>' +
            '</xml>';

        testUndoConnect.call(this, xml, 1, 2, (parent, child) => {
          parent.nextConnection.connect(child.previousConnection);
        });
      });

      test('Row w/ child', function() {
        var xml =
            '<xml>' +
            '  <block type="row_block" id="1">' +
            '    <value name="INPUT">' +
            '      <block type="row_block" id="3"></block>' +
            '    </value>' +
            '  </block>' +
            '  <block type="row_block" id="2"></block>' +
            '</xml>';

        testUndoConnect.call(this, xml, 1, 2, (parent, child) => {
          parent.getInput('INPUT').connection.connect(child.outputConnection);
        });
      });

      test('Statement w/ child', function() {
        var xml =
            '<xml>' +
            '  <block type="statement_block" id="1">' +
            '    <statement name="STATEMENT">' +
            '      <block type="stack_block" id="3"></block>' +
            '    </statement>' +
            '  </block>' +
            '  <block type="stack_block" id="2"></block>' +
            '</xml>';

        testUndoConnect.call(this, xml, 1, 2, (parent, child) => {
          parent.getInput('STATEMENT').connection
              .connect(child.previousConnection);
        });
      });

      test('Stack w/ shadow', function() {
        var xml =
            '<xml>' +
            '  <block type="stack_block" id="1">' +
            '    <next>' +
            '      <shadow type="stack_block" id="3"></shadow>' +
            '    </next>' +
            '  </block>' +
            '  <block type="stack_block" id="2"></block>' +
            '</xml>';

        testUndoConnect.call(this, xml, 1, 2, (parent, child) => {
          parent.nextConnection.connect(child.previousConnection);
        });
      });

      test('Row w/ shadow', function() {
        var xml =
            '<xml>' +
            '  <block type="row_block" id="1">' +
            '    <value name="INPUT">' +
            '      <shadow type="row_block" id="3"></shadow>' +
            '    </value>' +
            '  </block>' +
            '  <block type="row_block" id="2"></block>' +
            '</xml>';

        testUndoConnect.call(this, xml, 1, 2, (parent, child) => {
          parent.getInput('INPUT').connection.connect(child.outputConnection);
        });
      });

      test('Statement w/ shadow', function() {
        var xml =
            '<xml>' +
            '  <block type="statement_block" id="1">' +
            '    <statement name="STATEMENT">' +
            '      <shadow type="stack_block" id="3"></shadow>' +
            '    </statement>' +
            '  </block>' +
            '  <block type="stack_block" id="2"></block>' +
            '</xml>';

        testUndoConnect.call(this, xml, 1, 2, (parent, child) => {
          parent.getInput('STATEMENT').connection
              .connect(child.previousConnection);
        });
      });
    });

    suite('Undo Disconnect', function() {

      setup(function() {
        Blockly.defineBlocksWithJsonArray([
          {
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
            "output": null
          },
          {
            "type": "statement_block",
            "message0": "%1",
            "args0": [
              {
                "type": "input_statement",
                "name": "STATEMENT"
              }
            ],
            "previousStatement": null,
            "nextStatement": null
          }]);
      });

      teardown(function() {
        delete Blockly.Blocks['stack_block'];
        delete Blockly.Blocks['row_block'];
        delete Blockly.Blocks['statement_block'];
      });

      function testUndoDisconnect(xmlText, childId) {
        var xml = Blockly.Xml.textToDom(xmlText);
        Blockly.Xml.domToWorkspace(xml, this.workspace);

        var child = this.workspace.getBlockById(childId);
        if (child.outputConnection) {
          child.outputConnection.disconnect();
        } else {
          child.previousConnection.disconnect();
        }
        this.workspace.undo();

        var newXml = Blockly.Xml.workspaceToDom(this.workspace);
        assertNodesEqual(newXml, xml);
      }

      test('Stack', function() {
        var xml =
            '<xml>' +
            '  <block type="stack_block" id="1">' +
            '    <next>' +
            '      <block type="stack_block" id="2"></block>' +
            '    </next>' +
            '  </block>' +
            '</xml>';
        testUndoDisconnect.call(this, xml, 2);
      });

      test('Row', function() {
        var xml =
            '<xml>' +
            '  <block type="row_block" id="1">' +
            '    <value name="INPUT">' +
            '      <block type="row_block" id="2"></block>' +
            '    </value>' +
            '  </block>' +
            '</xml>';
        testUndoDisconnect.call(this, xml, 2);
      });

      test('Statement', function() {
        var xml =
            '<xml>' +
            '  <block type="statement_block" id="1">' +
            '    <statement name="STATEMENT">' +
            '      <block type="stack_block" id="2"></block>' +
            '    </statement>' +
            '  </block>' +
            '</xml>';
        testUndoDisconnect.call(this, xml, 2);
      });

      test('Stack w/ child', function() {
        var xml =
            '<xml>' +
            '  <block type="stack_block" id="1">' +
            '    <next>' +
            '      <block type="stack_block" id="2">' +
            '        <next>' +
            '          <block type="stack_block" id="3"></block>' +
            '        </next>' +
            '      </block>' +
            '    </next>' +
            '  </block>' +
            '</xml>';
        testUndoDisconnect.call(this, xml, 2);
      });

      test('Row w/ child', function() {
        var xml =
            '<xml>' +
            '  <block type="row_block" id="1">' +
            '    <value name="INPUT">' +
            '      <block type="row_block" id="2">' +
            '        <value name="INPUT">' +
            '          <block type="row_block" id="3"></block>' +
            '        </value>' +
            '      </block>' +
            '    </value>' +
            '  </block>' +
            '</xml>';
        testUndoDisconnect.call(this, xml, 2);
      });

      test('Statement w/ child', function() {
        var xml =
            '<xml>' +
            '  <block type="statement_block" id="1">' +
            '    <statement name="STATEMENT">' +
            '      <block type="statement_block" id="2">' +
            '        <statement name="STATEMENT">' +
            '          <block type="stack_block" id="3"></block>' +
            '        </statement>' +
            '      </block>' +
            '    </statement>' +
            '  </block>' +
            '</xml>';
        testUndoDisconnect.call(this, xml, 2);
      });

      test('Stack w/ shadow', function() {
        // TODO: For some reason on next connections shadows are
        //   serialized second.
        var xml =
            '<xml>' +
            '  <block type="stack_block" id="1">' +
            '    <next>' +
            '      <block type="stack_block" id="2"></block>' +
            '      <shadow type="stack_block" id="3"></shadow>' +
            '    </next>' +
            '  </block>' +
            '</xml>';
        testUndoDisconnect.call(this, xml, 2);
        chai.assert.equal(this.workspace.getAllBlocks().length, 2,
            'expected there to only be 2 blocks on the workspace ' +
            '(check for shadows)');
      });

      test('Row w/ shadow', function() {
        var xml =
            '<xml>' +
            '  <block type="row_block" id="1">' +
            '    <value name="INPUT">' +
            '      <shadow type="row_block" id="3"></shadow>' +
            '      <block type="row_block" id="2"></block>' +
            '    </value>' +
            '  </block>' +
            '</xml>';
        testUndoDisconnect.call(this, xml, 2);
        chai.assert.equal(this.workspace.getAllBlocks().length, 2,
            'expected there to only be 2 blocks on the workspace ' +
            '(check for shadows)');
      });

      test('Statement w/ shadow', function() {
        var xml =
            '<xml>' +
            '  <block type="statement_block" id="1">' +
            '    <statement name="STATEMENT">' +
            '      <shadow type="stack_block" id="3"></shadow>' +
            '      <block type="stack_block" id="2"></block>' +
            '    </statement>' +
            '  </block>' +
            '</xml>';
        testUndoDisconnect.call(this, xml, 2);
      });
    });

    suite('Variables', function() {
      function createTwoVarsDifferentTypes(workspace) {
        workspace.createVariable('name1', 'type1', 'id1');
        workspace.createVariable('name2', 'type2', 'id2');
      }

      suite('createVariable', function() {
        test('Undo only', function() {
          createTwoVarsDifferentTypes(this.workspace);

          this.workspace.undo();
          assertVariableValues(this.workspace, 'name1', 'type1', 'id1');
          chai.assert.isNull(this.workspace.getVariableById('id2'));

          this.workspace.undo();
          chai.assert.isNull(this.workspace.getVariableById('id1'));
          chai.assert.isNull(this.workspace.getVariableById('id2'));
        });

        test('Undo and redo', function() {
          createTwoVarsDifferentTypes(this.workspace);

          this.workspace.undo();
          assertVariableValues(this.workspace, 'name1', 'type1', 'id1');
          chai.assert.isNull(this.workspace.getVariableById('id2'));

          this.workspace.undo(true);

          // Expect that variable 'id2' is recreated
          assertVariableValues(this.workspace, 'name1', 'type1', 'id1');
          assertVariableValues(this.workspace, 'name2', 'type2', 'id2');

          this.workspace.undo();
          this.workspace.undo();
          chai.assert.isNull(this.workspace.getVariableById('id1'));
          chai.assert.isNull(this.workspace.getVariableById('id2'));
          this.workspace.undo(true);

          // Expect that variable 'id1' is recreated
          assertVariableValues(this.workspace, 'name1', 'type1', 'id1');
          chai.assert.isNull(this.workspace.getVariableById('id2'));
        });
      });

      suite('deleteVariableById', function() {
        test('Undo only no usages', function() {
          createTwoVarsDifferentTypes(this.workspace);
          this.workspace.deleteVariableById('id1');
          this.workspace.deleteVariableById('id2');

          this.workspace.undo();
          chai.assert.isNull(this.workspace.getVariableById('id1'));
          assertVariableValues(this.workspace, 'name2', 'type2', 'id2');

          this.workspace.undo();
          assertVariableValues(this.workspace, 'name1', 'type1', 'id1');
          assertVariableValues(this.workspace, 'name2', 'type2', 'id2');
        });

        test('Undo only with usages', function() {
          createTwoVarsDifferentTypes(this.workspace);
          // Create blocks to refer to both of them.
          createVarBlocksNoEvents(this.workspace, ['id1', 'id2']);
          this.workspace.deleteVariableById('id1');
          this.workspace.deleteVariableById('id2');

          this.workspace.undo();
          assertBlockVarModelName(this.workspace, 0, 'name2');
          chai.assert.isNull(this.workspace.getVariableById('id1'));
          assertVariableValues(this.workspace, 'name2', 'type2', 'id2');

          this.workspace.undo();
          assertBlockVarModelName(this.workspace, 0, 'name2');
          assertBlockVarModelName(this.workspace, 1, 'name1');
          assertVariableValues(this.workspace, 'name1', 'type1', 'id1');
          assertVariableValues(this.workspace, 'name2', 'type2', 'id2');
        });

        test('Reference exists no usages', function() {
          createTwoVarsDifferentTypes(this.workspace);
          this.workspace.deleteVariableById('id1');
          this.workspace.deleteVariableById('id2');

          this.workspace.undo();
          chai.assert.isNull(this.workspace.getVariableById('id1'));
          assertVariableValues(this.workspace, 'name2', 'type2', 'id2');

          this.workspace.undo(true);
          // Expect that both variables are deleted
          chai.assert.isNull(this.workspace.getVariableById('id1'));
          chai.assert.isNull(this.workspace.getVariableById('id2'));

          this.workspace.undo();
          this.workspace.undo();
          assertVariableValues(this.workspace, 'name1', 'type1', 'id1');
          assertVariableValues(this.workspace, 'name2', 'type2', 'id2');

          this.workspace.undo(true);
          // Expect that variable 'id2' is recreated
          chai.assert.isNull(this.workspace.getVariableById('id1'));
          assertVariableValues(this.workspace, 'name2', 'type2', 'id2');
        });

        test('Reference exists with usages', function() {
          createTwoVarsDifferentTypes(this.workspace);
          // Create blocks to refer to both of them.
          createVarBlocksNoEvents(this.workspace, ['id1', 'id2']);
          this.workspace.deleteVariableById('id1');
          this.workspace.deleteVariableById('id2');

          this.workspace.undo();
          assertBlockVarModelName(this.workspace, 0, 'name2');
          chai.assert.isNull(this.workspace.getVariableById('id1'));
          assertVariableValues(this.workspace, 'name2', 'type2', 'id2');

          this.workspace.undo(true);
          // Expect that both variables are deleted
          chai.assert.equal(this.workspace.topBlocks_.length, 0);
          chai.assert.isNull(this.workspace.getVariableById('id1'));
          chai.assert.isNull(this.workspace.getVariableById('id2'));

          this.workspace.undo();
          this.workspace.undo();
          assertBlockVarModelName(this.workspace, 0, 'name2');
          assertBlockVarModelName(this.workspace, 1, 'name1');
          assertVariableValues(this.workspace, 'name1', 'type1', 'id1');
          assertVariableValues(this.workspace, 'name2', 'type2', 'id2');

          this.workspace.undo(true);
          // Expect that variable 'id2' is recreated
          assertBlockVarModelName(this.workspace,0, 'name2');
          chai.assert.isNull(this.workspace.getVariableById('id1'));
          assertVariableValues(this.workspace, 'name2', 'type2', 'id2');
        });

        test('Delete same variable twice no usages', function() {
          this.workspace.createVariable('name1', 'type1', 'id1');
          this.workspace.deleteVariableById('id1');
          var workspace = this.workspace;
          var warnings = captureWarnings(function() {
            workspace.deleteVariableById('id1');
          });
          chai.assert.equal(warnings.length, 1,
              'Expected 1 warning for second deleteVariableById call.');

          // Check the undoStack only recorded one delete event.
          var undoStack = this.workspace.undoStack_;
          chai.assert.equal(undoStack[undoStack.length - 1].type, 'var_delete');
          chai.assert.notEqual(undoStack[undoStack.length - 2].type, 'var_delete');

          // Undo delete
          this.workspace.undo();
          assertVariableValues(this.workspace, 'name1', 'type1', 'id1');

          // Redo delete
          this.workspace.undo(true);
          chai.assert.isNull(this.workspace.getVariableById('id1'));

          // Redo delete, nothing should happen
          this.workspace.undo(true);
          chai.assert.isNull(this.workspace.getVariableById('id1'));
        });

        test('Delete same variable twice with usages', function() {
          this.workspace.createVariable('name1', 'type1', 'id1');
          createVarBlocksNoEvents(this.workspace, ['id1']);
          this.workspace.deleteVariableById('id1');
          var workspace = this.workspace;
          var warnings = captureWarnings(function() {
            workspace.deleteVariableById('id1');
          });
          chai.assert.equal(warnings.length, 1,
              'Expected 1 warning for second deleteVariableById call.');

          // Check the undoStack only recorded one delete event.
          var undoStack = this.workspace.undoStack_;
          chai.assert.equal(undoStack[undoStack.length - 1].type, 'var_delete');
          chai.assert.equal(undoStack[undoStack.length - 2].type, 'delete');
          chai.assert.notEqual(undoStack[undoStack.length - 3].type, 'var_delete');

          // Undo delete
          this.workspace.undo();
          assertBlockVarModelName(this.workspace, 0, 'name1');
          assertVariableValues(this.workspace, 'name1', 'type1', 'id1');

          // Redo delete
          this.workspace.undo(true);
          chai.assert.equal(this.workspace.topBlocks_.length, 0);
          chai.assert.isNull(this.workspace.getVariableById('id1'));

          // Redo delete, nothing should happen
          this.workspace.undo(true);
          chai.assert.equal(this.workspace.topBlocks_.length, 0);
          chai.assert.isNull(this.workspace.getVariableById('id1'));
        });
      });

      suite('renameVariableById', function() {
        setup(function() {
          this.workspace.createVariable('name1', 'type1', 'id1');
        });

        test('Reference exists no usages rename to name2', function() {
          this.workspace.renameVariableById('id1', 'name2');

          this.workspace.undo();
          assertVariableValues(this.workspace, 'name1', 'type1', 'id1');

          this.workspace.undo(true);
          assertVariableValues(this.workspace, 'name2', 'type1', 'id1');

        });

        test('Reference exists with usages rename to name2', function() {
          createVarBlocksNoEvents(this.workspace, ['id1']);
          this.workspace.renameVariableById('id1', 'name2');

          this.workspace.undo();
          assertBlockVarModelName(this.workspace, 0, 'name1');
          assertVariableValues(this.workspace, 'name1', 'type1', 'id1');

          this.workspace.undo(true);
          assertBlockVarModelName(this.workspace, 0, 'name2');
          assertVariableValues(this.workspace, 'name2', 'type1', 'id1');
        });

        test('Reference exists different capitalization no usages rename to Name1', function() {
          this.workspace.renameVariableById('id1', 'Name1');

          this.workspace.undo();
          assertVariableValues(this.workspace, 'name1', 'type1', 'id1');

          this.workspace.undo(true);
          assertVariableValues(this.workspace, 'Name1', 'type1', 'id1');
        });

        test('Reference exists different capitalization with usages rename to Name1', function() {
          createVarBlocksNoEvents(this.workspace, ['id1']);
          this.workspace.renameVariableById('id1', 'Name1');

          this.workspace.undo();
          assertBlockVarModelName(this.workspace, 0, 'name1');
          assertVariableValues(this.workspace, 'name1', 'type1', 'id1');

          this.workspace.undo(true);
          assertBlockVarModelName(this.workspace, 0, 'Name1');
          assertVariableValues(this.workspace, 'Name1', 'type1', 'id1');
        });

        suite('Two variables rename overlap', function() {
          test('Same type no usages rename variable with id1 to name2', function() {
            this.workspace.createVariable('name2', 'type1', 'id2');
            this.workspace.renameVariableById('id1', 'name2');

            this.workspace.undo();
            assertVariableValues(this.workspace, 'name1', 'type1', 'id1');
            assertVariableValues(this.workspace, 'name2', 'type1', 'id2');

            this.workspace.undo(true);
            assertVariableValues(this.workspace, 'name2', 'type1', 'id2');
            chai.assert.isNull(this.workspace.getVariableById('id1'));
          });

          test('Same type with usages rename variable with id1 to name2', function() {
            this.workspace.createVariable('name2', 'type1', 'id2');
            createVarBlocksNoEvents(this.workspace, ['id1', 'id2']);
            this.workspace.renameVariableById('id1', 'name2');

            this.workspace.undo();
            assertBlockVarModelName(this.workspace, 0, 'name1');
            assertBlockVarModelName(this.workspace, 1, 'name2');
            assertVariableValues(this.workspace, 'name1', 'type1', 'id1');
            assertVariableValues(this.workspace, 'name2', 'type1', 'id2');

            this.workspace.undo(true);
            assertVariableValues(this.workspace, 'name2', 'type1', 'id2');
            chai.assert.isNull(this.workspace.getVariableById('id1'));
          });

          test('Same type different capitalization no usages rename variable with id1 to Name2', function() {
            this.workspace.createVariable('name2', 'type1', 'id2');
            this.workspace.renameVariableById('id1', 'Name2');

            this.workspace.undo();
            assertVariableValues(this.workspace, 'name1', 'type1', 'id1');
            assertVariableValues(this.workspace, 'name2', 'type1', 'id2');

            this.workspace.undo(true);
            assertVariableValues(this.workspace, 'Name2', 'type1', 'id2');
            chai.assert.isNull(this.workspace.getVariable('name1'));
          });

          test('Same type different capitalization with usages rename variable with id1 to Name2', function() {
            this.workspace.createVariable('name2', 'type1', 'id2');
            createVarBlocksNoEvents(this.workspace, ['id1', 'id2']);
            this.workspace.renameVariableById('id1', 'Name2');

            this.workspace.undo();
            assertBlockVarModelName(this.workspace, 0, 'name1');
            assertBlockVarModelName(this.workspace, 1, 'name2');
            assertVariableValues(this.workspace, 'name1', 'type1', 'id1');
            assertVariableValues(this.workspace, 'name2', 'type1', 'id2');

            this.workspace.undo(true);
            assertVariableValues(this.workspace, 'Name2', 'type1', 'id2');
            chai.assert.isNull(this.workspace.getVariableById('id1'));
            assertBlockVarModelName(this.workspace, 0, 'Name2');
            assertBlockVarModelName(this.workspace, 1, 'Name2');
          });

          test('Different type no usages rename variable with id1 to name2', function() {
            this.workspace.createVariable('name2', 'type2', 'id2');
            this.workspace.renameVariableById('id1', 'name2');

            this.workspace.undo();
            assertVariableValues(this.workspace, 'name1', 'type1', 'id1');
            assertVariableValues(this.workspace, 'name2', 'type2', 'id2');

            this.workspace.undo(true);
            assertVariableValues(this.workspace, 'name2', 'type1', 'id1');
            assertVariableValues(this.workspace, 'name2', 'type2', 'id2');
          });

          test('Different type with usages rename variable with id1 to name2', function() {
            this.workspace.createVariable('name2', 'type2', 'id2');
            createVarBlocksNoEvents(this.workspace, ['id1', 'id2']);
            this.workspace.renameVariableById('id1', 'name2');

            this.workspace.undo();
            assertVariableValues(this.workspace, 'name1', 'type1', 'id1');
            assertVariableValues(this.workspace, 'name2', 'type2', 'id2');
            assertBlockVarModelName(this.workspace, 0, 'name1');
            assertBlockVarModelName(this.workspace, 1, 'name2');

            this.workspace.undo(true);
            assertVariableValues(this.workspace, 'name2', 'type1', 'id1');
            assertVariableValues(this.workspace, 'name2', 'type2', 'id2');
            assertBlockVarModelName(this.workspace, 0, 'name2');
            assertBlockVarModelName(this.workspace, 1, 'name2');
          });

          test('Different type different capitalization no usages rename variable with id1 to Name2', function() {
            this.workspace.createVariable('name2', 'type2', 'id2');
            this.workspace.renameVariableById('id1', 'Name2');

            this.workspace.undo();
            assertVariableValues(this.workspace, 'name1', 'type1', 'id1');
            assertVariableValues(this.workspace, 'name2', 'type2', 'id2');

            this.workspace.undo(true);
            assertVariableValues(this.workspace, 'Name2', 'type1', 'id1');
            assertVariableValues(this.workspace, 'name2', 'type2', 'id2');
          });

          test('Different type different capitalization with usages rename variable with id1 to Name2', function() {
            this.workspace.createVariable('name2', 'type2', 'id2');
            createVarBlocksNoEvents(this.workspace, ['id1', 'id2']);
            this.workspace.renameVariableById('id1', 'Name2');

            this.workspace.undo();
            assertVariableValues(this.workspace, 'name1', 'type1', 'id1');
            assertVariableValues(this.workspace, 'name2', 'type2', 'id2');
            assertBlockVarModelName(this.workspace, 0, 'name1');
            assertBlockVarModelName(this.workspace, 1, 'name2');

            this.workspace.undo(true);
            assertVariableValues(this.workspace, 'Name2', 'type1', 'id1');
            assertVariableValues(this.workspace, 'name2', 'type2', 'id2');
            assertBlockVarModelName(this.workspace, 0, 'Name2');
            assertBlockVarModelName(this.workspace, 1, 'name2');
          });
        });
      });
    });
  });
}
