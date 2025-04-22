/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.IContextMenu

export interface IContextMenu {
  /**
   * Show the context menu for this object.
   *
   * @param e Mouse event.
   */
  showContextMenu(e: Event): void;
}

/** Type guard for objects that implement IContextMenu. */
export function hasContextMenu(obj: object): obj is IContextMenu {
  return (obj as any).showContextMenu !== undefined;
}
