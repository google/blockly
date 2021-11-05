/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.module('Blockly.test.toolbox');

const {defineStackBlock, sharedTestSetup, sharedTestTeardown} = goog.require('Blockly.test.helpers');
const {getBasicToolbox, getCategoryJSON, getChildItem, getCollapsibleItem, getDeeplyNestedJSON, getInjectedToolbox, getNonCollapsibleItem, getSeparator, getSimpleJson, getXmlArray} = goog.require('Blockly.test.toolboxHelpers');


suite('Toolbox', function() {

  setup(function() {
    sharedTestSetup.call(this);
    defineStackBlock();
  });

  teardown(function() {
    sharedTestTeardown.call(this);
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
      let toolboxDiv = Blockly.getMainWorkspace().getInjectionDiv().childNodes[0];
      chai.assert.equal(toolboxDiv.className,
          'blocklyToolboxDiv blocklyNonSelectable');
    });
    test('Init called -> Toolbox is subscribed to background and foreground colour', function() {
      let themeManager = this.toolbox.workspace_.getThemeManager();
      let themeManagerSpy = sinon.spy(themeManager, 'subscribe');
      let componentManager = this.toolbox.workspace_.getComponentManager();
      sinon.stub(componentManager, 'addComponent');
      this.toolbox.init();
      sinon.assert.calledWith(themeManagerSpy, this.toolbox.HtmlDiv,
          'toolboxBackgroundColour', 'background-color');
      sinon.assert.calledWith(themeManagerSpy, this.toolbox.HtmlDiv,
          'toolboxForegroundColour', 'color');
    });
    test('Init called -> Render is called', function() {
      let renderSpy = sinon.spy(this.toolbox, 'render');
      let componentManager = this.toolbox.workspace_.getComponentManager();
      sinon.stub(componentManager, 'addComponent');
      this.toolbox.init();
      sinon.assert.calledOnce(renderSpy);
    });
    test('Init called -> Flyout is initialized', function() {
      let componentManager = this.toolbox.workspace_.getComponentManager();
      sinon.stub(componentManager, 'addComponent');
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
      let positionStub = sinon.stub(this.toolbox, 'position');
      this.toolbox.render({'contents': [
        {'kind': 'category', 'contents': []},
        {'kind': 'category', 'contents': []}
      ]});
      chai.assert.lengthOf(this.toolbox.contents_, 2);
      sinon.assert.called(positionStub);
    });
    // TODO: Uncomment once implemented.
    test.skip('Toolbox definition with both blocks and categories -> Should throw an error', function() {
      let toolbox = this.toolbox;
      let badToolboxDef = [
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
      let selectedNode = this.toolbox.tree_.children_[0];
      chai.assert.isTrue(selectedNode.selected_);
    });
    test('JSON toolbox definition -> Should create toolbox with contents', function() {
      let jsonDef = {'contents' : [
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
      let hideChaffStub = sinon.stub(
        Blockly.WorkspaceSvg.prototype, "hideChaff");
      let evt = new MouseEvent('click', {});
      this.toolbox.HtmlDiv.dispatchEvent(evt);
      sinon.assert.calledOnce(hideChaffStub);
    });
    test('Category clicked -> Should select category', function() {
      let categoryXml = document.getElementsByClassName('blocklyTreeRow')[0];
      let evt = {
        'target': categoryXml
      };
      let item = this.toolbox.contentMap_[categoryXml.getAttribute('id')];
      let setSelectedSpy = sinon.spy(this.toolbox, 'setSelectedItem');
      let onClickSpy = sinon.spy(item, 'onClick');
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
      let event = createKeyDownMock(keyCode);
      let preventDefaultEvent = sinon.stub(event, 'preventDefault');
      let selectMethodStub = sinon.stub(toolbox, funcName);
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
      let toggleExpandedStub = sinon.stub(this.toolbox.selectedItem_, 'toggleExpanded');
      let event = createKeyDownMock(Blockly.utils.KeyCodes.ENTER);
      let preventDefaultEvent = sinon.stub(event, 'preventDefault');
      this.toolbox.onKeyDown_(event);
      sinon.assert.called(toggleExpandedStub);
      sinon.assert.called(preventDefaultEvent);
    });
    test('Enter button is pushed when no item is selected -> Should not call prevent default', function() {
      this.toolbox.selectedItem_ = null;
      let event = createKeyDownMock(Blockly.utils.KeyCodes.ENTER);
      let preventDefaultEvent = sinon.stub(event, 'preventDefault');
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
        let handled = this.toolbox.selectChild_();
        chai.assert.isFalse(handled);
      });
      test('Selected item is not collapsible -> Should not handle event', function() {
        this.toolbox.selectedItem_ = getNonCollapsibleItem(this.toolbox);
        let handled = this.toolbox.selectChild_();
        chai.assert.isFalse(handled);
      });
      test('Selected item is collapsible -> Should expand', function() {
        let collapsibleItem = getCollapsibleItem(this.toolbox);
        this.toolbox.selectedItem_ = collapsibleItem;
        let handled = this.toolbox.selectChild_();
        chai.assert.isTrue(handled);
        chai.assert.isTrue(collapsibleItem.isExpanded());
        chai.assert.equal(this.toolbox.selectedItem_, collapsibleItem);
      });

      test('Selected item is expanded -> Should select child', function() {
        let collapsibleItem = getCollapsibleItem(this.toolbox);
        collapsibleItem.expanded_ = true;
        let selectNextStub = sinon.stub(this.toolbox, 'selectNext_');
        this.toolbox.selectedItem_ = collapsibleItem;
        let handled = this.toolbox.selectChild_();
        chai.assert.isTrue(handled);
        sinon.assert.called(selectNextStub);
      });
    });

    suite('selectParent_', function() {
      test('No item selected -> Should not handle event', function() {
        this.toolbox.selectedItem_ = null;
        let handled = this.toolbox.selectParent_();
        chai.assert.isFalse(handled);
      });
      test('Selected item is expanded -> Should collapse', function() {
        let collapsibleItem = getCollapsibleItem(this.toolbox);
        collapsibleItem.expanded_ = true;
        this.toolbox.selectedItem_ = collapsibleItem;
        let handled = this.toolbox.selectParent_();
        chai.assert.isTrue(handled);
        chai.assert.isFalse(collapsibleItem.isExpanded());
        chai.assert.equal(this.toolbox.selectedItem_, collapsibleItem);
      });
      test('Selected item is not expanded -> Should get parent', function() {
        let childItem = getChildItem(this.toolbox);
        this.toolbox.selectedItem_ = childItem;
        let handled = this.toolbox.selectParent_();
        chai.assert.isTrue(handled);
        chai.assert.equal(this.toolbox.selectedItem_, childItem.getParent());
      });
    });

    suite('selectNext_', function() {
      test('No item is selected -> Should not handle event', function() {
        this.toolbox.selectedItem_ = null;
        let handled = this.toolbox.selectNext_();
        chai.assert.isFalse(handled);
      });
      test('Next item is selectable -> Should select next item', function() {
        let item = this.toolbox.contents_[0];
        this.toolbox.selectedItem_ = item;
        let handled = this.toolbox.selectNext_();
        chai.assert.isTrue(handled);
        chai.assert.equal(this.toolbox.selectedItem_, this.toolbox.contents_[1]);
      });
      test('Selected item is last item -> Should not handle event', function() {
        let item = this.toolbox.contents_[this.toolbox.contents_.length - 1];
        this.toolbox.selectedItem_ = item;
        let handled = this.toolbox.selectNext_();
        chai.assert.isFalse(handled);
        chai.assert.equal(this.toolbox.selectedItem_, item);
      });
      test('Selected item is collapsed -> Should skip over its children', function() {
        let item = getCollapsibleItem(this.toolbox);
        let childItem = item.flyoutItems_[0];
        item.expanded_ = false;
        this.toolbox.selectedItem_ = item;
        let handled = this.toolbox.selectNext_();
        chai.assert.isTrue(handled);
        chai.assert.notEqual(this.toolbox.selectedItem_, childItem);
      });
    });

    suite('selectPrevious', function() {
      test('No item is selected -> Should not handle event', function() {
        this.toolbox.selectedItem_ = null;
        let handled = this.toolbox.selectPrevious_();
        chai.assert.isFalse(handled);
      });
      test('Selected item is first item -> Should not handle event', function() {
        let item = this.toolbox.contents_[0];
        this.toolbox.selectedItem_ = item;
        let handled = this.toolbox.selectPrevious_();
        chai.assert.isFalse(handled);
        chai.assert.equal(this.toolbox.selectedItem_, item);
      });
      test('Previous item is selectable -> Should select previous item', function() {
        let item = this.toolbox.contents_[1];
        let prevItem = this.toolbox.contents_[0];
        this.toolbox.selectedItem_ = item;
        let handled = this.toolbox.selectPrevious_();
        chai.assert.isTrue(handled);
        chai.assert.equal(this.toolbox.selectedItem_, prevItem);
      });
      test('Previous item is collapsed -> Should skip over children of the previous item', function() {
        let childItem = getChildItem(this.toolbox);
        let parentItem = childItem.getParent();
        let parentIdx = this.toolbox.contents_.indexOf(parentItem);
        // Gets the item after the parent.
        let item = this.toolbox.contents_[parentIdx + 1];
        this.toolbox.selectedItem_ = item;
        let handled = this.toolbox.selectPrevious_();
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
      let newItemStub = sinon.stub(newItem, 'setSelected');
      toolbox.setSelectedItem(newItem);
      return newItemStub;
    }

    test('Selected item and new item are null -> Should not update the flyout', function() {
      this.selectedItem_ = null;
      this.toolbox.setSelectedItem(null);
      let updateFlyoutStub = sinon.stub(this.toolbox, 'updateFlyout_');
      sinon.assert.notCalled(updateFlyoutStub);
    });
    test('New item is not selectable -> Should not update the flyout', function() {
      let separator = getSeparator(this.toolbox);
      this.toolbox.setSelectedItem(separator);
      let updateFlyoutStub = sinon.stub(this.toolbox, 'updateFlyout_');
      sinon.assert.notCalled(updateFlyoutStub);
    });
    test('Select an item with no children -> Should select item', function() {
      let oldItem = getCollapsibleItem(this.toolbox);
      let oldItemStub = sinon.stub(oldItem, 'setSelected');
      let newItem = getNonCollapsibleItem(this.toolbox);
      let newItemStub = setupSetSelected(this.toolbox, oldItem, newItem);
      sinon.assert.calledWith(oldItemStub, false);
      sinon.assert.calledWith(newItemStub, true);
    });
    test('Select previously selected item with no children -> Should deselect', function() {
      let newItem = getNonCollapsibleItem(this.toolbox);
      let newItemStub = setupSetSelected(this.toolbox, newItem, newItem);
      sinon.assert.calledWith(newItemStub, false);
    });
    test('Select collapsible item -> Should select item', function() {
      let newItem = getCollapsibleItem(this.toolbox);
      let newItemStub = setupSetSelected(this.toolbox, null, newItem);
      sinon.assert.calledWith(newItemStub, true);
    });
    test('Select previously selected collapsible item -> Should not deselect', function() {
      let newItem = getCollapsibleItem(this.toolbox);
      let newItemStub = setupSetSelected(this.toolbox, newItem, newItem);
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
      let updateFlyoutStub = sinon.stub(toolbox.flyout_, 'hide');
      const newItem = getNonCollapsibleItem(toolbox);
      toolbox.updateFlyout_(oldItem, newItem);
      sinon.assert.called(updateFlyoutStub);
    }

    test('Select previously selected item -> Should close flyout', function() {
      let newItem = getNonCollapsibleItem(this.toolbox);
      testHideFlyout(this.toolbox, newItem, newItem);
    });
    test('No new item -> Should close flyout', function() {
      testHideFlyout(this.toolbox, null, null);
    });
    test('Select collapsible item -> Should close flyout', function() {
      let newItem = getCollapsibleItem(this.toolbox);
      testHideFlyout(this.toolbox, null, newItem);
    });
    test('Select selectable item -> Should open flyout', function() {
      let showFlyoutstub = sinon.stub(this.toolbox.flyout_, 'show');
      let scrollToStartFlyout = sinon.stub(this.toolbox.flyout_, 'scrollToStart');
      let newItem = getNonCollapsibleItem(this.toolbox);
      this.toolbox.updateFlyout_(null, newItem);
      sinon.assert.called(showFlyoutstub);
      sinon.assert.called(scrollToStartFlyout);
    });
  });

  suite('position', function() {
    setup(function() {
      this.toolbox = getBasicToolbox();
      let metricsStub = sinon.stub(this.toolbox.workspace_, 'getMetrics');
      metricsStub.returns({});
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
      let toolbox = this.toolbox;
      toolbox.HtmlDiv = null;
      toolbox.horizontalLayout_ = true;
      toolbox.position();
      chai.assert.equal(toolbox.height_, 0);
    });
    test('Horizontal toolbox at top -> Should anchor horizontal toolbox to top', function() {
      let toolbox = this.toolbox;
      toolbox.toolboxPosition = Blockly.utils.toolbox.Position.TOP;
      toolbox.horizontalLayout_ = true;
      toolbox.position();
      checkHorizontalToolbox(toolbox);
      chai.assert.equal(toolbox.HtmlDiv.style.top, '0px', 'Check top');
    });
    test('Horizontal toolbox at bottom -> Should anchor horizontal toolbox to bottom', function() {
      let toolbox = this.toolbox;
      toolbox.toolboxPosition = Blockly.utils.toolbox.Position.BOTTOM;
      toolbox.horizontalLayout_ = true;
      toolbox.position();
      checkHorizontalToolbox(toolbox);
      chai.assert.equal(toolbox.HtmlDiv.style.bottom, '0px', 'Check bottom');
    });
    test('Vertical toolbox at right -> Should anchor to right', function() {
      let toolbox = this.toolbox;
      toolbox.toolboxPosition = Blockly.utils.toolbox.Position.RIGHT;
      toolbox.horizontalLayout_ = false;
      toolbox.position();
      chai.assert.equal(toolbox.HtmlDiv.style.right, '0px', 'Check right');
      checkVerticalToolbox(toolbox);
    });
    test('Vertical toolbox at left -> Should anchor to left', function() {
      let toolbox = this.toolbox;
      toolbox.toolboxPosition = Blockly.utils.toolbox.Position.LEFT;
      toolbox.horizontalLayout_ = false;
      toolbox.position();
      chai.assert.equal(toolbox.HtmlDiv.style.left, '0px', 'Check left');
      checkVerticalToolbox(toolbox);
    });
  });

  suite('parseMethods', function() {
    setup(function() {
      this.categoryToolboxJSON = getCategoryJSON();
      this.simpleToolboxJSON = getSimpleJson();
    });

    function checkValue(actual, expected, value) {
      let actualVal = actual[value];
      let expectedVal = expected[value];
      chai.assert.equal(actualVal.toUpperCase(), expectedVal.toUpperCase(), 'Checking value for: ' + value);
    }
    function checkContents(actualContents, expectedContents) {
      chai.assert.equal(actualContents.length, expectedContents.length);
      for (let i = 0; i < actualContents.length; i++) {
        // TODO: Check the values as well as all the keys.
        chai.assert.containsAllKeys(actualContents[i], Object.keys(expectedContents[i]));
      }
    }
    function checkCategory(actual, expected) {
      checkValue(actual, expected, 'kind');
      checkValue(actual, expected, 'name');
      chai.assert.deepEqual(actual['cssconfig'], expected['cssconfig']);
      checkContents(actual.contents, expected.contents);
    }
    function checkCategoryToolbox(actual, expected) {
      let actualContents = actual['contents'];
      let expectedContents = expected['contents'];
      chai.assert.equal(actualContents.length, expectedContents.length);
      for (let i = 0; i < expected.length; i++) {
        checkCategory(actualContents[i], expected[i]);
      }
    }
    function checkSimpleToolbox(actual, expected) {
      checkContents(actual['contents'], expected['contents']);
    }

    suite('parseToolbox', function() {
      test('Category Toolbox: JSON', function() {
        let toolboxDef = Blockly.utils.toolbox.convertToolboxDefToJson(this.categoryToolboxJSON);
        chai.assert.isNotNull(toolboxDef);
        checkCategoryToolbox(toolboxDef, this.categoryToolboxJSON);
      });
      test('Simple Toolbox: JSON', function() {
        let toolboxDef = Blockly.utils.toolbox.convertToolboxDefToJson(this.simpleToolboxJSON);
        chai.assert.isNotNull(toolboxDef);
        checkSimpleToolbox(toolboxDef, this.simpleToolboxJSON);
      });
      test('Category Toolbox: xml', function() {
        let toolboxXml = document.getElementById('toolbox-categories');
        let toolboxDef = Blockly.utils.toolbox.convertToolboxDefToJson(toolboxXml);
        chai.assert.isNotNull(toolboxDef);
        checkCategoryToolbox(toolboxDef, this.categoryToolboxJSON);
      });
      test('Simple Toolbox: xml', function() {
        let toolboxXml = document.getElementById('toolbox-simple');
        let toolboxDef = Blockly.utils.toolbox.convertToolboxDefToJson(toolboxXml);
        chai.assert.isNotNull(toolboxDef);
        checkSimpleToolbox(toolboxDef, this.simpleToolboxJSON);
      });
      test('Simple Toolbox: string', function() {
        let toolbox = '<xml>';
        toolbox += '  <block type="controls_if"></block>';
        toolbox += '  <block type="controls_whileUntil"></block>';
        toolbox += '</xml>';

        let toolboxJson = {
          'contents': [
            {
              'kind': 'block',
              'type': 'controls_if'
            },
            {
              'kind': 'block',
              'type': 'controls_if'
            }
          ]
        };

        let toolboxDef = Blockly.utils.toolbox.convertToolboxDefToJson(toolbox);
        chai.assert.isNotNull(toolboxDef);
        checkSimpleToolbox(toolboxDef, toolboxJson);
      });
      test('Category Toolbox: string', function() {
        let toolbox = '<xml>';
        toolbox += '  <category name="a"></category>';
        toolbox += '  <category name="b"></category>';
        toolbox += '</xml>';

        let toolboxJson = {
          'contents': [
            {
              'kind': 'category',
              'name': 'a'
            },
            {
              'kind': 'category',
              'name': 'b'
            }
          ]
        };

        let toolboxDef = Blockly.utils.toolbox.convertToolboxDefToJson(toolbox);
        chai.assert.isNotNull(toolboxDef);
        checkSimpleToolbox(toolboxDef, toolboxJson);
      });
    });
    suite('parseFlyout', function() {
      test('Array of Nodes', function() {
        let xmlList = getXmlArray();
        let flyoutDef = Blockly.utils.toolbox.convertFlyoutDefToJsonArray(xmlList);
        checkContents(flyoutDef, this.simpleToolboxJSON['contents']);
      });
      test('NodeList', function() {
        let nodeList = document.getElementById('toolbox-simple').childNodes;
        let flyoutDef = Blockly.utils.toolbox.convertFlyoutDefToJsonArray(nodeList);
        checkContents(flyoutDef, this.simpleToolboxJSON['contents']);
      });
      test('List of json', function() {
        let jsonList = this.simpleToolboxJSON['contents'];
        let flyoutDef = Blockly.utils.toolbox.convertFlyoutDefToJsonArray(jsonList);
        checkContents(flyoutDef, this.simpleToolboxJSON['contents']);
      });
      test('Json', function() {
        let flyoutDef = Blockly.utils.toolbox.convertFlyoutDefToJsonArray(this.simpleToolboxJSON);
        checkContents(flyoutDef, this.simpleToolboxJSON['contents']);
      });
    });
  });
  suite('Nested Categories', function() {
    setup(function() {
      this.toolbox = getInjectedToolbox();
    });
    teardown(function() {
      this.toolbox.dispose();
    });
    test('Child categories visible if all ancestors expanded', function() {
      this.toolbox.render(getDeeplyNestedJSON());
      let outerCategory = this.toolbox.contents_[0];
      let middleCategory = this.toolbox.contents_[1];
      let innerCategory = this.toolbox.contents_[2];

      outerCategory.toggleExpanded();
      middleCategory.toggleExpanded();
      innerCategory.show();

      chai.assert.isTrue(innerCategory.isVisible(),
          'All ancestors are expanded, so category should be visible');
    });
    test('Child categories not visible if any ancestor not expanded', function() {
      this.toolbox.render(getDeeplyNestedJSON());
      let middleCategory = this.toolbox.contents_[1];
      let innerCategory = this.toolbox.contents_[2];

      // Don't expand the outermost category
      // Even though the direct parent of inner is expanded, it shouldn't be visible
      // because all ancestor categories need to be visible, not just parent
      middleCategory.toggleExpanded();
      innerCategory.show();

      chai.assert.isFalse(innerCategory.isVisible(),
          'Not all ancestors are expanded, so category should not be visible');
    });
  });
});
