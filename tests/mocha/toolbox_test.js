/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Toolbox', function() {

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
    });

    test('Init called -> HtmlDiv is created', function() {
      chai.assert.isDefined(this.toolbox.HtmlDiv);
    });
    test('Init called -> HtmlDiv is inserted before parent node', function() {
      var toolboxDiv = Blockly.getMainWorkspace().getInjectionDiv().childNodes[0];
      chai.assert.equal(toolboxDiv.className,
          'blocklyToolboxDiv blocklyNonSelectable');
    });
    test('Init called -> Toolbox is subscribed to background and foreground colour', function() {
      var themeManager = this.toolbox.workspace_.getThemeManager();
      var themeManagerSpy = sinon.spy(themeManager, 'subscribe');
      this.toolbox.init();
      sinon.assert.calledWith(themeManagerSpy, this.toolbox.HtmlDiv,
          'toolboxBackgroundColour', 'background-color');
      sinon.assert.calledWith(themeManagerSpy, this.toolbox.HtmlDiv,
          'toolboxForegroundColour', 'color');
    });
    test('Init called -> Render is called', function() {
      var renderSpy = sinon.spy(this.toolbox, 'render');
      this.toolbox.init();
      sinon.assert.calledOnce(renderSpy);
    });
    test('Init called -> Flyout is initialized', function() {
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
    });
    test('Render called with valid toolboxDef -> Contents are created', function() {
      var positionStub = sinon.stub(this.toolbox, 'position');
      this.toolbox.render({'contents': [
        {'kind': 'category'},
        {'kind': 'category'}
      ]});
      chai.assert.lengthOf(this.toolbox.contents_, 2);
      sinon.assert.called(positionStub);
    });
    // TODO: Uncomment once implemented.
    test.skip('Toolbox definition with both blocks and categories -> Should throw an error', function() {
      var toolbox = this.toolbox;
      var badToolboxDef = [
        {
          "kind": "block"
        },
        {
          "kind": "category",
        }
      ];
      chai.assert.throws(function() {
        toolbox.render({'contents' : badToolboxDef});
      }, 'Toolbox cannot have both blocks and categories in the root level.');
    });
    // TODO: Uncomment once implemented.
    test.skip('Expanded set to true for a non collapsible toolbox item -> Should open flyout', function() {
      this.toolbox.render(this.toolboxXml);
      var selectedNode = this.toolbox.tree_.children_[0];
      chai.assert.isTrue(selectedNode.selected_);
    });
    test('JSON toolbox definition -> Should create toolbox with contents', function() {
      var jsonDef = {'contents' : [
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
      ]};
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
    });

    test('Toolbox clicked -> Should close flyout', function() {
      var hideChaffStub = sinon.stub(Blockly, "hideChaff");
      var evt = new MouseEvent('pointerdown', {});
      this.toolbox.HtmlDiv.dispatchEvent(evt);
      sinon.assert.calledOnce(hideChaffStub);
    });
    test('Category clicked -> Should select category', function() {
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
    });

    function createKeyDownMock(keyCode) {
      return {
        'keyCode': keyCode,
        'preventDefault': function() {}
      };
    }

    function testCorrectFunctionCalled(toolbox, keyCode, funcName) {
      var event = createKeyDownMock(keyCode);
      var preventDefaultEvent = sinon.stub(event, 'preventDefault');
      var selectMethodStub = sinon.stub(toolbox, funcName);
      selectMethodStub.returns(true);
      toolbox.onKeyDown_(event);
      sinon.assert.called(selectMethodStub);
      sinon.assert.called(preventDefaultEvent);
    }

    test('Down button is pushed -> Should call selectNext_', function() {
      testCorrectFunctionCalled(this.toolbox, Blockly.utils.KeyCodes.DOWN, 'selectNext_', true);
    });
    test('Up button is pushed -> Should call selectPrevious_', function() {
      testCorrectFunctionCalled(this.toolbox, Blockly.utils.KeyCodes.UP, 'selectPrevious_', true);
    });
    test('Left button is pushed -> Should call selectParent_', function() {
      testCorrectFunctionCalled(this.toolbox, Blockly.utils.KeyCodes.LEFT, 'selectParent_', true);
    });
    test('Right button is pushed -> Should call selectChild_', function() {
      testCorrectFunctionCalled(this.toolbox, Blockly.utils.KeyCodes.RIGHT, 'selectChild_', true);
    });
    test('Enter button is pushed -> Should toggle expandedd', function() {
      this.toolbox.selectedItem_ = getCollapsibleItem(this.toolbox);
      var toggleExpandedStub = sinon.stub(this.toolbox.selectedItem_, 'toggleExpanded');
      var event = createKeyDownMock(Blockly.utils.KeyCodes.ENTER);
      var preventDefaultEvent = sinon.stub(event, 'preventDefault');
      this.toolbox.onKeyDown_(event);
      sinon.assert.called(toggleExpandedStub);
      sinon.assert.called(preventDefaultEvent);
    });
    test('Enter button is pushed when no item is selected -> Should not call prevent default', function() {
      this.toolbox.selectedItem_ = null;
      var event = createKeyDownMock(Blockly.utils.KeyCodes.ENTER);
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
    });

    suite('selectChild_', function() {
      test('No item is selected -> Should not handle event', function() {
        this.toolbox.selectedItem_ = null;
        var handled = this.toolbox.selectChild_();
        chai.assert.isFalse(handled);
      });
      test('Selected item is not collapsible -> Should not handle event', function() {
        this.toolbox.selectedItem_ = getNonCollapsibleItem(this.toolbox);
        var handled = this.toolbox.selectChild_();
        chai.assert.isFalse(handled);
      });
      test('Selected item is collapsible -> Should expand', function() {
        var collapsibleItem = getCollapsibleItem(this.toolbox);
        this.toolbox.selectedItem_ = collapsibleItem;
        var handled = this.toolbox.selectChild_();
        chai.assert.isTrue(handled);
        chai.assert.isTrue(collapsibleItem.isExpanded());
        chai.assert.equal(this.toolbox.selectedItem_, collapsibleItem);
      });

      test('Selected item is expanded -> Should select child', function() {
        var collapsibleItem = getCollapsibleItem(this.toolbox);
        collapsibleItem.expanded_ = true;
        var selectNextStub = sinon.stub(this.toolbox, 'selectNext_');
        this.toolbox.selectedItem_ = collapsibleItem;
        var handled = this.toolbox.selectChild_();
        chai.assert.isTrue(handled);
        sinon.assert.called(selectNextStub);
      });
    });

    suite('selectParent_', function() {
      test('No item selected -> Should not handle event', function() {
        this.toolbox.selectedItem_ = null;
        var handled = this.toolbox.selectParent_();
        chai.assert.isFalse(handled);
      });
      test('Selected item is expanded -> Should collapse', function() {
        var collapsibleItem = getCollapsibleItem(this.toolbox);
        collapsibleItem.expanded_ = true;
        this.toolbox.selectedItem_ = collapsibleItem;
        var handled = this.toolbox.selectParent_();
        chai.assert.isTrue(handled);
        chai.assert.isFalse(collapsibleItem.isExpanded());
        chai.assert.equal(this.toolbox.selectedItem_, collapsibleItem);
      });
      test('Selected item is not expanded -> Should get parent', function() {
        var childItem = getChildItem(this.toolbox);
        this.toolbox.selectedItem_ = childItem;
        var handled = this.toolbox.selectParent_();
        chai.assert.isTrue(handled);
        chai.assert.equal(this.toolbox.selectedItem_, childItem.getParent());
      });
    });

    suite('selectNext_', function() {
      test('No item is selected -> Should not handle event', function() {
        this.toolbox.selectedItem_ = null;
        var handled = this.toolbox.selectNext_();
        chai.assert.isFalse(handled);
      });
      test('Next item is selectable -> Should select next item', function() {
        var item = this.toolbox.contents_[0];
        this.toolbox.selectedItem_ = item;
        var handled = this.toolbox.selectNext_();
        chai.assert.isTrue(handled);
        chai.assert.equal(this.toolbox.selectedItem_, this.toolbox.contents_[1]);
      });
      test('Selected item is last item -> Should not handle event', function() {
        var item = this.toolbox.contents_[this.toolbox.contents_.length - 1];
        this.toolbox.selectedItem_ = item;
        var handled = this.toolbox.selectNext_();
        chai.assert.isFalse(handled);
        chai.assert.equal(this.toolbox.selectedItem_, item);
      });
      test('Selected item is collapsed -> Should skip over its children', function() {
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
      test('No item is selected -> Should not handle event', function() {
        this.toolbox.selectedItem_ = null;
        var handled = this.toolbox.selectPrevious_();
        chai.assert.isFalse(handled);
      });
      test('Selected item is first item -> Should not handle event', function() {
        var item = this.toolbox.contents_[0];
        this.toolbox.selectedItem_ = item;
        var handled = this.toolbox.selectPrevious_();
        chai.assert.isFalse(handled);
        chai.assert.equal(this.toolbox.selectedItem_, item);
      });
      test('Previous item is selectable -> Should select previous item', function() {
        var item = this.toolbox.contents_[1];
        var prevItem = this.toolbox.contents_[0];
        this.toolbox.selectedItem_ = item;
        var handled = this.toolbox.selectPrevious_();
        chai.assert.isTrue(handled);
        chai.assert.equal(this.toolbox.selectedItem_, prevItem);
      });
      test('Previous item is collapsed -> Should skip over children of the previous item', function() {
        var childItem = getChildItem(this.toolbox);
        var parentItem = childItem.getParent();
        var parentIdx = this.toolbox.contents_.indexOf(parentItem);
        // Gets the item after the parent.
        var item = this.toolbox.contents_[parentIdx + 1];
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
      this.toolbox.dispose();
    });

    function setupSetSelected(toolbox, oldItem, newItem) {
      toolbox.selectedItem_ = oldItem;
      var newItemStub = sinon.stub(newItem, 'setSelected');
      toolbox.setSelectedItem(newItem);
      return newItemStub;
    }

    test('Selected item and new item are null -> Should not update the flyout', function() {
      this.selectedItem_ = null;
      this.toolbox.setSelectedItem(null);
      var updateFlyoutStub = sinon.stub(this.toolbox, 'updateFlyout_');
      sinon.assert.notCalled(updateFlyoutStub);
    });
    test('New item is not selectable -> Should not update the flyout', function() {
      var separator = getSeparator(this.toolbox);
      this.toolbox.setSelectedItem(separator);
      var updateFlyoutStub = sinon.stub(this.toolbox, 'updateFlyout_');
      sinon.assert.notCalled(updateFlyoutStub);
    });
    test('Select an item with no children -> Should select item', function() {
      var oldItem = getCollapsibleItem(this.toolbox);
      var oldItemStub = sinon.stub(oldItem, 'setSelected');
      var newItem = getNonCollapsibleItem(this.toolbox);
      var newItemStub = setupSetSelected(this.toolbox, oldItem, newItem);
      sinon.assert.calledWith(oldItemStub, false);
      sinon.assert.calledWith(newItemStub, true);
    });
    test('Select previously selected item with no children -> Should deselect', function() {
      var newItem = getNonCollapsibleItem(this.toolbox);
      var newItemStub = setupSetSelected(this.toolbox, newItem, newItem);
      sinon.assert.calledWith(newItemStub, false);
    });
    test('Select collapsible item -> Should select item', function() {
      var newItem = getCollapsibleItem(this.toolbox);
      var newItemStub = setupSetSelected(this.toolbox, null, newItem);
      sinon.assert.calledWith(newItemStub, true);
    });
    test('Select previously selected collapsible item -> Should not deselect', function() {
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
      this.toolbox.dispose();
    });

    function testHideFlyout(toolbox, oldItem, newItem) {
      var updateFlyoutStub = sinon.stub(toolbox.flyout_, 'hide');
      var newItem = getNonCollapsibleItem(toolbox);
      toolbox.updateFlyout_(oldItem, newItem);
      sinon.assert.called(updateFlyoutStub);
    }

    test('Select previously selected item -> Should close flyout', function() {
      var newItem = getNonCollapsibleItem(this.toolbox);
      testHideFlyout(this.toolbox, newItem, newItem);
    });
    test('No new item -> Should close flyout', function() {
      testHideFlyout(this.toolbox, null, null);
    });
    test('Select collapsible item -> Should close flyout', function() {
      var newItem = getCollapsibleItem(this.toolbox);
      testHideFlyout(this.toolbox,null, newItem);
    });
    test('Select selectable item -> Should open flyout', function() {
      var showFlyoutstub = sinon.stub(this.toolbox.flyout_, 'show');
      var scrollToStartFlyout = sinon.stub(this.toolbox.flyout_, 'scrollToStart');
      var newItem = getNonCollapsibleItem(this.toolbox);
      this.toolbox.updateFlyout_(null, newItem);
      sinon.assert.called(showFlyoutstub);
      sinon.assert.called(scrollToStartFlyout);
    });
    test('Select non selectable item -> Should not update the flyout', function() {
      var showFlyoutstub = sinon.stub(this.toolbox.flyout_, 'show');
      var hideFlyoutStub = sinon.stub(this.toolbox.flyout_, 'hide');
      var nonSelectableItem = getSeparator(this.toolbox);
      this.toolbox.updateFlyout_(null, nonSelectableItem);
      sinon.assert.notCalled(showFlyoutstub);
      sinon.assert.notCalled(hideFlyoutStub);
    });
  });

  suite('position', function() {
    setup(function() {
      this.toolbox = getBasicToolbox();
    });

    function checkHorizontalToolbox(toolbox) {
      chai.assert.equal(toolbox.HtmlDiv.style.left, '0px', 'Check left position');
      chai.assert.equal(toolbox.HtmlDiv.style.height, 'auto', 'Check height');
      chai.assert.equal(toolbox.HtmlDiv.style.width, '100%', 'Check width');
      chai.assert.equal(toolbox.height_, toolbox.HtmlDiv.offsetHeight, 'Check height');
    }
    function checkVerticalToolbox(toolbox) {
      chai.assert.equal(toolbox.HtmlDiv.style.height, '100%', 'Check height');
      chai.assert.equal(toolbox.width_, toolbox.HtmlDiv.offsetWidth, 'Check width');
    }
    test('HtmlDiv is not created -> Should not resize', function() {
      var toolbox = this.toolbox;
      toolbox.HtmlDiv = null;
      toolbox.horizontalLayout_ = true;
      toolbox.position();
      chai.assert.equal(toolbox.height_, 0);
    });
    test('Horizontal toolbox at top -> Should anchor horizontal toolbox to top', function() {
      var toolbox = this.toolbox;
      toolbox.toolboxPosition = Blockly.TOOLBOX_AT_TOP;
      toolbox.horizontalLayout_ = true;
      toolbox.position();
      checkHorizontalToolbox(toolbox);
      chai.assert.equal(toolbox.HtmlDiv.style.top, '0px', 'Check top');
    });
    test('Horizontal toolbox at bottom -> Should anchor horizontal toolbox to bottom', function() {
      var toolbox = this.toolbox;
      toolbox.toolboxPosition = Blockly.TOOLBOX_AT_BOTTOM;
      toolbox.horizontalLayout_ = true;
      toolbox.position();
      checkHorizontalToolbox(toolbox);
      chai.assert.equal(toolbox.HtmlDiv.style.bottom, '0px', 'Check bottom');
    });
    test('Vertical toolbox at right -> Should anchor to right', function() {
      var toolbox = this.toolbox;
      toolbox.toolboxPosition = Blockly.TOOLBOX_AT_RIGHT;
      toolbox.horizontalLayout_ = false;
      toolbox.position();
      chai.assert.equal(toolbox.HtmlDiv.style.right, '0px', 'Check right');
      checkVerticalToolbox(toolbox);
    });
    test('Vertical toolbox at left -> Should anchor to left', function() {
      var toolbox = this.toolbox;
      toolbox.toolboxPosition = Blockly.TOOLBOX_AT_LEFT;
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
      chai.assert.equal(actualVal.toUpperCase(), expectedVal.toUpperCase(), 'Checking value for: ' + value);
    }
    function checkContents(actualContents, expectedContents) {
      chai.assert.equal(actualContents.length, expectedContents.length);
      for (var i = 0; i < actualContents.length; i++) {
        // TODO: Check the values as well as all the keys.
        chai.assert.containsAllKeys(actualContents[i], Object.keys(expectedContents[i]));
      }
    }
    function checkCategory(actual, expected) {
      checkValue(actual, expected, 'kind');
      checkValue(actual, expected, 'name');
      chai.assert.deepEqual(actual['cssConfig'], expected['cssConfig']);
      checkContents(actual.contents, expected.contents);
    }
    function checkCategoryToolbox(actual, expected) {
      var contents = actual['contents'];
      chai.assert.equal(contents.length, expected.length);
      for (var i = 0; i < expected.length; i++) {
        checkCategory(contents[i], expected[i]);
      }
    }
    function checkSimpleToolbox(actual, expected) {
      checkContents(actual['contents'], expected);
    }

    test('Simple Toolbox: Array with xml', function() {
      var xmlList = getXmlArray();
      var toolboxDef = Blockly.utils.toolbox.convertToolboxToJSON(xmlList);
      checkSimpleToolbox(toolboxDef, this.simpleToolboxJSON);
    });
    test('Category Toolbox: Array with xml', function() {
      var categoryOne = Blockly.Xml.textToDom('<category name="First" css-container="something"><block type="basic_block"><field name="TEXT">FirstCategory-FirstBlock</field></block><block type="basic_block"><field name="TEXT">FirstCategory-SecondBlock</field></block></category>');
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
