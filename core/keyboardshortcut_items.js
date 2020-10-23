/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Registers default keyboard shortcuts.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

/**
 * @name Blockly.KeyboardShortcutItems
 * @namespace
 */
goog.provide('Blockly.KeyboardShortcutItems');

goog.require('Blockly.utils.KeyCodes');


/** Keyboard shortcut to hide chaff on escape. */
Blockly.KeyboardShortcutItems.registerEscape = function() {
  var escapeAction = {
    name: 'escape',
    preconditionFn: function(workspace) {
      return !workspace.options.readOnly;
    },
    callback: function() {
      Blockly.hideChaff();
      return true;
    }
    // TODO: Add meta data for keyboard shortcuts menu.
  };
  Blockly.KeyboardShortcutRegistry.registry.register(escapeAction);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(
      Blockly.utils.KeyCodes.ESC, escapeAction.name);
};

/** Keyboard shortcut to delete a block on delete or workspace */
Blockly.KeyboardShortcutItems.registerDelete = function() {
  var deleteAction = {
    name: 'delete',
    preconditionFn: function(workspace) {
      return !workspace.options.readOnly &&
          Blockly.selected &&
          Blockly.selected.isDeletable();
    },
    callback: function(workspace, e) {
      // Delete or backspace.
      // Stop the browser from going back to the previous page.
      // Do this first to prevent an error in the delete code from resulting in
      // data loss.
      e.preventDefault();
      // Don't delete while dragging.  Jeez.
      if (Blockly.Gesture.inProgress()) {
        return;
      }
      // TODO: This is still weird.
      Blockly.deleteBlock(/** @type {!Blockly.BlockSvg} */ (Blockly.selected));
    }
  };
  Blockly.KeyboardShortcutRegistry.registry.register(deleteAction);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(
      Blockly.utils.KeyCodes.DELETE, deleteAction.name);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(
      Blockly.utils.KeyCodes.BACKSPACE, deleteAction.name);
};

/** Keyboard shortcut to copy a block on Ctrl + c, Cmd + c, or Alt + c. */
Blockly.KeyboardShortcutItems.registerCopy = function() {
  var copyAction = {
    name: 'copy',
    preconditionFn: function(workspace) {
      return !workspace.options.readOnly &&
        !Blockly.Gesture.inProgress() &&
        Blockly.selected &&
        Blockly.selected.isDeletable() &&
        Blockly.selected.isMovable();
    },
    callback: function() {
      Blockly.hideChaff();
      Blockly.copy(/** @type {!Blockly.ICopyable} */ (Blockly.selected));
    }
  };
  Blockly.KeyboardShortcutRegistry.registry.register(copyAction);

  var ctrlC = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.C, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(ctrlC, copyAction.name);

  var altC = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.C, [Blockly.utils.KeyCodes.ALT]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(altC, copyAction.name);

  var metaC = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.C, [Blockly.utils.KeyCodes.META]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(metaC, copyAction.name);
};

/** Keyboard shortcut to copy and delete a block on Ctrl + x, Cmd + x, or Alt + x. */
Blockly.KeyboardShortcutItems.registerCut = function() {
  var cutAction = {
    name: 'cut',
    preconditionFn: function(workspace) {
      return !workspace.options.readOnly &&
        !Blockly.Gesture.inProgress() &&
        Blockly.selected &&
        Blockly.selected.isDeletable() &&
        Blockly.selected.isMovable() &&
        !Blockly.selected.workspace.isFlyout;
    },
    callback: function() {
      Blockly.copy(/** @type {!Blockly.ICopyable} */ (Blockly.selected));
      // TODO: This is a bit weird. Why is this not of type block?
      Blockly.deleteBlock(/** @type {!Blockly.BlockSvg} */ (Blockly.selected));
    }
  };

  Blockly.KeyboardShortcutRegistry.registry.register(cutAction);

  var ctrlX = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.X, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(ctrlX, cutAction.name);

  var altX = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.X, [Blockly.utils.KeyCodes.ALT]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(altX, cutAction.name);

  var metaX = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.X, [Blockly.utils.KeyCodes.META]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(metaX, cutAction.name);
};

