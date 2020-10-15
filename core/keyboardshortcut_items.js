/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Registers default keyboaard shortcuts.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

/**
 * @name Blockly.KeyboardShortcutItems
 * @namespace
 */
goog.provide('Blockly.KeyboardShortcutItems');

Blockly.KeyboardShortcutItems.registerEscape = function() {
  var escapeAction = {
    name: 'escape',
    callback: function() {
      Blockly.hideChaff();
      return true;
    }
  };
  Blockly.KeyboardShortcutRegistry.registry.register(Blockly.utils.KeyCodes.ESC, escapeAction);
};

Blockly.KeyboardShortcutItems.registerBackwards = function() {
  // TODO: If we can register with two separate keys that would be ideal. What should the name be here?
  var backwardsAction = {
    name: 'backwards',
    callback: function(workspace, e) {
      // TODO: Double check that this works.
      e.preventDefault();
      if (Blockly.Gesture.inProgress()) {
        return;
      }
      if (Blockly.selected && Blockly.selected.isDeletable()) {
        Blockly.deleteBlock(Blockly.selected);
      }
    },
    preconditionFn: function(workspace) {
      return !workspace.options.readOnly;
    }
  };
  Blockly.KeyboardShortcutRegistry.registry.register(Blockly.utils.KeyCodes.BACKSPACE, backwardsAction);
};

Blockly.KeyboardShortcutItems.registerDelete = function() {
  // TODO: If we can register with two separate keys that would be ideal. What should the name be here?
  var deleteAction = {
    name: 'delete',
    callback: function(workspace, e) {
      // TODO: Double check that this works.
      e.preventDefault();
      if (Blockly.Gesture.inProgress()) {
        return;
      }
      if (Blockly.selected && Blockly.selected.isDeletable()) {
        Blockly.deleteBlock(Blockly.selected);
      }
    },
    preconditionFn: function(workspace) {
      return !workspace.options.readOnly;
    }
  };
  Blockly.KeyboardShortcutRegistry.registry.register(Blockly.utils.KeyCodes.DELETE, deleteAction);
};

Blockly.KeyboardShortcutItems.registerCopy = function() {
  var copyAction = {
    name: 'copy',
    callback: function() {
      Blockly.hideChaff();
      Blockly.copy_(Blockly.selected);
    },
    preconditionFn: function(workspace) {
      return !Blockly.Gesture.inProgress() &&
        Blockly.selected &&
        Blockly.selected.isDeletable() &&
        Blockly.selected.isMovable() &&
        !workspace.options.readOnly;
    }
  };
  var ctrlKeyCode = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.C, [Blockly.KeyboardShortcutRegistry.modifierKeys.CONTROL]);
  Blockly.KeyboardShortcutRegistry.registry.register(ctrlKeyCode, copyAction);
  var altKeyCode = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.C, [Blockly.KeyboardShortcutRegistry.modifierKeys.ALT]);
  Blockly.KeyboardShortcutRegistry.registry.register(altKeyCode, copyAction);
  var metaKeyCode = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.C, [Blockly.KeyboardShortcutRegistry.modifierKeys.META]);
  Blockly.KeyboardShortcutRegistry.registry.register(metaKeyCode, copyAction);
};

Blockly.KeyboardShortcutItems.registerCut = function() {
  var cutAction = {
    name: 'cut',
    callback: function() {
      Blockly.copy_(Blockly.selected);
      Blockly.deleteBlock(Blockly.selected);
    },
    preconditionFn: function(workspace) {
      return !Blockly.Gesture.inProgress() && Blockly.selected &&
        Blockly.selected.isDeletable() &&
        Blockly.selected.isMovable() &&
        !Blockly.selected.workspace.isFlyout &&
        !workspace.options.readOnly;
    }
  };
  var ctrlKeyCode = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.X, [Blockly.KeyboardShortcutRegistry.modifierKeys.CONTROL]);
  Blockly.KeyboardShortcutRegistry.registry.register(ctrlKeyCode, cutAction);
  var altKeyCode = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.X, [Blockly.KeyboardShortcutRegistry.modifierKeys.ALT]);
  Blockly.KeyboardShortcutRegistry.registry.register(altKeyCode, cutAction);
  var metaKeyCode = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.X, [Blockly.KeyboardShortcutRegistry.modifierKeys.META]);
  Blockly.KeyboardShortcutRegistry.registry.register(metaKeyCode, cutAction);
};

