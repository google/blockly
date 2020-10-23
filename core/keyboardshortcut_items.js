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


/**
 * Object holding the names of the default shortcut items.
 * @enum {string}
 */
Blockly.KeyboardShortcutItems.names = {
  ESCAPE: 'escape',
  DELETE: 'delete',
  COPY: 'copy',
  CUT: 'cut',
  PASTE: 'paste',
  UNDO: 'undo',
  REDO: 'redo'
};

/** Keyboard shortcut to hide chaff on escape. */
Blockly.KeyboardShortcutItems.registerEscape = function() {
  /** @type {!Blockly.KeyboardShortcutRegistry.KeyboardShortcut} */
  var escapeAction = {
    name: Blockly.KeyboardShortcutItems.names.ESCAPE,
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

/** Keyboard shortcut to delete a block on delete or backspace */
Blockly.KeyboardShortcutItems.registerDelete = function() {
  /** @type {!Blockly.KeyboardShortcutRegistry.KeyboardShortcut} */
  var deleteShortcut = {
    name: Blockly.KeyboardShortcutItems.names.DELETE,
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
        return false;
      }
      Blockly.deleteBlock(/** @type {!Blockly.BlockSvg} */ (Blockly.selected));
      return true;
    }
  };
  Blockly.KeyboardShortcutRegistry.registry.register(deleteShortcut);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(
      Blockly.utils.KeyCodes.DELETE, deleteShortcut.name);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(
      Blockly.utils.KeyCodes.BACKSPACE, deleteShortcut.name);
};

/** Keyboard shortcut to copy a block on ctrl+c, cmd+c, or alt+c. */
Blockly.KeyboardShortcutItems.registerCopy = function() {
  /** @type {!Blockly.KeyboardShortcutRegistry.KeyboardShortcut} */
  var copyShortcut = {
    name: Blockly.KeyboardShortcutItems.names.COPY,
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
      return true;
    }
  };
  Blockly.KeyboardShortcutRegistry.registry.register(copyShortcut);

  var ctrlC = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.C, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(ctrlC, copyShortcut.name);

  var altC = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.C, [Blockly.utils.KeyCodes.ALT]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(altC, copyShortcut.name);

  var metaC = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.C, [Blockly.utils.KeyCodes.META]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(metaC, copyShortcut.name);
};

/** Keyboard shortcut to copy and delete a block on ctrl+x, cmd+x, or alt+x. */
Blockly.KeyboardShortcutItems.registerCut = function() {
  /** @type {!Blockly.KeyboardShortcutRegistry.KeyboardShortcut} */
  var cutShortcut = {
    name: Blockly.KeyboardShortcutItems.names.CUT,
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
      Blockly.deleteBlock(/** @type {!Blockly.BlockSvg} */ (Blockly.selected));
      return true;
    }
  };

  Blockly.KeyboardShortcutRegistry.registry.register(cutShortcut);

  var ctrlX = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.X, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(ctrlX, cutShortcut.name);

  var altX = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.X, [Blockly.utils.KeyCodes.ALT]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(altX, cutShortcut.name);

  var metaX = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.X, [Blockly.utils.KeyCodes.META]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(metaX, cutShortcut.name);
};

/** Keyboard shortcut to paste a block on ctrl+v, cmd+v, or alt+v. */
Blockly.KeyboardShortcutItems.registerPaste = function() {
  /** @type {!Blockly.KeyboardShortcutRegistry.KeyboardShortcut} */
  var pasteShortcut = {
    name: Blockly.KeyboardShortcutItems.names.PASTE,
    preconditionFn: function(workspace) {
      return !workspace.options.readOnly && !Blockly.Gesture.inProgress();
    },
    callback: function() {
      return Blockly.paste();
    }
  };

  Blockly.KeyboardShortcutRegistry.registry.register(pasteShortcut);

  var ctrlV = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.V, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(ctrlV, pasteShortcut.name);

  var altV = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.V, [Blockly.utils.KeyCodes.ALT]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(altV, pasteShortcut.name);

  var metaV = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.V, [Blockly.utils.KeyCodes.META]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(metaV, pasteShortcut.name);
};

/** Keyboard shortcut to undo the previous action on ctrl+z, cmd+z, or alt+z. */
Blockly.KeyboardShortcutItems.registerUndo = function() {
  /** @type {!Blockly.KeyboardShortcutRegistry.KeyboardShortcut} */
  var undoShortcut = {
    name: Blockly.KeyboardShortcutItems.names.UNDO,
    preconditionFn: function(workspace) {
      return !workspace.options.readOnly &&
        !Blockly.Gesture.inProgress();
    },
    callback: function(workspace) {
      // 'z' for undo 'Z' is for redo.
      Blockly.hideChaff();
      workspace.undo(false);
      return true;
    }
  };
  Blockly.KeyboardShortcutRegistry.registry.register(undoShortcut);

  var ctrlZ = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Z, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(ctrlZ, undoShortcut.name);

  var altZ = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Z, [Blockly.utils.KeyCodes.ALT]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(altZ, undoShortcut.name);

  var metaZ = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Z, [Blockly.utils.KeyCodes.META]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(metaZ, undoShortcut.name);
};

/** Keyboard shortcut to redo the previous action on ctrl+shift+z, cmd+shift+z, or alt+shift+z. */
Blockly.KeyboardShortcutItems.registerRedo = function() {
  /** @type {!Blockly.KeyboardShortcutRegistry.KeyboardShortcut} */
  var redoShortcut = {
    name: Blockly.KeyboardShortcutItems.names.REDO,
    preconditionFn: function(workspace) {
      return !Blockly.Gesture.inProgress() && !workspace.options.readOnly;
    },
    callback: function(workspace) {
      // 'z' for undo 'Z' is for redo.
      Blockly.hideChaff();
      workspace.undo(true);
      return true;
    }
  };
  Blockly.KeyboardShortcutRegistry.registry.register(redoShortcut);

  var ctrlShiftZ = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Z, [Blockly.utils.KeyCodes.SHIFT,
        Blockly.utils.KeyCodes.CTRL]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(ctrlShiftZ, redoShortcut.name);

  var altShiftZ = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Z, [Blockly.utils.KeyCodes.SHIFT,
        Blockly.utils.KeyCodes.ALT]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(altShiftZ, redoShortcut.name);

  var metaShiftZ = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Z, [Blockly.utils.KeyCodes.SHIFT,
        Blockly.utils.KeyCodes.META]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(metaShiftZ, redoShortcut.name);

  // Ctrl-y is redo in Windows.  Command-y is never valid on Macs.
  var ctrlY = Blockly.KeyboardShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Y, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.KeyboardShortcutRegistry.registry.addKeyMapping(ctrlY, redoShortcut.name);
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
