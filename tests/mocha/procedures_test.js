/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.require('Blockly.Blocks.procedures');
goog.require('Blockly.Msg');

suite('Procedures', function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = new Blockly.Workspace();
    this.workspace.createVariable('preCreatedVar', '', 'preCreatedVarId');
    this.workspace.createVariable(
        'preCreatedTypedVar', 'type', 'preCreatedTypedVarId');
  });
  teardown(function() {
    sharedTestTeardown.call(this);
  });
  
  suite('allProcedures', function() {
    test('Only Procedures', function() {
      var noReturnBlock = new Blockly.Block(this.workspace, 'procedures_defnoreturn');
      noReturnBlock.setFieldValue('no return', 'NAME');
      var returnBlock = new Blockly.Block(this.workspace, 'procedures_defreturn');
      returnBlock.setFieldValue('return', 'NAME');

      var allProcedures = Blockly.Procedures.allProcedures(this.workspace);
      chai.assert.lengthOf(allProcedures, 2);

      chai.assert.lengthOf(allProcedures[0], 1);
      chai.assert.equal(allProcedures[0][0][0], 'no return');

      chai.assert.lengthOf(allProcedures[1], 1);
      chai.assert.equal(allProcedures[1][0][0], 'return');
    });
    test('Multiple Blocks', function() {
      var noReturnBlock = new Blockly.Block(this.workspace, 'procedures_defnoreturn');
      noReturnBlock.setFieldValue('no return', 'NAME');
      var returnBlock = new Blockly.Block(this.workspace, 'procedures_defreturn');
      returnBlock.setFieldValue('return', 'NAME');
      var returnBlock2 = new Blockly.Block(this.workspace, 'procedures_defreturn');
      returnBlock2.setFieldValue('return2', 'NAME');
      var _ = new Blockly.Block(this.workspace, 'controls_if');

      var allProcedures = Blockly.Procedures.allProcedures(this.workspace);
      chai.assert.lengthOf(allProcedures, 2);

      chai.assert.lengthOf(allProcedures[0], 1);
      chai.assert.equal(allProcedures[0][0][0], 'no return');

      chai.assert.lengthOf(allProcedures[1], 2);
      chai.assert.equal(allProcedures[1][0][0], 'return');
      chai.assert.equal(allProcedures[1][1][0], 'return2');
    });
    test('No Procedures', function() {
      var _ = new Blockly.Block(this.workspace, 'controls_if');
      var allProcedures = Blockly.Procedures.allProcedures(this.workspace);
      chai.assert.lengthOf(allProcedures, 2);
      chai.assert.lengthOf(allProcedures[0], 0, 'No procedures_defnoreturn blocks expected');
      chai.assert.lengthOf(allProcedures[1], 0, 'No procedures_defreturn blocks expected');
    });
  });

  suite('isNameUsed', function() {
    test('No Blocks', function() {
      chai.assert.isFalse(
          Blockly.Procedures.isNameUsed('name1', this.workspace)
      );
    });
  });

  suite('Enable/Disable', function() {
    setup(function() {
      var toolbox = document.getElementById('toolbox-categories');
      this.workspaceSvg = Blockly.inject('blocklyDiv', {toolbox: toolbox});
    });
    teardown(function() {
      workspaceTeardown.call(this, this.workspaceSvg);
      sinon.restore();
    });
    suite('Inherited disabled', function() {
      setup(function() {
        var dom = Blockly.Xml.textToDom(
            '<xml xmlns="https://developers.google.com/blockly/xml">' +
            '<block type="procedures_defreturn" id="bar-def">' +
            '<field name="NAME">bar</field>' +
            '<statement name="STACK">' +
            '<block type="procedures_callnoreturn" id="foo-c1">' +
            '<mutation name="foo"></mutation>' +
            '</block>' +
            '</statement>' +
            '<value name="RETURN">' +
            '<block type="procedures_callreturn" id="bar-c1">' +
            '<mutation name="bar"></mutation>' +
            '</block>' +
            '</value>' +
            '</block>' +
            '<block type="procedures_defnoreturn" id="foo-def">' +
            '<field name="NAME">foo</field>' +
            '</block>' +
            '<block type="procedures_defreturn" id="baz-def">' +
            '<field name="NAME">baz</field>' +
            '<value name="RETURN">' +
            '<block type="procedures_callreturn" id="bar-c2">' +
            '<mutation name="bar"></mutation>' +
            '</block>' +
            '</value>' +
            '</block>' +
            '<block type="procedures_callnoreturn" id="foo-c2">' +
            '<mutation name="foo"></mutation>' +
            '</block>' +
            '<block type="procedures_callreturn" id="baz-c1">' +
            '<mutation name="baz"></mutation>' +
            '</block>' +
            '</xml>');
        Blockly.Events.disable();
        Blockly.Xml.appendDomToWorkspace(dom, this.workspaceSvg);
        Blockly.Events.enable();

        this.barDef = this.workspaceSvg.getBlockById('bar-def');
        this.fooDef = this.workspaceSvg.getBlockById('foo-def');
        this.bazDef = this.workspaceSvg.getBlockById('baz-def');

        this.barCalls = [
          this.workspaceSvg.getBlockById('bar-c1'),
          this.workspaceSvg.getBlockById('bar-c2')];
        this.fooCalls = [
          this.workspaceSvg.getBlockById('foo-c1'),
          this.workspaceSvg.getBlockById('foo-c2')];
        this.bazCall = this.workspaceSvg.getBlockById('baz-c1');
      });
      test('Nested caller', function() {
        this.barDef.setEnabled(false);

        for (var i = 0; i < 2; i++) {
          chai.assert.isFalse(this.barCalls[i].isEnabled(),
              'Callers are disabled when their definition is disabled ' +
              '(bar call ' + i + ')');
        }
        chai.assert.isTrue(this.fooCalls[0].isEnabled(),
            'Callers in definitions are disabled by inheritance');
        chai.assert.isTrue(this.fooCalls[0].getInheritedDisabled(),
            'Callers in definitions are disabled by inheritance');

        this.fooDef.setEnabled(false);

        for (var i = 0; i < 2; i++) {
          chai.assert.isFalse(this.fooCalls[i].isEnabled(),
              'Callers are disabled when their definition is disabled ' +
              '(foo call ' + i + ')');
        }

        this.barDef.setEnabled(true);

        for (var i = 0; i < 2; i++) {
          chai.assert.isTrue(this.barCalls[i].isEnabled(),
              'Callers are reenabled with their definition ' +
              '(bar call ' + i + ')');
        }
        chai.assert.isFalse(this.fooCalls[0].isEnabled(),
            'Nested disabled callers remain disabled');
        chai.assert.isFalse(this.fooCalls[0].getInheritedDisabled(),
            'Nested disabled callers remain disabled, not by inheritance');
      });
      test('Caller in return', function() {
        this.bazDef.setEnabled(false);

        chai.assert.isFalse(this.bazCall.isEnabled(),
            'Caller is disabled with its definition');

        chai.assert.isTrue(this.barCalls[1].isEnabled(),
            'Caller in the return is disabled by inheritance');
        chai.assert.isTrue(this.barCalls[1].getInheritedDisabled(),
            'Caller in the return is disabled by inheritance');

        this.barDef.setEnabled(false);

        for (var i = 0; i < 2; i++) {
          chai.assert.isFalse(this.barCalls[i].isEnabled(),
              'Callers are disabled when their definition is disabled ' +
              '(bar call ' + i + ')');
        }

        this.bazDef.setEnabled(true);

        chai.assert.isFalse(this.barCalls[1].isEnabled(),
            'Caller in return remains disabled');
        chai.assert.isFalse(this.barCalls[1].getInheritedDisabled(),
            'Caller in return remains disabled, not by inheritance');
      });
    });
  });

  suite('Multiple block serialization', function() {
    function assertDefAndCallBlocks(workspace, noReturnNames, returnNames, hasCallers) {
      const allProcedures = Blockly.Procedures.allProcedures(workspace);
      const defNoReturnBlocks = allProcedures[0];
      chai.assert.lengthOf(defNoReturnBlocks, noReturnNames.length);
      for (let i = 0; i < noReturnNames.length; i++) {
        const expectedName = noReturnNames[i];
        chai.assert.equal(defNoReturnBlocks[i][0], expectedName);
        if (hasCallers) {
          const callers =
              Blockly.Procedures.getCallers(expectedName, workspace);
          chai.assert.lengthOf(callers, 1);
        }
      }
      const defReturnBlocks = allProcedures[1];
      chai.assert.lengthOf(defReturnBlocks, returnNames.length);
      for (let i = 0; i < returnNames.length; i++) {
        const expectedName = returnNames[i];
        chai.assert.equal(defReturnBlocks[i][0], expectedName);
        if (hasCallers) {
          const callers =
              Blockly.Procedures.getCallers(expectedName, workspace);
          chai.assert.lengthOf(callers, 1);
        }
      }

      // Expecting def and caller blocks are the only blocks on workspace
      let expectedCount = noReturnNames.length + returnNames.length;
      if (hasCallers) {
        expectedCount *= 2;
      }
      const blocks = workspace.getAllBlocks(false);
      chai.assert.lengthOf(blocks, expectedCount);
    }
    suite('no name renamed to unnamed', function() {
      test('defnoreturn and defreturn', function() {
        var xml = Blockly.Xml.textToDom(`
              <xml xmlns="https://developers.google.com/blockly/xml">
                <block type="procedures_defnoreturn"/>
                <block type="procedures_defreturn"/>
              </xml>`);
        Blockly.Xml.domToWorkspace(xml, this.workspace);
        assertDefAndCallBlocks(
            this.workspace, ['unnamed'], ['unnamed2'], false);
      });
      test('defreturn and defnoreturn', function() {
        var xml = Blockly.Xml.textToDom(`
              <xml xmlns="https://developers.google.com/blockly/xml">
                <block type="procedures_defreturn"/>
                <block type="procedures_defnoreturn"/>
              </xml>`);
        Blockly.Xml.domToWorkspace(xml, this.workspace);
        assertDefAndCallBlocks(
            this.workspace, ['unnamed2'], ['unnamed'], false);
      });
      test('callnoreturn (no def in xml)', function() {
        var xml = Blockly.Xml.textToDom(`
              <xml xmlns="https://developers.google.com/blockly/xml">
                <block type="procedures_callnoreturn"/>
              </xml>`);
        Blockly.Xml.domToWorkspace(xml, this.workspace);
        assertDefAndCallBlocks(
            this.workspace, ['unnamed'], [], true);
      });
      test('callreturn (no def in xml)', function() {
        var xml = Blockly.Xml.textToDom(`
              <xml xmlns="https://developers.google.com/blockly/xml">
                <block type="procedures_callreturn"/>
              </xml>`);
        Blockly.Xml.domToWorkspace(xml, this.workspace);
        assertDefAndCallBlocks(
            this.workspace, [], ['unnamed'], true);
      });
      test('callnoreturn and callreturn (no def in xml)', function() {
        var xml = Blockly.Xml.textToDom(`
              <xml xmlns="https://developers.google.com/blockly/xml">
                <block type="procedures_callnoreturn"/>
                <block type="procedures_callreturn"/>
              </xml>`);
        Blockly.Xml.domToWorkspace(xml, this.workspace);
        assertDefAndCallBlocks(
            this.workspace, ['unnamed'], ['unnamed2'], true);
      });
      test('callreturn and callnoreturn (no def in xml)', function() {
        var xml = Blockly.Xml.textToDom(`
              <xml xmlns="https://developers.google.com/blockly/xml">
                <block type="procedures_callreturn"/>
                <block type="procedures_callnoreturn"/>
              </xml>`);
        Blockly.Xml.domToWorkspace(xml, this.workspace);
        assertDefAndCallBlocks(
            this.workspace, ['unnamed2'], ['unnamed'], true);
      });
    });
    suite('caller param mismatch', function() {
      test.skip('callreturn with missing args', function() {
        // TODO: How do we want it to behave in this situation?
        var defBlock = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(`
            <block type="procedures_defreturn">
              <field name="NAME">do something</field>
              <mutation>
                <arg name="x" varid="arg"></arg>
              </mutation>
            </block>
        `), this.workspace);
        var callBlock = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
            '<block type="procedures_callreturn">' +
            '  <mutation name="do something"/>' +
            '</block>'
        ), this.workspace);
        assertDefBlockStructure(defBlock, true, ['x'], ['arg']);
        assertCallBlockStructure(callBlock, ['x'], ['arg']);
      });
      test.skip('callreturn with bad args', function() {
        // TODO: How do we want it to behave in this situation?
        var defBlock = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(`
            <block type="procedures_defreturn">
              <field name="NAME">do something</field>
              <mutation>
                <arg name="x" varid="arg"></arg>
              </mutation>
            </block>
        `), this.workspace);
        var callBlock = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(`
            <block type="procedures_callreturn">
              <mutation name="do something">
                <arg name="y"></arg>
              </mutation>
            </block>
        `), this.workspace);
        assertDefBlockStructure(defBlock, true, ['x'], ['arg']);
        assertCallBlockStructure(callBlock, ['x'], ['arg']);
      });
      test.skip('callnoreturn with missing args', function() {
        // TODO: How do we want it to behave in this situation?
        var defBlock = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(`
            <block type="procedures_defnoreturn">
              <field name="NAME">do something</field>
              <mutation>
                <arg name="x" varid="arg"></arg>
              </mutation>
            </block>
        `), this.workspace);
        var callBlock = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
            '<block type="procedures_callnoreturn">' +
            '  <mutation name="do something"/>' +
            '</block>'
        ), this.workspace);
        assertDefBlockStructure(defBlock, false, ['x'], ['arg']);
        assertCallBlockStructure(callBlock, ['x'], ['arg']);
      });
      test.skip('callnoreturn with bad args', function() {
        // TODO: How do we want it to behave in this situation?
        var defBlock = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(`
            <block type="procedures_defnoreturn">
              <field name="NAME">do something</field>
              <mutation>
                <arg name="x" varid="arg"></arg>
              </mutation>
            </block>
        `), this.workspace);
        var callBlock = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(`
            <block type="procedures_callnoreturn">
              <mutation name="do something">
                <arg name="y"></arg>
              </mutation>
            </block>
        `), this.workspace);
        assertDefBlockStructure(defBlock, false, ['x'], ['arg']);
        assertCallBlockStructure(callBlock, ['x'], ['arg']);
      });
    });
  });

  const testSuites = [
    {title: 'procedures_defreturn', hasReturn: true,
      defType: 'procedures_defreturn', callType: 'procedures_callreturn'},
    {title: 'procedures_defnoreturn', hasReturn: false,
      defType: 'procedures_defnoreturn', callType: 'procedures_callnoreturn'},
  ];

  testSuites.forEach((testSuite) => {
    suite(testSuite.title, function() {
      suite('Structure', function() {
        setup(function() {
          this.defBlock = new Blockly.Block(this.workspace, testSuite.defType);
          this.defBlock.setFieldValue('proc name', 'NAME');
        });
        test('Definition block', function() {
          assertDefBlockStructure(this.defBlock, testSuite.hasReturn);
        });

        test('Call block', function() {
          this.callBlock = new Blockly.Block(
              this.workspace, testSuite.callType);
          this.callBlock.setFieldValue('proc name', 'NAME');
          assertCallBlockStructure(this.callBlock);
        });
      });
      suite('isNameUsed', function() {
        setup(function() {
          this.defBlock = new Blockly.Block(this.workspace, testSuite.defType);
          this.defBlock.setFieldValue('proc name', 'NAME');
          this.callBlock = new Blockly.Block(
              this.workspace, testSuite.callType);
          this.callBlock.setFieldValue('proc name', 'NAME');
        });
        test('True', function() {
          chai.assert.isTrue(
              Blockly.Procedures.isNameUsed('proc name', this.workspace));
        });
        test('False', function() {
          chai.assert.isFalse(
              Blockly.Procedures.isNameUsed('unused proc name', this.workspace));
        });
      });
      suite('rename', function() {
        setup(function() {
          this.defBlock = new Blockly.Block(this.workspace, testSuite.defType);
          this.defBlock.setFieldValue('proc name', 'NAME');
          this.callBlock = new Blockly.Block(
              this.workspace, testSuite.callType);
          this.callBlock.setFieldValue('proc name', 'NAME');
          sinon.stub(this.defBlock.getField('NAME'), 'resizeEditor_');
        });
        test('Simple, Programmatic', function() {
          this.defBlock.setFieldValue(
              this.defBlock.getFieldValue('NAME') + '2',
              'NAME'
          );
          chai.assert.equal(
              this.defBlock.getFieldValue('NAME'), 'proc name2');
          chai.assert.equal(
              this.callBlock.getFieldValue('NAME'), 'proc name2');
        });
        test('Simple, Input', function() {
          var defInput = this.defBlock.getField('NAME');
          defInput.htmlInput_ = Object.create(null);
          defInput.htmlInput_.oldValue_ = 'proc name';
          defInput.htmlInput_.untypedDefaultValue_ = 'proc name';

          defInput.htmlInput_.value = defInput.htmlInput_.oldValue_ + '2';
          defInput.onHtmlInputChange_(null);
          chai.assert.equal(
              this.defBlock.getFieldValue('NAME'), 'proc name2');
          chai.assert.equal(
              this.callBlock.getFieldValue('NAME'), 'proc name2');
        });
        test('lower -> CAPS', function() {
          var defInput = this.defBlock.getField('NAME');
          defInput.htmlInput_ = Object.create(null);
          defInput.htmlInput_.oldValue_ = 'proc name';
          defInput.htmlInput_.untypedDefaultValue_ = 'proc name';

          defInput.htmlInput_.value = 'PROC NAME';
          defInput.onHtmlInputChange_(null);
          chai.assert.equal(
              this.defBlock.getFieldValue('NAME'), 'PROC NAME');
          chai.assert.equal(
              this.callBlock.getFieldValue('NAME'), 'PROC NAME');
        });
        test('CAPS -> lower', function() {
          this.defBlock.setFieldValue('PROC NAME', 'NAME');
          this.callBlock.setFieldValue('PROC NAME', 'NAME');
          var defInput = this.defBlock.getField('NAME');
          defInput.htmlInput_ = Object.create(null);
          defInput.htmlInput_.oldValue_ = 'PROC NAME';
          defInput.htmlInput_.untypedDefaultValue_ = 'PROC NAME';

          defInput.htmlInput_.value = 'proc name';
          defInput.onHtmlInputChange_(null);
          chai.assert.equal(
              this.defBlock.getFieldValue('NAME'), 'proc name');
          chai.assert.equal(
              this.callBlock.getFieldValue('NAME'), 'proc name');
        });
        test('Whitespace', function() {
          var defInput = this.defBlock.getField('NAME');
          defInput.htmlInput_ = Object.create(null);
          defInput.htmlInput_.oldValue_ = 'proc name';
          defInput.htmlInput_.untypedDefaultValue_ = 'proc name';

          defInput.htmlInput_.value = defInput.htmlInput_.oldValue_ + ' ';
          defInput.onHtmlInputChange_(null);
          chai.assert.equal(
              this.defBlock.getFieldValue('NAME'), 'proc name');
          chai.assert.equal(
              this.callBlock.getFieldValue('NAME'), 'proc name');
        });
        test('Whitespace then Text', function() {
          var defInput = this.defBlock.getField('NAME');
          defInput.htmlInput_ = Object.create(null);
          defInput.htmlInput_.oldValue_ = 'proc name';
          defInput.htmlInput_.untypedDefaultValue_ = 'proc name';

          defInput.htmlInput_.value = defInput.htmlInput_.oldValue_ + ' ';
          defInput.onHtmlInputChange_(null);
          defInput.htmlInput_.value = defInput.htmlInput_.oldValue_ + '2';
          defInput.onHtmlInputChange_(null);
          chai.assert.equal(
              this.defBlock.getFieldValue('NAME'), 'proc name 2');
          chai.assert.equal(
              this.callBlock.getFieldValue('NAME'), 'proc name 2');
        });
        test('Set Empty', function() {
          var defInput = this.defBlock.getField('NAME');
          defInput.htmlInput_ = Object.create(null);
          defInput.htmlInput_.oldValue_ = 'proc name';
          defInput.htmlInput_.untypedDefaultValue_ = 'proc name';

          defInput.htmlInput_.value = '';
          defInput.onHtmlInputChange_(null);
          chai.assert.equal(
              this.defBlock.getFieldValue('NAME'),
              Blockly.Msg['UNNAMED_KEY']);
          chai.assert.equal(
              this.callBlock.getFieldValue('NAME'),
              Blockly.Msg['UNNAMED_KEY']);
        });
        test('Set Empty, and Create New', function() {
          var defInput = this.defBlock.getField('NAME');
          defInput.htmlInput_ = Object.create(null);
          defInput.htmlInput_.oldValue_ = 'proc name';
          defInput.htmlInput_.untypedDefaultValue_ = 'proc name';

          defInput.htmlInput_.value = '';
          defInput.onHtmlInputChange_(null);
          var newDefBlock = new Blockly.Block(this.workspace, testSuite.defType);
          newDefBlock.setFieldValue('new name', 'NAME');
          chai.assert.equal(
              this.defBlock.getFieldValue('NAME'),
              Blockly.Msg['UNNAMED_KEY']);
          chai.assert.equal(
              this.callBlock.getFieldValue('NAME'),
              Blockly.Msg['UNNAMED_KEY']);
        });
      });
      suite('getCallers', function() {
        setup(function() {
          this.defBlock = new Blockly.Block(this.workspace, testSuite.defType);
          this.defBlock.setFieldValue('proc name', 'NAME');
          this.callBlock = new Blockly.Block(
              this.workspace, testSuite.callType);
          this.callBlock.setFieldValue('proc name', 'NAME');
        });
        test('Simple', function() {
          var callers =
              Blockly.Procedures.getCallers('proc name', this.workspace);
          chai.assert.equal(callers.length, 1);
          chai.assert.equal(callers[0], this.callBlock);
        });
        test('Multiple Callers', function() {
          var caller2 = new Blockly.Block(this.workspace, testSuite.callType);
          caller2.setFieldValue('proc name', 'NAME');
          var caller3 = new Blockly.Block(this.workspace, testSuite.callType);
          caller3.setFieldValue('proc name', 'NAME');

          var callers =
              Blockly.Procedures.getCallers('proc name', this.workspace);
          chai.assert.equal(callers.length, 3);
          chai.assert.equal(callers[0], this.callBlock);
          chai.assert.equal(callers[1], caller2);
          chai.assert.equal(callers[2], caller3);
        });
        test('Multiple Procedures', function() {
          var def2 = new Blockly.Block(this.workspace, testSuite.defType);
          def2.setFieldValue('proc name2', 'NAME');
          var caller2 = new Blockly.Block(this.workspace, testSuite.callType);
          caller2.setFieldValue('proc name2', 'NAME');

          var callers =
              Blockly.Procedures.getCallers('proc name', this.workspace);
          chai.assert.equal(callers.length, 1);
          chai.assert.equal(callers[0], this.callBlock);
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
          this.callBlock.setFieldValue('PROC NAME', 'NAME');
          var callers =
              Blockly.Procedures.getCallers('proc name', this.workspace);
          chai.assert.equal(callers.length, 1);
          chai.assert.equal(callers[0], this.callBlock);
        });
        test('Multiple Workspaces', function() {
          var workspace = new Blockly.Workspace();
          try {
            var def2 = new Blockly.Block(workspace, testSuite.defType);
            def2.setFieldValue('proc name', 'NAME');
            var caller2 = new Blockly.Block(workspace, testSuite.callType);
            caller2.setFieldValue('proc name', 'NAME');

            var callers =
                Blockly.Procedures.getCallers('proc name', this.workspace);
            chai.assert.equal(callers.length, 1);
            chai.assert.equal(callers[0], this.callBlock);

            callers = Blockly.Procedures.getCallers('proc name', workspace);
            chai.assert.equal(callers.length, 1);
            chai.assert.equal(callers[0], caller2);
          } finally {
            workspaceTeardown.call(this, workspace);
          }
        });
      });
      suite('getDefinition', function() {
        setup(function() {
          this.defBlock = new Blockly.Block(this.workspace, testSuite.defType);
          this.defBlock.setFieldValue('proc name', 'NAME');
          this.callBlock = new Blockly.Block(
              this.workspace, testSuite.callType);
          this.callBlock.setFieldValue('proc name', 'NAME');
        });
        test('Simple', function() {
          var def =
              Blockly.Procedures.getDefinition('proc name', this.workspace);
          chai.assert.equal(def, this.defBlock);
        });
        test('Multiple Procedures', function() {
          var def2 = new Blockly.Block(this.workspace, testSuite.defType);
          def2.setFieldValue('proc name2', 'NAME');
          var caller2 = new Blockly.Block(this.workspace, testSuite.callType);
          caller2.setFieldValue('proc name2', 'NAME');

          var def =
              Blockly.Procedures.getDefinition('proc name', this.workspace);
          chai.assert.equal(def, this.defBlock);
        });
        test('Multiple Workspaces', function() {
          var workspace = new Blockly.Workspace();
          try {
            var def2 = new Blockly.Block(workspace, testSuite.defType);
            def2.setFieldValue('proc name', 'NAME');
            var caller2 = new Blockly.Block(workspace, testSuite.callType);
            caller2.setFieldValue('proc name', 'NAME');

            var def =
                Blockly.Procedures.getDefinition('proc name', this.workspace);
            chai.assert.equal(def, this.defBlock);

            def = Blockly.Procedures.getDefinition('proc name', workspace);
            chai.assert.equal(def, def2);
          } finally {
            workspaceTeardown.call(this, workspace);
          }
        });
      });

      suite('Enable/Disable', function() {
        setup(function() {
          var toolbox = document.getElementById('toolbox-categories');
          this.workspaceSvg = Blockly.inject('blocklyDiv', {toolbox: toolbox});
        });
        teardown(function() {
          workspaceTeardown.call(this, this.workspaceSvg);
        });
        const domText = (testSuite.defType === 'procedures_defreturn') ?
            ('<xml xmlns="https://developers.google.com/blockly/xml">' +
                '<block type="procedures_defreturn" id="bar-def">' +
                '<field name="NAME">bar</field>' +
                '<value name="RETURN">' +
                '<block type="procedures_callreturn" id="bar-c1">' +
                '<mutation name="bar"></mutation>' +
                '</block>' +
                '</value>' +
                '</block>' +
                '<block type="procedures_callreturn" id="bar-c2">' +
                '<mutation name="bar"></mutation>' +
                '</block>' +
                '</xml>') :
            ('<xml xmlns="https://developers.google.com/blockly/xml">' +
                '<block type="procedures_defnoreturn" id="bar-def">' +
                '<field name="NAME">bar</field>' +
                '</block>' +
                '<block type="procedures_callnoreturn" id="bar-c1">' +
                '<mutation name="bar"></mutation>' +
                '</block>' +
                '<block type="procedures_callnoreturn" id="bar-c2">' +
                '<mutation name="bar"></mutation>' +
                '</block>' +
                '</xml>');
        setup(function() {
          var dom = Blockly.Xml.textToDom(domText);

          Blockly.Xml.appendDomToWorkspace(dom, this.workspaceSvg);
          this.barDef = this.workspaceSvg.getBlockById('bar-def');
          this.barCalls = [
            this.workspaceSvg.getBlockById('bar-c1'),
            this.workspaceSvg.getBlockById('bar-c2')
          ];
        });

        test('Set disabled updates callers', function() {
          this.workspaceSvg.clearUndo();
          Blockly.Events.setGroup('g1');
          this.barDef.setEnabled(false);
          Blockly.Events.setGroup(false);

          for (var i = 0; i < 2; i++) {
            chai.assert.isFalse(this.barCalls[i].isEnabled(),
                'Callers are disabled when their definition is disabled (call ' +
                i + ')');
          }
          var firedEvents = this.workspaceSvg.undoStack_;
          chai.assert.equal(firedEvents.length, 3,
              'An event was fired for the definition and each caller');
          for (var i = 0; i < 3; i++) {
            chai.assert.equal(firedEvents[i].group, 'g1',
                'Disable events are in the same group (event ' + i + ')');
          }

          this.workspaceSvg.clearUndo();
          Blockly.Events.setGroup('g2');
          this.barDef.setEnabled(true);
          Blockly.Events.setGroup(false);

          for (var i = 0; i < 2; i++) {
            chai.assert.isTrue(this.barCalls[i].isEnabled(),
                'Callers are enabled when their definition is enabled (call ' +
                i + ')');
          }
          chai.assert.equal(firedEvents.length,3,
              'An event was fired for the definition and each caller');
          for (var i = 0; i < 3; i++) {
            chai.assert.equal(firedEvents[i].group, 'g2',
                'Enable events are in the same group (event ' + i + ')');
          }
        });
        test('Set disabled updates callers while remembering old caller state', function() {
          this.barCalls[0].setEnabled(false);
          this.workspaceSvg.clearUndo();
          Blockly.Events.setGroup('g1');
          this.barDef.setEnabled(false);
          Blockly.Events.setGroup(false);

          for (var i = 0; i < 2; i++) {
            chai.assert.isFalse(this.barCalls[i].isEnabled(),
                'Callers are disabled when their definition is disabled (call ' +
                i + ')');
          }
          var firedEvents = this.workspaceSvg.undoStack_;
          chai.assert.equal(firedEvents.length, 2,
              'An event was fired for the definition and the enabled caller');
          for (var i = 0; i < 2; i++) {
            chai.assert.equal(firedEvents[i].group, 'g1',
                'Disable events are in the same group (event ' + i + ')');
          }

          this.workspaceSvg.clearUndo();
          Blockly.Events.setGroup('g2');
          this.barDef.setEnabled(true);
          Blockly.Events.setGroup(false);

          chai.assert.isFalse(this.barCalls[0].isEnabled(),
              'Caller remains in disabled state when the definition is enabled');
          chai.assert.isTrue(this.barCalls[1].isEnabled(),
              'Caller returns to previous enabled state when the definition is enabled');
          chai.assert.equal(firedEvents.length,2,
              'An event was fired for the definition and the enabled caller');
          for (var i = 0; i < 2; i++) {
            chai.assert.equal(firedEvents[i].group, 'g2',
                'Enable events are in the same group (event ' + i + ')');
          }
        });
      });
      suite('Mutation', function() {
        setup(function() {
          this.defBlock = new Blockly.Block(this.workspace, testSuite.defType);
          this.defBlock.setFieldValue('proc name', 'NAME');
          this.callBlock = new Blockly.Block(
              this.workspace, testSuite.callType);
          this.callBlock.setFieldValue('proc name', 'NAME');
          this.findParentStub = sinon.stub(Blockly.Mutator, 'findParentWs')
              .returns(this.workspace);
        });
        teardown(function() {
          this.findParentStub.restore();
        });
        suite('Composition', function() {
          suite('Statements', function() {
            function setStatementValue(mainWorkspace, defBlock, value) {
              var mutatorWorkspace = new Blockly.Workspace(
                  new Blockly.Options({
                    parentWorkspace: mainWorkspace
                  }));
              defBlock.decompose(mutatorWorkspace);
              var containerBlock = mutatorWorkspace.getTopBlocks()[0];
              var statementField = containerBlock.getField('STATEMENTS');
              statementField.setValue(value);
              defBlock.compose(containerBlock);
            }
            if (testSuite.defType === 'procedures_defreturn') {
              test('Has Statements', function() {
                setStatementValue(this.workspace, this.defBlock, true);
                chai.assert.isTrue(this.defBlock.hasStatements_);
              });
              test('Has No Statements', function() {
                setStatementValue(this.workspace, this.defBlock, false);
                chai.assert.isFalse(this.defBlock.hasStatements_);
              });
              test('Saving Statements', function() {
                var blockXml = Blockly.Xml.textToDom(
                    '<block type="procedures_defreturn">' +
                    '  <statement name="STACK">' +
                    '    <block type="procedures_ifreturn" id="test"></block>' +
                    '  </statement> ' +
                    '</block>'
                );
                var defBlock = Blockly.Xml.domToBlock(blockXml, this.workspace);
                setStatementValue(this.workspace, defBlock, false);
                chai.assert.isNull(defBlock.getInput('STACK'));
                setStatementValue(this.workspace, defBlock, true);
                chai.assert.isNotNull(defBlock.getInput('STACK'));
                var statementBlocks = defBlock.getChildren();
                chai.assert.equal(statementBlocks.length, 1);
                var block = statementBlocks[0];
                chai.assert.equal(block.type, 'procedures_ifreturn');
                chai.assert.equal(block.id, 'test');
              });
            }
          });
          suite('Untyped Arguments', function() {
            function createMutator(argArray) {
              this.mutatorWorkspace = new Blockly.Workspace(
                  new Blockly.Options({
                    parentWorkspace: this.workspace
                  }));
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
            test('Simple Add Arg', function() {
              var args = ['arg1'];
              createMutator.call(this, args);
              assertArgs.call(this, args);
            });
            test('Multiple Args', function() {
              var args = ['arg1', 'arg2', 'arg3'];
              createMutator.call(this, args);
              assertArgs.call(this, args);
            });
            test('Simple Change Arg', function() {
              createMutator.call(this, ['arg1']);
              this.argBlock.setFieldValue('arg2', 'NAME');
              this.defBlock.compose(this.containerBlock);
              assertArgs.call(this, ['arg2']);
            });
            test('lower -> CAPS', function() {
              createMutator.call(this, ['arg']);
              this.argBlock.setFieldValue('ARG', 'NAME');
              this.defBlock.compose(this.containerBlock);
              assertArgs.call(this, ['ARG']);
            });
            test('CAPS -> lower', function() {
              createMutator.call(this, ['ARG']);
              this.argBlock.setFieldValue('arg', 'NAME');
              this.defBlock.compose(this.containerBlock);
              assertArgs.call(this, ['arg']);
            });
            // Test case for #1958
            test('Set Arg Empty', function() {
              var args = ['arg1'];
              createMutator.call(this, args);
              this.argBlock.setFieldValue('', 'NAME');
              this.defBlock.compose(this.containerBlock);
              assertArgs.call(this, args);
            });
            test('Whitespace', function() {
              var args = ['arg1'];
              createMutator.call(this, args);
              this.argBlock.setFieldValue(' ', 'NAME');
              this.defBlock.compose(this.containerBlock);
              assertArgs.call(this, args);
            });
            test('Whitespace and Text', function() {
              createMutator.call(this, ['arg1']);
              this.argBlock.setFieldValue(' text ', 'NAME');
              this.defBlock.compose(this.containerBlock);
              assertArgs.call(this, ['text']);
            });
            test('<>', function() {
              var args = ['<>'];
              createMutator.call(this, args);
              assertArgs.call(this, args);
            });
          });
        });
        suite('Decomposition', function() {
          suite('Statements', function() {
            if (testSuite.defType === 'procedures_defreturn') {
              test('Has Statement Input', function() {
                var mutatorWorkspace = new Blockly.Workspace(
                    new Blockly.Options({
                      parentWorkspace: this.workspace
                    }));
                this.defBlock.decompose(mutatorWorkspace);
                var statementInput = mutatorWorkspace.getTopBlocks()[0]
                    .getInput('STATEMENT_INPUT');
                chai.assert.isNotNull(statementInput);
              });
              test('Has Statements', function() {
                this.defBlock.hasStatements_ = true;
                var mutatorWorkspace = new Blockly.Workspace(
                    new Blockly.Options({
                      parentWorkspace: this.workspace
                    }));
                this.defBlock.decompose(mutatorWorkspace);
                var statementValue = mutatorWorkspace.getTopBlocks()[0]
                    .getField('STATEMENTS').getValueBoolean();
                chai.assert.isTrue(statementValue);
              });
              test('No Has Statements', function() {
                this.defBlock.hasStatements_ = false;
                var mutatorWorkspace = new Blockly.Workspace(
                    new Blockly.Options({
                      parentWorkspace: this.workspace
                    }));
                this.defBlock.decompose(mutatorWorkspace);
                var statementValue = mutatorWorkspace.getTopBlocks()[0]
                    .getField('STATEMENTS').getValueBoolean();
                chai.assert.isFalse(statementValue);
              });
            } else {
              test('Has no Statement Input', function() {
                var mutatorWorkspace = new Blockly.Workspace(
                    new Blockly.Options({
                      parentWorkspace: this.workspace
                    }));
                this.defBlock.decompose(mutatorWorkspace);
                var statementInput = mutatorWorkspace.getTopBlocks()[0]
                    .getInput('STATEMENT_INPUT');
                chai.assert.isNull(statementInput);
              });
            }
          });
          suite('Untyped Arguments', function() {
            function assertArguments(argumentsArray) {
              this.defBlock.arguments_ = argumentsArray;
              var mutatorWorkspace = new Blockly.Workspace(
                  new Blockly.Options({
                    parentWorkspace: this.workspace
                  }));
              this.defBlock.decompose(mutatorWorkspace);
              var argBlocks = mutatorWorkspace.getBlocksByType('procedures_mutatorarg');
              chai.assert.equal(argBlocks.length, argumentsArray.length);

              for (var i = 0; i < argumentsArray.length; i++) {
                var argString = argumentsArray[i];
                var argBlockValue = argBlocks[i].getFieldValue('NAME');
                chai.assert.equal(argBlockValue, argString);
              }
            }
            test('Simple Single Arg', function() {
              assertArguments.call(this, ['arg']);
            });
            test('Multiple Args', function() {
              assertArguments.call(this, ['arg1', 'arg2']);
            });
            test('<>', function() {
              assertArguments.call(this, ['<>']);
            });
          });
        });
      });
      /**
       * Test cases for serialization tests.
       * @type {Array<SerializationTestCase>}
       */
      const testCases = [
        {
          title: 'Minimal definition',
          xml: '<block type="' + testSuite.defType + '"/>',
          expectedXml:
              '<block xmlns="https://developers.google.com/blockly/xml" ' +
              'type="' + testSuite.defType + '" id="1">\n' +
              '  <field name="NAME">unnamed</field>\n' +
              '</block>',
          assertBlockStructure:
              (block) => {
                assertDefBlockStructure(block, testSuite.hasReturn);
              },
        },
        {
          title: 'Common definition',
          xml:
              '<block type="' + testSuite.defType + '">' +
              '  <field name="NAME">do something</field>' +
              '</block>',
          expectedXml:
              '<block xmlns="https://developers.google.com/blockly/xml" ' +
              'type="' + testSuite.defType + '" id="1">\n' +
              '  <field name="NAME">do something</field>\n' +
              '</block>',
          assertBlockStructure:
              (block) => {
                assertDefBlockStructure(block, testSuite.hasReturn);
              },
        },
        {
          title: 'With vars definition',
          xml:
              '<block type="' + testSuite.defType + '">\n' +
              '  <mutation>\n' +
              '    <arg name="x" varid="arg1"></arg>\n' +
              '    <arg name="y" varid="arg2"></arg>\n' +
              '  </mutation>\n' +
              '  <field name="NAME">do something</field>\n' +
              '</block>',
          expectedXml:
              '<block xmlns="https://developers.google.com/blockly/xml" ' +
              'type="' + testSuite.defType + '" id="1">\n' +
              '  <mutation>\n' +
              '    <arg name="x" varid="arg1"></arg>\n' +
              '    <arg name="y" varid="arg2"></arg>\n' +
              '  </mutation>\n' +
              '  <field name="NAME">do something</field>\n' +
              '</block>',
          assertBlockStructure:
              (block) => {
                assertDefBlockStructure(
                    block, testSuite.hasReturn, ['x', 'y'], ['arg1', 'arg2']);
              },
        },
        {
          title: 'With pre-created vars definition',
          xml:
              '<block type="' + testSuite.defType + '">\n' +
              '  <mutation>\n' +
              '    <arg name="preCreatedVar" varid="preCreatedVarId"></arg>\n' +
              '  </mutation>\n' +
              '  <field name="NAME">do something</field>\n' +
              '</block>',
          expectedXml:
              '<block xmlns="https://developers.google.com/blockly/xml" ' +
              'type="' + testSuite.defType + '" id="1">\n' +
              '  <mutation>\n' +
              '    <arg name="preCreatedVar" varid="preCreatedVarId"></arg>\n' +
              '  </mutation>\n' +
              '  <field name="NAME">do something</field>\n' +
              '</block>',
          assertBlockStructure:
              (block) => {
                assertDefBlockStructure(block, testSuite.hasReturn,
                    ['preCreatedVar'], ['preCreatedVarId']);
              },
        },
        {
          title: 'With pre-created typed vars definition',
          xml:
              '<block type="' + testSuite.defType + '">\n' +
              '  <mutation>\n' +
              '    <arg name="preCreatedTypedVar" varid="preCreatedTypedVarId"></arg>\n' +
              '  </mutation>\n' +
              '  <field name="NAME">do something</field>\n' +
              '</block>',
          expectedXml:
              '<block xmlns="https://developers.google.com/blockly/xml" ' +
              'type="' + testSuite.defType + '" id="1">\n' +
              '  <mutation>\n' +
              '    <arg name="preCreatedTypedVar" varid="preCreatedTypedVarId"></arg>\n' +
              '  </mutation>\n' +
              '  <field name="NAME">do something</field>\n' +
              '</block>',
          assertBlockStructure:
              (block) => {
                assertDefBlockStructure(block, testSuite.hasReturn,
                    ['preCreatedTypedVar'], ['preCreatedTypedVarId']);
              },
        },
        {
          title: 'No statements definition',
          xml:
              '<block type="procedures_defreturn">\n' +
              '  <mutation statements="false"></mutation>\n' +
              '  <field name="NAME">do something</field>\n' +
              '</block>',
          expectedXml:
              '<block xmlns="https://developers.google.com/blockly/xml" ' +
              'type="procedures_defreturn" id="1">\n' +
              '  <mutation statements="false"></mutation>\n' +
              '  <field name="NAME">do something</field>\n' +
              '</block>',
          assertBlockStructure:
              (block) => {
                assertDefBlockStructure(block, true, [], [], false);
              },
        },
        {
          title: 'Minimal caller',
          xml: '<block type="' + testSuite.callType + '"/>',
          expectedXml:
              '<block xmlns="https://developers.google.com/blockly/xml" ' +
              'type="' + testSuite.callType + '" id="1">\n' +
              '  <mutation name="unnamed"></mutation>\n' +
              '</block>',
          assertBlockStructure:
              (block) => {
                assertCallBlockStructure(block);
              },
        },
        {
          title: 'Common caller',
          xml:
              '<block type="' + testSuite.callType + '">\n' +
              '  <mutation name="do something"/>\n' +
              '</block>',
          expectedXml:
              '<block xmlns="https://developers.google.com/blockly/xml" ' +
              'type="' + testSuite.callType + '" id="1">\n' +
              '  <mutation name="do something"></mutation>\n' +
              '</block>',
          assertBlockStructure:
              (block) => {
                assertCallBlockStructure(block);
              },
        },
        {
          title: 'With pre-created vars caller',
          xml:
              '<block type="' + testSuite.callType + '">\n' +
              '  <mutation name="do something">\n' +
              '    <arg name="preCreatedVar"></arg>\n' +
              '  </mutation>\n' +
              '</block>',
          expectedXml:
              '<block xmlns="https://developers.google.com/blockly/xml" ' +
              'type="' + testSuite.callType + '" id="1">\n' +
              '  <mutation name="do something">\n' +
              '    <arg name="preCreatedVar"></arg>\n' +
              '  </mutation>\n' +
              '</block>',
          assertBlockStructure:
              (block) => {
                assertCallBlockStructure(block, ['preCreatedVar'], ['preCreatedVarId']);
              },
        },
      ];
      testHelpers.runSerializationTestSuite(testCases);
    });
  });
});
