/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Toolbox', function() {
  setup(function() {
    Blockly.defineBlocksWithJsonArray([{
      "type": "basic_block",
      "message0": "%1",
      "args0": [
        {
          "type": "field_input",
          "name": "TEXT",
          "text": "default"
        }
      ]
    }]);
    this.toolboxXml = document.getElementById('toolbox-test');
    this.workspace = Blockly.inject('blocklyDiv',
        {
          toolbox: this.toolboxXml
        });
    this.toolbox = this.workspace.getToolbox();
    this.toolbox.init();
  });
  
  teardown(function() {
    this.workspace.dispose();
    delete Blockly.Blocks['basic_block'];
    sinon.restore();
  });

  suite('init', function() {
    test('HtmlDiv is created', function() {
      chai.assert.isDefined(this.toolbox.HtmlDiv);
    });
    test('HtmlDiv is inserted before parent node', function() {
      var toolboxDiv = Blockly.getMainWorkspace().getInjectionDiv().childNodes[0];
      chai.assert.equal(toolboxDiv.className, 'blocklyToolboxDiv blocklyNonSelectable');
    });
    test('hideChaff is called when the toolbox is clicked', function() {
      var hideChaffStub = sinon.stub(Blockly, "hideChaff");
      var evt = new MouseEvent('pointerdown', {});
      this.toolbox.HtmlDiv.dispatchEvent(evt);
      sinon.assert.calledOnce(hideChaffStub);
    });
    test('Flyout is initialized', function() {
      chai.assert.isDefined(this.toolbox.flyout_);
    });
  });

  suite('renderTree', function() {
    test('Tree is created and set', function() {
      this.toolbox.renderTree(this.toolboxXml);
      chai.assert.isDefined(this.toolbox.tree_);
    });
    test('Throws error if a toolbox has both blocks and categories at root level', function() {
      var badXml = document.getElementById('toolbox-incorrect');
      var toolbox = this.toolbox;
      chai.assert.throws(function() {
        toolbox.renderTree(badXml);
      }, 'Toolbox cannot have both blocks and categories in the root level.');
    });
    test('Select any open nodes', function() {
      this.toolbox.renderTree(this.toolboxXml);
      var selectedNode = this.toolbox.tree_.children_[0];
      chai.assert.isTrue(selectedNode.selected_);
    });
    test('Set the state for horizontal layout ', function() {
      this.toolbox.horizontalLayout_ = true;
      this.toolbox.renderTree(this.toolboxXml);
      var orientationAttribute = this.toolbox.tree_.getElement()
          .getAttribute('aria-orientation');
      chai.assert.equal(orientationAttribute, 'horizontal');
    });
  });

  suite('handleBeforeTreeSelected_', function() {
    setup(function() {
      this.toolbox.selectFirstCategory();
      this.firstChild = this.toolbox.tree_.getChildAt(0);
      this.secondChild = this.toolbox.tree_.getChildAt(1);
      this.toolbox.handleBeforeTreeSelected_(this.secondChild);
    });
    test('Clear the previously selected category', function() {
      chai.assert.equal(this.firstChild.getRowElement().style.backgroundColor, '');
    });
    test('Set color for new selected category', function() {
      chai.assert.equal(this.secondChild.getRowElement().style.backgroundColor,
          'rgb(85, 119, 238)');
    });
  });

  suite('handleAfterTreeSelected_', function() {
    setup(function() {
      this.toolbox.selectFirstCategory();
      this.firstChild = this.toolbox.tree_.getChildAt(0);
      this.secondChild = this.toolbox.tree_.getChildAt(1);
      this.showStub = sinon.stub(this.toolbox.flyout_, "show");
    });
    test('Show the new set of blocks in the flyout', function() {
      this.toolbox.handleAfterTreeSelected_(this.firstChild, this.secondChild);
      sinon.assert.calledWith(this.showStub, this.secondChild.blocks);
    });
    test('Opening the previous selected category does not scroll', function() {
      var scrollStub = sinon.stub(this.toolbox.flyout_, "scrollToStart");
      this.toolbox.handleAfterTreeSelected_(null, this.firstChild);
      sinon.assert.notCalled(scrollStub);
    });
    test('Opening new category scrolls to top', function() {
      var scrollStub = sinon.stub(this.toolbox.flyout_, "scrollToStart");
      this.toolbox.handleAfterTreeSelected_(null, this.secondChild);
      sinon.assert.calledOnce(scrollStub);
    });
    test('Clicking selected category closes flyout', function() {
      var flyoutHideStub = sinon.stub(this.toolbox.flyout_, "hide");
      this.toolbox.handleAfterTreeSelected_(this.firstChild);
      sinon.assert.calledOnce(flyoutHideStub);
    });
    test('UI Event is fired when new category is selected', function() {
      var eventsFireStub = sinon.stub(Blockly.Events, 'fire');
      this.toolbox.handleAfterTreeSelected_(this.firstChild);
      sinon.assert.calledOnce(eventsFireStub);
    });
    test('Last category is updated when there is a new node', function() {
      this.toolbox.handleAfterTreeSelected_(this.firstChild, this.secondChild);
      chai.assert.equal(this.toolbox.lastCategory_, this.secondChild);
    });
  });

  suite('position', function() {
    setup(function() {
      this.toolbox.init();
    });
    function checkHorizontalToolbox(toolbox) {
      chai.assert.equal(toolbox.HtmlDiv.style.left, '0px', 'Check left position');
      chai.assert.equal(toolbox.HtmlDiv.style.height, 'auto', 'Check height');
      var svgSize = Blockly.svgSize(toolbox.workspace_.getParentSvg());
      chai.assert.equal(toolbox.HtmlDiv.style.width, svgSize.width + 'px', 'Check width');
      chai.assert.equal(toolbox.height, toolbox.HtmlDiv.offsetHeight, 'Check height');
    }
    function checkVerticalToolbox(toolbox) {
      var svgSize = Blockly.svgSize(toolbox.workspace_.getParentSvg());
      chai.assert.equal(toolbox.HtmlDiv.style.height, svgSize.height + 'px', 'Check height');
      chai.assert.equal(toolbox.width, toolbox.HtmlDiv.offsetWidth, 'Check width');
    }
    test('Return if tree is not yet initialized', function() {
      this.toolbox.HtmlDiv = null;
      this.toolbox.horizontalLayout_ = true;
      this.toolbox.position();
      chai.assert.equal(this.toolbox.height, '');
    });
    test('Position horizontal at top', function() {
      var toolbox = this.toolbox;
      toolbox.toolboxPosition = Blockly.TOOLBOX_AT_TOP;
      toolbox.horizontalLayout_ = true;
      toolbox.position();
      checkHorizontalToolbox(toolbox);
      chai.assert.equal(toolbox.HtmlDiv.style.top, '0px', 'Check top');
    });
    test('Position horizontal at bottom', function() {
      var toolbox = this.toolbox;
      toolbox.toolboxPosition = Blockly.TOOLBOX_AT_BOTTOM;
      toolbox.horizontalLayout_ = true;
      toolbox.position();
      checkHorizontalToolbox(toolbox);
      chai.assert.equal(toolbox.HtmlDiv.style.bottom, '0px', 'Check bottom');
    });
    test('Position Vertical at right', function() {
      var toolbox = this.toolbox;
      toolbox.toolboxPosition = Blockly.TOOLBOX_AT_RIGHT;
      toolbox.horizontalLayout_ = false;
      toolbox.position();
      chai.assert.equal(toolbox.HtmlDiv.style.right, '0px', 'Check right');
      checkVerticalToolbox(toolbox);
    });
    test('Position Vertical at left ', function() {
      var toolbox = this.toolbox;
      toolbox.toolboxPosition = Blockly.TOOLBOX_AT_RIGHT;
      toolbox.horizontalLayout_ = false;
      toolbox.position();
      chai.assert.equal(toolbox.HtmlDiv.style.left, '0px', 'Check left');
      checkVerticalToolbox(toolbox);
    });
  });

  suite('syncTrees_', function() {
    setup(function() {
      this.tree = new Blockly.tree.TreeControl(this.toolbox, this.toolbox.config_);
      this.tree.blocks = [];
      this.toolboxXml = document.getElementById('toolbox-test');
      this.separatorIdx = 0;
      this.buttonIdx = 1;
      this.dynamicCategoryIdx = 3;
      this.categorySeparatorIdx = 2;
    });
    test('Having a dynamic category', function() {
      this.toolbox.syncTrees_(this.toolboxXml, this.tree,
          this.toolbox.workspace_.options.pathToMedia);
      chai.assert.equal(this.tree.children_[this.dynamicCategoryIdx].blocks, 'VARIABLE');
    });
    test('Node is expanded', function() {
      var openNode = this.toolbox.syncTrees_(this.toolboxXml, this.tree,
          this.toolbox.workspace_.options.pathToMedia);
      chai.assert.exists(openNode);
    });
    test('Having a tree separator', function() {
      this.toolbox.syncTrees_(this.toolboxXml, this.tree,
          this.toolbox.workspace_.options.pathToMedia);
      var sepString = Blockly.utils.xml.domToText(this.tree.children_[0].blocks[this.separatorIdx]);
      chai.assert.equal(sepString, '<sep xmlns="http://www.w3.org/1999/xhtml" gap="-1"></sep>');
    });
    test('Separator between two categories', function() {
      this.toolbox.syncTrees_(this.toolboxXml, this.tree,
          this.toolbox.workspace_.options.pathToMedia);
      chai.assert.isTrue(this.tree.children_[
          this.categorySeparatorIdx] instanceof Blockly.Toolbox.TreeSeparator);
    });
    test('Having a button', function() {
      this.toolbox.syncTrees_(this.toolboxXml, this.tree,
          this.toolbox.workspace_.options.pathToMedia);
      var btnString = Blockly.utils.xml.domToText(this.tree.children_[0].blocks[this.buttonIdx]);
      chai.assert.equal(btnString,
          '<button xmlns="http://www.w3.org/1999/xhtml" text="insert" callbackkey="insertConnectionRows"></button>');
    });
    test('Colours are set using correct method', function() {
      var setColourFromStyleStub = sinon.stub(this.toolbox, "setColourFromStyle_");
      var setColourStub = sinon.stub(this.toolbox, "setColour_");
      this.toolbox.syncTrees_(this.toolboxXml, this.tree,
          this.toolbox.workspace_.options.pathToMedia);
      sinon.assert.calledOnce(setColourFromStyleStub);
      sinon.assert.called(setColourStub);
    });
  });
});
