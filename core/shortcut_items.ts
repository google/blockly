/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.ShortcutItems

import {BlockSvg} from './block_svg.js';
import * as clipboard from './clipboard.js';
import * as eventUtils from './events/utils.js';
import {getFocusManager} from './focus_manager.js';
import {Gesture} from './gesture.js';
import {
  ICopyable,
  ICopyData,
  isCopyable as isICopyable,
} from './interfaces/i_copyable.js';
import {
  IDeletable,
  isDeletable as isIDeletable,
} from './interfaces/i_deletable.js';
import {IDraggable, isDraggable} from './interfaces/i_draggable.js';
import {IFocusableNode} from './interfaces/i_focusable_node.js';
import {KeyboardShortcut, ShortcutRegistry} from './shortcut_registry.js';
import {Coordinate} from './utils/coordinate.js';
import {KeyCodes} from './utils/keycodes.js';
import {Rect} from './utils/rect.js';
import * as svgMath from './utils/svg_math.js';
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
      return !workspace.isReadOnly();
    },
    callback(workspace) {
      workspace.hideChaff();
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
    preconditionFn(workspace, scope) {
      const focused = scope.focusedNode;
      return (
        !workspace.isReadOnly() &&
        focused != null &&
        isIDeletable(focused) &&
        focused.isDeletable() &&
        !Gesture.inProgress() &&
        // Don't delete the block if a field editor is open
        !getFocusManager().ephemeralFocusTaken()
      );
    },
    callback(workspace, e, shortcut, scope) {
      // Delete or backspace.
      // Stop the browser from going back to the previous page.
      // Do this first to prevent an error in the delete code from resulting in
      // data loss.
      e.preventDefault();
      const focused = scope.focusedNode;
      if (focused instanceof BlockSvg) {
        focused.checkAndDelete();
      } else if (isIDeletable(focused) && focused.isDeletable()) {
        eventUtils.setGroup(true);
        focused.dispose();
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
 * Determine if a focusable node can be copied.
 *
 * Unfortunately the ICopyable interface doesn't include an isCopyable
 * method, so we must use some other criteria to make the decision.
 * Specifically,
 *
 * - It must be an ICopyable.
 * - So that a pasted copy can be manipluated and/or disposed of, it
 *   must be both an IDraggable and an IDeletable.
 * - Additionally, both .isOwnMovable() and .isOwnDeletable() must return
 *   true (i.e., the copy could be moved and deleted).
 *
 * TODO(#9098): Revise these criteria.  The latter criteria prevents
 * shadow blocks from being copied; additionally, there are likely to
 * be other circumstances were it is desirable to allow movable /
 * copyable copies of a currently-unmovable / -copyable block to be
 * made.
 *
 * @param focused The focused object.
 */
function isCopyable(
  focused: IFocusableNode,
): focused is ICopyable<ICopyData> & IDeletable & IDraggable {
  if (!(focused instanceof BlockSvg)) return false;
  return (
    isICopyable(focused) &&
    isIDeletable(focused) &&
    focused.isOwnDeletable() &&
    isDraggable(focused) &&
    focused.isOwnMovable()
  );
}

/**
 * Determine if a focusable node can be cut.
 *
 * Unfortunately the ICopyable interface doesn't include an isCuttable
 * method, so we must use some other criteria to make the decision.
 * Specifically,
 *
 * - It must be an ICopyable.
 * - So that a pasted copy can be manipluated and/or disposed of, it
 *   must be both an IDraggable and an IDeletable.
 * - Additionally, both .isMovable() and .isDeletable() must return
 *   true (i.e., can currently be moved and deleted). This is the main
 *   difference with isCopyable.
 *
 * TODO(#9098): Revise these criteria.  The latter criteria prevents
 * shadow blocks from being copied; additionally, there are likely to
 * be other circumstances were it is desirable to allow movable /
 * copyable copies of a currently-unmovable / -copyable block to be
 * made.
 *
 * @param focused The focused object.
 */
function isCuttable(focused: IFocusableNode): boolean {
  if (!(focused instanceof BlockSvg)) return false;
  return (
    isICopyable(focused) &&
    isIDeletable(focused) &&
    focused.isDeletable() &&
    isDraggable(focused) &&
    focused.isMovable()
  );
}

/**
 * Keyboard shortcut to copy a block on ctrl+c, cmd+c, or alt+c.
 */
export function registerCopy() {
  const ctrlC = ShortcutRegistry.registry.createSerializedKey(KeyCodes.C, [
    KeyCodes.CTRL,
  ]);
  const metaC = ShortcutRegistry.registry.createSerializedKey(KeyCodes.C, [
    KeyCodes.META,
  ]);

  const copyShortcut: KeyboardShortcut = {
    name: names.COPY,
    preconditionFn(workspace, scope) {
      const focused = scope.focusedNode;
      if (!(focused instanceof BlockSvg)) return false;

      const targetWorkspace = workspace.isFlyout
        ? workspace.targetWorkspace
        : workspace;
      return (
        !!focused &&
        !!targetWorkspace &&
        !targetWorkspace.isReadOnly() &&
        !targetWorkspace.isDragging() &&
        !getFocusManager().ephemeralFocusTaken() &&
        isCopyable(focused)
      );
    },
    callback(workspace, e, shortcut, scope) {
      // Prevent the default copy behavior, which may beep or otherwise indicate
      // an error due to the lack of a selection.
      e.preventDefault();

      const focused = scope.focusedNode;
      if (!focused || !isCopyable(focused)) return false;
      let targetWorkspace: WorkspaceSvg | null =
        focused.workspace instanceof WorkspaceSvg
          ? focused.workspace
          : workspace;
      targetWorkspace = targetWorkspace.isFlyout
        ? targetWorkspace.targetWorkspace
        : targetWorkspace;
      if (!targetWorkspace) return false;

      if (!focused.workspace.isFlyout) {
        targetWorkspace.hideChaff();
      }
      copyData = focused.toCopyData();
      copyWorkspace = targetWorkspace;
      copyCoords =
        isDraggable(focused) && focused.workspace == targetWorkspace
          ? focused.getRelativeToSurfaceXY()
          : null;
      return !!copyData;
    },
    keyCodes: [ctrlC, metaC],
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
  const metaX = ShortcutRegistry.registry.createSerializedKey(KeyCodes.X, [
    KeyCodes.META,
  ]);

  const cutShortcut: KeyboardShortcut = {
    name: names.CUT,
    preconditionFn(workspace, scope) {
      const focused = scope.focusedNode;
      return (
        !!focused &&
        !workspace.isReadOnly() &&
        !workspace.isDragging() &&
        !getFocusManager().ephemeralFocusTaken() &&
        isCuttable(focused)
      );
    },
    callback(workspace, e, shortcut, scope) {
      const focused = scope.focusedNode;

      if (focused instanceof BlockSvg) {
        copyData = focused.toCopyData();
        copyWorkspace = workspace;
        copyCoords = focused.getRelativeToSurfaceXY();
        focused.checkAndDelete();
        return true;
      } else if (
        isIDeletable(focused) &&
        focused.isDeletable() &&
        isICopyable(focused)
      ) {
        copyData = focused.toCopyData();
        copyWorkspace = workspace;
        copyCoords = isDraggable(focused)
          ? focused.getRelativeToSurfaceXY()
          : null;
        focused.dispose();
        return true;
      }
      return false;
    },
    keyCodes: [ctrlX, metaX],
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
  const metaV = ShortcutRegistry.registry.createSerializedKey(KeyCodes.V, [
    KeyCodes.META,
  ]);

  const pasteShortcut: KeyboardShortcut = {
    name: names.PASTE,
    preconditionFn(workspace) {
      const targetWorkspace = workspace.isFlyout
        ? workspace.targetWorkspace
        : workspace;
      return (
        !!copyData &&
        !!targetWorkspace &&
        !targetWorkspace.isReadOnly() &&
        !targetWorkspace.isDragging() &&
        !getFocusManager().ephemeralFocusTaken()
      );
    },
    callback(workspace: WorkspaceSvg, e: Event) {
      if (!copyData || !copyWorkspace) return false;

      if (e instanceof PointerEvent) {
        // The event that triggers a shortcut would conventionally be a KeyboardEvent.
        // However, it may be a PointerEvent if a context menu item was used as a
        // wrapper for this callback, in which case the new block(s) should be pasted
        // at the mouse coordinates where the menu was opened, and this PointerEvent
        // is where the menu was opened.
        const mouseCoords = svgMath.screenToWsCoordinates(
          copyWorkspace,
          new Coordinate(e.clientX, e.clientY),
        );
        return !!clipboard.paste(copyData, copyWorkspace, mouseCoords);
      }

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
    keyCodes: [ctrlV, metaV],
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
  const metaZ = ShortcutRegistry.registry.createSerializedKey(KeyCodes.Z, [
    KeyCodes.META,
  ]);

  const undoShortcut: KeyboardShortcut = {
    name: names.UNDO,
    preconditionFn(workspace) {
      return (
        !workspace.isReadOnly() &&
        !Gesture.inProgress() &&
        !getFocusManager().ephemeralFocusTaken()
      );
    },
    callback(workspace, e) {
      // 'z' for undo 'Z' is for redo.
      (workspace as WorkspaceSvg).hideChaff();
      workspace.undo(false);
      e.preventDefault();
      return true;
    },
    keyCodes: [ctrlZ, metaZ],
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
      return (
        !Gesture.inProgress() &&
        !workspace.isReadOnly() &&
        !getFocusManager().ephemeralFocusTaken()
      );
    },
    callback(workspace, e) {
      // 'z' for undo 'Z' is for redo.
      (workspace as WorkspaceSvg).hideChaff();
      workspace.undo(true);
      e.preventDefault();
      return true;
    },
    keyCodes: [ctrlShiftZ, metaShiftZ, ctrlY],
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
