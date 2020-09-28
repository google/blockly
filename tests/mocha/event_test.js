/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Events', function() {
  setup(function() {
    sharedTestSetup.call(this, {fireEventsNow: false});
    this.eventsFireSpy = sinon.spy(Blockly.Events, 'fire');
    this.workspace = new Blockly.Workspace();
    Blockly.defineBlocksWithJsonArray([{
      'type': 'field_variable_test_block',
      'message0': '%1',
      'args0': [
        {
          'type': 'field_variable',
          'name': 'VAR',
          'variable': 'item'
        }
      ],
    },
    {
      'type': 'simple_test_block',
      'message0': 'simple test block'
    }]);
  });

  teardown(function() {
    sharedTestTeardown.call(this);
  });

  function createSimpleTestBlock(workspace) {
    // Disable events while constructing the block: this is a test of the
    // Blockly.Event constructors, not the block constructors.
    // Set the group id to avoid an extra call to genUid.
    Blockly.Events.disable();
    try {
      Blockly.Events.setGroup('unused');
      var block = new Blockly.Block(
          workspace, 'simple_test_block');
    } finally {
      Blockly.Events.setGroup(false);
    }
    Blockly.Events.enable();
    return block;
  }

  suite('Constructors', function() {
    test('Abstract', function() {
      var event = new Blockly.Events.Abstract();
      assertEventEquals(event, undefined, undefined, undefined, {
        'recordUndo': true,
        'group': ''
      });
    });

    test('UI event without block', function() {
      var TEST_GROUP_ID = 'testGroup';
      Blockly.Events.setGroup(TEST_GROUP_ID);
      var event = new Blockly.Events.Ui(null, 'foo', 'bar', 'baz');
      assertEventEquals(event, Blockly.Events.UI, null, null, {
        'element': 'foo',
        'oldValue': 'bar',
        'newValue': 'baz',
        'recordUndo': false,
        'group': TEST_GROUP_ID
      });
    });

    suite('With simple blocks', function() {
      setup(function() {
        this.TEST_BLOCK_ID = 'test_block_id';
        this.TEST_PARENT_ID = 'parent';
        // genUid is expected to be called either once or twice in this suite.
        this.genUidStub = createGenUidStubWithReturns(
            [this.TEST_BLOCK_ID, this.TEST_PARENT_ID]);
        this.block = createSimpleTestBlock(this.workspace);
      });

      test('Block base', function() {
        var event = new Blockly.Events.BlockBase(this.block);
        sinon.assert.calledOnce(this.genUidStub);
        assertEventEquals(event, undefined,
            this.workspace.id, this.TEST_BLOCK_ID,
            {
              'varId': undefined,
              'recordUndo': true,
              'group': '',
            });
      });

      test('Create', function() {
        var event = new Blockly.Events.Create(this.block);
        sinon.assert.calledOnce(this.genUidStub);
        assertEventEquals(event, Blockly.Events.CREATE,
            this.workspace.id, this.TEST_BLOCK_ID,
            {
              'recordUndo': true,
              'group': '',
            });
      });

      test('Block create', function() {
        var event = new Blockly.Events.BlockCreate(this.block);
        sinon.assert.calledOnce(this.genUidStub);
        assertEventEquals(event, Blockly.Events.CREATE,
            this.workspace.id, this.TEST_BLOCK_ID,
            {
              'recordUndo': true,
              'group': '',
            });
      });

      test('Delete', function() {
        var event = new Blockly.Events.Delete(this.block);
        sinon.assert.calledOnce(this.genUidStub);
        assertEventEquals(event, Blockly.Events.DELETE,
            this.workspace.id, this.TEST_BLOCK_ID,
            {
              'recordUndo': true,
              'group': '',
            });
      });

      test('Block delete', function() {
        var event = new Blockly.Events.BlockDelete(this.block);
        sinon.assert.calledOnce(this.genUidStub);
        assertEventEquals(event, Blockly.Events.DELETE,
            this.workspace.id, this.TEST_BLOCK_ID,
            {
              'recordUndo': true,
              'group': '',
            });
      });

      test('UI event with block', function() {
        var TEST_GROUP_ID = 'testGroup';
        Blockly.Events.setGroup(TEST_GROUP_ID);
        var event = new Blockly.Events.Ui(this.block, 'foo', 'bar', 'baz');
        sinon.assert.calledOnce(this.genUidStub);
        assertEventEquals(event, Blockly.Events.UI, this.workspace.id,
            this.TEST_BLOCK_ID,
            {
              'element': 'foo',
              'oldValue': 'bar',
              'newValue': 'baz',
              'recordUndo': false,
              'group': TEST_GROUP_ID
            });
      });

      suite('Move', function() {
        test('Move by coordinate', function() {
          var coordinate = new Blockly.utils.Coordinate(3, 4);
          this.block.xy_ = coordinate;

          var event = new Blockly.Events.Move(this.block);
          sinon.assert.calledOnce(this.genUidStub);
          assertEventEquals(event, Blockly.Events.MOVE, this.workspace.id,
              this.TEST_BLOCK_ID, {
                'oldParentId': undefined,
                'oldInputName': undefined,
                'oldCoordinate': coordinate,
                'recordUndo': true,
                'group': ''
              });
        });

        test('Block move by coordinate', function() {
          var coordinate = new Blockly.utils.Coordinate(3, 4);
          this.block.xy_ = coordinate;

          var event = new Blockly.Events.BlockMove(this.block);
          sinon.assert.calledOnce(this.genUidStub);
          assertEventEquals(event, Blockly.Events.MOVE, this.workspace.id,
              this.TEST_BLOCK_ID, {
                'oldParentId': undefined,
                'oldInputName': undefined,
                'oldCoordinate': coordinate,
                'recordUndo': true,
                'group': ''
              });
        });

        suite('Move by parent', function() {
          setup(function() {
            this.parentBlock = createSimpleTestBlock(this.workspace);

            this.block.parentBlock_ = this.parentBlock;
            this.block.xy_ = new Blockly.utils.Coordinate(3, 4);
          });
          teardown(function() {
            // This needs to be cleared, otherwise workspace.dispose will fail.
            this.block.parentBlock_ = null;
          });

          test('Move by parent', function() {
            var event = new Blockly.Events.Move(this.block);
            sinon.assert.calledTwice(this.genUidStub);
            assertEventEquals(event, Blockly.Events.MOVE, this.workspace.id,
                this.TEST_BLOCK_ID, {
                  'oldParentId': this.TEST_PARENT_ID,
                  'oldInputName': undefined,
                  'oldCoordinate': undefined,
                  'recordUndo': true,
                  'group': ''
                });
          });

          test('Block move by parent', function() {
            var event = new Blockly.Events.BlockMove(this.block);
            sinon.assert.calledTwice(this.genUidStub);
            assertEventEquals(event, Blockly.Events.MOVE, this.workspace.id,
                this.TEST_BLOCK_ID,
                {
                  'oldParentId': this.TEST_PARENT_ID,
                  'oldInputName': undefined,
                  'oldCoordinate': undefined,
                  'recordUndo': true,
                  'group': ''
                });
          });
        });
      });
    });

    suite('With shadow blocks', function() {
      setup(function() {
        this.TEST_BLOCK_ID = 'test_block_id';
        this.TEST_PARENT_ID = 'parent';
        // genUid is expected to be called either once or twice in this suite.
        this.genUidStub = createGenUidStubWithReturns(
            [this.TEST_BLOCK_ID, this.TEST_PARENT_ID]);
        this.block = createSimpleTestBlock(this.workspace);
        this.block.setShadow(true);
      });

      test('Block base', function() {
        var event = new Blockly.Events.BlockBase(this.block);
        sinon.assert.calledOnce(this.genUidStub);
        assertEventEquals(event, undefined,
            this.workspace.id, this.TEST_BLOCK_ID,
            {
              'varId': undefined,
              'recordUndo': true,
              'group': '',
            });
      });

      test('Change', function() {
        var event = new Blockly.Events.Change(
            this.block, 'field', 'FIELD_NAME', 'old', 'new');
        sinon.assert.calledOnce(this.genUidStub);
        assertEventEquals(event, Blockly.Events.CHANGE,
            this.workspace.id, this.TEST_BLOCK_ID,
            {
              'varId': undefined,
              'element': 'field',
              'name': 'FIELD_NAME',
              'oldValue': 'old',
              'newValue': 'new',
              'recordUndo': true,
              'group': '',
            });
      });

      test('Block change', function() {
        var event = new Blockly.Events.BlockChange(
            this.block, 'field', 'FIELD_NAME', 'old', 'new');
        sinon.assert.calledOnce(this.genUidStub);
        assertEventEquals(event, Blockly.Events.CHANGE,
            this.workspace.id, this.TEST_BLOCK_ID,
            {
              'varId': undefined,
              'element': 'field',
              'name': 'FIELD_NAME',
              'oldValue': 'old',
              'newValue': 'new',
              'recordUndo': true,
              'group': '',
            });
      });

      test('Create', function() {
        var event = new Blockly.Events.Create(this.block);
        sinon.assert.calledOnce(this.genUidStub);
        assertEventEquals(event, Blockly.Events.CREATE,
            this.workspace.id, this.TEST_BLOCK_ID,
            {
              'recordUndo': false,
              'group': '',
            });
      });

      test('Block create', function() {
        var event = new Blockly.Events.BlockCreate(this.block);
        sinon.assert.calledOnce(this.genUidStub);
        assertEventEquals(event, Blockly.Events.CREATE,
            this.workspace.id, this.TEST_BLOCK_ID,
            {
              'recordUndo': false,
              'group': '',
            });
      });

      test('Delete', function() {
        var event = new Blockly.Events.Delete(this.block);
        sinon.assert.calledOnce(this.genUidStub);
        assertEventEquals(event, Blockly.Events.DELETE,
            this.workspace.id, this.TEST_BLOCK_ID,
            {
              'recordUndo': false,
              'group': '',
            });
      });

      test('Block delete', function() {
        var event = new Blockly.Events.BlockDelete(this.block);
        sinon.assert.calledOnce(this.genUidStub);
        assertEventEquals(event, Blockly.Events.DELETE,
            this.workspace.id, this.TEST_BLOCK_ID,
            {
              'recordUndo': false,
              'group': '',
            });
      });

      suite('Move', function() {
        setup(function() {
          this.parentBlock = createSimpleTestBlock(this.workspace);
          this.block.parentBlock_ = this.parentBlock;
          this.block.xy_ = new Blockly.utils.Coordinate(3, 4);
        });

        teardown(function() {
          // This needs to be cleared, otherwise workspace.dispose will fail.
          this.block.parentBlock_ = null;
        });

        test('Move', function() {
          var event = new Blockly.Events.Move(this.block);
          sinon.assert.calledTwice(this.genUidStub);
          assertEventEquals(event, Blockly.Events.MOVE, this.workspace.id,
              this.TEST_BLOCK_ID, {
                'oldParentId': this.TEST_PARENT_ID,
                'oldInputName': undefined,
                'oldCoordinate': undefined,
                'recordUndo': false,
                'group': ''
              });
        });

        test('Block move', function() {
          var event = new Blockly.Events.BlockMove(this.block);
          sinon.assert.calledTwice(this.genUidStub);
          assertEventEquals(event, Blockly.Events.MOVE, this.workspace.id,
              this.TEST_BLOCK_ID,
              {
                'oldParentId': this.TEST_PARENT_ID,
                'oldInputName': undefined,
                'oldCoordinate': undefined,
                'recordUndo': false,
                'group': ''
              });
        });
      });
    });

    suite('With variable getter blocks', function() {
      setup(function() {
        this.genUidStub = createGenUidStubWithReturns(
            [this.TEST_BLOCK_ID, 'test_var_id', 'test_group_id']);
        // Disabling events when creating a block with variable can cause issues
        // at workspace dispose.
        this.block = new Blockly.Block(
            this.workspace, 'field_variable_test_block');
      });

      test('Change', function() {
        var event = new Blockly.Events.Change(
            this.block, 'field', 'VAR', 'id1', 'id2');
        assertEventEquals(event, Blockly.Events.CHANGE, this.workspace.id,
            this.TEST_BLOCK_ID,
            {
              'element': 'field',
              'name': 'VAR',
              'oldValue': 'id1',
              'newValue': 'id2',
              'recordUndo': true,
              'group': ''
            });
      });

      test('Block change', function() {
        var event = new Blockly.Events.BlockChange(
            this.block, 'field', 'VAR', 'id1', 'id2');
        assertEventEquals(event, Blockly.Events.CHANGE, this.workspace.id,
            this.TEST_BLOCK_ID,
            {
              'element': 'field',
              'name': 'VAR',
              'oldValue': 'id1',
              'newValue': 'id2',
              'recordUndo': true,
              'group': ''
            });
      });
    });
  });

  suite('Variable events', function() {
    setup(function() {
      this.variable = this.workspace.createVariable('name1', 'type1', 'id1');
    });

    /**
     * Check if a variable with the given values exists.
     * @param {Blockly.Workspace|Blockly.VariableMap} container The workspace  or
     *     variableMap the checked variable belongs to.
     * @param {!string} name The expected name of the variable.
     * @param {!string} type The expected type of the variable.
     * @param {!string} id The expected id of the variable.
     */
    function checkVariableValues(container, name, type, id) {
      var variable = container.getVariableById(id);
      chai.assert.isDefined(variable);
      chai.assert.equal(name, variable.name);
      chai.assert.equal(type, variable.type);
      chai.assert.equal(id, variable.getId());
    }

    suite('Constructors', function() {
      test('Var base', function() {
        var event = new Blockly.Events.VarBase(this.variable);
        assertEventEquals(event, undefined, this.workspace.id, undefined, {
          'varId': 'id1',
          'recordUndo': true,
          'group': ''
        });
      });

      test('Var create', function() {
        var event = new Blockly.Events.VarCreate(this.variable);
        assertEventEquals(event, Blockly.Events.VAR_CREATE, this.workspace.id,
            undefined,
            {
              'varId': 'id1',
              'varType': 'type1',
              'varName': 'name1',
              'recordUndo': true,
              'group': ''
            });
      });

      test('Var delete', function() {
        var event = new Blockly.Events.VarDelete(this.variable);
        assertEventEquals(event, Blockly.Events.VAR_DELETE, this.workspace.id,
            undefined,
            {
              'varId': 'id1',
              'varType': 'type1',
              'varName': 'name1',
              'recordUndo': true,
              'group': ''
            });
      });

      test('Var rename', function() {
        var event = new Blockly.Events.VarRename(this.variable, 'name2');
        assertEventEquals(event, Blockly.Events.VAR_RENAME, this.workspace.id,
            undefined,
            {
              'varId': 'id1',
              'oldName': 'name1',
              'newName': 'name2',
              'recordUndo': true,
              'group': ''
            });
      });
    });

    suite('fromJson', function() {
      test('Var create', function() {
        var event = new Blockly.Events.VarCreate(this.variable);
        var event2 = new Blockly.Events.VarCreate();
        var json = event.toJson();
        event2.fromJson(json);

        chai.assert.equal(JSON.stringify(json), JSON.stringify(event2.toJson()));
      });
      test('Var delete', function() {
        var event = new Blockly.Events.VarDelete(this.variable);
        var event2 = new Blockly.Events.VarDelete();
        var json = event.toJson();
        event2.fromJson(json);

        chai.assert.equal(JSON.stringify(json), JSON.stringify(event2.toJson()));
      });
      test('Var rename', function() {
        var event = new Blockly.Events.VarRename(this.variable, '');
        var event2 = new Blockly.Events.VarRename();
        var json = event.toJson();
        event2.fromJson(json);

        chai.assert.equal(JSON.stringify(json), JSON.stringify(event2.toJson()));
      });
    });

    suite('toJson', function() {
      test('Var create', function() {
        var event = new Blockly.Events.VarCreate(this.variable);
        var json = event.toJson();
        var expectedJson = ({type: "var_create", varId: "id1", varType: "type1",
          varName: "name1"});

        chai.assert.equal(JSON.stringify(expectedJson), JSON.stringify(json));
      });

      test('Var delete', function() {
        var event = new Blockly.Events.VarDelete(this.variable);
        var json = event.toJson();
        var expectedJson = ({type: "var_delete", varId: "id1", varType: "type1",
          varName: "name1"});

        chai.assert.equal(JSON.stringify(expectedJson), JSON.stringify(json));
      });

      test('Var rename', function() {
        var event = new Blockly.Events.VarRename(this.variable, 'name2');
        var json = event.toJson();
        var expectedJson = ({type: "var_rename", varId: "id1", oldName: "name1",
          newName: "name2"});

        chai.assert.equal(JSON.stringify(expectedJson), JSON.stringify(json));
      });
    });

    suite('Run Forward', function() {
      test('Var create', function() {
        var json = {type: "var_create", varId: "id2", varType: "type2",
          varName: "name2"};
        var event = Blockly.Events.fromJson(json, this.workspace);
        var x = this.workspace.getVariableById('id2');
        chai.assert.isNull(x);
        event.run(true);
        assertVariableValues(this.workspace, 'name2', 'type2', 'id2');
      });

      test('Var delete', function() {
        var event = new Blockly.Events.VarDelete(this.variable);
        chai.assert.isNotNull(this.workspace.getVariableById('id1'));
        event.run(true);
        chai.assert.isNull(this.workspace.getVariableById('id1'));
      });

      test('Var rename', function() {
        var event = new Blockly.Events.VarRename(this.variable, 'name2');
        event.run(true);
        chai.assert.isNull(this.workspace.getVariable('name1'));
        checkVariableValues(this.workspace, 'name2', 'type1', 'id1');
      });
    });
    suite('Run Backward', function() {
      test('Var create', function() {
        var event = new Blockly.Events.VarCreate(this.variable);
        chai.assert.isNotNull(this.workspace.getVariableById('id1'));
        event.run(false);
      });

      test('Var delete', function() {
        var json = {type: "var_delete", varId: "id2", varType: "type2",
          varName: "name2"};
        var event = Blockly.Events.fromJson(json, this.workspace);
        chai.assert.isNull(this.workspace.getVariableById('id2'));
        event.run(false);
        assertVariableValues(this.workspace, 'name2', 'type2', 'id2');
      });

      test('Var rename', function() {
        var event = new Blockly.Events.VarRename(this.variable, 'name2');
        event.run(false);
        chai.assert.isNull(this.workspace.getVariable('name2'));
        checkVariableValues(this.workspace, 'name1', 'type1', 'id1');
      });
    });
  });

  suite('Filters', function() {
    function addMoveEvent(events, block, newX, newY) {
      events.push(new Blockly.Events.BlockMove(block));
      block.xy_ = new Blockly.utils.Coordinate(newX, newY);
      events[events.length - 1].recordNew();
    }

    function addMoveEventParent(events, block, parent) {
      events.push(new Blockly.Events.BlockMove(block));
      block.setParent(parent);
      events[events.length - 1].recordNew();
    }

    test('No removed, order unchanged', function() {
      var block = this.workspace.newBlock('field_variable_test_block', '1');
      var events = [
        new Blockly.Events.BlockCreate(block),
        new Blockly.Events.BlockMove(block),
        new Blockly.Events.BlockChange(block, 'field', 'VAR', 'id1', 'id2'),
        new Blockly.Events.Ui(block, 'click', undefined, undefined)
      ];
      var filteredEvents = Blockly.Events.filter(events, true);
      chai.assert.equal(filteredEvents.length, 4);  // no event should have been removed.
      // test that the order hasn't changed
      chai.assert.isTrue(filteredEvents[0] instanceof Blockly.Events.BlockCreate);
      chai.assert.isTrue(filteredEvents[1] instanceof Blockly.Events.BlockMove);
      chai.assert.isTrue(filteredEvents[2] instanceof Blockly.Events.BlockChange);
      chai.assert.isTrue(filteredEvents[3] instanceof Blockly.Events.Ui);
    });

    test('Different blocks no removed', function() {
      var block1 = this.workspace.newBlock('field_variable_test_block', '1');
      var block2 = this.workspace.newBlock('field_variable_test_block', '2');
      var events = [
        new Blockly.Events.BlockCreate(block1),
        new Blockly.Events.BlockMove(block1),
        new Blockly.Events.BlockCreate(block2),
        new Blockly.Events.BlockMove(block2)
      ];
      var filteredEvents = Blockly.Events.filter(events, true);
      chai.assert.equal(filteredEvents.length, 4);  // no event should have been removed.
    });

    test('Forward', function() {
      var block = this.workspace.newBlock('field_variable_test_block', '1');
      var events = [ new Blockly.Events.BlockCreate(block) ];
      addMoveEvent(events, block, 1, 1);
      addMoveEvent(events, block, 2, 2);
      addMoveEvent(events, block, 3, 3);
      var filteredEvents = Blockly.Events.filter(events, true);
      chai.assert.equal(filteredEvents.length, 2);  // duplicate moves should have been removed.
      // test that the order hasn't changed
      chai.assert.isTrue(filteredEvents[0] instanceof Blockly.Events.BlockCreate);
      chai.assert.isTrue(filteredEvents[1] instanceof Blockly.Events.BlockMove);
      chai.assert.equal(filteredEvents[1].newCoordinate.x, 3);
      chai.assert.equal(filteredEvents[1].newCoordinate.y, 3);
    });

    test('Backward', function() {
      var block = this.workspace.newBlock('field_variable_test_block', '1');
      var events = [ new Blockly.Events.BlockCreate(block) ];
      addMoveEvent(events, block, 1, 1);
      addMoveEvent(events, block, 2, 2);
      addMoveEvent(events, block, 3, 3);
      var filteredEvents = Blockly.Events.filter(events, false);
      chai.assert.equal(filteredEvents.length, 2);  // duplicate event should have been removed.
      // test that the order hasn't changed
      chai.assert.isTrue(filteredEvents[0] instanceof Blockly.Events.BlockCreate);
      chai.assert.isTrue(filteredEvents[1] instanceof Blockly.Events.BlockMove);
      chai.assert.equal(filteredEvents[1].newCoordinate.x, 1);
      chai.assert.equal(filteredEvents[1].newCoordinate.y, 1);
    });

    test('Merge move events', function() {
      var block = this.workspace.newBlock('field_variable_test_block', '1');
      var events = [];
      addMoveEvent(events, block, 0, 0);
      addMoveEvent(events, block, 1, 1);
      var filteredEvents = Blockly.Events.filter(events, true);
      chai.assert.equal(filteredEvents.length, 1);  // second move event merged into first
      chai.assert.equal(filteredEvents[0].newCoordinate.x, 1);
      chai.assert.equal(filteredEvents[0].newCoordinate.y, 1);
    });

    test('Merge change events', function() {
      var block1 = this.workspace.newBlock('field_variable_test_block', '1');
      var events = [
        new Blockly.Events.Change(block1, 'field', 'VAR', 'item', 'item1'),
        new Blockly.Events.Change(block1, 'field', 'VAR', 'item1', 'item2')
      ];
      var filteredEvents = Blockly.Events.filter(events, true);
      chai.assert.equal(filteredEvents.length, 1);  // second change event merged into first
      chai.assert.equal(filteredEvents[0].oldValue, 'item');
      chai.assert.equal(filteredEvents[0].newValue, 'item2');
    });

    test('Merge ui events', function() {
      var block1 = this.workspace.newBlock('field_variable_test_block', '1');
      var block2 = this.workspace.newBlock('field_variable_test_block', '2');
      var block3 = this.workspace.newBlock('field_variable_test_block', '3');
      var events = [
        new Blockly.Events.Ui(block1, 'commentOpen', 'false', 'true'),
        new Blockly.Events.Ui(block1, 'click', 'false', 'true'),
        new Blockly.Events.Ui(block2, 'mutatorOpen', 'false', 'true'),
        new Blockly.Events.Ui(block2, 'click', 'false', 'true'),
        new Blockly.Events.Ui(block3, 'warningOpen', 'false', 'true'),
        new Blockly.Events.Ui(block3, 'click', 'false', 'true')
      ];
      var filteredEvents = Blockly.Events.filter(events, true);
      // click event merged into corresponding *Open event
      chai.assert.equal(filteredEvents.length, 3);
      chai.assert.equal(filteredEvents[0].element, 'commentOpen');
      chai.assert.equal(filteredEvents[1].element, 'mutatorOpen');
      chai.assert.equal(filteredEvents[2].element, 'warningOpen');
    });

    test('Colliding events not dropped', function() {
      // Tests that events that collide on a (event, block, workspace) tuple
      // but cannot be merged do not get dropped during filtering.
      var block = this.workspace.newBlock('field_variable_test_block', '1');
      var events = [
        new Blockly.Events.Ui(block, 'click', undefined, undefined),
        new Blockly.Events.Ui(block, 'stackclick', undefined, undefined)
      ];
      var filteredEvents = Blockly.Events.filter(events, true);
      // click and stackclick should both exist
      chai.assert.equal(filteredEvents.length, 2);
      chai.assert.equal(filteredEvents[0].element, 'click');
      chai.assert.equal(filteredEvents[1].element, 'stackclick');
    });

    test('Merging null operations dropped', function() {
      // Mutator composition could result in move events for blocks
      // connected to the mutated block that were null operations. This
      // leads to events in the undo/redo queue that do nothing, requiring
      // an extra undo/redo to proceed to the next event. This test ensures
      // that two move events that do get merged (disconnecting and
      // reconnecting a block in response to a mutator change) are filtered
      // from the queue.
      var block = this.workspace.newBlock('field_variable_test_block', '1');
      block.setParent(null);
      var events = [];
      addMoveEventParent(events, block, null);
      addMoveEventParent(events, block, null);
      var filteredEvents = Blockly.Events.filter(events, true);
      // The two events should be merged, but because nothing has changed
      // they will be filtered out.
      chai.assert.equal(filteredEvents.length, 0);
    });

    test('Move events different blocks not merged', function() {
      // Move events should only merge if they refer to the same block and are
      // consecutive.
      // See github.com/google/blockly/pull/1892 for a worked example showing
      // how merging non-consecutive events can fail when replacing a shadow
      // block.
      var block1 = createSimpleTestBlock(this.workspace);
      var block2 = createSimpleTestBlock(this.workspace);

      var events = [];
      addMoveEvent(events, block1, 1, 1);
      addMoveEvent(events, block2, 1, 1);
      events.push(new Blockly.Events.BlockDelete(block2));
      addMoveEvent(events, block1, 2, 2);

      var filteredEvents = Blockly.Events.filter(events, true);
      // Nothing should have merged.
      chai.assert.equal(filteredEvents.length, 4);
      // test that the order hasn't changed
      chai.assert.isTrue(filteredEvents[0] instanceof Blockly.Events.BlockMove);
      chai.assert.isTrue(filteredEvents[1] instanceof Blockly.Events.BlockMove);
      chai.assert.isTrue(filteredEvents[2] instanceof Blockly.Events.BlockDelete);
      chai.assert.isTrue(filteredEvents[3] instanceof Blockly.Events.BlockMove);
    });
  });

  suite('Firing', function() {
    setup(function() {
      this.changeListenerSpy = createFireChangeListenerSpy(this.workspace);
    });

    test('Block dispose triggers Delete', function() {
      try {
        var toolbox = document.getElementById('toolbox-categories');
        var workspaceSvg = Blockly.inject('blocklyDiv', {toolbox: toolbox});
        var TEST_BLOCK_ID = 'test_block_id';
        var genUidStub = createGenUidStubWithReturns(
            [TEST_BLOCK_ID, 'test_group_id']);

        var block = workspaceSvg.newBlock('');
        block.initSvg();
        block.setCommentText('test comment');
        var expectedOldXml = Blockly.Xml.blockToDomWithXY(block);
        var expectedId = block.id;

        // Run all queued events.
        this.clock.runAll();

        this.eventsFireSpy.resetHistory();
        var changeListenerSpy = createFireChangeListenerSpy(workspaceSvg);
        block.dispose();

        // Run all queued events.
        this.clock.runAll();

        // Expect two calls to genUid: one to set the block's ID, and one for
        // the event group's ID for creating block.
        sinon.assert.calledTwice(genUidStub);

        assertNthCallEventArgEquals(
            this.eventsFireSpy, 0, Blockly.Events.Delete,
            {oldXml: expectedOldXml, group: ''},
            workspaceSvg.id, expectedId);
        assertNthCallEventArgEquals(
            changeListenerSpy, 0, Blockly.Events.Delete,
            {oldXml: expectedOldXml, group: ''},
            workspaceSvg.id, expectedId);

        // Expect the workspace to not have a variable with ID 'test_block_id'.
        chai.assert.isNull(this.workspace.getVariableById(TEST_BLOCK_ID));
      } finally {
        workspaceTeardown.call(this, workspaceSvg);
      }
    });

    test('New block new var', function() {
      var TEST_BLOCK_ID = 'test_block_id';
      var TEST_GROUP_ID = 'test_group_id';
      var TEST_VAR_ID = 'test_var_id';
      var genUidStub = createGenUidStubWithReturns(
          [TEST_BLOCK_ID, TEST_GROUP_ID, TEST_VAR_ID]);
      var _ = this.workspace.newBlock('field_variable_test_block');
      var TEST_VAR_NAME = 'item';  //  As defined in block's json.

      // Run all queued events.
      this.clock.runAll();

      // Expect three calls to genUid: one to set the block's ID, one for the event
      // group's ID, and one for the variable's ID.
      sinon.assert.calledThrice(genUidStub);

      // Expect two events fired: varCreate and block create.
      sinon.assert.calledTwice(this.eventsFireSpy);
      // Expect both events to trigger change listener.
      sinon.assert.calledTwice(this.changeListenerSpy);
      // Both events should be on undo stack
      chai.assert.equal(this.workspace.undoStack_.length, 2,
          'Undo stack length');

      assertNthCallEventArgEquals(
          this.changeListenerSpy, 0, Blockly.Events.VarCreate,
          {group: TEST_GROUP_ID, varId: TEST_VAR_ID, varName: TEST_VAR_NAME},
          this.workspace.id, undefined);
      assertNthCallEventArgEquals(
          this.changeListenerSpy, 1, Blockly.Events.Create,
          {group: TEST_GROUP_ID}, this.workspace.id, TEST_BLOCK_ID);

      // Expect the workspace to have a variable with ID 'test_var_id'.
      chai.assert.isNotNull(this.workspace.getVariableById(TEST_VAR_ID));
    });

    test('New block new var xml', function() {
      var TEST_GROUP_ID = 'test_group_id';
      var genUidStub = createGenUidStubWithReturns(TEST_GROUP_ID);
      var dom = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="field_variable_test_block" id="test_block_id">' +
          '    <field name="VAR" id="test_var_id">name1</field>' +
          '  </block>' +
          '</xml>');
      Blockly.Xml.domToWorkspace(dom, this.workspace);
      var TEST_BLOCK_ID = 'test_block_id';
      var TEST_VAR_ID = 'test_var_id';
      var TEST_VAR_NAME = 'name1';

      // Run all queued events.
      this.clock.runAll();

      // Expect one call to genUid: for the event group's id
      sinon.assert.calledOnce(genUidStub);

      // When block is created using domToWorkspace, 5 events are fired:
      // 1. varCreate (events disabled)
      // 2. varCreate
      // 3. block create
      // 4. move (no-op, is filtered out)
      // 5. finished loading
      sinon.assert.callCount(this.eventsFireSpy, 5);
      // The first varCreate and move event should have been ignored.
      sinon.assert.callCount(this.changeListenerSpy, 3);
      // Expect two events on undo stack: varCreate and block create.
      chai.assert.equal(this.workspace.undoStack_.length, 2,
          'Undo stack length');

      assertNthCallEventArgEquals(
          this.changeListenerSpy, 0, Blockly.Events.VarCreate,
          {group: TEST_GROUP_ID, varId: TEST_VAR_ID, varName: TEST_VAR_NAME},
          this.workspace.id, undefined);
      assertNthCallEventArgEquals(
          this.changeListenerSpy, 1, Blockly.Events.Create,
          {group: TEST_GROUP_ID}, this.workspace.id, TEST_BLOCK_ID);

      // Finished loading event should not be part of event group.
      assertNthCallEventArgEquals(
          this.changeListenerSpy, 2, Blockly.Events.FinishedLoading,
          {group: ''}, this.workspace.id, undefined);

      // Expect the workspace to have a variable with ID 'test_var_id'.
      chai.assert.isNotNull(this.workspace.getVariableById(TEST_VAR_ID));
    });
  });
});
