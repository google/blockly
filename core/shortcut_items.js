/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Registers default keyboard shortcuts.
 */
'use strict';

/**
 * Registers default keyboard shortcuts.
 * @namespace Blockly.ShortcutItems
 */
goog.module('Blockly.ShortcutItems');

const clipboard = goog.require('Blockly.clipboard');
const common = goog.require('Blockly.common');
const {BlockSvg} = goog.require('Blockly.BlockSvg');
const {Gesture} = goog.require('Blockly.Gesture');
/* eslint-disable-next-line no-unused-vars */
const {ICopyable} = goog.requireType('Blockly.ICopyable');
const {KeyCodes} = goog.require('Blockly.utils.KeyCodes');
const {ShortcutRegistry} = goog.require('Blockly.ShortcutRegistry');


/**
 * Object holding the names of the default shortcut items.
 * @enum {string}
 * @alias Blockly.ShortcutItems.names
 */
const names = {
  ESCAPE: 'escape',
  DELETE: 'delete',
  COPY: 'copy',
  CUT: 'cut',
  PASTE: 'paste',
  UNDO: 'undo',
  REDO: 'redo',
};
exports.names = names;

/**
 * Keyboard shortcut to hide chaff on escape.
 * @alias Blockly.ShortcutItems.registerEscape
 */
const registerEscape = function() {
  /** @type {!ShortcutRegistry.KeyboardShortcut} */
  const escapeAction = {
    name: names.ESCAPE,
    preconditionFn: function(workspace) {
      return !workspace.options.readOnly;
    },
    callback: function(workspace) {
      workspace.hideChaff();
      return true;
    },
    keyCodes: [KeyCodes.ESC],
  };
  ShortcutRegistry.registry.register(escapeAction);
};
exports.registerEscape = registerEscape;

/**
 * Keyboard shortcut to delete a block on delete or backspace
 * @alias Blockly.ShortcutItems.registerDelete
 */
const registerDelete = function() {
  /** @type {!ShortcutRegistry.KeyboardShortcut} */
  const deleteShortcut = {
    name: names.DELETE,
    preconditionFn: function(workspace) {
      const selected = common.getSelected();
      return !workspace.options.readOnly && selected && selected.isDeletable();
    },
    callback: function(workspace, e) {
      // Delete or backspace.
      // Stop the browser from going back to the previous page.
      // Do this first to prevent an error in the delete code from resulting in
      // data loss.
      e.preventDefault();
      // Don't delete while dragging.  Jeez.
      if (Gesture.inProgress()) {
        return false;
      }
      (/** @type {!BlockSvg} */ (common.getSelected())).checkAndDelete();
      return true;
    },
    keyCodes: [KeyCodes.DELETE, KeyCodes.BACKSPACE],
  };
  ShortcutRegistry.registry.register(deleteShortcut);
};
exports.registerDelete = registerDelete;

/**
 * Keyboard shortcut to copy a block on ctrl+c, cmd+c, or alt+c.
 * @alias Blockly.ShortcutItems.registerCopy
 */
const registerCopy = function() {
  const ctrlC = ShortcutRegistry.registry.createSerializedKey(
      KeyCodes.C, [KeyCodes.CTRL]);
  const altC =
      ShortcutRegistry.registry.createSerializedKey(KeyCodes.C, [KeyCodes.ALT]);
  const metaC = ShortcutRegistry.registry.createSerializedKey(
      KeyCodes.C, [KeyCodes.META]);

  /** @type {!ShortcutRegistry.KeyboardShortcut} */
  const copyShortcut = {
    name: names.COPY,
    preconditionFn: function(workspace) {
      const selected = common.getSelected();
      return !workspace.options.readOnly && !Gesture.inProgress() && selected &&
          selected.isDeletable() && selected.isMovable();
    },
    callback: function(workspace, e) {
      // Prevent the default copy behavior, which may beep or otherwise indicate
      // an error due to the lack of a selection.
      e.preventDefault();
      workspace.hideChaff();
      clipboard.copy(/** @type {!ICopyable} */ (common.getSelected()));
      return true;
    },
    keyCodes: [ctrlC, altC, metaC],
  };
  ShortcutRegistry.registry.register(copyShortcut);
};
exports.registerCopy = registerCopy;

/**
 * Keyboard shortcut to copy and delete a block on ctrl+x, cmd+x, or alt+x.
 * @alias Blockly.ShortcutItems.registerCut
 */
