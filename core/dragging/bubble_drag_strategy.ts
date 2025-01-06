/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {IBubble, WorkspaceSvg} from '../blockly.js';
import * as eventUtils from '../events/utils.js';
import {IDragStrategy} from '../interfaces/i_draggable.js';
import * as layers from '../layers.js';
import {Coordinate} from '../utils.js';

export class BubbleDragStrategy implements IDragStrategy {
  private startLoc: Coordinate | null = null;

  /** Was there already an event group in progress when the drag started? */
  private inGroup: boolean = false;

  constructor(
    private bubble: IBubble,
    private workspace: WorkspaceSvg,
  ) {}

  isMovable(): boolean {
    return true;
  }

  startDrag(): void {
    this.inGroup = !!eventUtils.getGroup();
    if (!this.inGroup) {
      eventUtils.setGroup(true);
    }
    this.startLoc = this.bubble.getRelativeToSurfaceXY();
    this.workspace.setResizesEnabled(false);
    this.workspace.getLayerManager()?.moveToDragLayer(this.bubble);
    if (this.bubble.setDragging) {
      this.bubble.setDragging(true);
    }
  }

  drag(newLoc: Coordinate): void {
    this.bubble.moveDuringDrag(newLoc);
  }

  endDrag(): void {
    this.workspace.setResizesEnabled(true);
    if (!this.inGroup) {
      eventUtils.setGroup(false);
    }

    this.workspace
      .getLayerManager()
      ?.moveOffDragLayer(this.bubble, layers.BUBBLE);
    this.bubble.setDragging(false);
  }

  revertDrag(): void {
    if (this.startLoc) this.bubble.moveDuringDrag(this.startLoc);
  }
}
