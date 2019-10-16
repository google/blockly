/**
 * @license
 * Copyright 2019 Google LLC
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
 * @fileoverview Standard Block ContextMenu item plugins.
 * @author jollytoad@gmail.com (Mark Gibson)
 */
'use strict';

goog.provide('Blockly.BlockSvg.plugin');

goog.require('Blockly.BlockSvg');
goog.require('Blockly.ContextMenu');
goog.require('Blockly.Plugins');

Blockly.BlockSvg.plugin.duplicateOption = Blockly.ContextMenu.createPlugin(
    Blockly.BlockSvg.CONTEXTMENU_HOOK,
    function(block) {
      return !block.isInFlyout && block.isDeletable() && block.isMovable();
    },
    Blockly.ContextMenu.blockDuplicateOption
);

Blockly.BlockSvg.plugin.commentOption = Blockly.ContextMenu.createPlugin(
    Blockly.BlockSvg.CONTEXTMENU_HOOK,
    function(block) {
      return !block.isInFlyout && block.workspace.options.comments && !block.collapsed_ &&
          block.isEditable();
    },
    Blockly.ContextMenu.blockCommentOption
);

Blockly.BlockSvg.plugin.inlineOption = Blockly.ContextMenu.createPlugin(
    Blockly.BlockSvg.CONTEXTMENU_HOOK,
    function(block) {
      return !block.isInFlyout && block.isMovable() && !block.collapsed_;
    },
    function(block) {
      // Option to make block inline.
      for (var i = 1; i < block.inputList.length; i++) {
        if (block.inputList[i - 1].type != Blockly.NEXT_STATEMENT &&
            block.inputList[i].type != Blockly.NEXT_STATEMENT) {
          // Only display this option if there are two value or dummy inputs
          // next to each other.
          var isInline = block.getInputsInline();
          return {
            text: isInline ? Blockly.Msg['EXTERNAL_INPUTS'] : Blockly.Msg['INLINE_INPUTS'],
            enabled: true,
            callback: function() {
              block.setInputsInline(!isInline);
            }
          };
        }
      }
    }
);

Blockly.BlockSvg.plugin.collapseOption = Blockly.ContextMenu.createPlugin(
    Blockly.BlockSvg.CONTEXTMENU_HOOK,
    function(block) {
      return !block.isInFlyout && block.isMovable() && block.workspace.options.collapse;
    },
    function(block) {
      var isCollapsed = block.collapsed_;
      return {
        text: isCollapsed ? Blockly.Msg['EXPAND_BLOCK'] : Blockly.Msg['COLLAPSE_BLOCK'],
        enabled: true,
        callback: function() {
          block.setCollapsed(!isCollapsed);
        }
      };
    }
);

Blockly.BlockSvg.plugin.disableOption = Blockly.ContextMenu.createPlugin(
    Blockly.BlockSvg.CONTEXTMENU_HOOK,
    function(block) {
      return !block.isInFlyout && block.workspace.options.disable && block.isEditable();
    },
    function(block) {
      var isEnabled = block.isEnabled();
      return {
        text: isEnabled ? Blockly.Msg['DISABLE_BLOCK'] : Blockly.Msg['ENABLE_BLOCK'],
        enabled: !block.getInheritedDisabled(),
        callback: function() {
          var group = Blockly.Events.getGroup();
          if (!group) {
            Blockly.Events.setGroup(true);
          }
          block.setEnabled(!isEnabled);
          if (!group) {
            Blockly.Events.setGroup(false);
          }
        }
      };
    }
);

Blockly.BlockSvg.plugin.deleteOption = Blockly.ContextMenu.createPlugin(
    Blockly.BlockSvg.CONTEXTMENU_HOOK,
    function(block) {
      return !block.isInFlyout && block.isDeletable();
    },
    Blockly.ContextMenu.blockDeleteOption
);

Blockly.BlockSvg.plugin.helpOption = Blockly.ContextMenu.createPlugin(
    Blockly.BlockSvg.CONTEXTMENU_HOOK,
    function() {
      return true;
    },
    Blockly.ContextMenu.blockHelpOption
);
