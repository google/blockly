/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {IDragStrategy} from '../interfaces/i_draggable.js';
import {Coordinate} from '../utils.js';
import * as eventUtils from '../events/utils.js';
import * as layers from '../layers.js';
import {RenderedWorkspaceComment} from '../comments.js';
import {WorkspaceSvg} from '../workspace_svg.js';

export class CommentDragStrategy implements IDragStrategy {
  private startLoc: Coordinate | null = null;

  constructor(
    private comment: RenderedWorkspaceComment,
    private workspace: WorkspaceSvg,
  ) {}

  isMovable(): boolean {
    return this.comment.isOwnMovable() && !this.workspace.options.readOnly;
  }

  startDrag(): void {
    if (!eventUtils.getGroup()) {
      eventUtils.setGroup(true);
    }
    this.startLoc = this.comment.getRelativeToSurfaceXY();
    this.workspace.setResizesEnabled(false);
    this.workspace.getLayerManager()?.moveToDragLayer(this.comment);
    this.comment.setDragging(true);
  }

  drag(newLoc: Coordinate): void {
    this.comment.moveDuringDrag(newLoc);
  }

  endDrag(): void {
    this.workspace.setResizesEnabled(true);
    eventUtils.setGroup(false);

    this.workspace
      .getLayerManager()
      ?.moveOffDragLayer(this.comment, layers.BLOCK);
    this.comment.setDragging(false);
  }

  revertDrag(): void {
    if (this.startLoc) this.comment.moveDuringDrag(this.startLoc);
  }
}
