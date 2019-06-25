/**
 * @license
 * Blockly Tests
 *
 * Copyright 2019 Google Inc.
 * https://developers.google.com/blockly/
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

goog.require('Blockly.Blocks.procedures');
goog.require('Blockly.Msg.en');

suite('Procedures', function() {
  setup(function() {
    Blockly.setTheme(new Blockly.Theme({
      "procedure_blocks": {
        "colourPrimary": "290"
      }
    }));
    this.workspace = new Blockly.Workspace();

    this.callForAllTypes = function(func, startName) {
      var typesArray = [
        ['procedures_defnoreturn', 'procedures_callnoreturn'],
        ['procedures_defreturn', 'procedures_callreturn']
      ];

      for (var i = 0, types; types = typesArray[i]; i++) {
        var context = Object.create(null);
        context.workspace = this.workspace;
        context.defType = types[0];
        context.callType = types[1];

        context.defBlock = new Blockly.Block(this.workspace, context.defType);
        context.defBlock.setFieldValue(startName, 'NAME');
        context.callBlock = new Blockly.Block(this.workspace, context.callType);
        context.callBlock.setFieldValue(startName, 'NAME');
        func.call(context);
        context.defBlock.dispose();
        context.callBlock.dispose();
      }
    };
  });
  teardown(function() {
    this.workspace.dispose();
  });

  suite('isNameUsed', function() {
    test('No Blocks', function() {
      chai.assert.isFalse(
          Blockly.Procedures.isNameUsed('name1', this.workspace)
      );
    });
    test('True', function() {
      this.callForAllTypes(function() {
        chai.assert.isTrue(
            Blockly.Procedures.isNameUsed('name1', this.workspace)
        );
      }, 'name1');
    });
    test('False', function() {
      this.callForAllTypes(function() {
        chai.assert.isFalse(
            Blockly.Procedures.isNameUsed('name2', this.workspace)
        );
      }, 'name1');
    });
  });
  suite('rename', function() {
    test('Simple, Programmatic', function() {
      this.callForAllTypes(function() {
        this.defBlock.setFieldValue(
            this.defBlock.getFieldValue('NAME') + '2',
            'NAME'
        );
        chai.assert.equal(this.defBlock.getFieldValue('NAME'), 'start name2');
        chai.assert.equal(this.callBlock.getFieldValue('NAME'), 'start name2');
      }, 'start name');
    });
    test('Simple, Input', function() {
      this.callForAllTypes(function() {
        var defInput = this.defBlock.getField('NAME');
        defInput.htmlInput_ = Object.create(null);
        defInput.htmlInput_.oldValue_ = 'start name';
        defInput.htmlInput_.untypedDefaultValue_ = 'start name';

        defInput.htmlInput_.value = defInput.htmlInput_.oldValue_ + '2';
        defInput.onHtmlInputChange_(null);
        chai.assert.equal(this.defBlock.getFieldValue('NAME'), 'start name2');
        chai.assert.equal(this.callBlock.getFieldValue('NAME'), 'start name2');
      }, 'start name');
    });
    test('lower -> CAPS', function() {
      this.callForAllTypes(function() {
        var defInput = this.defBlock.getField('NAME');
        defInput.htmlInput_ = Object.create(null);
        defInput.htmlInput_.oldValue_ = 'start name';
        defInput.htmlInput_.untypedDefaultValue_ = 'start name';

        defInput.htmlInput_.value = 'START NAME';
        defInput.onHtmlInputChange_(null);
        chai.assert.equal(this.defBlock.getFieldValue('NAME'), 'START NAME');
        chai.assert.equal(this.callBlock.getFieldValue('NAME'), 'START NAME');
      }, 'start name');
    });
    test('CAPS -> lower', function() {
      this.callForAllTypes(function() {
        var defInput = this.defBlock.getField('NAME');
        defInput.htmlInput_ = Object.create(null);
        defInput.htmlInput_.oldValue_ = 'START NAME';
        defInput.htmlInput_.untypedDefaultValue_ = 'START NAME';

        defInput.htmlInput_.value = 'start name';
        defInput.onHtmlInputChange_(null);
        console.log(this.defType);
        chai.assert.equal(this.defBlock.getFieldValue('NAME'), 'start name');
        chai.assert.equal(this.callBlock.getFieldValue('NAME'), 'start name');
      }, 'START NAME');
    });
    test('Whitespace', function() {
      this.callForAllTypes(function() {
        var defInput = this.defBlock.getField('NAME');
        defInput.htmlInput_ = Object.create(null);
        defInput.htmlInput_.oldValue_ = 'start name';
        defInput.htmlInput_.untypedDefaultValue_ = 'start name';

        defInput.htmlInput_.value = defInput.htmlInput_.oldValue_ + ' ';
        defInput.onHtmlInputChange_(null);
        chai.assert.equal(this.defBlock.getFieldValue('NAME'), 'start name');
        chai.assert.equal(this.callBlock.getFieldValue('NAME'), 'start name');
      }, 'start name');
    });
    // TODO: Simple fix, oldText needs to be trimmed too, or we just discard
    //  the checking (params don't check).
    test.skip('Whitespace then Text', function() {
      this.callForAllTypes(function() {
        var defInput = this.defBlock.getField('NAME');
        defInput.htmlInput_ = Object.create(null);
        defInput.htmlInput_.oldValue_ = 'start name';
        defInput.htmlInput_.untypedDefaultValue_ = 'start name';

        defInput.htmlInput_.value = defInput.htmlInput_.oldValue_ + ' ';
        defInput.onHtmlInputChange_(null);
        defInput.htmlInput_.value = defInput.htmlInput_.oldValue_ + '2';
        defInput.onHtmlInputChange_(null);
        chai.assert.equal(this.defBlock.getFieldValue('NAME'), 'start name 2');
        chai.assert.equal(this.callBlock.getFieldValue('NAME'), 'start name 2');
      }, 'start name');
    });
    test('Set Empty', function() {
      this.callForAllTypes(function() {
        var defInput = this.defBlock.getField('NAME');
        defInput.htmlInput_ = Object.create(null);
        defInput.htmlInput_.oldValue_ = 'start name';
        defInput.htmlInput_.untypedDefaultValue_ = 'start name';

        defInput.htmlInput_.value = '';
        defInput.onHtmlInputChange_(null);
        chai.assert.equal(this.defBlock.getFieldValue('NAME'), '');
        chai.assert.equal(this.callBlock.getFieldValue('NAME'), '');
      }, 'start name');
    });
    // TODO: Procedures do not handle having no name correctly. It is a
    //  problem with newly created procedure blocks having '' as the
    //  oldName, just like empty procedures. The renameProcedure function
    //  gets confused when a procedure's name is initially set. This is
    //  basically #503 again.
    test.skip('Set Empty, and Create New', function() {
      this.callForAllTypes(function() {
        var defInput = this.defBlock.getField('NAME');
        defInput.htmlInput_ = Object.create(null);
        defInput.htmlInput_.oldValue_ = 'start name';
        defInput.htmlInput_.untypedDefaultValue_ = 'start name';

        defInput.htmlInput_.value = '';
        defInput.onHtmlInputChange_(null);
        var newDefBlock = new Blockly.Block(this.workspace, this.defType);
        newDefBlock.setFieldValue('new name', 'NAME');
        chai.assert.equal(this.defBlock.getFieldValue('NAME'), '');
        chai.assert.equal(this.callBlock.getFieldValue('NAME'), '');

        newDefBlock.dispose();
      }, 'start name');
    });
  });
  suite('getCallers', function() {
    test('Simple', function() {
      this.callForAllTypes(function() {
        var callers = Blockly.Procedures.getCallers('name1', this.workspace);
        chai.assert.equal(callers.length, 1);
        chai.assert.equal(callers[0], this.callBlock);
      }, 'name1');
    });
    test('Multiple Callers', function() {
      this.callForAllTypes(function() {
        var caller2 = new Blockly.Block(this.workspace, this.callType);
        caller2.setFieldValue('name1', 'NAME');
        var caller3 = new Blockly.Block(this.workspace, this.callType);
        caller3.setFieldValue('name1', 'NAME');

        var callers = Blockly.Procedures.getCallers('name1', this.workspace);
        chai.assert.equal(callers.length, 3);
        chai.assert.equal(callers[0], this.callBlock);
        chai.assert.equal(callers[1], caller2);
        chai.assert.equal(callers[2], caller3);

        caller2.dispose();
        caller3.dispose();
      }, 'name1');
    });
    test('Multiple Procedures', function() {
      this.callForAllTypes(function() {
        var def2 = new Blockly.Block(this.workspace, this.defType);
        def2.setFieldValue('name2', 'NAME');
        var caller2 = new Blockly.Block(this.workspace, this.callType);
        caller2.setFieldValue('name2', 'NAME');

        var callers = Blockly.Procedures.getCallers('name1', this.workspace);
        chai.assert.equal(callers.length, 1);
        chai.assert.equal(callers[0], this.callBlock);

        def2.dispose();
        caller2.dispose();
      }, 'name1');
    });
    // This can occur if you:
    //  1) Create an uppercase definition and call block.
    //  2) Delete both blocks.
    //  3) Create a lowercase definition and call block.
    //  4) Retrieve the uppercase call block from the trashcan.
    // (And vise versa for creating lowercase blocks first)
    // When converted to code all function names will be lowercase, so a
    // caller should still be returned for a differently-cased procedure.
    test('Call Different Case', function() {
      this.callForAllTypes(function() {
        this.callBlock.setFieldValue('NAME1', 'NAME');
        var callers = Blockly.Procedures.getCallers('name1', this.workspace);
        chai.assert.equal(callers.length, 1);
        chai.assert.equal(callers[0], this.callBlock);
      }, 'name');
    });
    test('Multiple Workspaces', function() {
      this.callForAllTypes(function() {
        var workspace = new Blockly.Workspace();
        var def2 = new Blockly.Block(workspace, this.defType);
        def2.setFieldValue('name', 'NAME');
        var caller2 = new Blockly.Block(workspace, this.callType);
        caller2.setFieldValue('name', 'NAME');

        var callers = Blockly.Procedures.getCallers('name', this.workspace);
        chai.assert.equal(callers.length, 1);
        chai.assert.equal(callers[0], this.callBlock);

        callers = Blockly.Procedures.getCallers('name', workspace);
        chai.assert.equal(callers.length, 1);
        chai.assert.equal(callers[0], caller2);

        def2.dispose();
        caller2.dispose();
      }, 'name');
    });
  });
  suite('getDefinition', function() {
    test('Simple', function() {
      this.callForAllTypes(function() {
        var def = Blockly.Procedures.getDefinition('name1', this.workspace);
        chai.assert.equal(def, this.defBlock);
      }, 'name1');
    });
    test('Multiple Procedures', function() {
      this.callForAllTypes(function() {
        var def2 = new Blockly.Block(this.workspace, this.defType);
        def2.setFieldValue('name2', 'NAME');
        var caller2 = new Blockly.Block(this.workspace, this.callType);
        caller2.setFieldValue('name2', 'NAME');

        var def = Blockly.Procedures.getDefinition('name1', this.workspace);
        chai.assert.equal(def, this.defBlock);

        def2.dispose();
        caller2.dispose();
      }, 'name1');
    });
    test('Multiple Workspaces', function() {
      this.callForAllTypes(function() {
        var workspace = new Blockly.Workspace();
        var def2 = new Blockly.Block(workspace, this.defType);
        def2.setFieldValue('name', 'NAME');
        var caller2 = new Blockly.Block(workspace, this.callType);
        caller2.setFieldValue('name', 'NAME');

        var def = Blockly.Procedures.getDefinition('name', this.workspace);
        chai.assert.equal(def, this.defBlock);

        def = Blockly.Procedures.getDefinition('name', workspace);
        chai.assert.equal(def, def2);

        def2.dispose();
        caller2.dispose();
      }, 'name');
    });
  });
  suite('Arguments', function() {
    setup(function() {
      this.findParentStub = sinon.stub(Blockly.Mutator, 'findParentWs')
          .returns(this.workspace);
    });
    teardown(function() {
      this.findParentStub.restore();
    });
    suite('Untyped Arguments', function() {
      function createMutator(argArray) {
        this.mutatorWorkspace = new Blockly.Workspace();
        this.containerBlock = this.defBlock.decompose(this.mutatorWorkspace);
        this.connection = this.containerBlock.getInput('STACK').connection;
        for (var i = 0; i < argArray.length; i++) {
          this.argBlock = new Blockly.Block(
              this.mutatorWorkspace, 'procedures_mutatorarg');
          this.argBlock.setFieldValue(argArray[i], 'NAME');
          this.connection.connect(this.argBlock.previousConnection);
          this.connection = this.argBlock.nextConnection;
        }
        this.defBlock.compose(this.containerBlock);
      }
      function assertArgs(argArray) {
        chai.assert.equal(this.defBlock.arguments_.length, argArray.length);
        for (var i = 0; i < argArray.length; i++) {
          chai.assert.equal(this.defBlock.arguments_[i], argArray[i]);
        }
        chai.assert.equal(this.callBlock.arguments_.length, argArray.length);
        for (var i = 0; i < argArray.length; i++) {
          chai.assert.equal(this.callBlock.arguments_[i], argArray[i]);
        }
      }
      function clearVariables() {
        // TODO: Update this for typed vars.
        var variables = this.workspace.getVariablesOfType('');
        var variableMap = this.workspace.getVariableMap();
        for (var i = 0, variable; variable = variables[i]; i++) {
          variableMap.deleteVariable(variable);
        }
      }
      test('Simple Add Arg', function() {
        this.callForAllTypes(function() {
          var args = ['arg1'];
          createMutator.call(this, args);
          assertArgs.call(this, args);
          clearVariables.call(this);
        }, 'name');
      });
      test('Multiple Args', function() {
        this.callForAllTypes(function() {
          var args = ['arg1', 'arg2', 'arg3'];
          createMutator.call(this, args);
          assertArgs.call(this, args);
          clearVariables.call(this);
        }, 'name');
      });
      test('Simple Change Arg', function() {
        this.callForAllTypes(function() {
          createMutator.call(this, ['arg1']);
          this.argBlock.setFieldValue('arg2', 'NAME');
          this.defBlock.compose(this.containerBlock);
          assertArgs.call(this, ['arg2']);
          clearVariables.call(this);
        }, 'name');
      });
      test.skip('lower -> CAPS', function() {
        this.callForAllTypes(function() {
          createMutator.call(this, ['arg']);
          this.argBlock.setFieldValue('ARG', 'NAME');
          this.defBlock.compose(this.containerBlock);
          assertArgs.call(this, ['ARG']);
          clearVariables.call(this);
        }, 'name');
      });
      test.skip('CAPS -> lower', function() {
        this.callForAllTypes(function() {
          createMutator.call(this, ['ARG']);
          this.argBlock.setFieldValue('arg', 'NAME');
          this.defBlock.compose(this.containerBlock);
          assertArgs.call(this, ['arg']);
          clearVariables.call(this);
        }, 'name');
      });
      // Test case for #1958
      test('Set Arg Empty', function() {
        this.callForAllTypes(function() {
          var args = ['arg1'];
          createMutator.call(this, args);
          this.argBlock.setFieldValue('', 'NAME');
          this.defBlock.compose(this.containerBlock);
          assertArgs.call(this, args);
          clearVariables.call(this);
        }, 'name');
      });
      test('Whitespace', function() {
        this.callForAllTypes(function() {
          var args = ['arg1'];
          createMutator.call(this, args);
          this.argBlock.setFieldValue(' ', 'NAME');
          this.defBlock.compose(this.containerBlock);
          assertArgs.call(this, args);
          clearVariables.call(this);
        }, 'name');
      });
      test('Whitespace and Text', function() {
        this.callForAllTypes(function() {
          createMutator.call(this, ['arg1']);
          this.argBlock.setFieldValue(' text ', 'NAME');
          this.defBlock.compose(this.containerBlock);
          assertArgs.call(this, ['text']);
          clearVariables.call(this);
        }, 'name');
      });
    });
  });
});
