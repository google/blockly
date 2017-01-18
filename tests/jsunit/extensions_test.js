/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
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
 * @fileoverview Tests for Blockly.Extensions
 * @author Anm@anm.me (Andrew n marshall)
 */
'use strict';

function test_extension() {
  try {
    assertUndefined(Blockly.Extensions.ALL_['extensions_test']);

    var numCallsToBefore = 0;
    var numCallsToAfter = 0;

    // Extension defined before the block type is defined.
    Blockly.Extensions.register('extensions_test_before', function () {
      numCallsToBefore++;
      this.extendedWithBefore = true;
    });

    Blockly.defineBlocksWithJsonArray([{
      "type": "extension_test_block",
      "message0": "extension_test_block",
      "extensions": ["extensions_test_before", "extensions_test_after"]
    }]);

    // Extension defined after the block type (but before instantiation).
    Blockly.Extensions.register('extensions_test_after', function () {
      numCallsToAfter++;
      this.extendedWithAfter = true;
    });

    assert(goog.isFunction(Blockly.Extensions.ALL_['extensions_test_before']));
    assert(goog.isFunction(Blockly.Extensions.ALL_['extensions_test_after']));
    assertEquals(0, numCallsToBefore);
    assertEquals(0, numCallsToAfter);

    var workspace = new Blockly.Workspace();
    var block = new Blockly.Block(workspace, 'extension_test_block');

    assertEquals(1, numCallsToBefore);
    assertEquals(1, numCallsToAfter);
    assert(block.extendedWithBefore);
    assert(block.extendedWithAfter);
 } finally {
    delete Blockly.Extensions.ALL_['extensions_test_before'];
    delete Blockly.Extensions.ALL_['extensions_test_after'];
    delete Blockly.Blocks['extension_test_block'];
  }
}

function test_extension_missing() {
  var exceptionWasThrown = false;
  try {
    assertUndefined(Blockly.Extensions.ALL_['missing_extension']);
    Blockly.defineBlocksWithJsonArray([{
      "type": "missing_extension_block",
      "message0": "missing_extension_block",
      "extensions": ["missing_extension"]
    }]);

    var workspace = new Blockly.Workspace();
    var block = new Blockly.Block(workspace, 'missing_extension_block');
  } catch (e) {
    // Expected.
    exceptionWasThrown = true;
  } finally {
    delete Blockly.Blocks['missing_extension_block'];
  }
  assert(exceptionWasThrown);
}

function test_extension_not_a_function() {
  var exceptionWasThrown = false;
  try {
    assertUndefined(Blockly.Extensions.ALL_['extension_just_a_string']);
    Blockly.Extensions.register('extension_just_a_string', 'extension_just_a_string');
  } catch (e) {
    // Expected.
    exceptionWasThrown = true;
  } finally {
    delete Blockly.Extensions.ALL_['extension_just_a_string'];
  }
  assert(exceptionWasThrown);

  var exceptionWasThrown = false;
  try {
    assertUndefined(Blockly.Extensions.ALL_['extension_is_null']);
    Blockly.Extensions.register('extension_is_null', null);
  } catch (e) {
    // Expected.
    exceptionWasThrown = true;
  } finally {
    delete Blockly.Extensions.ALL_['extension_is_null'];
  }
  assert(exceptionWasThrown);

  var exceptionWasThrown = false;
  try {
    assertUndefined(Blockly.Extensions.ALL_['extension_is_undefined']);
    Blockly.Extensions.register('extension_is_undefined');
  } catch (e) {
    // Expected.
    exceptionWasThrown = true;
  } finally {
    delete Blockly.Extensions.ALL_['extension_is_undefined'];
  }
  assert(exceptionWasThrown);
}

function test_parent_tooltip_when_inline() {
  var defaultTooltip = "defaultTooltip";
  var parentTooltip = "parentTooltip";
  try {
    Blockly.defineBlocksWithJsonArray([
      {
        "type": "test_parent_tooltip_when_inline",
        "message0": "test_parent_tooltip_when_inline",
        "output": true,
        "tooltip": defaultTooltip,
        "extensions": ["parent_tooltip_when_inline"]
      },
      {
        "type": "test_parent",
        "message0": "%1",
        "args0": [
          {
            "type": "input_value",
            "name": "INPUT"
          }
        ],
        "tooltip": parentTooltip
      }
    ]);

    var workspace = new Blockly.Workspace();
    var block = new Blockly.Block(workspace, 'test_parent_tooltip_when_inline');

    // Tooltip is dynamic after extension initialization.
    assert(goog.isFunction(block.tooltip));
    assertEquals(block.tooltip(), defaultTooltip);

    // Tooltip is normal before connected to parent.
    var parent = new Blockly.Block(workspace, 'test_parent');
    assertEquals(parent.tooltip, parentTooltip);
    assertFalse(!!parent.inputsInline);

    // Tooltip is normal when parent is not inline.
    parent.getInput('INPUT').connection.connect(block.outputConnection);
    assertEquals(block.getParent(), parent);
    assertEquals(block.tooltip(), defaultTooltip);

    // Tooltip is parent's when parent is inline.
    parent.setInputsInline(true);
    assertEquals(block.tooltip(), parentTooltip);

    // Tooltip revert when disconnected.
    parent.getInput('INPUT').connection.disconnect();
    assert(!block.getParent());
    assertEquals(block.tooltip(), defaultTooltip);
  } finally {
    delete Blockly.Blocks['test_parent_tooltip_when_inline'];
    delete Blockly.Blocks['test_parent'];
  }
}