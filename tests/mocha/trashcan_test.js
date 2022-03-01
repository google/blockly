/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.trashcan');

const {assertEventFired, assertEventNotFired} = goog.require('Blockly.test.helpers.events');
const {sharedTestSetup, sharedTestTeardown} = goog.require('Blockly.test.helpers.setupTeardown');
const {defineBasicBlockWithField, defineMutatorBlocks, defineRowBlock, defineStackBlock, defineStatementBlock} = goog.require('Blockly.test.helpers.blockDefinitions');
const eventUtils = goog.require('Blockly.Events.utils');
const {simulateClick} = goog.require('Blockly.test.helpers.userInput');


suite("Trashcan", function() {
  function fireDeleteEvent(workspace, xmlString) {
    let xml = Blockly.Xml.textToDom(
        '<xml xmlns="https://developers.google.com/blockly/xml">' +
        xmlString + '</xml>');
    xml = xml.children[0];
    const block = Blockly.Xml.domToBlock(xml, workspace);
    const event = new Blockly.Events.BlockDelete(block);
    eventUtils.fire(event);
  }
  function fireNonDeleteEvent(workspace, oldXml) {
    const event = new Blockly.Events.Abstract();
    event.type = 'test_field_block';
    event.workspaceId = workspace.id;
    if (oldXml) {
      event.oldXml = oldXml;
    }
    eventUtils.fire(/** @type {Blockly.Events.Abstract} */ event);
  }

  setup(function() {
    sharedTestSetup.call(this);
    defineBasicBlockWithField();
    defineRowBlock();
    defineRowBlock('row_block2');
    defineStatementBlock();
    defineStatementBlock('statement_block2');
    defineStackBlock();
    defineStackBlock('stack_block2');
    defineMutatorBlocks();
    this.workspace = Blockly.inject('blocklyDiv',
        {'trashcan': true, 'maxTrashcanContents': Infinity});
    this.trashcan = this.workspace.trashcan;
  });
  teardown(function() {
    sharedTestTeardown.call(this);
    Blockly.Extensions.unregister('xml_mutator');
    Blockly.Extensions.unregister('jso_mutator');
  });

  suite("Events", function() {
    test("Delete", function() {
      fireDeleteEvent(this.workspace, '<block type="test_field_block"/>');
      chai.assert.equal(this.trashcan.contents_.length, 1);
    });
    test("Non-Delete", function() {
      fireNonDeleteEvent(this.workspace);
      chai.assert.equal(this.trashcan.contents_.length, 0);
    });
    test("Non-Delete w/ oldXml", function() {
      let xml = Blockly.Xml.textToDom(
          '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '  <block type="test_field_block"/>' +
          '</xml>'
      );
      xml = xml.children[0];
      fireNonDeleteEvent(this.workspace, xml);
      chai.assert.equal(this.trashcan.contents_.length, 0);
    });
    test("Shadow Delete", function() {
      fireDeleteEvent(this.workspace, '<shadow type="test_field_block"/>');
      chai.assert.equal(this.trashcan.contents_.length, 0);
    });
    test("Click without contents - fires workspace click", function() {
      simulateClick(this.trashcan.svgGroup_);

      assertEventNotFired(
          this.eventsFireStub, Blockly.Events.TrashcanOpen, {type: eventUtils.CLICK});
      assertEventFired(
          this.eventsFireStub, Blockly.Events.Click, {targetType: 'workspace', type: eventUtils.CLICK},
          this.workspace.id, null);
    });
    test("Click with contents - fires trashcanOpen", function() {
      fireDeleteEvent(this.workspace, '<block type="test_field_block"/>');
      chai.assert.equal(this.trashcan.contents_.length, 1);
      // Stub flyout interaction.
      const showFlyoutStub = sinon.stub(this.trashcan.flyout, "show");

      simulateClick(this.trashcan.svgGroup_);

      sinon.assert.calledOnce(showFlyoutStub);

      assertEventFired(
          this.eventsFireStub, Blockly.Events.TrashcanOpen,
          {isOpen: true, type: eventUtils.TRASHCAN_OPEN}, this.workspace.id);
      assertEventNotFired(
          this.eventsFireStub, Blockly.Events.Click, {type: eventUtils.TRASHCAN_OPEN});
    });
    test("Click outside trashcan - fires trashcanClose", function() {
      sinon.stub(this.trashcan.flyout, 'isVisible').returns(true);
      // Stub flyout interaction.
      const hideFlyoutStub = sinon.stub(this.trashcan.flyout, "hide");

      simulateClick(this.workspace.svgGroup_);

      sinon.assert.calledOnce(hideFlyoutStub);

      assertEventFired(
          this.eventsFireStub, Blockly.Events.TrashcanOpen,
          {isOpen: false, type: eventUtils.TRASHCAN_OPEN}, this.workspace.id);
      assertEventFired(
          this.eventsFireStub, Blockly.Events.Click, {targetType: 'workspace', type: eventUtils.CLICK},
          this.workspace.id, null);
    });
  });
  suite("Unique Contents", function() {
    test("Simple", function() {
      fireDeleteEvent(this.workspace, '<block type="test_field_block"/>');
      fireDeleteEvent(this.workspace, '<block type="test_field_block"/>');
      chai.assert.equal(this.trashcan.contents_.length, 1);
    });
    test("Different Coords", function() {
      fireDeleteEvent(
          this.workspace, '<block type="test_field_block" x="10" y="10"/>');
      fireDeleteEvent(
          this.workspace, '<block type="test_field_block" x="20" y="20"/>');
      chai.assert.equal(this.trashcan.contents_.length, 1);
    });
    test("Different IDs", function() {
      fireDeleteEvent(
          this.workspace, '<block type="test_field_block" id="id1"/>');
      fireDeleteEvent(
          this.workspace, '<block type="test_field_block" id="id2"/>');
      chai.assert.equal(this.trashcan.contents_.length, 1);
    });
    test("No Disabled - Disabled True", function() {
      fireDeleteEvent(
          this.workspace, '<block type="test_field_block"/>');
      fireDeleteEvent(
          this.workspace, '<block type="test_field_block" disabled="true"/>');
      // Disabled tags get removed because disabled blocks aren't allowed to
      // be dragged from flyouts. See #2239 and #3243.
      chai.assert.equal(this.trashcan.contents_.length, 1);
    });
    test("Different Field Values", function() {
      fireDeleteEvent(this.workspace,
          '<block type="test_field_block">' +
          '  <field name="NAME">dummy_value1</field>' +
          '</block>'
      );
      fireDeleteEvent(this.workspace,
          '<block type="test_field_block">' +
          '  <field name="NAME">dummy_value2</field>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("No Values - Values", function() {
      fireDeleteEvent(this.workspace, '<block type="row_block"/>');
      fireDeleteEvent(this.workspace,
          '<block type="row_block">' +
          '  <value name="INPUT">' +
          '    <block type="row_block"/>' +
          '  </value>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Value Blocks", function() {
      fireDeleteEvent(this.workspace,
          '<block type="row_block">' +
          '  <value name="INPUT">' +
          '    <block type="row_block"/>' +
          '  </value>' +
          '</block>'
      );
      fireDeleteEvent(this.workspace,
          '<block type="row_block">' +
          '  <value name="INPUT">' +
          '    <block type="row_block2"/>' +
          '  </value>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("No Statements - Statements", function() {
      fireDeleteEvent(this.workspace, '<block type="statement_block"/>');
      fireDeleteEvent(this.workspace,
          '<block type="statement_block">' +
          '  <statement name="NAME">' +
          '    <block type="statement_block"/>' +
          '  </statement>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Statement Blocks", function() {
      fireDeleteEvent(this.workspace,
          '<block type="statement_block">' +
          '  <statement name="NAME">' +
          '    <block type="statement_block"/>' +
          '  </statement>' +
          '</block>'
      );
      fireDeleteEvent(this.workspace,
          '<block type="statement_block2">' +
          '  <statement name="NAME">' +
          '    <block type="statement_block2"/>' +
          '  </statement>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("No Next - Next", function() {
      fireDeleteEvent(this.workspace, '<block type="stack_block"/>');
      fireDeleteEvent(this.workspace,
          '<block type="stack_block">' +
          '  <next>' +
          '    <block type="stack_block"/>' +
          '  </next>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Next Blocks", function() {
      fireDeleteEvent(this.workspace,
          '<block type="stack_block">' +
          '  <next>' +
          '    <block type="stack_block"/>' +
          '  </next>' +
          '</block>'
      );
      fireDeleteEvent(this.workspace,
          '<block type="stack_block">' +
          '  <next>' +
          '    <block type="stack_block2"/>' +
          '  </next>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("No Comment - Comment", function() {
      fireDeleteEvent(this.workspace, '<block type="test_field_block"/>');
      fireDeleteEvent(this.workspace,
          '<block type="test_field_block">' +
          '  <comment>comment_text</comment>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Comment Text", function() {
      fireDeleteEvent(this.workspace,
          '<block type="test_field_block">' +
          '  <comment>comment_text1</comment>' +
          '</block>'
      );
      fireDeleteEvent(this.workspace,
          '<block type="test_field_block">' +
          '  <comment>comment_text2</comment>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
    test("Different Comment Size", function() {
      fireDeleteEvent(this.workspace,
          '<block type="test_field_block">' +
          '  <comment h="10" w="10">comment_text</comment>' +
          '</block>'
      );
      fireDeleteEvent(this.workspace,
          '<block type="test_field_block">' +
          '  <comment h="20" w="20">comment_text</comment>' +
          '</block>'
      );
      // h & w tags are removed b/c the blocks appear the same.
      chai.assert.equal(this.trashcan.contents_.length, 1);
    });
    test("Different Comment Pinned", function() {
      fireDeleteEvent(this.workspace,
          '<block type="test_field_block">' +
          '  <comment pinned="false">comment_text</comment>' +
          '</block>'
      );
      fireDeleteEvent(this.workspace,
          '<block type="test_field_block">' +
          '  <comment pinned="true">comment_text</comment>' +
          '</block>'
      );
      // pinned tags are removed b/c the blocks appear the same.
      chai.assert.equal(this.trashcan.contents_.length, 1);
    });
    test("Different Mutator", function() {
      fireDeleteEvent(this.workspace,
          '<block type="xml_block">' +
          '  <mutation hasInput="true"></mutation>' +
          '</block>'
      );
      fireDeleteEvent(this.workspace,
          '<block type="xml_block">' +
          '  <mutation hasInputt="false"></mutation>' +
          '</block>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 2);
    });
  });
  suite("Max Contents", function() {
    test("Max 0", function() {
      this.workspace.options.maxTrashcanContents = 0;
      fireDeleteEvent(this.workspace,
          '<block type="test_field_block"/>'
      );
      chai.assert.equal(this.trashcan.contents_.length, 0);
      this.workspace.options.maxTrashcanContents = Infinity;
    });
  });
});
