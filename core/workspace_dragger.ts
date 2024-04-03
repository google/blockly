/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Methods for dragging a workspace visually.
 *
 * @class
 */
// Former goog.module ID: Blockly.WorkspaceDragger

import * as common from './common.js';
import {Coordinate} from './utils/coordinate.js';
import type {WorkspaceSvg} from './workspace_svg.js';

/**
 * Class for a workspace dragger.  It moves the workspace around when it is
 * being dragged by a mouse or touch.
 *
 */
export class WorkspaceDragger {
  private readonly horizontalScrollEnabled_: boolean;
  private readonly verticalScrollEnabled_: boolean;
  protected startScrollXY_: Coordinate;

  /** @param workspace The workspace to drag. */
  constructor(private workspace: WorkspaceSvg) {
    /** Whether horizontal scroll is enabled. */
    this.horizontalScrollEnabled_ = this.workspace.isMovableHorizontally();

    /** Whether vertical scroll is enabled. */
    this.verticalScrollEnabled_ = this.workspace.isMovableVertically();

    /**
     * The scroll position of the workspace at the beginning of the drag.
     * Coordinate system: pixel coordinates.
     */
    this.startScrollXY_ = new Coordinate(workspace.scrollX, workspace.scrollY);
  }

  /**
   * Sever all links from this object.
   *
   * @internal
   */
  dispose() {
    // AnyDuringMigration because:  Type 'null' is not assignable to type
    // 'WorkspaceSvg'.
    this.workspace = null as AnyDuringMigration;
  }

  /**
   * Start dragging the workspace.
   *
   * @internal
   */
  startDrag() {
    if (common.getSelected()) {
      common.getSelected()!.unselect();
    }
  }

  /**
   * Finish dragging the workspace and put everything back where it belongs.
   *
   * @param currentDragDeltaXY How far the pointer has moved from the position
   *     at the start of the drag, in pixel coordinates.
   * @internal
   */
  endDrag(currentDragDeltaXY: Coordinate) {
    // Make sure everything is up to date.
    this.drag(currentDragDeltaXY);
  }

  /**
   * Move the workspace based on the most recent mouse movements.
   *
   * @param currentDragDeltaXY How far the pointer has moved from the position
   *     at the start of the drag, in pixel coordinates.
   * @internal
   */
  drag(currentDragDeltaXY: Coordinate) {
    const newXY = Coordinate.sum(this.startScrollXY_, currentDragDeltaXY);

    if (this.horizontalScrollEnabled_ && this.verticalScrollEnabled_) {
      this.workspace.scroll(newXY.x, newXY.y);
    } else if (this.horizontalScrollEnabled_) {
      this.workspace.scroll(newXY.x, this.workspace.scrollY);
    } else if (this.verticalScrollEnabled_) {
      this.workspace.scroll(this.workspace.scrollX, newXY.y);
    } else {
      throw new TypeError('Invalid state.');
    }
  }
}
