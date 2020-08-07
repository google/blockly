/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('New Toolbox', function() {

  function getInjectedToolbox () {
    /**
     * Category: First
     *   sep
     *   basic_block
     *   basic_block
     * Category: second
     *   basic_block
     * Category: Variables
     *   custom: VARIABLE
     * Category: NestedCategory
     *   Category: NestedItemOne
     */
    var toolboxXml = document.getElementById('toolbox-test');
    var workspace = Blockly.inject('blocklyDiv',
        {
          toolbox: toolboxXml
        });
    return workspace.getToolbox();
  };

  function getBasicToolbox() {
    var workspace = new Blockly.WorkspaceSvg(new Blockly.Options({}));
    var toolbox = new Blockly.Toolbox(workspace);
    toolbox.HtmlDiv = document.createElement('div');
    var flyout = {
      position: function() {}
    };
    toolbox.flyout_ = flyout;
    return toolbox;
  };

  function getCollapsibleItem(toolbox) {
    var contents = toolbox.contents_;
    for (var i = 0; i < contents.length; i++) {
      var item = contents[i];
      if (item.isCollapsible()) {
        return item;
      }
    }
  }

  function getNonCollapsibleItem(toolbox) {
    var contents = toolbox.contents_;
    for (var i = 0; i < contents.length; i++) {
      var item = contents[i];
      if (!item.isCollapsible()) {
        return item;
      }
    }
  }

  function getChildItem(toolbox) {
    return toolbox.getToolboxItemById('nestedCategory');
  }

  function getSeparator(toolbox) {
    return toolbox.getToolboxItemById('separator');
  }


  setup(function() {
    sharedTestSetup.call(this);
    defineStackBlock();
  });

  teardown(function() {
    sharedTestTeardown.call(this);
    delete Blockly.Blocks['row_block'];
  });

  suite('init', function() {
    setup(function() {
      this.toolbox = getInjectedToolbox();
    });
    teardown(function() {
      this.toolbox.dispose();
      delete this.toolbox;
    });

    test('HtmlDiv is created', function() {
      chai.assert.isDefined(this.toolbox.HtmlDiv);
    });
    test('HtmlDiv is inserted before parent node', function() {
      var toolboxDiv = Blockly.getMainWorkspace().getInjectionDiv().childNodes[0];
      chai.assert.equal(toolboxDiv.className,
          'blocklyToolboxDiv blocklyNonSelectable');
    });
    test('Toolbox is subscribed to background and foreground colour', function() {
      var themeManager = this.toolbox.workspace_.getThemeManager();
      var themeManagerSpy = sinon.spy(themeManager, 'subscribe');
      this.toolbox.init();
      sinon.assert.calledWith(themeManagerSpy, this.toolbox.HtmlDiv,
          'toolboxBackgroundColour', 'background-color');
      sinon.assert.calledWith(themeManagerSpy, this.toolbox.HtmlDiv,
          'toolboxForegroundColour', 'color');
    });
    test('Render is called', function() {
      var renderSpy = sinon.spy(this.toolbox, 'render');
      this.toolbox.init();
      sinon.assert.calledOnce(renderSpy);
    });
    test('Flyout is initialized', function() {
      this.toolbox.init();
      chai.assert.isDefined(this.toolbox.flyout_);
    });
  });

  suite('render', function() {
    setup(function() {
      this.toolbox = getInjectedToolbox();
    });
    teardown(function() {
      this.toolbox.dispose();
      delete this.toolbox;
    });
    test('Tree is created and set', function() {
    });
    test.skip('Throws error if a toolbox has both blocks and categories at root level', function() {
      var toolbox = this.toolbox;
      var badToolboxDef = [
        {
          "kind": "block",
          "blockxml": "<block type='controls_if'></block>"
        },
        {
          "kind": "category",
          "name": "loops",
          "categorystyle": "math_category",
          "contents": [
            {
              "kind": "block",
              "blockxml": "<block type='controls_if'></block>"
            },
            {
              "kind": "button",
              "text": "insert",
              "callbackkey":"insertConnectionRows"
            },
            {
              "kind": "label",
              "text": "Something"
            }
          ]
        }
      ];
      chai.assert.throws(function() {
        toolbox.render(badToolboxDef);
      }, 'Toolbox cannot have both blocks and categories in the root level.');
    });
    test.skip('Select any open nodes', function() {
      this.toolbox.render(this.toolboxXml);
      var selectedNode = this.toolbox.tree_.children_[0];
      chai.assert.isTrue(selectedNode.selected_);
    });
    test('Create a toolbox from JSON', function() {
      var jsonDef = [
        {
          "kind": "category",
          "contents": [
            {
              "kind": "block",
              "blockxml": '<block xmlns="http://www.w3.org/1999/xhtml" type="basic_block"><field name="TEXT">FirstCategory-FirstBlock</field></block>'
            },
            {
              "kind": "label",
              "text": "Input/Output:",
              "web-class": "ioLabel"
            },
            {
              "kind": "button",
              "text": "insert",
              "callbackkey": "insertConnectionStacks",
              "web-class": "ioLabel"
            },
            {
              "kind": "sep",
              "gap": "7"
            }
          ]
        }
      ];
      this.toolbox.render(jsonDef);
      chai.assert.lengthOf(this.toolbox.contents_, 1);
    });
  });

  suite('onClick_', function() {
    setup(function() {
      this.toolbox = getInjectedToolbox();
    });
    teardown(function() {
      this.toolbox.dispose();
      delete this.toolbox;
    });

    test('ToolboxClicked_ShouldCloseFlyout', function() {
      var hideChaffStub = sinon.stub(Blockly, "hideChaff");
      var evt = new MouseEvent('pointerdown', {});
      this.toolbox.HtmlDiv.dispatchEvent(evt);
      sinon.assert.calledOnce(hideChaffStub);
    });
    test('CategoryClicked_ShouldSelect', function() {
      var categoryXml = document.getElementsByClassName('blocklyToolboxCategory')[0];
      var evt = {
        'srcElement': categoryXml
      };
      var item = this.toolbox.contentIds_[categoryXml.getAttribute('id')];
      var setSelectedSpy = sinon.spy(this.toolbox, 'setSelectedItem');
      var onClickSpy = sinon.spy(item, 'onClick');
      this.toolbox.onClick_(evt);
      sinon.assert.calledOnce(setSelectedSpy);
      sinon.assert.calledOnce(onClickSpy);
    });
  });

  suite('onKeyDown_', function() {
    setup(function() {
      this.toolbox = getInjectedToolbox();
    });
    teardown(function() {
      this.toolbox.dispose();
      delete this.toolbox;
    });

    function createEventMock(keyCode) {
      return {
        'keyCode': keyCode,
        'preventDefault': function() {}
      };
    }

    function testCorrectFunctionCalled(toolbox, keyCode, funcName) {
      var event = createEventMock(keyCode);
      var preventDefaultEvent = sinon.stub(event, 'preventDefault');
      var selectMethodStub = sinon.stub(toolbox, funcName);
      selectMethodStub.returns(true);
      toolbox.onKeyDown_(event);
      sinon.assert.called(selectMethodStub);
      sinon.assert.called(preventDefaultEvent);
    }

    test('DownBtnPushed_ShouldCallSelectNext', function() {
      testCorrectFunctionCalled(this.toolbox, Blockly.utils.KeyCodes.DOWN, 'selectNext_', true);
    });
    test('UpBtnPushed_ShouldCallSelectPrevious', function() {
      testCorrectFunctionCalled(this.toolbox, Blockly.utils.KeyCodes.UP, 'selectPrevious_', true);
    });
    test('LeftBtnPushed_ShouldCallSelectParent', function() {
      testCorrectFunctionCalled(this.toolbox, Blockly.utils.KeyCodes.LEFT, 'selectParent_', true);
    });
    test('RightBtnPushed_ShouldCallSelectChild', function() {
      testCorrectFunctionCalled(this.toolbox, Blockly.utils.KeyCodes.RIGHT, 'selectChild_', true);
    });
    test('EnterBtnPushedWithCollapsibleItem_ShouldToggleExpanded', function() {
      this.toolbox.selectedItem_ = getCollapsibleItem(this.toolbox);
      var toggleExpandedStub = sinon.stub(this.toolbox.selectedItem_, 'toggleExpanded');
      var event = createEventMock(Blockly.utils.KeyCodes.ENTER);
      var preventDefaultEvent = sinon.stub(event, 'preventDefault');
      this.toolbox.onKeyDown_(event);
      sinon.assert.called(toggleExpandedStub);
      sinon.assert.called(preventDefaultEvent);
    });
    test('EnterBtnPushedWithNoSelectedItem_', function() {
      this.toolbox.selectedItem_ = null;
      var event = createEventMock(Blockly.utils.KeyCodes.ENTER);
      var preventDefaultEvent = sinon.stub(event, 'preventDefault');
      this.toolbox.onKeyDown_(event);
      sinon.assert.notCalled(preventDefaultEvent);
    });
  });

  suite('Select Methods', function() {
    setup(function() {
      this.toolbox = getInjectedToolbox();
    });
    teardown(function() {
      this.toolbox.dispose();
      delete this.toolbox;
    });

    // TODO: Check multiple nested category
    suite('selectChild_', function() {
      test('NoItemSelected_ShouldDoNothing', function() {
        this.toolbox.selectedItem_ = null;
        var handled = this.toolbox.selectChild_();
        chai.assert.isFalse(handled);
      });
      test('SelectedItemIsNotCollapsible_ShouldDoNothing', function() {
        this.toolbox.selectedItem_ = getNonCollapsibleItem(this.toolbox);
        var handled = this.toolbox.selectChild_();
        chai.assert.isFalse(handled);
      });
      test('SelectedItemIsCollapsible_ShouldExpand', function() {
        var collapsibleItem = getCollapsibleItem(this.toolbox);
        this.toolbox.selectedItem_ = collapsibleItem;
        var handled = this.toolbox.selectChild_();
        chai.assert.isTrue(handled);
        chai.assert.isTrue(collapsibleItem.isExpanded());
        chai.assert.equal(this.toolbox.selectedItem_, collapsibleItem);
      });

      test('SelectedItemIsCollapsibleAndExpanded_ShouldSelectChild', function() {
        var collapsibleItem = getCollapsibleItem(this.toolbox);
        collapsibleItem.expanded_ = true;
        var selectNextStub = sinon.stub(this.toolbox, 'selectNext_');
        this.toolbox.selectedItem_ = collapsibleItem;
        var handled = this.toolbox.selectChild_();
        chai.assert.isTrue(handled);
        sinon.assert.called(selectNextStub);
      });
    });

    // TODO: Check multiple nested category
    suite('selectParent_', function() {
      test('NoItemSelected_ShouldDoNothing', function() {
        this.toolbox.selectedItem_ = null;
        var handled = this.toolbox.selectParent_();
        chai.assert.isFalse(handled);
      });
      test('SelectedItemIsCollapsibleAndExpanded_ShouldCollapse', function() {
        var collapsibleItem = getCollapsibleItem(this.toolbox);
        collapsibleItem.expanded_ = true;
        this.toolbox.selectedItem_ = collapsibleItem;
        var handled = this.toolbox.selectParent_();
        chai.assert.isTrue(handled);
        chai.assert.isFalse(collapsibleItem.isExpanded());
        chai.assert.equal(this.toolbox.selectedItem_, collapsibleItem);
      });
      test('SelectedItemIsNotExpanded_ShouldGetParent', function() {
        var childItem = getChildItem(this.toolbox);
        this.toolbox.selectedItem_ = childItem;
        var handled = this.toolbox.selectParent_();
        chai.assert.isTrue(handled);
        chai.assert.equal(this.toolbox.selectedItem_, childItem.getParent());
      });
    });

    suite('selectNext_', function() {
      test('NoItemSelected_ShouldDoNothing', function() {
        this.toolbox.selectedItem_ = null;
        var handled = this.toolbox.selectNext_();
        chai.assert.isFalse(handled);
      });
      test('NextItemIsSelectable_ShouldSelectNextItem', function() {
        var item = this.toolbox.contents_[0];
        this.toolbox.selectedItem_ = item;
        var handled = this.toolbox.selectNext_();
        chai.assert.isTrue(handled);
        chai.assert.equal(this.toolbox.selectedItem_, this.toolbox.contents_[1]);
      });
      test('SelectedItemIsLastItem_ShouldDoNothing', function() {
        var item = this.toolbox.contents_[this.toolbox.contents_.length - 1];
        this.toolbox.selectedItem_ = item;
        var handled = this.toolbox.selectNext_();
        chai.assert.isFalse(handled);
        chai.assert.equal(this.toolbox.selectedItem_, item);
      });
      test('SelectedItemHasChildrenAndIsCollapsed_ShouldSkipOverChildren', function() {
        var item = getCollapsibleItem(this.toolbox);
        var childItem = item.contents_[0];
        item.expanded_ = false;
        this.toolbox.selectedItem_ = item;
        var handled = this.toolbox.selectNext_();
        chai.assert.isTrue(handled);
        chai.assert.notEqual(this.toolbox.selectedItem_, childItem);
      });
    });

    suite('selectPrevious', function() {
      test('NoItemSelected_ShouldDoNothing', function() {
        this.toolbox.selectedItem_ = null;
        var handled = this.toolbox.selectPrevious_();
        chai.assert.isFalse(handled);
      });
      test('SelectedItemIsFirstItem_ShouldDoNothing', function() {
        var item = this.toolbox.contents_[0];
        this.toolbox.selectedItem_ = item;
        var handled = this.toolbox.selectPrevious_();
        chai.assert.isFalse(handled);
        chai.assert.equal(this.toolbox.selectedItem_, item);
      });
      test('PrevItemIsSelectable_SelectPreviousItem', function() {
        var item = this.toolbox.contents_[1];
        var prevItem = this.toolbox.contents_[0];
        this.toolbox.selectedItem_ = item;
        var handled = this.toolbox.selectPrevious_();
        chai.assert.isTrue(handled);
        chai.assert.equal(this.toolbox.selectedItem_, prevItem);
      });
      test('PrevItemHasChildrenAndIsCollapsed_ShouldSkipOverChildren', function() {
        var item = this.toolbox.contents_[this.toolbox.contents_.length - 1];
        // TODO: Fix this. Shouldn't be using 3.
        var prevItem = this.toolbox.contents_[this.toolbox.contents_.length - 3];
        prevItem.expanded_ = false;
        var childItem = prevItem.contents_[0];
        this.toolbox.selectedItem_ = item;
        var handled = this.toolbox.selectPrevious_();
        chai.assert.isTrue(handled);
        chai.assert.notEqual(this.toolbox.selectedItem_, childItem);
      });
    });

  });

  suite('setSelectedItem', function() {
    setup(function() {
      this.toolbox = getInjectedToolbox();
    });
    teardown(function() {
      delete this.toolbox;
    });

    function setupSetSelected(toolbox, oldItem, newItem) {
      toolbox.selectedItem_ = oldItem;
      var newItemStub = sinon.stub(newItem, 'setSelected');
      toolbox.setSelectedItem(newItem);
      return newItemStub;
    }

    test('NoSelectedItemNoNewItem_ShouldDoNothing', function() {
      this.selectedItem_ = null;
      this.toolbox.setSelectedItem(null);
      var updateFlyoutStub = sinon.stub(this.toolbox, 'updateFlyout_');
      sinon.assert.notCalled(updateFlyoutStub);
    });
    test('NewItemIsNotSelectable_ShouldDoNothing', function() {
      var separator = getSeparator(this.toolbox);
      this.toolbox.setSelectedItem(separator);
      var updateFlyoutStub = sinon.stub(this.toolbox, 'updateFlyout_');
      sinon.assert.notCalled(updateFlyoutStub);
    });
    test('SelectCategoryWithNoChildren_ShouldSelectItem', function() {
      var oldItem = getCollapsibleItem(this.toolbox);
      var oldItemStub = sinon.stub(oldItem, 'setSelected');
      var newItem = getNonCollapsibleItem(this.toolbox);
      var newItemStub = setupSetSelected(this.toolbox, oldItem, newItem);
      sinon.assert.calledWith(oldItemStub, false);
      sinon.assert.calledWith(newItemStub, true);
    });
    test('SelectSelectedCategoryWithNoChildren_ShouldDeselectItem', function() {
      var newItem = getNonCollapsibleItem(this.toolbox);
      var newItemStub = setupSetSelected(this.toolbox, newItem, newItem);
      sinon.assert.calledWith(newItemStub, false);
    });
    test('SelectCollapsibleCategory_ShouldSelectItem', function() {
      var newItem = getCollapsibleItem(this.toolbox);
      var newItemStub = setupSetSelected(this.toolbox, null, newItem);
      sinon.assert.calledWith(newItemStub, true);
    });
    test('SelectSelectedCollapsibleCategory_ShouldNotDeselect', function() {
      var newItem = getCollapsibleItem(this.toolbox);
      var newItemStub = setupSetSelected(this.toolbox, newItem, newItem);
      sinon.assert.notCalled(newItemStub);
    });
  });

  suite('updateFlyout_', function() {
    setup(function() {
      this.toolbox = getInjectedToolbox();
    });
    teardown(function() {
      delete this.toolbox;
    });

    function testHideFlyout(toolbox, oldItem, newItem) {
      var updateFlyoutStub = sinon.stub(toolbox.flyout_, 'hide');
      var newItem = getNonCollapsibleItem(toolbox);
      toolbox.updateFlyout_(oldItem, newItem);
      sinon.assert.called(updateFlyoutStub);
    }

    test('OldItemEqualsNewItem_ShouldCloseFlyout', function() {
      var newItem = getNonCollapsibleItem(this.toolbox);
      testHideFlyout(this.toolbox, newItem, newItem);
    });
    test('NoNewItem_ShouldCloseFlyout', function() {
      testHideFlyout(this.toolbox, null, null);
    });
    test('NewItemIsCollapsible_ShouldCloseFlyout', function() {
      var newItem = getCollapsibleItem(this.toolbox);
      testHideFlyout(this.toolbox,null, newItem);
    });
    test('NewItemIsSelectable_ShouldOpenFlyout', function() {
      var showFlyoutstub = sinon.stub(this.toolbox.flyout_, 'show');
      var scrollToStartFlyout = sinon.stub(this.toolbox.flyout_, 'scrollToStart');
      var newItem = getNonCollapsibleItem(this.toolbox);
      this.toolbox.updateFlyout_(null, newItem);
      sinon.assert.called(showFlyoutstub);
      sinon.assert.called(scrollToStartFlyout);
    });
  });

  suite('position', function() {
    setup(function() {
      this.basicToolbox = getBasicToolbox();
      this.injectedToolbox = getInjectedToolbox();
    });
    teardown(function() {
    });

    function checkHorizontalToolbox(toolbox) {
      chai.assert.equal(toolbox.HtmlDiv.style.left, '0px', 'Check left position');
      chai.assert.equal(toolbox.HtmlDiv.style.height, 'auto', 'Check height');
      // var svgSize = Blockly.svgSize(toolbox.workspace_.getParentSvg());
      chai.assert.equal(toolbox.HtmlDiv.style.width, '100%', 'Check width');
      chai.assert.equal(toolbox.height_, toolbox.HtmlDiv.offsetHeight, 'Check height');
    }
    function checkVerticalToolbox(toolbox) {
      // var svgSize = Blockly.svgSize(toolbox.workspace_.getParentSvg());
      chai.assert.equal(toolbox.HtmlDiv.style.height, '100%', 'Check height');
      chai.assert.equal(toolbox.width_, toolbox.HtmlDiv.offsetWidth, 'Check width');
    }
    test('Return if tree is not yet initialized', function() {
      this.basicToolbox.HtmlDiv = null;
      this.basicToolbox.horizontalLayout_ = true;
      this.basicToolbox.position();
      chai.assert.equal(this.basicToolbox.height_, 0);
    });
    test('Position horizontal at top', function() {
      this.injectedToolbox.toolboxPosition = Blockly.TOOLBOX_AT_TOP;
      this.injectedToolbox.horizontalLayout_ = true;
      this.injectedToolbox.position();
      checkHorizontalToolbox(this.injectedToolbox);
      chai.assert.equal(this.injectedToolbox.HtmlDiv.style.top, '0px', 'Check top');
    });
    test('Position horizontal at bottom', function() {
      var toolbox = this.injectedToolbox;
      toolbox.toolboxPosition = Blockly.TOOLBOX_AT_BOTTOM;
      toolbox.horizontalLayout_ = true;
      toolbox.position();
      checkHorizontalToolbox(toolbox);
      chai.assert.equal(toolbox.HtmlDiv.style.bottom, '0px', 'Check bottom');
    });
    test('Position Vertical at right', function() {
      var toolbox = this.injectedToolbox;
      toolbox.toolboxPosition = Blockly.TOOLBOX_AT_RIGHT;
      toolbox.horizontalLayout_ = false;
      toolbox.position();
      chai.assert.equal(toolbox.HtmlDiv.style.right, '0px', 'Check right');
      checkVerticalToolbox(toolbox);
    });
    test('Position Vertical at left ', function() {
      var toolbox = this.injectedToolbox;
      toolbox.toolboxPosition = Blockly.TOOLBOX_AT_RIGHT;
      toolbox.horizontalLayout_ = false;
      toolbox.position();
      chai.assert.equal(toolbox.HtmlDiv.style.left, '0px', 'Check left');
      checkVerticalToolbox(toolbox);
    });
  });

  suite('parseToolbox', function() {
    setup(function() {
      this.categoryToolboxJSON = getCategoryJSON();
      this.simpleToolboxJSON = getSimpleJSON();
    });

    function checkValue(actual, expected, value) {
      var actualVal = actual[value];
      var expectedVal = expected[value];
      chai.assert.equal(actualVal.toUpperCase(), expectedVal.toUpperCase(), 'Checknig value for: ' + value);
    }
    function checkContents(actualContents, expectedContents) {
      chai.assert.equal(actualContents.length, expectedContents.length);
      for (var i = 0; i < actualContents.length; i++) {
        chai.assert.containsAllKeys(actualContents[i], Object.keys(expectedContents[i]));
      }
    }
    function checkCategory(actual, expected) {
      checkValue(actual, expected, 'kind');
      checkValue(actual, expected, 'name');
      checkContents(actual.contents, expected.contents);
    }
    function checkCategoryToolbox(actual, expected) {
      chai.assert.equal(actual.length, expected.length);
      for (var i = 0; i < expected.length; i++) {
        checkCategory(actual[i], expected[i]);
      }
    }
    function checkSimpleToolbox(actual, expected) {
      checkContents(actual, expected);
    }

    test('Simple Toolbox: Array with xml', function() {
      var xmlList = getXmlArray();
      var toolboxDef = Blockly.utils.toolbox.convertToolboxToJSON(xmlList);
      checkSimpleToolbox(toolboxDef, this.simpleToolboxJSON);
    });
    test('Category Toolbox: Array with xml', function() {
      var categoryOne = Blockly.Xml.textToDom('<category name="First"><block type="basic_block"><field name="TEXT">FirstCategory-FirstBlock</field></block><block type="basic_block"><field name="TEXT">FirstCategory-SecondBlock</field></block></category>');
      var categoryTwo = Blockly.Xml.textToDom('<category name="Second"><block type="basic_block"><field name="TEXT">SecondCategory-FirstBlock</field></block></category>');
      var xmlList = [categoryOne, categoryTwo];
      var toolboxDef = Blockly.utils.toolbox.convertToolboxToJSON(xmlList);
      checkCategoryToolbox(toolboxDef, this.categoryToolboxJSON);
    });
    test('Category Toolbox: Array with JSON', function() {
      var toolboxDef = Blockly.utils.toolbox.convertToolboxToJSON(this.categoryToolboxJSON);
      chai.assert.isNotNull(toolboxDef);
      checkCategoryToolbox(toolboxDef, this.categoryToolboxJSON);
    });
    test('Simple Toolbox: Array with JSON', function() {
      var toolboxDef = Blockly.utils.toolbox.convertToolboxToJSON(this.simpleToolboxJSON);
      chai.assert.isNotNull(toolboxDef);
      checkSimpleToolbox(toolboxDef, this.simpleToolboxJSON);
    });
    test('Category Toolbox: NodeList', function() {
      var nodeList = document.getElementById('toolbox-categories').childNodes;
      var toolboxDef = Blockly.utils.toolbox.convertToolboxToJSON(nodeList);
      checkCategoryToolbox(toolboxDef, this.categoryToolboxJSON);
    });
    test('Simple Toolbox: NodeList', function() {
      var nodeList = document.getElementById('toolbox-simple').childNodes;
      var toolboxDef = Blockly.utils.toolbox.convertToolboxToJSON(nodeList);
      checkSimpleToolbox(toolboxDef, this.simpleToolboxJSON);
    });
    test('Category Toolbox: xml', function() {
      var toolboxXml = document.getElementById('toolbox-categories');
      var toolboxDef = Blockly.utils.toolbox.convertToolboxToJSON(toolboxXml);
      chai.assert.isNotNull(toolboxDef);
      checkCategoryToolbox(toolboxDef, this.categoryToolboxJSON);
    });
    test('Simple Toolbox: xml', function() {
      var toolboxXml = document.getElementById('toolbox-simple');
      var toolboxDef = Blockly.utils.toolbox.convertToolboxToJSON(toolboxXml);
      chai.assert.isNotNull(toolboxDef);
      checkSimpleToolbox(toolboxDef, this.simpleToolboxJSON);
    });
  });

});
