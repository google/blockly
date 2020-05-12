/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


function getCategoryJSON() {
  return [
    {
      "kind": "CATEGORY",
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
    }];
}

function getSimpleJSON() {
  return [
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
  ];
}

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
