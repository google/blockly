/**
 * @license
 * Copyright 2018 Google LLC
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

function defineThemeTestBlocks() {
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

function undefineThemeTestBlocks() {
  delete Blockly.Blocks['stack_block'];
  delete Blockly.Blocks['row_block'];
}


function createBlockStyles() {
  return {
    "styleOne": {
      "colourPrimary": "colour1",
      "colourSecondary":"colour2",
      "colourTertiary":"colour3"
    }
  };
}

function createMultipleBlockStyles() {
  return {
    "styleOne": {
      "colourPrimary": "colour1",
      "colourSecondary":"colour2",
      "colourTertiary":"colour3"
    },
    "styleTwo": {
      "colourPrimary": "colour1",
      "colourSecondary":"colour2",
      "colourTertiary":"colour3"
    }
  };
}

function test_setAllBlockStyles() {
  var theme = new Blockly.Theme(createBlockStyles());
  stringifyAndCompare(createBlockStyles(), theme.blockStyles_);
  theme.setAllBlockStyles(createMultipleBlockStyles());
  stringifyAndCompare(createMultipleBlockStyles(), theme.blockStyles_);
}

function test_getAllBlockStyles() {
  var theme = new Blockly.Theme(createMultipleBlockStyles());
  var allBlocks = theme.getAllBlockStyles();
  stringifyAndCompare(createMultipleBlockStyles(), allBlocks);

}

function test_getBlockStyles() {
  var theme = new Blockly.Theme(createBlockStyles());
  var blockStyle = theme.getBlockStyle('styleOne');

  stringifyAndCompare(blockStyle, createBlockStyles().styleOne);
}

function test_setBlockStyleUpdate() {
  var theme = new Blockly.Theme(createBlockStyles());
  var blockStyle = createBlockStyles();
  blockStyle.styleOne.colourPrimary = 'somethingElse';

  theme.setBlockStyle('styleOne', blockStyle.styleOne);

  stringifyAndCompare(theme.blockStyles_, blockStyle);
}

function test_setBlockStyleAdd() {
  var theme = new Blockly.Theme(createBlockStyles());
  var blockStyle = createMultipleBlockStyles();

  theme.setBlockStyle('styleTwo', blockStyle.styleTwo);

  stringifyAndCompare(theme.blockStyles_, blockStyle);
}

function test_setTheme() {
  defineThemeTestBlocks();
  var blockStyles = createBlockStyles();
  var workspace = new Blockly.WorkspaceSvg({});
  var blockA = workspace.newBlock('stack_block');
  var blocks = [blockA];

  blockA.setStyle = function() {this.styleName_ = 'styleTwo'};
  var callCount = 1;
  workspace.refreshToolboxSelection = function() {
    return ++callCount;
  };
  blockA.styleName_ = 'styleOne';

  var mockControl_ = setUpMockMethod(Blockly, 'getMainWorkspace', null, [workspace]);

  workspace.setTheme(blockStyles);

  //Checks that the theme was set correctly on Blockly namespace
  stringifyAndCompare(workspace.getTheme(), blockStyles);

  //Checks that the setTheme function was called on the block
  assertEquals(blockA.getStyleName(), 'styleTwo');

  //check that the toolbox refreshed method was called
  assertEquals(workspace.refreshToolboxSelection(), 3);

  assertEquals(Blockly.Events.FIRE_QUEUE_.pop().element, 'theme');

  undefineThemeTestBlocks();

  mockControl_.restore();
}

function stringifyAndCompare(val1, val2) {
  var stringVal1 = JSON.stringify(val1);
  var stringVal2 = JSON.stringify(val2);
  assertEquals(stringVal1, stringVal2);
}
