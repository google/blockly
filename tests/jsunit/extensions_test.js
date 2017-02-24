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
  var workspace = new Blockly.Workspace();
  var block;
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

    block = new Blockly.Block(workspace, 'extension_test_block');

    assertEquals(1, numCallsToBefore);
    assertEquals(1, numCallsToAfter);
    assert(block.extendedWithBefore);
    assert(block.extendedWithAfter);
  } finally {
    block && block.dispose();
    workspace.dispose();

    delete Blockly.Extensions.ALL_['extensions_test_before'];
    delete Blockly.Extensions.ALL_['extensions_test_after'];
    delete Blockly.Blocks['extension_test_block'];
  }
}

function test_extension_missing() {
  var workspace = new Blockly.Workspace();
  var block;
  var exceptionWasThrown = false;
  try {
    assertUndefined(Blockly.Extensions.ALL_['missing_extension']);
    Blockly.defineBlocksWithJsonArray([{
      "type": "missing_extension_block",
      "message0": "missing_extension_block",
      "extensions": ["missing_extension"]
    }]);

    block = new Blockly.Block(workspace, 'missing_extension_block');
  } catch (e) {
    // Expected.
    exceptionWasThrown = true;
  } finally {
    block && block.dispose();
    workspace.dispose();
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

  var workspace = new Blockly.Workspace();
  var block;
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

    block = new Blockly.Block(workspace, 'test_parent_tooltip_when_inline');

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
    block && block.dispose();
    workspace.dispose();

    delete Blockly.Blocks['test_parent_tooltip_when_inline'];
    delete Blockly.Blocks['test_parent'];
  }
}

function test_mixin_extension() {
  var TEST_MIXIN = {
    field: 'FIELD',
    method: function() {
      console.log('TEXT_MIXIN method()');
    }
  };

  var workspace = new Blockly.Workspace();
  var block;
  try {
    assertUndefined(Blockly.Extensions.ALL_['mixin_test']);

    // Extension defined before the block type is defined.
    Blockly.Extensions.registerMixin('mixin_test', TEST_MIXIN);
    assert(goog.isFunction(Blockly.Extensions.ALL_['mixin_test']));

    Blockly.defineBlocksWithJsonArray([{
      "type": "test_block_mixin",
      "message0": "test_block_mixin",
      "extensions": ["mixin_test"]
    }]);

    block = new Blockly.Block(workspace, 'test_block_mixin');

    assertEquals(TEST_MIXIN.field, block.field);
    assertEquals(TEST_MIXIN.method, block.method);
  } finally {
    block && block.dispose();
    workspace.dispose();

    delete Blockly.Extensions.ALL_['mixin_test'];
    delete Blockly.Blocks['test_block_mixin'];
  }
}

function test_bad_mixin_overwrites_local_value() {
  var TEST_MIXIN_BAD_INPUTLIST = {
    inputList: 'bad inputList'  // Defined in constructor
  };

  var workspace = new Blockly.Workspace();
  var block;
  try {
    assertUndefined(Blockly.Extensions.ALL_['mixin_bad_inputList']);

    // Extension defined before the block type is defined.
    Blockly.Extensions.registerMixin('mixin_bad_inputList', TEST_MIXIN_BAD_INPUTLIST);
    assert(goog.isFunction(Blockly.Extensions.ALL_['mixin_bad_inputList']));

    Blockly.defineBlocksWithJsonArray([{
      "type": "test_block_bad_inputList",
      "message0": "test_block_bad_inputList",
      "extensions": ["mixin_bad_inputList"]
    }]);

    try {
      block = new Blockly.Block(workspace, 'test_block_bad_inputList');
    } catch (e) {
      // Expected Error
      assert(e.message.indexOf('inputList') >= 0);  // Reference the conflict
      return;
    }
    fail('Expected error when constructing block');
  } finally {
    block && block.dispose();
    workspace.dispose();

    delete Blockly.Extensions.ALL_['mixin_bad_inputList'];
    delete Blockly.Blocks['test_block_bad_inputList'];
  }
}

function test_bad_mixin_overwrites_prototype() {
  var TEST_MIXIN_BAD_COLOUR = {
    colour_: 'bad colour_' // Defined on prototype
  };

  var workspace = new Blockly.Workspace();
  var block;
  try {
    assertUndefined(Blockly.Extensions.ALL_['mixin_bad_colour_']);

    // Extension defined before the block type is defined.
    Blockly.Extensions.registerMixin('mixin_bad_colour_', TEST_MIXIN_BAD_COLOUR);
    assert(goog.isFunction(Blockly.Extensions.ALL_['mixin_bad_colour_']));

    Blockly.defineBlocksWithJsonArray([{
      "type": "test_block_bad_colour",
      "message0": "test_block_bad_colour",
      "extensions": ["mixin_bad_colour_"]
    }]);

    try {
      block = new Blockly.Block(workspace, 'test_block_bad_colour');
    } catch (e) {
      // Expected Error
      assert(e.message.indexOf('colour_') >= 0);  // Reference the conflict
      return;
    }
    fail('Expected error when constructing block');
  } finally {
    block && block.dispose();
    workspace.dispose();

    delete Blockly.Extensions.ALL_['mixin_bad_colour_'];
    delete Blockly.Blocks['test_block_bad_colour'];
  }
}

