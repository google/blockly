/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('WorkspaceSvg', function() {
  setup(function() {
    var toolbox = document.getElementById('toolbox-categories');
    this.workspace = Blockly.inject('blocklyDiv', {toolbox: toolbox});
    Blockly.defineBlocksWithJsonArray([{
      'type': 'simple_test_block',
      'message0': 'simple test block',
      'output': null
    },
    {
      'type': 'test_val_in',
      'message0': 'test in %1',
      'args0': [
        {
          'type': 'input_value',
          'name': 'NAME'
        }
      ]
    }]);
  });

  teardown(function() {
    delete Blockly.Blocks['simple_test_block'];
    delete Blockly.Blocks['test_val_in'];
    this.workspace.dispose();
    sinon.restore();
  });

  test('appendDomToWorkspace alignment', function() {
    var dom = Blockly.Xml.textToDom(
        '<xml xmlns="https://developers.google.com/blockly/xml">' +
        '  <block type="math_random_float" inline="true" x="21" y="23">' +
        '  </block>' +
        '</xml>');
    Blockly.Xml.appendDomToWorkspace(dom, this.workspace);
    chai.assert.equal(this.workspace.getAllBlocks(false).length, 1,
        'Block count');
    Blockly.Xml.appendDomToWorkspace(dom, this.workspace);
    chai.assert.equal(this.workspace.getAllBlocks(false).length, 2,
        'Block count');
    var blocks = this.workspace.getAllBlocks(false);
    chai.assert.equal(blocks[0].getRelativeToSurfaceXY().x, 21,
        'Block 1 position x');
    chai.assert.equal(blocks[0].getRelativeToSurfaceXY().y, 23,
        'Block 1 position y');
    chai.assert.equal(blocks[1].getRelativeToSurfaceXY().x, 21,
        'Block 2 position x');
    // Y separation value defined in appendDomToWorkspace as 10
    chai.assert.equal(blocks[1].getRelativeToSurfaceXY().y,
        23 + blocks[0].getHeightWidth().height + 10,
        'Block 2 position y');
  });

  test('Replacing shadow disposes svg', function() {
    var dom = Blockly.Xml.textToDom(
        '<xml xmlns="https://developers.google.com/blockly/xml">' +
        '<block type="test_val_in">' +
        '<value name="NAME">' +
        '<shadow type="simple_test_block"></shadow>' +
        '</value>' +
        '</block>' +
        '</xml>');

    Blockly.Xml.appendDomToWorkspace(dom, this.workspace);
    var blocks = this.workspace.getAllBlocks(false);
    chai.assert.equal(blocks.length, 2,'Block count');
    var shadowBlock = blocks[1];
    chai.assert.exists(shadowBlock.getSvgRoot());

    var block = this.workspace.newBlock('simple_test_block');
    block.initSvg();

    var inputConnection =
        this.workspace.getTopBlocks()[0].getInput('NAME').connection;
    inputConnection.connect(block.outputConnection);
    chai.assert.exists(block.getSvgRoot());
    chai.assert.notExists(shadowBlock.getSvgRoot());
  });

  suite('updateToolbox', function() {
    test('Passes in null when toolbox exists', function() {
      chai.assert.throws(function() {
        this.workspace.updateToolbox(null);
      }.bind(this), 'Can\'t nullify an existing toolbox.');
    });
    test('Passes in toolbox def when current toolbox is null', function() {
      this.workspace.options.languageTree = null;
      chai.assert.throws(function() {
        this.workspace.updateToolbox([]);
      }.bind(this), 'Existing toolbox is null.  Can\'t create new toolbox.');
    });
    test('Existing toolbox has no categories', function() {
      sinon.stub(Blockly.utils.toolbox, 'hasCategories').returns(true);
      this.workspace.toolbox_ = null;
      chai.assert.throws(function() {
        this.workspace.updateToolbox([]);
      }.bind(this), 'Existing toolbox has no categories.  Can\'t change mode.');
    });
    test('Existing toolbox has categories', function() {
      sinon.stub(Blockly.utils.toolbox, 'hasCategories').returns(false);
      this.workspace.flyout_ = null;
      chai.assert.throws(function() {
        this.workspace.updateToolbox([]);
      }.bind(this), 'Existing toolbox has categories.  Can\'t change mode.');
    });
    test('Passing in string as toolboxdef', function() {
      var parseToolboxFake = sinon.spy(Blockly.Options, 'parseToolboxTree');
      this.workspace.updateToolbox('<xml><category name="something"></category></xml>');
      sinon.assert.calledOnce(parseToolboxFake);
    });
  });

  suite('Workspace Base class', function() {
    testAWorkspace();
  });
});
