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
 * @name Blockly.ShortcutItems
 * @namespace
 */
goog.provide('Blockly.ShortcutItems');

goog.require('Blockly.Gesture');
goog.require('Blockly.ShortcutRegistry');
goog.require('Blockly.utils.KeyCodes');

goog.requireType('Blockly.BlockSvg');
goog.requireType('Blockly.ICopyable');


/**
 * Object holding the names of the default shortcut items.
 * @enum {string}
 */
Blockly.ShortcutItems.names = {
  ESCAPE: 'escape',
  DELETE: 'delete',
  COPY: 'copy',
  CUT: 'cut',
  PASTE: 'paste',
  UNDO: 'undo',
  REDO: 'redo'
};

/** Keyboard shortcut to hide chaff on escape. */
Blockly.ShortcutItems.registerEscape = function() {
  /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  var escapeAction = {
    name: Blockly.ShortcutItems.names.ESCAPE,
    preconditionFn: function(workspace) {
      return !workspace.options.readOnly;
    },
    callback: function() {
      Blockly.hideChaff();
      return true;
    }
  };
  Blockly.ShortcutRegistry.registry.register(escapeAction);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      Blockly.utils.KeyCodes.ESC, escapeAction.name);
};

/** Keyboard shortcut to delete a block on delete or backspace */
Blockly.ShortcutItems.registerDelete = function() {
  /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  var deleteShortcut = {
    name: Blockly.ShortcutItems.names.DELETE,
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
  Blockly.ShortcutRegistry.registry.register(deleteShortcut);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      Blockly.utils.KeyCodes.DELETE, deleteShortcut.name);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      Blockly.utils.KeyCodes.BACKSPACE, deleteShortcut.name);
};

/** Keyboard shortcut to copy a block on ctrl+c, cmd+c, or alt+c. */
Blockly.ShortcutItems.registerCopy = function() {
  /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  var copyShortcut = {
    name: Blockly.ShortcutItems.names.COPY,
    preconditionFn: function(workspace) {
      return !workspace.options.readOnly &&
        !Blockly.Gesture.inProgress() &&
        Blockly.selected &&
        Blockly.selected.isDeletable() &&
        Blockly.selected.isMovable();
    },
    callback: function(workspace, e) {
      // Prevent the default copy behavior, which may beep or otherwise indicate
      // an error due to the lack of a selection.
      e.preventDefault();
      Blockly.hideChaff();
      Blockly.copy(/** @type {!Blockly.ICopyable} */ (Blockly.selected));
      return true;
    }
  };
  Blockly.ShortcutRegistry.registry.register(copyShortcut);

  var ctrlC = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.C, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(ctrlC, copyShortcut.name);

  var altC = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.C, [Blockly.utils.KeyCodes.ALT]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(altC, copyShortcut.name);

  var metaC = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.C, [Blockly.utils.KeyCodes.META]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(metaC, copyShortcut.name);
};

/** Keyboard shortcut to copy and delete a block on ctrl+x, cmd+x, or alt+x. */
Blockly.ShortcutItems.registerCut = function() {
  /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  var cutShortcut = {
    name: Blockly.ShortcutItems.names.CUT,
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

  Blockly.ShortcutRegistry.registry.register(cutShortcut);

  var ctrlX = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.X, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(ctrlX, cutShortcut.name);

  var altX = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.X, [Blockly.utils.KeyCodes.ALT]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(altX, cutShortcut.name);

  var metaX = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.X, [Blockly.utils.KeyCodes.META]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(metaX, cutShortcut.name);
};

/** Keyboard shortcut to paste a block on ctrl+v, cmd+v, or alt+v. */
Blockly.ShortcutItems.registerPaste = function() {
  /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  var pasteShortcut = {
    name: Blockly.ShortcutItems.names.PASTE,
    preconditionFn: function(workspace) {
      return !workspace.options.readOnly && !Blockly.Gesture.inProgress();
    },
    callback: function() {
      return Blockly.paste();
    }
  };

  Blockly.ShortcutRegistry.registry.register(pasteShortcut);

  var ctrlV = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.V, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(ctrlV, pasteShortcut.name);

  var altV = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.V, [Blockly.utils.KeyCodes.ALT]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(altV, pasteShortcut.name);

  var metaV = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.V, [Blockly.utils.KeyCodes.META]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(metaV, pasteShortcut.name);
};

/** Keyboard shortcut to undo the previous action on ctrl+z, cmd+z, or alt+z. */
Blockly.ShortcutItems.registerUndo = function() {
  /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  var undoShortcut = {
    name: Blockly.ShortcutItems.names.UNDO,
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
  Blockly.ShortcutRegistry.registry.register(undoShortcut);

  var ctrlZ = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Z, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(ctrlZ, undoShortcut.name);

  var altZ = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Z, [Blockly.utils.KeyCodes.ALT]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(altZ, undoShortcut.name);

  var metaZ = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Z, [Blockly.utils.KeyCodes.META]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(metaZ, undoShortcut.name);
};

/** Keyboard shortcut to redo the previous action on ctrl+shift+z, cmd+shift+z, or alt+shift+z. */
Blockly.ShortcutItems.registerRedo = function() {
  /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  var redoShortcut = {
    name: Blockly.ShortcutItems.names.REDO,
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
  Blockly.ShortcutRegistry.registry.register(redoShortcut);

  var ctrlShiftZ = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Z,
      [Blockly.utils.KeyCodes.SHIFT, Blockly.utils.KeyCodes.CTRL]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      ctrlShiftZ, redoShortcut.name);

  var altShiftZ = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Z,
      [Blockly.utils.KeyCodes.SHIFT, Blockly.utils.KeyCodes.ALT]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(altShiftZ, redoShortcut.name);

  var metaShiftZ = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Z,
      [Blockly.utils.KeyCodes.SHIFT, Blockly.utils.KeyCodes.META]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      metaShiftZ, redoShortcut.name);

  // Ctrl-y is redo in Windows.  Command-y is never valid on Macs.
  var ctrlY = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.Y, [Blockly.utils.KeyCodes.CTRL]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(ctrlY, redoShortcut.name);
};

/**
 * Registers all default keyboard shortcut item. This should be called once per instance of
 * KeyboardShortcutRegistry.
 * @package
 */
Blockly.ShortcutItems.registerDefaultShortcuts = function() {
  Blockly.ShortcutItems.registerEscape();
  Blockly.ShortcutItems.registerDelete();
  Blockly.ShortcutItems.registerCopy();
  Blockly.ShortcutItems.registerCut();
  Blockly.ShortcutItems.registerPaste();
  Blockly.ShortcutItems.registerUndo();
  Blockly.ShortcutItems.registerRedo();
};

Blockly.ShortcutItems.registerDefaultShortcuts();