function test_mutator_mixin() {
  var workspace = new Blockly.Workspace();
  var block;

  try {
    Blockly.defineBlocksWithJsonArray([{
      "type": "mutator_test_block",
      "message0": "mutator_test_block",
      "mutator": "mutator_test"
    }]);

    // Events code calls mutationToDom and expects it to give back a meaningful
    // value.
    Blockly.Events.disable();
    Blockly.Extensions.registerMutator('mutator_test',
      {
        domToMutation: function() {
          return 'domToMutationFn';
        },
        mutationToDom: function() {
          return 'mutationToDomFn';
        },
        compose: function() {
          return 'composeFn';
        },
        decompose: function() {
          return 'decomposeFn';
        }
      });

    block = new Blockly.Block(workspace, 'mutator_test_block');

    // Make sure all of the functions were installed correctly.
    assertEquals(block.domToMutation(), 'domToMutationFn');
    assertEquals(block.mutationToDom(), 'mutationToDomFn');
    assertEquals(block.compose(), 'composeFn');
    assertEquals(block.decompose(), 'decomposeFn');
  } finally {
    if (block) {
      block.dispose();
    }
    workspace.dispose();
    Blockly.Events.enable();
    delete Blockly.Extensions.ALL_['mutator_test'];
  }
}

function test_mutator_mixin_no_dialog() {
  var workspace = new Blockly.Workspace();
  var block;

  try {
    Blockly.defineBlocksWithJsonArray([{
      "type": "mutator_test_block",
      "message0": "mutator_test_block",
      "mutator": "mutator_test"
    }]);

    // Events code calls mutationToDom and expects it to give back a meaningful
    // value.
    Blockly.Events.disable();
    assertUndefined(Blockly.Extensions.ALL_['mutator_test']);
    Blockly.Extensions.registerMutator('mutator_test',
      {
        domToMutation: function() {
          return 'domToMutationFn';
        },
        mutationToDom: function() {
          return 'mutationToDomFn';
        }
      });

    block = new Blockly.Block(workspace, 'mutator_test_block');

    // Make sure all of the functions were installed correctly.
    assertEquals(block.domToMutation(), 'domToMutationFn');
    assertEquals(block.mutationToDom(), 'mutationToDomFn');
    assertFalse(block.hasOwnProperty('compose'));
    assertFalse(block.hasOwnProperty('decompose'));
  } finally {
    if (block) {
      block.dispose();
    }
    workspace.dispose();
    Blockly.Events.enable();
    delete Blockly.Extensions.ALL_['mutator_test'];
  }
}

// Explicitly check all four things that could be missing.
function test_mutator_mixin_no_decompose_fails() {
  var exceptionWasThrown = false;
  try {
    Blockly.Extensions.registerMutator('mutator_test',
      {
        domToMutation: function() {
          return 'domToMutationFn';
        },
        mutationToDom: function() {
          return 'mutationToDomFn';
        },
        compose: function() {
          return 'composeFn';
        }
      });
  } catch (e) {
    // Expected.
    exceptionWasThrown = true;
  } finally {
    delete Blockly.Extensions.ALL_['mutator_test'];
  }
  assertTrue(exceptionWasThrown);
}

function test_mutator_mixin_no_compose_fails() {
  var exceptionWasThrown = false;
  try {
    Blockly.Extensions.registerMutator('mutator_test',
      {
        domToMutation: function() {
          return 'domToMutationFn';
        },
        mutationToDom: function() {
          return 'mutationToDomFn';
        },
        decompose: function() {
          return 'decomposeFn';
        }
      });
  } catch (e) {
    // Expected.
    exceptionWasThrown = true;
  } finally {
    delete Blockly.Extensions.ALL_['mutator_test'];
  }
  assertTrue(exceptionWasThrown);
}

function test_mutator_mixin_no_domToMutation_fails() {
  var exceptionWasThrown = false;
  try {
    Blockly.Extensions.registerMutator('mutator_test',
      {
        mutationToDom: function() {
          return 'mutationToDomFn';
        },
        compose: function() {
          return 'composeFn';
        },
        decompose: function() {
          return 'decomposeFn';
        }
      });
  } catch (e) {
    // Expected.
    exceptionWasThrown = true;
  } finally {
    delete Blockly.Extensions.ALL_['mutator_test'];
  }
  assertTrue(exceptionWasThrown);
}

function test_mutator_mixin_no_mutationToDom_fails() {
  var exceptionWasThrown = false;
  try {
    Blockly.Extensions.registerMutator('mutator_test',
      {
        domToMutation: function() {
          return 'domToMutationFn';
        },
        compose: function() {
          return 'composeFn';
        },
        decompose: function() {
          return 'decomposeFn';
        }
      });
  } catch (e) {
    // Expected.
    exceptionWasThrown = true;
  } finally {
    delete Blockly.Extensions.ALL_['mutator_test'];
  }
  assertTrue(exceptionWasThrown);
}