Blockly.KeyboardShortcutItems.registerPaste = function() {
  var pasteAction = {
    name: 'paste',
    callback: function() {
      // Pasting always pastes to the main workspace, even if the copy
      // started in a flyout workspace.
      var workspace = Blockly.clipboardSource_;
      if (workspace.isFlyout) {
        workspace = workspace.targetWorkspace;
      }
      if (Blockly.clipboardTypeCounts_ &&
          workspace.isCapacityAvailable(Blockly.clipboardTypeCounts_)) {
        Blockly.Events.setGroup(true);
        workspace.paste(Blockly.clipboardXml_);
        Blockly.Events.setGroup(false);
      }
    },
    preconditionFn: function(workspace) {
      // TODO: should this Blockly.Gesture.inProgress go inside onKeyDown??
      return !Blockly.Gesture.inProgress() &&
        Blockly.clipboardXml_ &&
        !workspace.options.readOnly;
    }
  };
  var ctrlKeyCode = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.V, [Blockly.KeyboardShortcutRegistry.modifierKeys.CONTROL]);
  Blockly.KeyboardShortcutRegistry.registry.register(ctrlKeyCode, pasteAction);
  var altKeyCode = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.V, [Blockly.KeyboardShortcutRegistry.modifierKeys.ALT]);
  Blockly.KeyboardShortcutRegistry.registry.register(altKeyCode, pasteAction);
  var metaKeyCode = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.V, [Blockly.KeyboardShortcutRegistry.modifierKeys.META]);
  Blockly.KeyboardShortcutRegistry.registry.register(metaKeyCode, pasteAction);
};


Blockly.KeyboardShortcutItems.registerUndo = function() {
  var undoAction = {
    name: 'paste',
    callback: function(workspace, e) {
      // 'z' for undo 'Z' is for redo.
      Blockly.hideChaff();
      workspace.undo(false);
    },
    preconditionFn: function(workspace) {
      // TODO: should this Blockly.Gesture.inProgress go inside onKeyDown??
      return !Blockly.Gesture.inProgress() && !workspace.options.readOnly;
    }
  };
  var ctrlKeyCode = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Z, [Blockly.KeyboardShortcutRegistry.modifierKeys.CONTROL]);
  Blockly.KeyboardShortcutRegistry.registry.register(ctrlKeyCode, undoAction);
  var altKeyCode = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Z, [Blockly.KeyboardShortcutRegistry.modifierKeys.ALT]);
  Blockly.KeyboardShortcutRegistry.registry.register(altKeyCode, undoAction);
  var metaKeyCode = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Z, [Blockly.KeyboardShortcutRegistry.modifierKeys.META]);
  Blockly.KeyboardShortcutRegistry.registry.register(metaKeyCode, undoAction);
};

Blockly.KeyboardShortcutItems.registerRedo = function() {
  var redoAction = {
    name: 'redo',
    callback: function(workspace, e) {
      // 'z' for undo 'Z' is for redo.
      Blockly.hideChaff();
      workspace.undo(true);
    },
    preconditionFn: function(workspace) {
      return !Blockly.Gesture.inProgress() && !workspace.options.readOnly;
    }
  };
  var ctrlKeyCode = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Z, [Blockly.KeyboardShortcutRegistry.modifierKeys.SHIFT,
        Blockly.KeyboardShortcutRegistry.modifierKeys.CONTROL]);
  Blockly.KeyboardShortcutRegistry.registry.register(ctrlKeyCode, redoAction);
  var altKeyCode = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Z, [Blockly.KeyboardShortcutRegistry.modifierKeys.SHIFT,
        Blockly.KeyboardShortcutRegistry.modifierKeys.ALT]);
  Blockly.KeyboardShortcutRegistry.registry.register(altKeyCode, redoAction);
  var metaKeyCode = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Z, [Blockly.KeyboardShortcutRegistry.modifierKeys.SHIFT,
        Blockly.KeyboardShortcutRegistry.modifierKeys.META]);
  Blockly.KeyboardShortcutRegistry.registry.register(metaKeyCode, redoAction);
};

Blockly.KeyboardShortcutItems.registerWindowsRedo = function() {
  var windowsRedoAction = {
    name: 'windowsRedo',
    callback: function(workspace) {
      // 'z' for undo 'Z' is for redo.
      Blockly.hideChaff();
      workspace.undo(true);
    },
    preconditionFn: function(workspace) {
      // TODO: should this Blockly.Gesture.inProgress go inside onKeyDown??
      return !Blockly.Gesture.inProgress() && !workspace.options.readOnly;
    }
  };
  var ctrlKeyCode = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Y, [Blockly.KeyboardShortcutRegistry.modifierKeys.CONTROL]);
  Blockly.KeyboardShortcutRegistry.registry.register(ctrlKeyCode, windowsRedoAction);
};

/**
 *
 * @package
 */
Blockly.KeyboardShortcutItems.registerDefaultShortcuts = function() {
  Blockly.KeyboardShortcutItems.registerEscape();
  Blockly.KeyboardShortcutItems.registerBackwards();
  Blockly.KeyboardShortcutItems.registerDelete();
  Blockly.KeyboardShortcutItems.registerCopy();
  Blockly.KeyboardShortcutItems.registerCut();
  Blockly.KeyboardShortcutItems.registerPaste();
  Blockly.KeyboardShortcutItems.registerUndo();
  Blockly.KeyboardShortcutItems.registerRedo();
  Blockly.KeyboardShortcutItems.registerWindowsRedo();
};
