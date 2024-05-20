/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {IDragStrategy} from '../interfaces/i_draggable.js';
import {Coordinate} from '../utils.js';
import * as eventUtils from '../events/utils.js';
import {IBubble, WorkspaceSvg} from '../blockly.js';
import * as layers from '../layers.js';

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
    if (!eventUtils.getGroup()) {
      eventUtils.setGroup(true);
    }
    this.startLoc = this.bubble.getRelativeToSurfaceXY();
    this.workspace.setResizesEnabled(false);
    this.workspace.getLayerManager()?.moveToDragLayer(this.bubble);
    this.bubble.setDragging && this.bubble.setDragging(true);
  }

  drag(newLoc: Coordinate): void {
    this.bubble.moveDuringDrag(newLoc);
  }

  endDrag(): void {
    this.workspace.setResizesEnabled(true);
    eventUtils.setGroup(false);

    this.workspace
      .getLayerManager()
      ?.moveOffDragLayer(this.bubble, layers.BUBBLE);
    this.bubble.setDragging(false);
  }

  revertDrag(): void {
    if (this.startLoc) this.bubble.moveDuringDrag(this.startLoc);
  }
}
