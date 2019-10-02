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

suite("Trashcan", function() {
  var themeManager = new Blockly.ThemeManager(Blockly.Themes.Classic);
  var workspace = {
    addChangeListener: function(func) {
      this.listener = func;
    },
    triggerListener: function(event) {
      this.listener(event);
    },
    getThemeManager: function() {
      return themeManager;
    },
    options: {
      maxTrashcanContents: Infinity
    }
  };
  function sendDeleteEvent(xmlString) {
    var xml = Blockly.Xml.textToDom(
        '<xml xmlns="https://developers.google.com/blockly/xml">' +
        xmlString + '</xml>');
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
      sendDeleteEvent('<block type="dummy_type"/>');
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
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
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
      sendDeleteEvent('<shadow type="dummy_type"/>');
      chai.assert.equal(this.trashcan.contents_.length, 0);
    });
  });
  suite("Unique Contents", function() {
    test("Simple", function() {
      sendDeleteEvent('<block type="dummy_type"/>');
      sendDeleteEvent('<block type="dummy_type"/>');
      chai.assert.equal(this.trashcan.contents_.length, 1);
    });
    test("Different Coords", function() {
      sendDeleteEvent('<block type="dummy_type" x="10" y="10"/>');
      sendDeleteEvent('<block type="dummy_type" x="20" y="20"/>');
      chai.assert.equal(this.trashcan.contents_.length, 1);
    });
    test("Different IDs", function() {
      sendDeleteEvent('<block type="dummy_type" id="id1"/>');
      sendDeleteEvent('<block type="dummy_type" id="id2"/>');
      chai.assert.equal(this.trashcan.contents_.length, 1);
    });
    test("No Disabled - Disabled True", function() {
      sendDeleteEvent('<block type="dummy_type"/>');
      sendDeleteEvent('<block type="dummy_type" disabled="true"/>');
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("No Editable - Editable False", function() {
      sendDeleteEvent('<block type="dummy_type"/>');
      sendDeleteEvent('<block type="dummy_type" editable="false"/>');
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("No Movable - Movable False", function() {
      sendDeleteEvent('<block type="dummy_type"/>');
      sendDeleteEvent('<block type="dummy_type" movable="false"/>');
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Field Values", function() {
      sendDeleteEvent(
          '<block type="dummy_type">' +
          '  <field name="dummy_name">dummy_value1</field>' +
          '</block>'
      );
      sendDeleteEvent(
          '<block type="dummy_type">' +
          '  <field name="dummy_name">dummy_value2</field>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("No Values - Values", function() {
      sendDeleteEvent('<block type="dummy_type"/>');
      sendDeleteEvent(
          '<block type="dummy_type">' +
          '  <value name="dummy_input">' +
          '    <block type="dummy_type"/>' +
          '  </value>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Value Blocks", function() {
      sendDeleteEvent(
          '<block type="dummy_type">' +
          '  <value name="dummy_input">' +
          '    <block type="dummy_type1"/>' +
          '  </value>' +
          '</block>'
      );
      sendDeleteEvent(
          '<block type="dummy_type">' +
          '  <value name="dummy_input">' +
          '    <block type="dummy_type2"/>' +
          '  </value>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("No Statements - Statements", function() {
      sendDeleteEvent('<block type="dummy_type"/>');
      sendDeleteEvent(
          '<block type="dummy_type">' +
          '  <statement name="dummy_input">' +
          '    <block type="dummy_type"/>' +
          '  </statement>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Statement Blocks", function() {
      sendDeleteEvent(
          '<block type="dummy_type">' +
          '  <statement name="dummy_input">' +
          '    <block type="dummy_type1"/>' +
          '  </statement>' +
          '</block>'
      );
      sendDeleteEvent(
          '<block type="dummy_type">' +
          '  <statement name="dummy_input">' +
          '    <block type="dummy_type2"/>' +
          '  </statement>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("No Next - Next", function() {
      sendDeleteEvent('<block type="dummy_type"/>');
      sendDeleteEvent(
          '<block type="dummy_type">' +
          '  <next>' +
          '    <block type="dummy_type"/>' +
          '  </next>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Next Blocks", function() {
      sendDeleteEvent(
          '<block type="dummy_type">' +
          '  <next>' +
          '    <block type="dummy_type1"/>' +
          '  </next>' +
          '</block>'
      );
      sendDeleteEvent(
          '<block type="dummy_type">' +
          '  <next>' +
          '    <block type="dummy_type2"/>' +
          '  </next>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("No Comment - Comment", function() {
      sendDeleteEvent('<block type="dummy_type"/>');
      sendDeleteEvent(
          '<block type="dummy_type">' +
          '  <comment>comment_text</comment>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Comment Text", function() {
      sendDeleteEvent(
          '<block type="dummy_type">' +
          '  <comment>comment_text1</comment>' +
          '</block>'
      );
      sendDeleteEvent(
          '<block type="dummy_type">' +
          '  <comment>comment_text2</comment>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Comment Size", function() {
      sendDeleteEvent(
          '<block type="dummy_type">' +
          '  <comment h="10" w="10">comment_text</comment>' +
          '</block>'
      );
      sendDeleteEvent(
          '<block type="dummy_type">' +
          '  <comment h="20" w="20">comment_text</comment>' +
          '</block>'
      );
      // TODO (#2574): These blocks are treated as different, but appear
      //  identical when the trashcan is opened.
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Comment Pinned", function() {
      sendDeleteEvent(
          '<block type="dummy_type">' +
          '  <comment pinned="false">comment_text</comment>' +
          '</block>'
      );
      sendDeleteEvent(
          '<block type="dummy_type">' +
          '  <comment pinned="true">comment_text</comment>' +
          '</block>'
      );
      // TODO (#2574): These blocks are treated as different, but appear
      //  identical when the trashcan is opened.
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("No Mutator - Mutator", function() {
      sendDeleteEvent('<block type="dummy_type"/>');
      sendDeleteEvent(
          '<block type="dummy_type">' +
          '  <mutation dummy_attribute="dummy_value"></mutation>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Mutator", function() {
      sendDeleteEvent(
          '<block type="dummy_type">' +
          '  <mutation dummy_attribute="dummy_value1"></mutation>' +
          '</block>'
      );
      sendDeleteEvent(
          '<block type="dummy_type">' +
          '  <mutation dummy_attribute="dummy_value2"></mutation>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
  });
  suite("Max Contents", function() {
    test("Max 0", function() {
      workspace.options.maxTrashcanContents = 0;
      sendDeleteEvent(
          '<block type="dummy_type"/>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 0);
      workspace.options.maxTrashcanContents = Infinity;
    });
    test("Last In First Out", function() {
      workspace.options.maxTrashcanContents = 1;
      sendDeleteEvent('<block type="dummy_type1"/>');
      sendDeleteEvent('<block type="dummy_type2"/>');
      chai.assert.equal(this.trashcan.contents_.length, 1);
      chai.assert.equal(
          Blockly.Xml.textToDom(this.trashcan.contents_[0])
              .getAttribute('type'),
          'dummy_type2'
      );
      workspace.options.maxTrashcanContents = Infinity;
    });
  });
});
