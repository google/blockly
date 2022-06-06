/** @fileoverview Registers default keyboard shortcuts. */

/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Registers default keyboard shortcuts.
 * @namespace Blockly.ShortcutItems
 */
import { BlockSvg } from './block_svg';
import * as clipboard from './clipboard';
import * as common from './common';
import { Gesture } from './gesture';
/* eslint-disable-next-line no-unused-vars */
import { ICopyable } from './interfaces/i_copyable';
import { KeyboardShortcut, ShortcutRegistry } from './shortcut_registry';
import { KeyCodes } from './utils/keycodes';
import { WorkspaceSvg } from './workspace_svg';


/**
 * Object holding the names of the default shortcut items.
 * @alias Blockly.ShortcutItems.names
 */
export enum names {
  ESCAPE = 'escape',
  DELETE = 'delete',
  COPY = 'copy',
  CUT = 'cut',
  PASTE = 'paste',
  UNDO = 'undo',
  REDO = 'redo'
}

/**
 * Keyboard shortcut to hide chaff on escape.
 * @alias Blockly.ShortcutItems.registerEscape
 */
export function registerEscape() {
  const escapeAction: KeyboardShortcut = {
    name: names.ESCAPE,
    preconditionFn(workspace) {
      return !workspace.options.readOnly;
    },
    callback(workspace) {
      // AnyDuringMigration because:  Property 'hideChaff' does not exist on
      // type 'Workspace'.
      (workspace as AnyDuringMigration).hideChaff();
      return true;
    },
  };
  ShortcutRegistry.registry.register(escapeAction);
  ShortcutRegistry.registry.addKeyMapping(KeyCodes.ESC, escapeAction.name);
}

/**
 * Keyboard shortcut to delete a block on delete or backspace
 * @alias Blockly.ShortcutItems.registerDelete
 */
export function registerDelete() {
  const deleteShortcut: KeyboardShortcut = {
    name: names.DELETE,
    preconditionFn(workspace) {
      const selected = common.getSelected();
      return !workspace.options.readOnly && selected && selected.isDeletable();
    },
    callback(workspace, e) {
      // Delete or backspace.
      // Stop the browser from going back to the previous page.
      // Do this first to prevent an error in the delete code from resulting in
      // data loss.
      e.preventDefault();
      // Don't delete while dragging.  Jeez.
      if (Gesture.inProgress()) {
        return false;
      }
      (common.getSelected() as BlockSvg).checkAndDelete();
      return true;
    },
  };
  ShortcutRegistry.registry.register(deleteShortcut);
  ShortcutRegistry.registry.addKeyMapping(KeyCodes.DELETE, deleteShortcut.name);
  ShortcutRegistry.registry.addKeyMapping(
    KeyCodes.BACKSPACE, deleteShortcut.name);
}

/**
 * Keyboard shortcut to copy a block on ctrl+c, cmd+c, or alt+c.
 * @alias Blockly.ShortcutItems.registerCopy
 */
export function registerCopy() {
  const copyShortcut: KeyboardShortcut = {
    name: names.COPY,
    preconditionFn(workspace) {
      const selected = common.getSelected();
      return !workspace.options.readOnly && !Gesture.inProgress() && selected &&
        selected.isDeletable() && selected.isMovable();
    },
    callback(workspace, e) {
      // Prevent the default copy behavior, which may beep or otherwise indicate
      // an error due to the lack of a selection.
      e.preventDefault();
      // AnyDuringMigration because:  Property 'hideChaff' does not exist on
      // type 'Workspace'.
      (workspace as AnyDuringMigration).hideChaff();
      clipboard.copy(common.getSelected() as ICopyable);
      return true;
    },
  };
  ShortcutRegistry.registry.register(copyShortcut);

  const ctrlC = ShortcutRegistry.registry.createSerializedKey(
    KeyCodes.C, [KeyCodes.CTRL]);
  ShortcutRegistry.registry.addKeyMapping(ctrlC, copyShortcut.name);

  const altC =
    ShortcutRegistry.registry.createSerializedKey(KeyCodes.C, [KeyCodes.ALT]);
  ShortcutRegistry.registry.addKeyMapping(altC, copyShortcut.name);

  const metaC = ShortcutRegistry.registry.createSerializedKey(
    KeyCodes.C, [KeyCodes.META]);
  ShortcutRegistry.registry.addKeyMapping(metaC, copyShortcut.name);
}

/**
 * Keyboard shortcut to copy and delete a block on ctrl+x, cmd+x, or alt+x.
 * @alias Blockly.ShortcutItems.registerCut
 */
export function registerCut() {
  const cutShortcut: KeyboardShortcut = {
    name: names.CUT,
    preconditionFn(workspace) {
      const selected = common.getSelected();
      return !!(
        !workspace.options.readOnly && !Gesture.inProgress() && selected &&
        selected instanceof BlockSvg && selected.isDeletable() &&
        selected.isMovable() && !selected.workspace.isFlyout);
    },
    callback() {
      const selected = common.getSelected();
      if (!selected) {
        // Shouldn't happen but appeases the type system
        return false;
      }
      clipboard.copy(selected);
      (selected as BlockSvg).checkAndDelete();
      return true;
    },
  };

  ShortcutRegistry.registry.register(cutShortcut);

  const ctrlX = ShortcutRegistry.registry.createSerializedKey(
    KeyCodes.X, [KeyCodes.CTRL]);
  ShortcutRegistry.registry.addKeyMapping(ctrlX, cutShortcut.name);

  const altX =
    ShortcutRegistry.registry.createSerializedKey(KeyCodes.X, [KeyCodes.ALT]);
  ShortcutRegistry.registry.addKeyMapping(altX, cutShortcut.name);

  const metaX = ShortcutRegistry.registry.createSerializedKey(
    KeyCodes.X, [KeyCodes.META]);
  ShortcutRegistry.registry.addKeyMapping(metaX, cutShortcut.name);
}

