/**
 * @license
 * Visual Blocks Editor
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

suite("Trashcan", function() {
  var workspace = {
    addChangeListener: function(func) {
      this.listener = func;
    },
    triggerListener: function(event) {
      this.listener(event);
    },
    options: {
      maxTrashcanContents: Infinity
    }
  };
  function sendDeleteEvent(xmlString) {
    var xml = Blockly.Xml.textToDom(xmlString);
    xml = xml.children[0];
    var event = {
      type: Blockly.Events.BLOCK_DELETE,
      oldXml: xml
    };
    workspace.triggerListener(event);
  }

  setup(function() {
    this.trashcan = new Blockly.Trashcan(workspace);
    this.setLidStub = sinon.stub(this.trashcan, 'setLidAngle_');
  });
  teardown(function() {
    this.setLidStub.restore();
    this.trashcan = null;
  });

  suite("Events", function() {
    test("Delete", function() {
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type"/>' +
          '</xml>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 1);
    });
    test("Non-Delete", function() {
      var event = {
        type: 'dummy_type'
      };
      workspace.triggerListener(event);
      chai.assert.equal(this.trashcan.contents_.length, 0);
    });
    test("Non-Delete w/ oldXml", function() {
      var xml = Blockly.Xml.textToDom(
          '<xml>' +
          '  <block type="dummy_type"/>' +
          '</xml>'
      );
      xml = xml.children[0];
      var event = {
        type: 'dummy_type',
        oldXml: xml
      };
      workspace.triggerListener(event);
      chai.assert.equal(this.trashcan.contents_.length, 0);
    });
    test("Shadow Delete", function() {
      sendDeleteEvent(
          '<xml>' +
          '  <shadow type="dummy_type"/>' +
          '</xml>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 0);
    });
  });
  suite("Unique Contents", function() {
    test("Simple", function() {
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type"/>' +
          '</xml>'
      );
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type"/>' +
          '</xml>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 1);
    });
    test("No Coords - Coords", function() {
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type"/>' +
          '</xml>'
      );
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type" x="10" y="10"/>' +
          '</xml>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 1);
    });
    test("Different Coords", function() {
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type" x="10" y="10"/>' +
          '</xml>'
      );
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type" x="20" y="20"/>' +
          '</xml>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 1);
    });
    test("No ID - ID", function() {
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type"/>' +
          '</xml>'
      );
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type" id="id"/>' +
          '</xml>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 1);
    });
    test("Different IDs", function() {
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type" id="id1"/>' +
          '</xml>'
      );
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type" id="id2"/>' +
          '</xml>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 1);
    });
    test("No Disabled - Disabled True", function() {
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type"/>' +
          '</xml>'
      );
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type" disabled="true"/>' +
          '</xml>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("No Disabled - Disabled False", function() {
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type"/>' +
          '</xml>'
      );
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type" disabled="false"/>' +
          '</xml>'
      );
      // TODO: Is this how we want this to work? To the user they appear to
      //  be the same.
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Disabled", function() {
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type" disabled="false"/>' +
          '</xml>'
      );
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type" disabled="true"/>' +
          '</xml>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("No Editable - Editable True", function() {
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type"/>' +
          '</xml>'
      );
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type" editable="true"/>' +
          '</xml>'
      );
      // TODO: Is this how we want this to work? To the user they appear to
      //  be the same.
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("No Editable - Editable False", function() {
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type"/>' +
          '</xml>'
      );
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type" editable="false"/>' +
          '</xml>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Editable", function() {
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type" editable="true"/>' +
          '</xml>'
      );
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type" editable="false"/>' +
          '</xml>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("No Movable - Movable True", function() {
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type"/>' +
          '</xml>'
      );
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type" movable="true"/>' +
          '</xml>'
      );
      // TODO: Is this how we want this to work? To the user they appear to
      //  be the same.
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("No Movable - Movable False", function() {
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type"/>' +
          '</xml>'
      );
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type" movable="false"/>' +
          '</xml>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Movable", function() {
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type" movable="true"/>' +
          '</xml>'
      );
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type" movable="false"/>' +
          '</xml>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("No Fields - Fields", function() {
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type"/>' +
          '</xml>'
      );
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type">' +
          '    <field name="dummy_name">dummy_value</field>' +
          '  </block>' +
          '</xml>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Field Values", function() {
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type">' +
          '    <field name="dummy_name">dummy_value1</field>' +
          '  </block>' +
          '</xml>'
      );
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type">' +
          '    <field name="dummy_name">dummy_value2</field>' +
          '  </block>' +
          '</xml>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("No Values - Values", function() {
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type"/>' +
          '</xml>'
      );
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type">' +
          '    <value name="dummy_input">' +
          '      <block type="dummy_type"/>' +
          '    </value>' +
          '  </block>' +
          '</xml>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Value Blocks", function() {
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type">' +
          '    <value name="dummy_input">' +
          '      <block type="dummy_type1"/>' +
          '    </value>' +
          '  </block>' +
          '</xml>'
      );
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type">' +
          '    <value name="dummy_input">' +
          '      <block type="dummy_type2"/>' +
          '    </value>' +
          '  </block>' +
          '</xml>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("No Statements - Statements", function() {
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type"/>' +
          '</xml>'
      );
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type">' +
          '    <statement name="dummy_input">' +
          '      <block type="dummy_type"/>' +
          '    </statement>' +
          '  </block>' +
          '</xml>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Statement Blocks", function() {
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type">' +
          '    <statement name="dummy_input">' +
          '      <block type="dummy_type1"/>' +
          '    </statement>' +
          '  </block>' +
          '</xml>'
      );
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type">' +
          '    <statement name="dummy_input">' +
          '      <block type="dummy_type2"/>' +
          '    </statement>' +
          '  </block>' +
          '</xml>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("No Next - Next", function() {
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type"/>' +
          '</xml>'
      );
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type">' +
          '    <next name="dummy_input">' +
          '      <block type="dummy_type"/>' +
          '    </next>' +
          '  </block>' +
          '</xml>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Next Blocks", function() {
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type">' +
          '    <statement name="dummy_input">' +
          '      <block type="dummy_type1"/>' +
          '    </statement>' +
          '  </block>' +
          '</xml>'
      );
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type">' +
          '    <statement name="dummy_input">' +
          '      <block type="dummy_type2"/>' +
          '    </statement>' +
          '  </block>' +
          '</xml>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("No Comment - Comment", function() {
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type"/>' +
          '</xml>'
      );
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type">' +
          '    <comment>comment_text</comment>' +
          '  </block>' +
          '</xml>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Comment Text", function() {
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type">' +
          '    <comment>comment_text1</comment>' +
          '  </block>' +
          '</xml>'
      );
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type">' +
          '    <comment>comment_text2</comment>' +
          '  </block>' +
          '</xml>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Comment Size", function() {
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type">' +
          '    <comment h="10" w="10">comment_text</comment>' +
          '  </block>' +
          '</xml>'
      );
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type">' +
          '    <comment h="20" w="20">comment_text</comment>' +
          '  </block>' +
          '</xml>'
      );
      // TODO: Is this how we want this to work? The difference is not
      //  related to the content.
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Comment Pinned", function() {
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type">' +
          '    <comment pinned="false">comment_text</comment>' +
          '  </block>' +
          '</xml>'
      );
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type">' +
          '    <comment pinned="true">comment_text</comment>' +
          '  </block>' +
          '</xml>'
      );
      // TODO: Is this how we want this to work? The difference is not
      //  related to the content.
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("No Mutator - Mutator", function() {
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type"/>' +
          '</xml>'
      );
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type">' +
          '    <mutation dummy_attribute="dummy_value"></mutation>' +
          '  </block>' +
          '</xml>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Mutator", function() {
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type">' +
          '    <mutation dummy_attribute="dummy_value1"></mutation>' +
          '  </block>' +
          '</xml>'
      );
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type">' +
          '    <mutation dummy_attribute="dummy_value2"></mutation>' +
          '  </block>' +
          '</xml>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
  });
  suite("Max Contents", function() {
    test("Max 0", function() {
      workspace.options.maxTrashcanContents = 0;
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type"/>' +
          '</xml>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 0);
      workspace.options.maxTrashcanContents = Infinity;
    });
    test("Last In First Out", function() {
      workspace.options.maxTrashcanContents = 1;
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type1"/>' +
          '</xml>'
      );
      sendDeleteEvent(
          '<xml>' +
          '  <block type="dummy_type2"/>' +
          '</xml>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 1);
      chai.assert.equal(
          Blockly.Xml.textToDom(this.trashcan.contents_[0])
              .children[0].getAttribute('type'),
          'dummy_type2'
      );
      workspace.options.maxTrashcanContents = Infinity;
    });
  });
});
