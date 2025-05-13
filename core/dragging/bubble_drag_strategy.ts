/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {IBubble, WorkspaceSvg} from '../blockly.js';
import {getFocusManager} from '../focus_manager.js';
import {IDragStrategy} from '../interfaces/i_draggable.js';
import * as layers from '../layers.js';
import {Coordinate} from '../utils.js';

export class BubbleDragStrategy implements IDragStrategy {
  private startLoc: Coordinate | null = null;

  constructor(
    private bubble: IBubble,
    private workspace: WorkspaceSvg,
  ) {}

  isMovable(): boolean {
    return true;
  }

  startDrag(): void {
    this.startLoc = this.bubble.getRelativeToSurfaceXY();
    this.workspace.setResizesEnabled(false);
    this.workspace.getLayerManager()?.moveToDragLayer(this.bubble);
    if (this.bubble.setDragging) {
      this.bubble.setDragging(true);
    }

    // Since moving the bubble to the drag layer will cause it to lose focus,
    // ensure it regains focus (to fire related bubble selection events).
    getFocusManager().focusNode(this.bubble);
  }

  drag(newLoc: Coordinate): void {
    this.bubble.moveDuringDrag(newLoc);
  }

  endDrag(): void {
    this.workspace.setResizesEnabled(true);

    this.workspace
      .getLayerManager()
      ?.moveOffDragLayer(this.bubble, layers.BUBBLE);
    this.bubble.setDragging(false);

    // Since moving the bubble off the drag layer will cause it to lose focus,
    // ensure it regains focus (to fire related bubble selection events).
    getFocusManager().focusNode(this.bubble);
  }

  revertDrag(): void {
    if (this.startLoc) this.bubble.moveDuringDrag(this.startLoc);
  }
}