/**
 * Keyboard shortcut to paste a block on ctrl+v, cmd+v, or alt+v.
 * @alias Blockly.ShortcutItems.registerPaste
 */
export function registerPaste() {
  const pasteShortcut: KeyboardShortcut = {
    name: names.PASTE,
    preconditionFn(workspace) {
      return !workspace.options.readOnly && !Gesture.inProgress();
    },
    callback() {
      return !!(clipboard.paste());
    },
  };

  ShortcutRegistry.registry.register(pasteShortcut);

  const ctrlV = ShortcutRegistry.registry.createSerializedKey(
    KeyCodes.V, [KeyCodes.CTRL]);
  ShortcutRegistry.registry.addKeyMapping(ctrlV, pasteShortcut.name);

  const altV =
    ShortcutRegistry.registry.createSerializedKey(KeyCodes.V, [KeyCodes.ALT]);
  ShortcutRegistry.registry.addKeyMapping(altV, pasteShortcut.name);

  const metaV = ShortcutRegistry.registry.createSerializedKey(
    KeyCodes.V, [KeyCodes.META]);
  ShortcutRegistry.registry.addKeyMapping(metaV, pasteShortcut.name);
}

/**
 * Keyboard shortcut to undo the previous action on ctrl+z, cmd+z, or alt+z.
 * @alias Blockly.ShortcutItems.registerUndo
 */
export function registerUndo() {
  const undoShortcut: KeyboardShortcut = {
    name: names.UNDO,
    preconditionFn(workspace) {
      return !workspace.options.readOnly && !Gesture.inProgress();
    },
    callback(workspace) {
      // 'z' for undo 'Z' is for redo.
      (workspace as WorkspaceSvg).hideChaff();
      workspace.undo(false);
      return true;
    },
  };
  ShortcutRegistry.registry.register(undoShortcut);

  const ctrlZ = ShortcutRegistry.registry.createSerializedKey(
    KeyCodes.Z, [KeyCodes.CTRL]);
  ShortcutRegistry.registry.addKeyMapping(ctrlZ, undoShortcut.name);

  const altZ =
    ShortcutRegistry.registry.createSerializedKey(KeyCodes.Z, [KeyCodes.ALT]);
  ShortcutRegistry.registry.addKeyMapping(altZ, undoShortcut.name);

  const metaZ = ShortcutRegistry.registry.createSerializedKey(
    KeyCodes.Z, [KeyCodes.META]);
  ShortcutRegistry.registry.addKeyMapping(metaZ, undoShortcut.name);
}

/**
 * Keyboard shortcut to redo the previous action on ctrl+shift+z, cmd+shift+z,
 * or alt+shift+z.
 * @alias Blockly.ShortcutItems.registerRedo
 */
export function registerRedo() {
  const redoShortcut: KeyboardShortcut = {
    name: names.REDO,
    preconditionFn(workspace) {
      return !Gesture.inProgress() && !workspace.options.readOnly;
    },
    callback(workspace) {
      // 'z' for undo 'Z' is for redo.
      (workspace as WorkspaceSvg).hideChaff();
      workspace.undo(true);
      return true;
    },
  };
  ShortcutRegistry.registry.register(redoShortcut);

  const ctrlShiftZ = ShortcutRegistry.registry.createSerializedKey(
    KeyCodes.Z, [KeyCodes.SHIFT, KeyCodes.CTRL]);
  ShortcutRegistry.registry.addKeyMapping(ctrlShiftZ, redoShortcut.name);

  const altShiftZ = ShortcutRegistry.registry.createSerializedKey(
    KeyCodes.Z, [KeyCodes.SHIFT, KeyCodes.ALT]);
  ShortcutRegistry.registry.addKeyMapping(altShiftZ, redoShortcut.name);

  const metaShiftZ = ShortcutRegistry.registry.createSerializedKey(
    KeyCodes.Z, [KeyCodes.SHIFT, KeyCodes.META]);
  ShortcutRegistry.registry.addKeyMapping(metaShiftZ, redoShortcut.name);

  // Ctrl-y is redo in Windows.  Command-y is never valid on Macs.
  const ctrlY = ShortcutRegistry.registry.createSerializedKey(
    KeyCodes.Y, [KeyCodes.CTRL]);
  ShortcutRegistry.registry.addKeyMapping(ctrlY, redoShortcut.name);
}

/**
 * Registers all default keyboard shortcut item. This should be called once per
 * instance of KeyboardShortcutRegistry.
 * @alias Blockly.ShortcutItems.registerDefaultShortcuts
 */
export function registerDefaultShortcuts() {
  registerEscape();
  registerDelete();
  registerCopy();
  registerCut();
  registerPaste();
  registerUndo();
  registerRedo();
}

registerDefaultShortcuts();
