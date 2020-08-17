/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite("Trashcan", function() {
  function fireDeleteEvent(workspace, xmlString) {
    var xml = Blockly.Xml.textToDom(
        '<xml xmlns="https://developers.google.com/blockly/xml">' +
        xmlString + '</xml>');
    xml = xml.children[0];
    var event = new Blockly.Events.Delete();
    event.oldXml = xml;
    event.workspaceId = workspace.id;
    Blockly.Events.fire(event);
  }
  function fireNonDeleteEvent(workspace, oldXml) {
    var event = new Blockly.Events.Abstract();
    event.type = 'dummy_type';
    event.workspaceId = workspace.id;
    if (oldXml) {
      event.oldXml = oldXml;
    }
    Blockly.Events.fire(/** @type {Blockly.Events.Abstract} */ event);
  }

  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = Blockly.inject('blocklyDiv',
        {'trashcan': true, 'maxTrashcanContents': Infinity});
    this.trashcan = this.workspace.trashcan;
  });
  teardown(function() {
    sharedTestTeardown.call(this);
  });

  suite("Events", function() {
    test("Delete", function() {
      fireDeleteEvent(this.workspace, '<block type="dummy_type"/>');
      chai.assert.equal(this.trashcan.contents_.length, 1);
    });
    test("Non-Delete", function() {
      fireNonDeleteEvent(this.workspace);
      chai.assert.equal(this.trashcan.contents_.length, 0);
    });
    test("Non-Delete w/ oldXml", function() {
      var xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="dummy_type"/>' +
          '</xml>'
      );
      xml = xml.children[0];
      fireNonDeleteEvent(this.workspace, xml);
      chai.assert.equal(this.trashcan.contents_.length, 0);
    });
    test("Shadow Delete", function() {
      fireDeleteEvent(this.workspace, '<shadow type="dummy_type"/>');
      chai.assert.equal(this.trashcan.contents_.length, 0);
    });
    test("Click without contents - fires workspace click", function() {
      simulateClick(this.trashcan.svgGroup_);

      assertEventNotFired(
          this.eventsFireStub, Blockly.Events.Ui, {element: 'trashcanOpen'});
      assertEventFired(
          this.eventsFireStub, Blockly.Events.Ui,
          {element: 'click', oldValue: null, newValue: 'workspace'},
          this.workspace.id, null);
    });
    test("Click with contents - fires trashcanOpen", function() {
      fireDeleteEvent(this.workspace, '<block type="dummy_type"/>');
      chai.assert.equal(this.trashcan.contents_.length, 1);
      // Stub flyout interaction.
      var showFlyoutStub = sinon.stub(this.trashcan.flyout, "show");

      simulateClick(this.trashcan.svgGroup_);

      sinon.assert.calledOnce(showFlyoutStub);

      assertEventFired(
          this.eventsFireStub, Blockly.Events.Ui,
          {element: 'trashcanOpen', oldValue: null, newValue: true},
          this.workspace.id, null);
      assertEventNotFired(
          this.eventsFireStub, Blockly.Events.Ui, {element: 'click'});
    });
    test("Click outside trashcan - fires trashcanClose", function() {
      sinon.stub(this.trashcan.flyout, 'isVisible').returns(true);
      // Stub flyout interaction.
      var hideFlyoutStub = sinon.stub(this.trashcan.flyout, "hide");

      simulateClick(this.workspace.svgGroup_);

      sinon.assert.calledOnce(hideFlyoutStub);

      assertEventFired(
          this.eventsFireStub, Blockly.Events.Ui,
          {element: 'trashcanOpen', oldValue: null, newValue: false},
          this.workspace.id, null);
      assertEventFired(
          this.eventsFireStub, Blockly.Events.Ui,
          {element: 'click', oldValue: null, newValue: 'workspace'},
          this.workspace.id, null);
    });
  });
  suite("Unique Contents", function() {
    test("Simple", function() {
      fireDeleteEvent(this.workspace, '<block type="dummy_type"/>');
      fireDeleteEvent(this.workspace, '<block type="dummy_type"/>');
      chai.assert.equal(this.trashcan.contents_.length, 1);
    });
    test("Different Coords", function() {
      fireDeleteEvent(this.workspace, '<block type="dummy_type" x="10" y="10"/>');
      fireDeleteEvent(this.workspace, '<block type="dummy_type" x="20" y="20"/>');
      chai.assert.equal(this.trashcan.contents_.length, 1);
    });
    test("Different IDs", function() {
      fireDeleteEvent(this.workspace, '<block type="dummy_type" id="id1"/>');
      fireDeleteEvent(this.workspace, '<block type="dummy_type" id="id2"/>');
      chai.assert.equal(this.trashcan.contents_.length, 1);
    });
    test("No Disabled - Disabled True", function() {
      fireDeleteEvent(this.workspace, '<block type="dummy_type"/>');
      fireDeleteEvent(this.workspace, '<block type="dummy_type" disabled="true"/>');
      // Disabled tags get removed because disabled blocks aren't allowed to
      // be dragged from flyouts. See #2239 and #3243.
      chai.assert.equal(this.trashcan.contents_.length, 1);
    });
    test("No Editable - Editable False", function() {
      fireDeleteEvent(this.workspace, '<block type="dummy_type"/>');
      fireDeleteEvent(this.workspace, '<block type="dummy_type" editable="false"/>');
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("No Movable - Movable False", function() {
      fireDeleteEvent(this.workspace, '<block type="dummy_type"/>');
      fireDeleteEvent(this.workspace, '<block type="dummy_type" movable="false"/>');
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Field Values", function() {
      fireDeleteEvent(this.workspace,
          '<block type="dummy_type">' +
          '  <field name="dummy_name">dummy_value1</field>' +
          '</block>'
      );
      fireDeleteEvent(this.workspace,
          '<block type="dummy_type">' +
          '  <field name="dummy_name">dummy_value2</field>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("No Values - Values", function() {
      fireDeleteEvent(this.workspace, '<block type="dummy_type"/>');
      fireDeleteEvent(this.workspace,
          '<block type="dummy_type">' +
          '  <value name="dummy_input">' +
          '    <block type="dummy_type"/>' +
          '  </value>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Value Blocks", function() {
      fireDeleteEvent(this.workspace,
          '<block type="dummy_type">' +
          '  <value name="dummy_input">' +
          '    <block type="dummy_type1"/>' +
          '  </value>' +
          '</block>'
      );
      fireDeleteEvent(this.workspace,
          '<block type="dummy_type">' +
          '  <value name="dummy_input">' +
          '    <block type="dummy_type2"/>' +
          '  </value>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("No Statements - Statements", function() {
      fireDeleteEvent(this.workspace, '<block type="dummy_type"/>');
      fireDeleteEvent(this.workspace,
          '<block type="dummy_type">' +
          '  <statement name="dummy_input">' +
          '    <block type="dummy_type"/>' +
          '  </statement>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Statement Blocks", function() {
      fireDeleteEvent(this.workspace,
          '<block type="dummy_type">' +
          '  <statement name="dummy_input">' +
          '    <block type="dummy_type1"/>' +
          '  </statement>' +
          '</block>'
      );
      fireDeleteEvent(this.workspace,
          '<block type="dummy_type">' +
          '  <statement name="dummy_input">' +
          '    <block type="dummy_type2"/>' +
          '  </statement>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("No Next - Next", function() {
      fireDeleteEvent(this.workspace, '<block type="dummy_type"/>');
      fireDeleteEvent(this.workspace,
          '<block type="dummy_type">' +
          '  <next>' +
          '    <block type="dummy_type"/>' +
          '  </next>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Next Blocks", function() {
      fireDeleteEvent(this.workspace,
          '<block type="dummy_type">' +
          '  <next>' +
          '    <block type="dummy_type1"/>' +
          '  </next>' +
          '</block>'
      );
      fireDeleteEvent(this.workspace,
          '<block type="dummy_type">' +
          '  <next>' +
          '    <block type="dummy_type2"/>' +
          '  </next>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("No Comment - Comment", function() {
      fireDeleteEvent(this.workspace, '<block type="dummy_type"/>');
      fireDeleteEvent(this.workspace,
          '<block type="dummy_type">' +
          '  <comment>comment_text</comment>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Comment Text", function() {
      fireDeleteEvent(this.workspace,
          '<block type="dummy_type">' +
          '  <comment>comment_text1</comment>' +
          '</block>'
      );
      fireDeleteEvent(this.workspace,
          '<block type="dummy_type">' +
          '  <comment>comment_text2</comment>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Comment Size", function() {
      fireDeleteEvent(this.workspace,
          '<block type="dummy_type">' +
          '  <comment h="10" w="10">comment_text</comment>' +
          '</block>'
      );
      fireDeleteEvent(this.workspace,
          '<block type="dummy_type">' +
          '  <comment h="20" w="20">comment_text</comment>' +
          '</block>'
      );
      // h & w tags are removed b/c the blocks appear the same.
      chai.assert.equal(this.trashcan.contents_.length, 1);
    });
    test("Different Comment Pinned", function() {
      fireDeleteEvent(this.workspace,
          '<block type="dummy_type">' +
          '  <comment pinned="false">comment_text</comment>' +
          '</block>'
      );
      fireDeleteEvent(this.workspace,
          '<block type="dummy_type">' +
          '  <comment pinned="true">comment_text</comment>' +
          '</block>'
      );
      // pinned tags are removed b/c the blocks appear the same.
      chai.assert.equal(this.trashcan.contents_.length, 1);
    });
    test("No Mutator - Mutator", function() {
      fireDeleteEvent(this.workspace, '<block type="dummy_type"/>');
      fireDeleteEvent(this.workspace,
          '<block type="dummy_type">' +
          '  <mutation dummy_attribute="dummy_value"></mutation>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Mutator", function() {
      fireDeleteEvent(this.workspace,
          '<block type="dummy_type">' +
          '  <mutation dummy_attribute="dummy_value1"></mutation>' +
          '</block>'
      );
      fireDeleteEvent(this.workspace,
          '<block type="dummy_type">' +
          '  <mutation dummy_attribute="dummy_value2"></mutation>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
  });
  suite("Max Contents", function() {
    test("Max 0", function() {
      this.workspace.options.maxTrashcanContents = 0;
      fireDeleteEvent(this.workspace,
          '<block type="dummy_type"/>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 0);
      this.workspace.options.maxTrashcanContents = Infinity;
    });
    test("Last In First Out", function() {
      this.workspace.options.maxTrashcanContents = 1;
      fireDeleteEvent(this.workspace, '<block type="dummy_type1"/>');
      fireDeleteEvent(this.workspace, '<block type="dummy_type2"/>');
      chai.assert.equal(this.trashcan.contents_.length, 1);
      chai.assert.equal(
          Blockly.Xml.textToDom(this.trashcan.contents_[0])
              .getAttribute('type'),
          'dummy_type2'
      );
      this.workspace.options.maxTrashcanContents = Infinity;
    });
  });
});
