/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 /**
 * @fileoverview Tests for Blockly.Style
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

function defineStyleTestBlocks() {
  Blockly.defineBlocksWithJsonArray([{
    "type": "stack_block",
    "message0": "",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "row_block",
    "message0": "%1",
    "args0": [
      {
        "type": "input_value",
        "name": "INPUT"
      }
    ],
    "output": null
  }]);
};

function undefineStyleTestBlocks() {
  delete Blockly.Blocks['stack_block'];
  delete Blockly.Blocks['row_block'];
}


function createBlockStyles() {
  return {
    "styleOne": {
      "primaryColour": "colour1",
      "secondaryColour":"colour2",
      "tertiaryColour":"colour3"
    }
  };
}

function createMultipleBlockStyles() {
  return {
    "styleOne": {
      "primaryColour": "colour1",
      "secondaryColour":"colour2",
      "tertiaryColour":"colour3"
    },
    "styleTwo": {
      "primaryColour": "colour1",
      "secondaryColour":"colour2",
      "tertiaryColour":"colour3"
    }
  };
}

function test_setAllBlockStyles() {
  var style = new Blockly.Style(createBlockStyles());
  stringifyAndCompare(createBlockStyles(), style.blockStyles_);
  style.setAllBlockStyles(createMultipleBlockStyles());
  stringifyAndCompare(createMultipleBlockStyles(), style.blockStyles_);
}

function test_getAllBlockStyles() {
  var style = new Blockly.Style(createMultipleBlockStyles());
  var allBlocks = style.getAllBlockStyles();
  stringifyAndCompare(createMultipleBlockStyles(), allBlocks);

}

function test_getBlockStyles() {
  var style = new Blockly.Style(createBlockStyles());
  var blockStyle = style.getBlockStyle("styleOne");

  stringifyAndCompare(blockStyle, createBlockStyles().styleOne);
}

function test_setBlockStyleUpdate() {
  var style = new Blockly.Style(createBlockStyles());
  var blockStyle = createBlockStyles();
  blockStyle.styleOne.primaryColour = "somethingElse";

  style.setBlockStyle('styleOne', blockStyle.styleOne);

  stringifyAndCompare(style.blockStyles_, blockStyle);
}

function test_setBlockStyleAdd() {
  var style = new Blockly.Style(createBlockStyles());
  var blockStyle = createMultipleBlockStyles();

  style.setBlockStyle('styleTwo', blockStyle.styleTwo);

  stringifyAndCompare(style.blockStyles_, blockStyle);
}

function test_setStyleForBlockly() {
  defineStyleTestBlocks();
  var blockStyles = createBlockStyles();
  var workspace = new Blockly.WorkspaceSvg({});
  var blockA = workspace.newBlock('stack_block');
  var blocks;

  blockA.setStyle = function(){this.styleName_ = 'styleTwo'};
  var something = 1;
  workspace.refreshToolboxSelection = function(){
    return ++something;
  };
  blockA.styleName_ = 'styleOne';

  blocks = [blockA];

  setUpMockMethod(mockControl_, Blockly, 'getMainWorkspace', null, [workspace]);

  Blockly.setStyle(blockStyles);

  //Checks that the style set correctly on Blockly namespace
  stringifyAndCompare(Blockly.getStyle(), blockStyles);

  //Checks that the setStyle function was called on the block
  assertEquals(blockA.getStyleName(), 'styleTwo');

  //check that the toolbox refreshed method was called
  assertEquals(workspace.refreshToolboxSelection(), 3);

  assertEquals(Blockly.Events.FIRE_QUEUE_.pop().element, "styleChanged");

  undefineStyleTestBlocks();
}

function stringifyAndCompare(val1, val2) {
  var stringVal1 = JSON.stringify(val1);
  var stringVal2 = JSON.stringify(val2);
  assertEquals(stringVal1, stringVal2);
}
