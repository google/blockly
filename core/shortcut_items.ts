/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.ShortcutItems

import {BlockSvg} from './block_svg.js';
import * as clipboard from './clipboard.js';
import * as common from './common.js';
import * as eventUtils from './events/utils.js';
import {Gesture} from './gesture.js';
import {ICopyData, isCopyable} from './interfaces/i_copyable.js';
import {isDeletable} from './interfaces/i_deletable.js';
import {isDraggable} from './interfaces/i_draggable.js';
import {KeyboardShortcut, ShortcutRegistry} from './shortcut_registry.js';
import {Coordinate} from './utils/coordinate.js';
import {KeyCodes} from './utils/keycodes.js';
import {Rect} from './utils/rect.js';
import {WorkspaceSvg} from './workspace_svg.js';

/**
 * Object holding the names of the default shortcut items.
 */
export enum names {
  ESCAPE = 'escape',
  DELETE = 'delete',
  COPY = 'copy',
  CUT = 'cut',
  PASTE = 'paste',
  UNDO = 'undo',
  REDO = 'redo',
}

/**
 * Keyboard shortcut to hide chaff on escape.
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
    keyCodes: [KeyCodes.ESC],
  };
  ShortcutRegistry.registry.register(escapeAction);
}

/**
 * Keyboard shortcut to delete a block on delete or backspace
 */
export function registerDelete() {
  const deleteShortcut: KeyboardShortcut = {
    name: names.DELETE,
    preconditionFn(workspace) {
      const selected = common.getSelected();
      return (
        !workspace.options.readOnly &&
        selected != null &&
        isDeletable(selected) &&
        selected.isDeletable() &&
        !Gesture.inProgress()
      );
    },
    callback(workspace, e) {
      // Delete or backspace.
      // Stop the browser from going back to the previous page.
      // Do this first to prevent an error in the delete code from resulting in
      // data loss.
      e.preventDefault();
      const selected = common.getSelected();
      if (selected instanceof BlockSvg) {
        selected.checkAndDelete();
      } else if (isDeletable(selected) && selected.isDeletable()) {
        eventUtils.setGroup(true);
        selected.dispose();
        eventUtils.setGroup(false);
      }
      return true;
    },
    keyCodes: [KeyCodes.DELETE, KeyCodes.BACKSPACE],
  };
  ShortcutRegistry.registry.register(deleteShortcut);
}

let copyData: ICopyData | null = null;
let copyWorkspace: WorkspaceSvg | null = null;
let copyCoords: Coordinate | null = null;

/**
 * Keyboard shortcut to copy a block on ctrl+c, cmd+c, or alt+c.
 */
export function registerCopy() {
  const ctrlC = ShortcutRegistry.registry.createSerializedKey(KeyCodes.C, [
    KeyCodes.CTRL,
  ]);
  const altC = ShortcutRegistry.registry.createSerializedKey(KeyCodes.C, [
    KeyCodes.ALT,
  ]);
  const metaC = ShortcutRegistry.registry.createSerializedKey(KeyCodes.C, [
    KeyCodes.META,
  ]);

  const copyShortcut: KeyboardShortcut = {
    name: names.COPY,
    preconditionFn(workspace) {
      const selected = common.getSelected();
      return (
        !workspace.options.readOnly &&
        !Gesture.inProgress() &&
        selected != null &&
        isDeletable(selected) &&
        selected.isDeletable() &&
        isDraggable(selected) &&
        selected.isMovable() &&
        isCopyable(selected)
      );
    },
    callback(workspace, e) {
      // Prevent the default copy behavior, which may beep or otherwise indicate
      // an error due to the lack of a selection.
      e.preventDefault();
      workspace.hideChaff();
      const selected = common.getSelected();
      if (!selected || !isCopyable(selected)) return false;
      copyData = selected.toCopyData();
      copyWorkspace =
        selected.workspace instanceof WorkspaceSvg
          ? selected.workspace
          : workspace;
      copyCoords = isDraggable(selected)
        ? selected.getRelativeToSurfaceXY()
        : null;
      return !!copyData;
    },
    keyCodes: [ctrlC, altC, metaC],
  };
  ShortcutRegistry.registry.register(copyShortcut);
}

/**
 * Keyboard shortcut to copy and delete a block on ctrl+x, cmd+x, or alt+x.
 */
export function registerCut() {
  const ctrlX = ShortcutRegistry.registry.createSerializedKey(KeyCodes.X, [
    KeyCodes.CTRL,
  ]);
  const altX = ShortcutRegistry.registry.createSerializedKey(KeyCodes.X, [
    KeyCodes.ALT,
  ]);
  const metaX = ShortcutRegistry.registry.createSerializedKey(KeyCodes.X, [
    KeyCodes.META,
  ]);

  const cutShortcut: KeyboardShortcut = {
    name: names.CUT,
    preconditionFn(workspace) {
      const selected = common.getSelected();
      return (
        !workspace.options.readOnly &&
        !Gesture.inProgress() &&
        selected != null &&
        isDeletable(selected) &&
        selected.isDeletable() &&
        isDraggable(selected) &&
        selected.isMovable() &&
        !selected.workspace!.isFlyout
      );
    },
    callback(workspace) {
      const selected = common.getSelected();

      if (selected instanceof BlockSvg) {
        copyData = selected.toCopyData();
        copyWorkspace = workspace;
        copyCoords = selected.getRelativeToSurfaceXY();
        selected.checkAndDelete();
        return true;
      } else if (
        isDeletable(selected) &&
        selected.isDeletable() &&
        isCopyable(selected)
      ) {
        copyData = selected.toCopyData();
        copyWorkspace = workspace;
        copyCoords = isDraggable(selected)
          ? selected.getRelativeToSurfaceXY()
          : null;
        selected.dispose();
        return true;
      }
      return false;
    },
    keyCodes: [ctrlX, altX, metaX],
  };

  ShortcutRegistry.registry.register(cutShortcut);
}

