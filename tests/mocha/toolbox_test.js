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
  });
  teardown(function() {
    this.workspace.dispose();
    sinon.restore();
  });

  suite('init', function() {
    setup(function() {
      this.toolbox.init();
    });
    test('HtmlDiv is created', function() {
      assertTrue(this.toolbox.HtmlDiv !== undefined);
    });
    test('HtmlDiv is inserted before parent node', function() {
      var toolboxDiv = Blockly.getMainWorkspace().getInjectionDiv().childNodes[0];
      assertEquals(toolboxDiv.className, 'blocklyToolboxDiv blocklyNonSelectable');
    });
    test('hideChaff is closed when the toolbox is clicked', function() {
      sinon.stub(Blockly, "hideChaff");
      var evt = new MouseEvent('pointerdown', {
      });
      this.toolbox.HtmlDiv.dispatchEvent(evt);
      assertTrue(Blockly.hideChaff.calledOnce);
    });
    test('Flyout is initialized', function() {
      assertTrue(this.toolbox.flyout_ !== undefined);
    });
  });

  suite('renderTree', function() {
    setup(function() {
      this.toolbox.init();
    });
    test('Tree is created and set', function() {
      this.toolbox.renderTree(this.toolboxXml);
      assertTrue(this.toolbox.tree_ !== null);
    });
    test('Throws error if a toolbox has both blocks and categories at root level', function() {
      var badXml = document.getElementById('toolbox-bad');
      var threwError = false;
      try {
        this.toolbox.renderTree(badXml);
      } catch (Error) {
        threwError = true;
        assertEquals(Error.message, 'Toolbox cannot have both blocks and categories in the root level.');
      }
      assertTrue(threwError);
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
      assertEquals('', this.firstChild.getRowElement().style.backgroundColor);
    });
    test('Set color for new selected category', function() {
      assertEquals('rgb(85, 119, 238)', this.secondChild.getRowElement().style.backgroundColor);
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
      assertTrue(this.toolbox.flyout_.show.calledWith(this.secondChild.blocks));
    });
    test('Opening the previous selected category does not scroll', function() {
      sinon.stub(this.toolbox.flyout_, "scrollToStart");
      this.toolbox.handleAfterTreeSelected_(null, this.firstChild);
      assertFalse(this.toolbox.flyout_.scrollToStart.calledOnce);
    });
    test('Opening new category scrolls to top', function() {
      sinon.stub(this.toolbox.flyout_, "scrollToStart");
      this.toolbox.handleAfterTreeSelected_(null, this.secondChild);
      assertTrue(this.toolbox.flyout_.scrollToStart.calledOnce);
    });
    test('Clicking selected category closes flyout', function() {
      sinon.stub(this.toolbox.flyout_, "hide");
      this.toolbox.handleAfterTreeSelected_(this.firstChild);
      assertTrue(this.toolbox.flyout_.hide.calledOnce);
    });
    test('UI Event is fired when new category is selected', function() {
      sinon.stub(Blockly.Events, 'fire');
      this.toolbox.handleAfterTreeSelected_(this.firstChild);
      assertTrue(Blockly.Events.fire.calledOnce);
    });
    test('Last category is updated when there is a new node', function() {
      this.toolbox.handleAfterTreeSelected_(this.firstChild, this.secondChild);
      assertEquals(this.secondChild, this.toolbox.lastCategory_);
    });
  });

  suite('position', function() {
    setup(function() {
      this.toolbox.init();
    });
    test('Return if tree is not yet initialized', function() {
    });
    test('Position Horizontal', function() {
    });
    test('Position Horizontal at top', function() {
    });
    test('Position Vertical ', function() {
    });
    test('Position Vertical at right ', function() {
    });
  });

  suite('syncTrees_', function() {
    setup(function() {
      this.toolbox.init();
    });
    test('Return if tree is not yet initialized', function() {
    });
  });
});
