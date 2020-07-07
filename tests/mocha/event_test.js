/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Events', function() {
  setup(function() {
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
    delete Blockly.Blocks['field_variable_test_block'];
    delete Blockly.Blocks['simple_test_block'];
    this.workspace.dispose();

    // Clear Blockly.Event state.
    Blockly.Events.setGroup(false);
    Blockly.Events.disabled_ = 0;
  });

  function checkExactEventValues(event, values) {
    var keys = Object.keys(values);
    for (var i = 0; i < keys.length; i++) {
      var field = keys[i];
      chai.assert.equal(values[field], event[field]);
    }
  }

  function checkCreateEventValues(event, block, ids, type) {
    var expected_xml = Blockly.Xml.domToText(Blockly.Xml.blockToDom(block));
    var result_xml = Blockly.Xml.domToText(event.xml);
    chai.assert.equal(expected_xml, result_xml);
    chai.assert.deepEqual(ids, event.ids);
    chai.assert.equal(type, event.type);
  }

  function checkDeleteEventValues(event, block, ids, type) {
    var expected_xml = Blockly.Xml.domToText(Blockly.Xml.blockToDom(block));
    var result_xml = Blockly.Xml.domToText(event.oldXml);
    chai.assert.equal(expected_xml, result_xml);
    chai.assert.deepEqual(ids, event.ids);
    chai.assert.equal(type, event.type);
  }

  function createSimpleTestBlock(workspace, opt_prototypeName) {
    // Disable events while constructing the block: this is a test of the
    // Blockly.Event constructors, not the block constructor.s
    Blockly.Events.disable();
    var block = new Blockly.Block(
        workspace, opt_prototypeName || 'simple_test_block');
    Blockly.Events.enable();
    return block;
  }

  suite('Constructors', function() {
    test('Abstract', function() {
      var event = new Blockly.Events.Abstract();
      chai.assert.isUndefined(event.blockId);
      chai.assert.isUndefined(event.workspaceId);
      chai.assert.isUndefined(event.varId);
      checkExactEventValues(event, {'group': '', 'recordUndo': true});
    });

    test('UI event without block', function() {
      Blockly.Events.setGroup('testGroup');
      var event = new Blockly.Events.Ui(null, 'foo', 'bar', 'baz');
      checkExactEventValues(event,
          {
            'blockId': null,
            'workspaceId': null,
            'type': 'ui',
            'oldValue': 'bar',
            'newValue': 'baz',
            'element': 'foo',
            'recordUndo': false,
            'group': 'testGroup'
          });
    });

    suite('With simple blocks', function() {
      setup(function() {
        this.FAKE_ID = 'hedgehog';
        sinon.stub(Blockly.utils, "genUid").returns(this.FAKE_ID);
        this.block = createSimpleTestBlock(this.workspace);
        sinon.restore();
      });

      teardown(function() {
      });

      test('Block base', function() {
        var event = new Blockly.Events.BlockBase(this.block);
        chai.assert.isUndefined(event.varId);
        checkExactEventValues(event,
            {
              'blockId': this.FAKE_ID,
              'workspaceId': this.workspace.id,
              'group': '',
              'recordUndo': true
            });
      });

      test('Create', function() {
        var event = new Blockly.Events.Create(this.block);
        checkCreateEventValues(event, this.block, [this.FAKE_ID], 'create');
      });

      test('Block create', function() {
        var event = new Blockly.Events.BlockCreate(this.block);
        checkCreateEventValues(event, this.block, [this.FAKE_ID], 'create');
      });

      test('Delete', function() {
        var event = new Blockly.Events.Delete(this.block);
        checkDeleteEventValues(event, this.block, [this.FAKE_ID], 'delete');
      });

      test('Block delete', function() {
        var event = new Blockly.Events.BlockDelete(this.block);
        checkDeleteEventValues(event, this.block, [this.FAKE_ID], 'delete');
      });

      test('UI event with block', function() {
        Blockly.Events.setGroup('testGroup');
        var event = new Blockly.Events.Ui(this.block, 'foo', 'bar', 'baz');
        checkExactEventValues(event,
            {
              'blockId': this.FAKE_ID,
              'workspaceId': this.workspace.id,
              'type': 'ui',
              'oldValue': 'bar',
              'newValue': 'baz',
              'element': 'foo',
              'recordUndo': false,
              'group': 'testGroup'
            });
      });

      suite('Move', function() {
        test('Move by coordinate', function() {
          var coordinate = new Blockly.utils.Coordinate(3, 4);
          this.block.xy_ = coordinate;

          var event = new Blockly.Events.Move(this.block);
          checkExactEventValues(event,
              {'oldCoordinate': coordinate, 'type': 'move'});
        });

        test('Block move by coordinate', function() {
          var coordinate = new Blockly.utils.Coordinate(3, 4);
          this.block.xy_ = coordinate;

          var event = new Blockly.Events.BlockMove(this.block);
          checkExactEventValues(event,
              {'oldCoordinate': coordinate, 'type': 'move'});
        });

        suite('Move by parent', function() {
          setup(function() {
            sinon.stub(Blockly.utils, "genUid").returns("parent");
            this.parentBlock = createSimpleTestBlock(this.workspace);
            sinon.restore();

            this.block.parentBlock_ = this.parentBlock;
            this.block.xy_ = new Blockly.utils.Coordinate(3, 4);
          });

          teardown(function() {
            this.block.parentBlock_ = null;
          });

          test('Move by parent', function() {
            // Expect the oldParentId to be set but not the oldCoordinate to be set.
            var event = new Blockly.Events.Move(this.block);
            checkExactEventValues(event, {'oldCoordinate': undefined,
              'oldParentId': 'parent', 'type': 'move'});
          });

          test('Block move by parent', function() {
            // Expect the oldParentId to be set but not the oldCoordinate to be set.
            var event = new Blockly.Events.BlockMove(this.block);
            checkExactEventValues(event, {'oldCoordinate': undefined,
              'oldParentId': 'parent', 'type': 'move'});
          });
        });
      });
    });

    suite('With variable getter blocks', function() {
      setup(function() {
        this.block = createSimpleTestBlock(this.workspace, 'field_variable_test_block');
      });

      test('Change', function() {
        var event =
            new Blockly.Events.Change(this.block, 'field', 'VAR', 'id1', 'id2');
        checkExactEventValues(event, {'element': 'field', 'name': 'VAR',
          'oldValue': 'id1', 'newValue': 'id2', 'type': 'change'});
      });

      test('Block change', function() {
        var event = new Blockly.Events.BlockChange(
            this.block, 'field', 'VAR', 'id1', 'id2');
        checkExactEventValues(event, {'element': 'field', 'name': 'VAR',
          'oldValue': 'id1', 'newValue': 'id2', 'type': 'change'});
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
        chai.assert.isUndefined(event.blockId);
        checkExactEventValues(event, {'varId': 'id1',
          'workspaceId': this.workspace.id, 'group': '', 'recordUndo': true});
      });

      test('Var create', function() {
        var event = new Blockly.Events.VarCreate(this.variable);
        checkExactEventValues(event, {'varName': 'name1', 'varType': 'type1',
          'type': 'var_create'});
      });

      test('Var delete', function() {
        var event = new Blockly.Events.VarDelete(this.variable);
        checkExactEventValues(event, {'varName': 'name1', 'varType': 'type1',
          'varId':'id1', 'type': 'var_delete'});
      });

      test('Var rename', function() {
        var event = new Blockly.Events.VarRename(this.variable, 'name2');
        checkExactEventValues(event, {'varId': 'id1', 'oldName': 'name1',
          'newName': 'name2', 'type': 'var_rename'});
      });
    });

    suite('fromJson', function() {
      test('Var create', function() {
        var event = new Blockly.Events.VarCreate(this.variable);
        var event2 = new Blockly.Events.VarCreate(null);
        var json = event.toJson();
        event2.fromJson(json);

        chai.assert.equal(JSON.stringify(json), JSON.stringify(event2.toJson()));
      });
      test('Var delete', function() {
        var event = new Blockly.Events.VarDelete(this.variable);
        var event2 = new Blockly.Events.VarDelete(null);
        var json = event.toJson();
        event2.fromJson(json);

        chai.assert.equal(JSON.stringify(json), JSON.stringify(event2.toJson()));
      });
      test('Var rename', function() {
        var event = new Blockly.Events.VarRename(this.variable, '');
        var event2 = new Blockly.Events.VarRename(null);
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
      chai.assert.equal(4, filteredEvents.length);  // no event should have been removed.
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
      chai.assert.equal(4, filteredEvents.length);  // no event should have been removed.
    });

    test('Forward', function() {
      var block = this.workspace.newBlock('field_variable_test_block', '1');
      var events = [ new Blockly.Events.BlockCreate(block) ];
      addMoveEvent(events, block, 1, 1);
      addMoveEvent(events, block, 2, 2);
      addMoveEvent(events, block, 3, 3);
      var filteredEvents = Blockly.Events.filter(events, true);
      chai.assert.equal(2, filteredEvents.length);  // duplicate moves should have been removed.
      // test that the order hasn't changed
      chai.assert.isTrue(filteredEvents[0] instanceof Blockly.Events.BlockCreate);
      chai.assert.isTrue(filteredEvents[1] instanceof Blockly.Events.BlockMove);
      chai.assert.equal(3, filteredEvents[1].newCoordinate.x);
      chai.assert.equal(3, filteredEvents[1].newCoordinate.y);
    });

    test('Backward', function() {
      var block = this.workspace.newBlock('field_variable_test_block', '1');
      var events = [ new Blockly.Events.BlockCreate(block) ];
      addMoveEvent(events, block, 1, 1);
      addMoveEvent(events, block, 2, 2);
      addMoveEvent(events, block, 3, 3);
      var filteredEvents = Blockly.Events.filter(events, false);
      chai.assert.equal(2, filteredEvents.length);  // duplicate event should have been removed.
      // test that the order hasn't changed
      chai.assert.isTrue(filteredEvents[0] instanceof Blockly.Events.BlockCreate);
      chai.assert.isTrue(filteredEvents[1] instanceof Blockly.Events.BlockMove);
      chai.assert.equal(1, filteredEvents[1].newCoordinate.x);
      chai.assert.equal(1, filteredEvents[1].newCoordinate.y);
    });

    test('Merge move events', function() {
      var block = this.workspace.newBlock('field_variable_test_block', '1');
      var events = [];
      addMoveEvent(events, block, 0, 0);
      addMoveEvent(events, block, 1, 1);
      var filteredEvents = Blockly.Events.filter(events, true);
      chai.assert.equal(1, filteredEvents.length);  // second move event merged into first
      chai.assert.equal(1, filteredEvents[0].newCoordinate.x);
      chai.assert.equal(1, filteredEvents[0].newCoordinate.y);
    });

    test('Merge change events', function() {
      var block1 = this.workspace.newBlock('field_variable_test_block', '1');
      var events = [
        new Blockly.Events.Change(block1, 'field', 'VAR', 'item', 'item1'),
        new Blockly.Events.Change(block1, 'field', 'VAR', 'item1', 'item2')
      ];
      var filteredEvents = Blockly.Events.filter(events, true);
      chai.assert.equal(1, filteredEvents.length);  // second change event merged into first
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
      chai.assert.equal(2, filteredEvents.length);
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
      chai.assert.equal(0, filteredEvents.length);
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
      chai.assert.equal(4, filteredEvents.length);
      // test that the order hasn't changed
      chai.assert.isTrue(filteredEvents[0] instanceof Blockly.Events.BlockMove);
      chai.assert.isTrue(filteredEvents[1] instanceof Blockly.Events.BlockMove);
      chai.assert.isTrue(filteredEvents[2] instanceof Blockly.Events.BlockDelete);
      chai.assert.isTrue(filteredEvents[3] instanceof Blockly.Events.BlockMove);
    });
  });

  suite('Firing', function() {
    setup(function() {
      createEventsFireStub();
    });

    teardown(function() {
      sinon.restore();
    });

    test('Block dispose triggers BlockDelete', function() {
      try {
        var toolbox = document.getElementById('toolbox-categories');
        var workspaceSvg = Blockly.inject('blocklyDiv', {toolbox: toolbox});
        Blockly.Events.fire.firedEvents_ = [];

        var block = workspaceSvg.newBlock('');
        block.initSvg();
        block.setCommentText('test comment');

        var event = new Blockly.Events.BlockDelete(block);

        workspaceSvg.clearUndo();
        block.dispose();

        var firedEvents = workspaceSvg.undoStack_;
        chai.assert.equal(
            Blockly.Xml.domToText(firedEvents[0].oldXml),
            Blockly.Xml.domToText(event.oldXml),
            'Delete event created by dispose');
      } finally {
        workspaceSvg.dispose();
      }
    });

    test('New block new var', function() {
      // Expect three calls to genUid: one to set the block's ID, one for the event
      // group's id, and one for the variable's ID.
      var stub = sinon.stub(Blockly.utils, "genUid");
      stub.onCall(0).returns('1');
      stub.onCall(1).returns('2');
      stub.onCall(2).returns('3');
      var _ = this.workspace.newBlock('field_variable_test_block');

      var firedEvents = this.workspace.undoStack_;
      // Expect two events: varCreate and block create.
      chai.assert.equal(2, firedEvents.length);

      var event0 = firedEvents[0];
      var event1 = firedEvents[1];
      chai.assert.equal(event0.type, 'var_create');
      chai.assert.equal(event1.type, 'create');

      // Expect the events to have the same group ID.
      chai.assert.equal(event0.group, event1.group);

      // Expect the group ID to be the result of the second call to genUid.
      chai.assert.equal(event0.group, '2');

      // Expect the workspace to have a variable with ID '3'.
      chai.assert.isNotNull(this.workspace.getVariableById('3'));
      chai.assert.equal(event0.varId, '3');
    });

    test('New block new var xml', function() {
      // The sequence of events should be the same whether the block was created from
      // XML or directly.
      var dom = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="field_variable_test_block" id="block1">' +
          '    <field name="VAR" id="id1">name1</field>' +
          '  </block>' +
          '</xml>');
      Blockly.Xml.domToWorkspace(dom, this.workspace);

      var firedEvents = this.workspace.undoStack_;
      // Expect two events: varCreate and block create.
      chai.assert.equal(2, firedEvents.length);

      var event0 = firedEvents[0];
      var event1 = firedEvents[1];
      chai.assert.equal(event0.type, 'var_create');
      chai.assert.equal(event1.type, 'create');

      // Expect the events to have the same group ID.
      chai.assert.equal(event0.group, event1.group);

      // Expect the workspace to have a variable with ID 'id1'.
      chai.assert.isNotNull(this.workspace.getVariableById('id1'));
      chai.assert.equal(event0.varId, 'id1');
    });
  });
});