/**
 * Keyboard shortcut to paste a block on ctrl+v, cmd+v, or alt+v.
 */
export function registerPaste() {
  const ctrlV = ShortcutRegistry.registry.createSerializedKey(KeyCodes.V, [
    KeyCodes.CTRL,
  ]);
  const altV = ShortcutRegistry.registry.createSerializedKey(KeyCodes.V, [
    KeyCodes.ALT,
  ]);
  const metaV = ShortcutRegistry.registry.createSerializedKey(KeyCodes.V, [
    KeyCodes.META,
  ]);

  const pasteShortcut: KeyboardShortcut = {
    name: names.PASTE,
    preconditionFn(workspace) {
      return !workspace.options.readOnly && !Gesture.inProgress();
    },
    callback() {
      if (!copyData || !copyWorkspace) return false;
      if (!copyCoords) {
        // If we don't have location data about the original copyable, let the
        // paster determine position.
        return !!clipboard.paste(copyData, copyWorkspace);
      }

      const {left, top, width, height} = copyWorkspace
        .getMetricsManager()
        .getViewMetrics(true);
      const viewportRect = new Rect(top, top + height, left, left + width);

      if (viewportRect.contains(copyCoords.x, copyCoords.y)) {
        // If the original copyable is inside the viewport, let the paster
        // determine position.
        return !!clipboard.paste(copyData, copyWorkspace);
      }

      // Otherwise, paste in the middle of the viewport.
      const centerCoords = new Coordinate(left + width / 2, top + height / 2);
      return !!clipboard.paste(copyData, copyWorkspace, centerCoords);
    },
    keyCodes: [ctrlV, altV, metaV],
  };

  ShortcutRegistry.registry.register(pasteShortcut);
}

/**
 * Keyboard shortcut to undo the previous action on ctrl+z, cmd+z, or alt+z.
 */
export function registerUndo() {
  const ctrlZ = ShortcutRegistry.registry.createSerializedKey(KeyCodes.Z, [
    KeyCodes.CTRL,
  ]);
  const altZ = ShortcutRegistry.registry.createSerializedKey(KeyCodes.Z, [
    KeyCodes.ALT,
  ]);
  const metaZ = ShortcutRegistry.registry.createSerializedKey(KeyCodes.Z, [
    KeyCodes.META,
  ]);

  const undoShortcut: KeyboardShortcut = {
    name: names.UNDO,
    preconditionFn(workspace) {
      return !workspace.options.readOnly && !Gesture.inProgress();
    },
    callback(workspace, e) {
      // 'z' for undo 'Z' is for redo.
      (workspace as WorkspaceSvg).hideChaff();
      workspace.undo(false);
      e.preventDefault();
      return true;
    },
    keyCodes: [ctrlZ, altZ, metaZ],
  };
  ShortcutRegistry.registry.register(undoShortcut);
}

/**
 * Keyboard shortcut to redo the previous action on ctrl+shift+z, cmd+shift+z,
 * or alt+shift+z.
 */
export function registerRedo() {
  const ctrlShiftZ = ShortcutRegistry.registry.createSerializedKey(KeyCodes.Z, [
    KeyCodes.SHIFT,
    KeyCodes.CTRL,
  ]);
  const altShiftZ = ShortcutRegistry.registry.createSerializedKey(KeyCodes.Z, [
    KeyCodes.SHIFT,
    KeyCodes.ALT,
  ]);
  const metaShiftZ = ShortcutRegistry.registry.createSerializedKey(KeyCodes.Z, [
    KeyCodes.SHIFT,
    KeyCodes.META,
  ]);
  // Ctrl-y is redo in Windows.  Command-y is never valid on Macs.
  const ctrlY = ShortcutRegistry.registry.createSerializedKey(KeyCodes.Y, [
    KeyCodes.CTRL,
  ]);

  const redoShortcut: KeyboardShortcut = {
    name: names.REDO,
    preconditionFn(workspace) {
      return !Gesture.inProgress() && !workspace.options.readOnly;
    },
    callback(workspace, e) {
      // 'z' for undo 'Z' is for redo.
      (workspace as WorkspaceSvg).hideChaff();
      workspace.undo(true);
      e.preventDefault();
      return true;
    },
    keyCodes: [ctrlShiftZ, altShiftZ, metaShiftZ, ctrlY],
  };
  ShortcutRegistry.registry.register(redoShortcut);
}

/**
 * Registers all default keyboard shortcut item. This should be called once per
 * instance of KeyboardShortcutRegistry.
 *
 * @internal
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