function test_use_mutator_as_extension_fails() {
  var workspace = new Blockly.Workspace();
  var block;
  var exceptionWasThrown = false;

  try {
    Blockly.defineBlocksWithJsonArray([{
      "type": "mutator_test_block",
      "message0": "mutator_test_block",
      "extensions": ["mutator_test"]
    }]);

    Blockly.Events.disable();
    assertUndefined(Blockly.Extensions.ALL_['mutator_test']);
    Blockly.Extensions.registerMutator('mutator_test',
      {
        domToMutation: function() {
          return 'domToMutationFn';
        },
        mutationToDom: function() {
          return 'mutationToDomFn';
        }
      });

    // Events code calls mutationToDom and expects it to give back a meaningful
    // value.
    block = new Blockly.Block(workspace, 'mutator_test_block');
  } catch (e) {
    // Expected
    exceptionWasThrown = true;
    // Should have failed on apply, not on register.
    assertNotNull(Blockly.Extensions.ALL_['mutator_test']);
  } finally {
    if (block) {
      block.dispose();
    }
    workspace.dispose();
    Blockly.Events.enable();
    delete Blockly.Extensions.ALL_['mutator_test'];
  }
  assertTrue(exceptionWasThrown);
}

function test_use_mutator_mixin_as_extension_fails() {
  var workspace = new Blockly.Workspace();
  var block;
  var exceptionWasThrown = false;

  try {
    Blockly.defineBlocksWithJsonArray([{
      "type": "mutator_test_block",
      "message0": "mutator_test_block",
      "extensions": ["mutator_test"]
    }]);

    // Events code calls mutationToDom and expects it to give back a meaningful
    // value.
    Blockly.Events.disable();
    assertUndefined(Blockly.Extensions.ALL_['mutator_test']);
    Blockly.Extensions.registerMixin('mutator_test',
      {
        domToMutation: function() {
          return 'domToMutationFn';
        },
        mutationToDom: function() {
          return 'mutationToDomFn';
        }
      });

    block = new Blockly.Block(workspace, 'mutator_test_block');
  } catch (e) {
    // Expected
    exceptionWasThrown = true;
    // Should have failed on apply, not on register.
    assertNotNull(Blockly.Extensions.ALL_['mutator_test']);
  } finally {
    if (block) {
      block.dispose();
    }
    workspace.dispose();
    Blockly.Events.enable();
    delete Blockly.Extensions.ALL_['mutator_test'];
  }
  assertTrue(exceptionWasThrown);
}

function test_use_extension_as_mutator_fails() {
  var workspace = new Blockly.Workspace();
  var block;
  var exceptionWasThrown = false;

  try {
    Blockly.defineBlocksWithJsonArray([{
      "type": "mutator_test_block",
      "message0": "mutator_test_block",
      "mutator": ["extensions_test"]
    }]);

    // Events code calls mutationToDom and expects it to give back a meaningful
    // value.
    Blockly.Events.disable();
    assertUndefined(Blockly.Extensions.ALL_['extensions_test']);
    Blockly.Extensions.register('extensions_test', function() {
      return 'extensions_test_fn';
    });

    block = new Blockly.Block(workspace, 'mutator_test_block');
  } catch (e) {
    // Expected
    exceptionWasThrown = true;
    // Should have failed on apply, not on register.
    assertNotNull(Blockly.Extensions.ALL_['extensions_test']);
  } finally {
    if (block) {
      block.dispose();
    }
    workspace.dispose();
    Blockly.Events.enable();
    delete Blockly.Extensions.ALL_['extensions_test'];
  }
  assertTrue(exceptionWasThrown);
}

function test_mutator_mixin_plus_function() {
  var workspace = new Blockly.Workspace();
  var block;
  var fnWasCalled = false;

  try {
    Blockly.defineBlocksWithJsonArray([{
      "type": "mutator_test_block",
      "message0": "mutator_test_block",
      "mutator": ["extensions_test"]
    }]);

    Blockly.Events.disable();
    assertUndefined(Blockly.Extensions.ALL_['extensions_test']);
    Blockly.Extensions.registerMutator('extensions_test',
      {
        domToMutation: function() {
          return 'domToMutationFn';
        },
        mutationToDom: function() {
          return 'mutationToDomFn';
        }
      },
      function() {
        fnWasCalled = true;
      }
    );

    // Events code calls mutationToDom and expects it to give back a meaningful
    // value.
    block = new Blockly.Block(workspace, 'mutator_test_block');
  } finally {
    if (block) {
      block.dispose();
    }
    workspace.dispose();
    Blockly.Events.enable();
    delete Blockly.Extensions.ALL_['extensions_test'];
  }
  assertTrue(fnWasCalled);
}
