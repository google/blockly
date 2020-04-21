/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.require('Blockly.Blocks.procedures');
goog.require('Blockly.Msg');

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
    this.toolboxXml = document.getElementById('toolbox-categories');
    this.workspace = Blockly.inject('blocklyDiv',
        {
          toolbox: this.toolboxXml
        });
    this.toolbox = this.workspace.getToolbox();
    this.toolbox.init();
  });
  teardown(function() {
    this.workspace.dispose();
    sinon.restore();
  });

  suite('init', function() {
    setup(function() {
    });
    test('HtmlDiv is created', function() {
      chai.assert.isDefined(this.toolbox.HtmlDiv);
    });
    test('HtmlDiv is inserted before parent node', function() {
      var toolboxDiv = Blockly.getMainWorkspace().getInjectionDiv().childNodes[0];
      chai.assert.equal(toolboxDiv.className, 'blocklyToolboxDiv blocklyNonSelectable');
    });
    test('hideChaff is closed when the toolbox is clicked', function() {
      sinon.stub(Blockly, "hideChaff");
      var evt = new MouseEvent('pointerdown', {
      });
      this.toolbox.HtmlDiv.dispatchEvent(evt);
      chai.assert.isTrue(Blockly.hideChaff.calledOnce);
    });
    test('Flyout is initialized', function() {
      chai.assert.isDefined(this.toolbox.flyout_);
    });
  });

  suite('renderTree', function() {
    setup(function() {
    });
    test('Tree is created and set', function() {
      this.toolbox.renderTree(this.toolboxXml);
      chai.assert.isDefined(this.toolbox.tree_);
    });
    test('Throws error if a toolbox has both blocks and categories at root level', function() {
      var badXml = document.getElementById('toolbox-incorrect');
      var threwError = false;
      try {
        this.toolbox.renderTree(badXml);
      } catch (Error) {
        threwError = true;
        chai.assert.equal(Error.message, 'Toolbox cannot have both blocks and categories in the root level.');
      }
      chai.assert.isTrue(threwError);
    });
    test('Select any open nodes', function() {
    });
    test('Set the state for horizontal layout ', function() {
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
      chai.assert.equal('', this.firstChild.getRowElement().style.backgroundColor);
    });
    test('Set color for new selected category', function() {
      chai.assert.equal('rgb(85, 119, 238)', this.secondChild.getRowElement().style.backgroundColor);
    });
  });

  suite('handleAfterTreeSelected_', function() {
    setup(function() {
      this.toolbox.selectFirstCategory();
      this.firstChild = this.toolbox.tree_.getChildAt(0);
      this.secondChild = this.toolbox.tree_.getChildAt(1);
      sinon.stub(this.toolbox.flyout_, "show");
    });
    test('Show the new set of blocks in the flyout', function() {
      this.toolbox.handleAfterTreeSelected_(this.firstChild, this.secondChild);
      chai.assert.isTrue(this.toolbox.flyout_.show.calledWith(this.secondChild.blocks));
    });
    test('Opening the previous selected category does not scroll', function() {
      sinon.stub(this.toolbox.flyout_, "scrollToStart");
      this.toolbox.handleAfterTreeSelected_(null, this.firstChild);
      chai.assert.isFalse(this.toolbox.flyout_.scrollToStart.calledOnce);
    });
    test('Opening new category scrolls to top', function() {
      sinon.stub(this.toolbox.flyout_, "scrollToStart");
      this.toolbox.handleAfterTreeSelected_(null, this.secondChild);
      chai.assert.isTrue(this.toolbox.flyout_.scrollToStart.calledOnce);
    });
    test('Clicking selected category closes flyout', function() {
      sinon.stub(this.toolbox.flyout_, "hide");
      this.toolbox.handleAfterTreeSelected_(this.firstChild);
      chai.assert.isTrue(this.toolbox.flyout_.hide.calledOnce);
    });
    test('UI Event is fired when new category is selected', function() {
      sinon.stub(Blockly.Events, 'fire');
      this.toolbox.handleAfterTreeSelected_(this.firstChild);
      chai.assert.isTrue(Blockly.Events.fire.calledOnce);
    });
    test('Last category is updated when there is a new node', function() {
      this.toolbox.handleAfterTreeSelected_(this.firstChild, this.secondChild);
      chai.assert.equal(this.secondChild, this.toolbox.lastCategory_);
    });
  });

  suite('position', function() {
    setup(function() {
      this.toolbox.init();
    });
    function checkHorizontal(toolbox) {
      chai.assert.equal(toolbox.HtmlDiv.style.left, '0px', 'Check left position');
      chai.assert.equal(toolbox.HtmlDiv.style.height, 'auto', 'Check height');
      var svgSize = Blockly.svgSize(toolbox.workspace_.getParentSvg());
      chai.assert.equal(toolbox.HtmlDiv.style.width, svgSize.width + 'px', 'Check width');
      chai.assert.equal(toolbox.height, toolbox.HtmlDiv.offsetHeight, 'Check width');
    }
    function checkVertical(toolbox) {
      var svgSize = Blockly.svgSize(toolbox.workspace_.getParentSvg());
      chai.assert.equal(toolbox.HtmlDiv.style.height, svgSize.height + 'px', 'Check Height');
      chai.assert.equal(toolbox.width, toolbox.HtmlDiv.offsetWidth, 'Check Width');
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
      checkHorizontal(toolbox);
      chai.assert.equal(toolbox.HtmlDiv.style.top, '0px', 'Check top');
    });
    test('Position horizontal at bottom', function() {
      var toolbox = this.toolbox;
      toolbox.toolboxPosition = Blockly.TOOLBOX_AT_BOTTOM;
      toolbox.horizontalLayout_ = true;
      toolbox.position();
      checkHorizontal(toolbox);
      chai.assert.equal(toolbox.HtmlDiv.style.bottom, '0px', 'Check bottom');
    });
    test('Position Vertical at right', function() {
      var toolbox = this.toolbox;
      toolbox.toolboxPosition = Blockly.TOOLBOX_AT_RIGHT;
      toolbox.horizontalLayout_ = false;
      toolbox.position();
      chai.assert.equal(toolbox.HtmlDiv.style.right, '0px', 'Check right');
      checkVertical(toolbox);
    });
    test('Position Vertical at left ', function() {
      var toolbox = this.toolbox;
      toolbox.toolboxPosition = Blockly.TOOLBOX_AT_RIGHT;
      toolbox.horizontalLayout_ = false;
      toolbox.position();
      chai.assert.equal(toolbox.HtmlDiv.style.left, '0px', 'Check left');
      checkVertical(toolbox);
    });
  });

  suite('syncTrees_', function() {
    setup(function() {
      this.tree = new Blockly.tree.TreeControl(this.toolbox, this.toolbox.config_);
      this.tree.blocks = [];
      this.toolboxXml = document.getElementById('toolbox-categories');
      this.buttonIdx = 1;
      this.separatorIdx = 0;
      this.dynamicCategoryIdx = 3;
      this.separatorBtwnCategoriesIdx = 2;
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
      var simpleToolbox = document.getElementById('toolbox-categories');
      this.toolbox.syncTrees_(simpleToolbox, this.tree,
          this.toolbox.workspace_.options.pathToMedia);
      chai.assert.isTrue(this.tree.children_[this.separatorBtwnCategoriesIdx] instanceof Blockly.Toolbox.TreeSeparator);
    });
    test('Having a button', function() {
      this.toolbox.syncTrees_(this.toolboxXml, this.tree,
          this.toolbox.workspace_.options.pathToMedia);
      var btnString = Blockly.utils.xml.domToText(this.tree.children_[0].blocks[this.buttonIdx]);
      chai.assert.equal(btnString, '<button xmlns="http://www.w3.org/1999/xhtml" text="insert" callbackkey="insertConnectionRows"></button>');
    });
    test('Colours are set using style', function() {
      sinon.stub(this.toolbox, "setColourFromStyle_");
      sinon.stub(this.toolbox, "setColour_");
      this.toolbox.syncTrees_(this.toolboxXml, this.tree,
          this.toolbox.workspace_.options.pathToMedia);
      chai.assert.isTrue(this.toolbox.setColourFromStyle_.calledOnce, 'Colour set from style');
      chai.assert.isTrue(this.toolbox.setColour_.called, 'Colour set');
    });
  });
});
