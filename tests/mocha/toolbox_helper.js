/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Get JSON for a toolbox that contains categories.
 * @return {Blockly.utils.toolbox.ToolboxJson} The array holding information
 *    for a toolbox.
 */
function getCategoryJSON() {
  return {"contents": [
    {
      "kind": "CATEGORY",
      "cssconfig": {
        "container": "something"
      },
      "contents": [
        {
          "kind": "BLOCK",
          "blockxml": '<block type="basic_block"><field name="TEXT">FirstCategory-FirstBlock</field></block>'
        },
        {
          "kind": "BLOCK",
          "blockxml": '<block type="basic_block"><field name="TEXT">FirstCategory-SecondBlock</field></block>'
        }
      ],
      "name": "First"
    },
    {
      "kind": "CATEGORY",
      "contents": [
        {
          "kind": "BLOCK",
          "blockxml": '<block type="basic_block"><field name="TEXT">SecondCategory-FirstBlock</field></block>'
        }
      ],
      "name": "Second"
    }]};
}

/**
 * Get JSON for a simple toolbox.
 * @return {Blockly.utils.toolbox.ToolboxJson} The array holding information
 *    for a simple toolbox.
 */
function getSimpleJSON() {
  return {"contents":[
    {
      "kind":"BLOCK",
      "blockxml": "<block type=\"logic_operation\"></block>",
      "type":"logic_operation"
    },
    {
      "kind":"SEP",
      "gap":"20"
    },
    {
      "kind":"BUTTON",
      "text": "insert",
      "callbackkey": "insertConnectionRows"
    },
    {
      "kind":"LABEL",
      "text":"tooltips"
    }
  ]};
}

/**
 * Get JSON for a toolbox that contains categories that contain categories.
 * @return {Blockly.utils.toolbox.ToolboxJson} The array holding information
 *    for a toolbox.
 */
function getDeeplyNestedJSON() {
  return {"contents": [
    {
      "kind": "CATEGORY",
      "cssconfig": {
        "container": "something"
      },
      "contents": [{
        "kind": "CATEGORY",
        "contents": [{
          "kind": "CATEGORY",
          "contents": [
            {
              "kind": "BLOCK",
              "blockxml": '<block type="basic_block"><field name="TEXT">NestedCategory-FirstBlock</field></block>'
            },
            {
              "kind": "BLOCK",
              "blockxml": '<block type="basic_block"><field name="TEXT">NestedCategory-SecondBlock</field></block>'
            }
          ],
          "name": "NestedCategoryInner"
        }],
        "name": "NestedCategoryMiddle",
      }],
      "name": "NestedCategoryOuter"
    },
    {
      "kind": "CATEGORY",
      "contents": [
        {
          "kind": "BLOCK",
          "blockxml": '<block type="basic_block"><field name="TEXT">SecondCategory-FirstBlock</field></block>'
        }
      ],
      "name": "Second"
    }]};
}

/**
 * Get an array filled with xml elements.
 * @return {Array<Node>} Array holding xml elements for a toolbox.
 */
function getXmlArray() {
  // Need to use HTMLElement instead of Element so parser output is
  // consistent with other tests
  var block = document.createElement('block');
  block.setAttribute('type', 'logic_operation');
  var separator = Blockly.Xml.textToDom('<sep gap="20"></sep>');
  var button = Blockly.Xml.textToDom('<button text="insert" callbackkey="insertConnectionRows"></button>');
  var label = Blockly.Xml.textToDom('<label text="tooltips"></label>');
  return [block, separator, button, label];
}

function getInjectedToolbox() {
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
}

function getBasicToolbox() {
  var workspace = new Blockly.WorkspaceSvg(new Blockly.Options({}));
  var toolbox = new Blockly.Toolbox(workspace);
  toolbox.HtmlDiv = document.createElement('div');
  toolbox.flyout_ = sinon.createStubInstance(Blockly.VerticalFlyout);
  return toolbox;
}

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