const registerCut = function() {
  const ctrlX = ShortcutRegistry.registry.createSerializedKey(
      KeyCodes.X, [KeyCodes.CTRL]);
  const altX =
      ShortcutRegistry.registry.createSerializedKey(KeyCodes.X, [KeyCodes.ALT]);
  const metaX = ShortcutRegistry.registry.createSerializedKey(
      KeyCodes.X, [KeyCodes.META]);

  /** @type {!ShortcutRegistry.KeyboardShortcut} */
  const cutShortcut = {
    name: names.CUT,
    preconditionFn: function(workspace) {
      const selected = common.getSelected();
      return !workspace.options.readOnly && !Gesture.inProgress() && selected &&
          selected instanceof BlockSvg && selected.isDeletable() &&
          selected.isMovable() && !selected.workspace.isFlyout;
    },
    callback: function() {
      const selected = common.getSelected();
      if (!selected) {
        // Shouldn't happen but appeases the type system
        return false;
      }
      clipboard.copy(selected);
      (/** @type {!BlockSvg} */ (selected)).checkAndDelete();
      return true;
    },
    keyCodes: [ctrlX, altX, metaX],
  };

  ShortcutRegistry.registry.register(cutShortcut);
};
exports.registerCut = registerCut;

/**
 * Keyboard shortcut to paste a block on ctrl+v, cmd+v, or alt+v.
 * @alias Blockly.ShortcutItems.registerPaste
 */
const registerPaste = function() {
  const ctrlV = ShortcutRegistry.registry.createSerializedKey(
      KeyCodes.V, [KeyCodes.CTRL]);
  const altV =
      ShortcutRegistry.registry.createSerializedKey(KeyCodes.V, [KeyCodes.ALT]);
  const metaV = ShortcutRegistry.registry.createSerializedKey(
      KeyCodes.V, [KeyCodes.META]);

  /** @type {!ShortcutRegistry.KeyboardShortcut} */
  const pasteShortcut = {
    name: names.PASTE,
    preconditionFn: function(workspace) {
      return !workspace.options.readOnly && !Gesture.inProgress();
    },
    callback: function() {
      return clipboard.paste();
    },
    keyCodes: [ctrlV, altV, metaV],
  };

  ShortcutRegistry.registry.register(pasteShortcut);
};
exports.registerPaste = registerPaste;

/**
 * Keyboard shortcut to undo the previous action on ctrl+z, cmd+z, or alt+z.
 * @alias Blockly.ShortcutItems.registerUndo
 */
const registerUndo = function() {
  const ctrlZ = ShortcutRegistry.registry.createSerializedKey(
      KeyCodes.Z, [KeyCodes.CTRL]);
  const altZ =
      ShortcutRegistry.registry.createSerializedKey(KeyCodes.Z, [KeyCodes.ALT]);
  const metaZ = ShortcutRegistry.registry.createSerializedKey(
      KeyCodes.Z, [KeyCodes.META]);

  /** @type {!ShortcutRegistry.KeyboardShortcut} */
  const undoShortcut = {
    name: names.UNDO,
    preconditionFn: function(workspace) {
      return !workspace.options.readOnly && !Gesture.inProgress();
    },
    callback: function(workspace) {
      // 'z' for undo 'Z' is for redo.
      workspace.hideChaff();
      workspace.undo(false);
      return true;
    },
    keyCodes: [ctrlZ, altZ, metaZ],
  };
  ShortcutRegistry.registry.register(undoShortcut);
};
exports.registerUndo = registerUndo;

/**
 * Keyboard shortcut to redo the previous action on ctrl+shift+z, cmd+shift+z,
 * or alt+shift+z.
 * @alias Blockly.ShortcutItems.registerRedo
 */
const registerRedo = function() {
  const ctrlShiftZ = ShortcutRegistry.registry.createSerializedKey(
      KeyCodes.Z, [KeyCodes.SHIFT, KeyCodes.CTRL]);
  const altShiftZ = ShortcutRegistry.registry.createSerializedKey(
      KeyCodes.Z, [KeyCodes.SHIFT, KeyCodes.ALT]);
  const metaShiftZ = ShortcutRegistry.registry.createSerializedKey(
      KeyCodes.Z, [KeyCodes.SHIFT, KeyCodes.META]);
  // Ctrl-y is redo in Windows.  Command-y is never valid on Macs.
  const ctrlY = ShortcutRegistry.registry.createSerializedKey(
      KeyCodes.Y, [KeyCodes.CTRL]);

  /** @type {!ShortcutRegistry.KeyboardShortcut} */
  const redoShortcut = {
    name: names.REDO,
    preconditionFn: function(workspace) {
      return !Gesture.inProgress() && !workspace.options.readOnly;
    },
    callback: function(workspace) {
      // 'z' for undo 'Z' is for redo.
      workspace.hideChaff();
      workspace.undo(true);
      return true;
    },
    keyCodes: [ctrlShiftZ, altShiftZ, metaShiftZ, ctrlY],
  };
  ShortcutRegistry.registry.register(redoShortcut);
};
exports.registerRedo = registerRedo;

/**
 * Registers all default keyboard shortcut item. This should be called once per
 * instance of KeyboardShortcutRegistry.
 * @alias Blockly.ShortcutItems.registerDefaultShortcuts
 * @package
 */
const registerDefaultShortcuts = function() {
  registerEscape();
  registerDelete();
  registerCopy();
  registerCut();
  registerPaste();
  registerUndo();
  registerRedo();
};
exports.registerDefaultShortcuts = registerDefaultShortcuts;

registerDefaultShortcuts();
