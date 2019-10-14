/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
      assertEquals(values[field], event[field]);
    }
  }

  function checkCreateEventValues(event, block, ids, type) {
    var expected_xml = Blockly.Xml.domToText(Blockly.Xml.blockToDom(block));
    var result_xml = Blockly.Xml.domToText(event.xml);
    assertEquals(expected_xml, result_xml);
    isEqualArrays(ids, event.ids);
    assertEquals(type, event.type);
  }

  function checkDeleteEventValues(event, block, ids, type) {
    var expected_xml = Blockly.Xml.domToText(Blockly.Xml.blockToDom(block));
    var result_xml = Blockly.Xml.domToText(event.oldXml);
    assertEquals(expected_xml, result_xml);
    isEqualArrays(ids, event.ids);
    assertEquals(type, event.type);
  }

  suite('Constructors', function() {
    test('Abstract', function() {
      var event = new Blockly.Events.Abstract();
      assertUndefined(event.blockId);
      assertUndefined(event.workspaceId);
      assertUndefined(event.varId);
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

        // Disable events while constructing the block: this is a test of the
        // Blockly.Event constructors, not the block constructor.
        Blockly.Events.disable();
        this.block = new Blockly.Block(this.workspace, 'simple_test_block');
        Blockly.Events.enable();
        sinon.restore();
      });

      teardown(function() {
      });

      test('Block base', function() {
        var event = new Blockly.Events.BlockBase(this.block);
        assertUndefined(event.varId);
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
            Blockly.Events.disable();
            this.parentBlock = new Blockly.Block(this.workspace, 'simple_test_block');
            Blockly.Events.enable();
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
        // Disable events while constructing the block: this is a test of the
        // Blockly.Event constructors, not the block constructor.
        Blockly.Events.disable();
        this.block = new Blockly.Block(this.workspace, 'field_variable_test_block');
        Blockly.Events.enable();
      });

      teardown(function() {

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
      assertNotUndefined(variable);
      assertEquals(name, variable.name);
      assertEquals(type, variable.type);
      assertEquals(id, variable.getId());
    }
    suite('Constructors', function() {
      test('Var base', function() {
        var event = new Blockly.Events.VarBase(this.variable);
        assertUndefined(event.blockId);
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

        assertEquals(JSON.stringify(json), JSON.stringify(event2.toJson()));
      });
      test('Var delete', function() {
        var event = new Blockly.Events.VarDelete(this.variable);
        var event2 = new Blockly.Events.VarDelete(null);
        var json = event.toJson();
        event2.fromJson(json);

        assertEquals(JSON.stringify(json), JSON.stringify(event2.toJson()));
      });
      test('Var rename', function() {
        var event = new Blockly.Events.VarRename(this.variable, '');
        var event2 = new Blockly.Events.VarRename(null);
        var json = event.toJson();
        event2.fromJson(json);

        assertEquals(JSON.stringify(json), JSON.stringify(event2.toJson()));
      });
    });

    suite('toJson', function() {
      test('Var create', function() {
        var variable = this.workspace.createVariable('name1', 'type1', 'id1');
        var event = new Blockly.Events.VarCreate(variable);
        var json = event.toJson();
        var expectedJson = ({type: "var_create", varId: "id1", varType: "type1",
          varName: "name1"});

        assertEquals(JSON.stringify(expectedJson), JSON.stringify(json));
      });

      test('Var delete', function() {
        var event = new Blockly.Events.VarDelete(this.variable);
        var json = event.toJson();
        var expectedJson = ({type: "var_delete", varId: "id1", varType: "type1",
          varName: "name1"});

        assertEquals(JSON.stringify(expectedJson), JSON.stringify(json));
      });

      test('Var rename', function() {
        var event = new Blockly.Events.VarRename(this.variable, 'name2');
        var json = event.toJson();
        var expectedJson = ({type: "var_rename", varId: "id1", oldName: "name1",
          newName: "name2"});

        assertEquals(JSON.stringify(expectedJson), JSON.stringify(json));
      });
    });

    suite.skip('Run Forward', function() {
      test('Var create', function() {
        var json = {type: "var_create", varId: "id1", varType: "type1",
          varName: "name1"};
        var event = Blockly.Events.fromJson(json, this.workspace);
        assertNull(this.workspace.getVariableById('id1'));
        event.run(true);
        checkVariableValues(this.workspace, 'name1', 'type1', 'id1');
      });

      test('Var delete', function() {
        var event = new Blockly.Events.VarDelete(this.variable);
        assertNotNull(this.workspace.getVariableById('id1'));
        event.run(true);
        assertNull(this.workspace.getVariableById('id1'));
      });

      test('Var rename', function() {
        var event = new Blockly.Events.VarRename(this.variable, 'name2');
        event.run(true);
        assertNull(this.workspace.getVariable('name1'));
        checkVariableValues(this.workspace, 'name2', 'type1', 'id1');
      });
    });
    suite.skip('Run Backward', function() {
      test('Var create', function() {
        var variable = this.workspace.createVariable('name1', 'type1', 'id1');
        var event = new Blockly.Events.VarCreate(variable);
        assertNotNull(this.workspace.getVariableById('id1'));
        event.run(false);
      });

      test('Var delete', function() {
        var json = {type: "var_delete", varId: "id1", varType: "type1",
          varName: "name1"};
        var event = Blockly.Events.fromJson(json, this.workspace);
        assertNull(this.workspace.getVariableById('id1'));
        event.run(false);
        checkVariableValues(this.workspace, 'name1', 'type1', 'id1');
      });

      test('Var rename', function() {
        var event = new Blockly.Events.VarRename(this.variable, 'name2');
        event.run(false);
        assertNull(this.workspace.getVariable('name2'));
        checkVariableValues(this.workspace, 'name1', 'type1', 'id1');
      });
    });
  });
});