/** Keyboard shortcut to paste a block on Ctrl + v, Cmd + v, or Alt + v. */
Blockly.KeyboardShortcutItems.registerPaste = function() {
  var pasteAction = {
    name: 'paste',
    preconditionFn: function(workspace) {
      return !workspace.options.readOnly &&
        !Blockly.Gesture.inProgress();
    },
    callback: function() {
      return Blockly.paste();
    }
  };

  Blockly.KeyboardShortcutRegistry.registry.register(pasteAction);

  var ctrlV = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.V, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(ctrlV, pasteAction.name);

  var altV = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.V, [Blockly.utils.KeyCodes.ALT]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(altV, pasteAction.name);

  var metaV = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.V, [Blockly.utils.KeyCodes.META]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(metaV, pasteAction.name);
};

/** Keyboard shortcut to undo the previous action on Ctrl + z, Cmd + z, or Alt + z. */
Blockly.KeyboardShortcutItems.registerUndo = function() {
  var undoAction = {
    name: 'undo',
    preconditionFn: function(workspace) {
      return !workspace.options.readOnly &&
        !Blockly.Gesture.inProgress();
    },
    callback: function(workspace) {
      // 'z' for undo 'Z' is for redo.
      Blockly.hideChaff();
      workspace.undo(false);
    }
  };
  Blockly.KeyboardShortcutRegistry.registry.register(undoAction);

  var ctrlZ = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Z, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(ctrlZ, undoAction.name);

  var altZ = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Z, [Blockly.utils.KeyCodes.ALT]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(altZ, undoAction.name);

  var metaZ = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Z, [Blockly.utils.KeyCodes.META]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(metaZ, undoAction.name);
};

/** Keyboard shortcut to redo the previous action on ctrl+shift+z, cmd+shift+z, or alt+shift+z. */
Blockly.KeyboardShortcutItems.registerRedo = function() {
  var redoAction = {
    name: 'redo',
    preconditionFn: function(workspace) {
      return !Blockly.Gesture.inProgress() && !workspace.options.readOnly;
    },
    callback: function(workspace) {
      // 'z' for undo 'Z' is for redo.
      Blockly.hideChaff();
      workspace.undo(true);
    }
  };
  Blockly.KeyboardShortcutRegistry.registry.register(redoAction);

  var ctrlShiftZ = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Z, [Blockly.utils.KeyCodes.SHIFT,
        Blockly.utils.KeyCodes.CTRL]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(ctrlShiftZ, redoAction.name);

  var altShiftZ = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Z, [Blockly.utils.KeyCodes.SHIFT,
        Blockly.utils.KeyCodes.ALT]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(altShiftZ, redoAction.name);

  var metaShiftZ = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Z, [Blockly.utils.KeyCodes.SHIFT,
        Blockly.utils.KeyCodes.META]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(metaShiftZ, redoAction.name);

  // Ctrl-y is redo in Windows.  Command-y is never valid on Macs.
  var ctrlY = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Y, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(ctrlY, redoAction.name);
};

/**
 * Registers all default keyboard shortcut item. This should be called once per instance of
 * KeyboardShortcutRegistry.
 * @package
 */
Blockly.KeyboardShortcutItems.registerDefaultShortcuts = function() {
  Blockly.KeyboardShortcutItems.registerEscape();
  Blockly.KeyboardShortcutItems.registerDelete();
  Blockly.KeyboardShortcutItems.registerCopy();
  Blockly.KeyboardShortcutItems.registerCut();
  Blockly.KeyboardShortcutItems.registerPaste();
  Blockly.KeyboardShortcutItems.registerUndo();
  Blockly.KeyboardShortcutItems.registerRedo();
};
