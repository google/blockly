/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.require('Blockly.Blocks.procedures');
goog.require('Blockly.Msg');

suite('Procedures XML', function() {
  suite('Deserialization', function() {
    setup(function() {
      this.workspace = new Blockly.Workspace();

      this.callForAllTypes = function(func) {
        var typesArray = [
          ['procedures_defnoreturn', 'procedures_callnoreturn'],
          ['procedures_defreturn', 'procedures_callreturn']
        ];

        for (var i = 0, types; (types = typesArray[i]); i++) {
          var context = Object.create(null);
          context.workspace = this.workspace;
          context.defType = types[0];
          context.callType = types[1];

          func.call(context);

          this.workspace.clear();
        }
      };
    });
    teardown(function() {
      this.workspace.dispose();
    });

    suite('Definition Blocks', function() {
      test('Minimal', function() {
        this.callForAllTypes(function() {
          var xml = Blockly.Xml.textToDom(
              '<block type="' + this.defType + '"></block>'
          );
          var block = Blockly.Xml.domToBlock(xml, this.workspace);

          // TODO: Is this how you want this to work? or do you want it to
          //    be 'unnamed'?
          chai.assert.equal(block.getFieldValue('NAME'), '');
          chai.assert.isArray(block.arguments_);
          chai.assert.isEmpty(block.arguments_);
          chai.assert.isArray(block.argumentVarModels_);
          chai.assert.isEmpty(block.argumentVarModels_);
          chai.assert.isNotNull(block.getInput('STACK'));
        });
      });
      // This is like what's in the toolbox.
      test('Common', function() {
        this.callForAllTypes(function() {
          var xml = Blockly.Xml.textToDom(
              '<block type="' + this.defType + '">' +
              '  <field name="NAME">do something</field>' +
              '</block>'
          );
          var block = Blockly.Xml.domToBlock(xml, this.workspace);

          chai.assert.equal(
              block.getFieldValue('NAME'),
              'do something');
          chai.assert.isArray(block.arguments_);
          chai.assert.isEmpty(block.arguments_);
          chai.assert.isArray(block.argumentVarModels_);
          chai.assert.isEmpty(block.argumentVarModels_);
          chai.assert.isNotNull(block.getInput('STACK'));
        });
      });
      test('Arg Vars Pre-Created', function() {
        this.callForAllTypes(function() {
          this.workspace.createVariable('x', '', 'arg');
          var xml = Blockly.Xml.textToDom(
              '<block type="' + this.defType + '">' +
              '  <field name="NAME">do something</field>' +
              '  <mutation>' +
              '    <arg name="x" varid="arg"></arg>' +
              '  </mutation>' +
              '</block>'
          );
          var block = Blockly.Xml.domToBlock(xml, this.workspace);

          chai.assert.equal(
              block.getFieldValue('NAME'),
              'do something');
          chai.assert.deepEqual(block.arguments_, ['x']);
          chai.assert.deepEqual(block.argumentVarModels_,
              [this.workspace.getVariableById('arg')]);
          chai.assert.isNotNull(block.getInput('STACK'));
        });
      });
      test('Arg Vars Not Created', function() {
        this.callForAllTypes(function() {
          var xml = Blockly.Xml.textToDom(
              '<block type="' + this.defType + '">' +
              '  <field name="NAME">do something</field>' +
              '  <mutation>' +
              '    <arg name="x" varid="arg"></arg>' +
              '  </mutation>' +
              '</block>'
          );
          var block = Blockly.Xml.domToBlock(xml, this.workspace);

          chai.assert.equal(
              block.getFieldValue('NAME'),
              'do something');
          chai.assert.deepEqual(block.arguments_, ['x']);
          chai.assert.deepEqual(block.argumentVarModels_,
              [this.workspace.getVariableById('arg')]);
          chai.assert.isNotNull(block.getInput('STACK'));
        });
      });
      // TODO: I don't know a lot about typing vars, and even less out it in
      //  this context. Is allowing typed vars to be args the correct behavior?
      test('Arg Vars Pre-Created Typed', function() {
        this.callForAllTypes(function() {
          this.workspace.createVariable('x', 'type', 'arg');
          var xml = Blockly.Xml.textToDom(
              '<block type="' + this.defType + '">' +
              '  <field name="NAME">do something</field>' +
              '  <mutation>' +
              '    <arg name="x" varid="arg"></arg>' +
              '  </mutation>' +
              '</block>'
          );
          var block = Blockly.Xml.domToBlock(xml, this.workspace);

          chai.assert.equal(
              block.getFieldValue('NAME'),
              'do something');
          chai.assert.deepEqual(block.arguments_, ['x']);
          chai.assert.deepEqual(block.argumentVarModels_,
              [this.workspace.getVariableById('arg')]);
          chai.assert.isNotNull(block.getInput('STACK'));
        });
      });
      test('Statements False', function() {
        var xml = Blockly.Xml.textToDom(
            '<block type="procedures_defreturn">' +
            '  <field name="NAME">do something</field>' +
            '  <mutation statements="false"></mutation>' +
            '</block>'
        );
        var block = Blockly.Xml.domToBlock(xml, this.workspace);

        chai.assert.equal(
            block.getFieldValue('NAME'),
            'do something');
        chai.assert.isArray(block.arguments_);
        chai.assert.isEmpty(block.arguments_);
        chai.assert.isArray(block.argumentVarModels_);
        chai.assert.isEmpty(block.argumentVarModels_);
        chai.assert.isNull(block.getInput('STACK'));
      });
      test('Statements True', function() {
        var xml = Blockly.Xml.textToDom(
            '<block type="procedures_defreturn">' +
            '  <field name="NAME">do something</field>' +
            '  <mutation statements="true"></mutation>' +
            '</block>'
        );
        var block = Blockly.Xml.domToBlock(xml, this.workspace);

        chai.assert.equal(
            block.getFieldValue('NAME'),
            'do something');
        chai.assert.isArray(block.arguments_);
        chai.assert.isEmpty(block.arguments_);
        chai.assert.isArray(block.argumentVarModels_);
        chai.assert.isEmpty(block.argumentVarModels_);
        chai.assert.isNotNull(block.getInput('STACK'));
      });
    });
    suite('Call Blocks', function() {
      test('Caller W/ Def', function() {
        this.callForAllTypes(function() {
          Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="' + this.defType + '">' +
              '  <field name="NAME">do something</field>' +
              '</block>'
          ), this.workspace);
          var callerXML = Blockly.Xml.textToDom(
              '<block type="' + this.callType + '">' +
              '  <mutation name="do something"/>' +
              '</block>'
          );
          var block = Blockly.Xml.domToBlock(callerXML, this.workspace);

          chai.assert.equal(
              block.getFieldValue('NAME'),
              'do something');
          chai.assert.isArray(block.arguments_);
          chai.assert.isEmpty(block.arguments_);
          // TODO: argumentVarModels_ is undefined for call_return, but
          //  defined for call_noreturn. Make it defined for both.
          /* chai.assert.isArray(block.argumentVarModels_);
          chai.assert.isEmpty(block.argumentVarModels_); */
        });
      });
      // TODO: I couldn't get this test (of creating a definition) to work
      //  b/c of the events delay.
      test.skip('Caller No Def', function() {
        this.callForAllTypes(function() {
          var callerXML = Blockly.Xml.textToDom(
              '<block type="' + this.callType + '">' +
              '  <mutation name="do something"/>' +
              '</block>'
          );
          var block = Blockly.Xml.domToBlock(callerXML, this.workspace);

          chai.assert.equal(
              block.getFieldValue('NAME'),
              'do something');
          chai.assert.isArray(block.arguments_);
          chai.assert.isEmpty(block.arguments_);
          // TODO: argumentVarModels_ is undefined for call_return, but
          //  defined for call_noreturn. Make it defined for both.
          /* chai.assert.isArray(block.argumentVarModels_);
          chai.assert.isEmpty(block.argumentVarModels_); */
          chai.assert.equal(this.workspace.getAllBlocks(false).count, 2);
        });
      });
      test('Caller W/ Params', function() {
        this.callForAllTypes(function() {
          Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="' + this.defType + '">' +
              '  <field name="NAME">do something</field>' +
              '  <mutation>' +
              '    <arg name="x" varid="arg"></arg>' +
              '  </mutation>' +
              '</block>'
          ), this.workspace);
          var callerXML = Blockly.Xml.textToDom(
              '<block type="' + this.callType + '">' +
              '  <mutation name="do something">' +
              '    <arg name="x"></arg>' +
              '  </mutation>' +
              '</block>'
          );
          var block = Blockly.Xml.domToBlock(callerXML, this.workspace);

          chai.assert.equal(
              block.getFieldValue('NAME'),
              'do something');
          chai.assert.deepEqual(block.arguments_, ['x']);
          chai.assert.deepEqual(block.argumentVarModels_,
              [this.workspace.getVariableById('arg')]);
        });
      });
      // TODO: How do you want it to behave in this situation?
      test.skip('Caller W/out Params', function() {
        this.callForAllTypes(function() {
          Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="' + this.defType + '">' +
              '  <field name="NAME">do something</field>' +
              '  <mutation>' +
              '    <arg name="x" varid="arg"></arg>' +
              '  </mutation>' +
              '</block>'
          ), this.workspace);
          var callerXML = Blockly.Xml.textToDom(
              '<block type="' + this.callType + '">' +
              '  <mutation name="do something"></mutation>' +
              '</block>'
          );
          // TODO: Remove this when you fix this test.
          // eslint-disable-next-line no-unused-vars
          var block = Blockly.Xml.domToBlock(callerXML, this.workspace);
        });
      });
      // TODO: How do you want it to behave in this situation?
      test.skip('Caller W/ Bad Params', function() {
        this.callForAllTypes(function() {
          Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
              '<block type="' + this.defType + '">' +
              '  <field name="NAME">do something</field>' +
              '  <mutation>' +
              '    <arg name="x" varid="arg"></arg>' +
              '  </mutation>' +
              '</block>'
          ), this.workspace);
          var callerXML = Blockly.Xml.textToDom(
              '<block type="' + this.callType + '">' +
              '  <mutation name="do something">' +
              '    <arg name="y"></arg>' +
              '  </mutation>' +
              '</block>'
          );
          // TODO: Remove this when you fix this test.
          // eslint-disable-next-line no-unused-vars
          var block = Blockly.Xml.domToBlock(callerXML, this.workspace);
        });
      });
    });
  });
});
