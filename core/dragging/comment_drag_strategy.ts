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
import {CommentMove} from '../events/events_comment_move.js';

export class CommentDragStrategy implements IDragStrategy {
  private startLoc: Coordinate | null = null;

  private workspace: WorkspaceSvg;

  constructor(private comment: RenderedWorkspaceComment) {
    this.workspace = comment.workspace;
  }

  isMovable(): boolean {
    return this.comment.isOwnMovable() && !this.workspace.options.readOnly;
  }

  startDrag(): void {
    if (!eventUtils.getGroup()) {
      eventUtils.setGroup(true);
    }
    this.fireDragStartEvent();
    this.startLoc = this.comment.getRelativeToSurfaceXY();
    this.workspace.setResizesEnabled(false);
    this.workspace.getLayerManager()?.moveToDragLayer(this.comment);
    this.comment.setDragging(true);
  }

  drag(newLoc: Coordinate): void {
    this.comment.moveDuringDrag(newLoc);
  }

  endDrag(): void {
    this.fireDragEndEvent();
    this.fireMoveEvent();

    this.workspace
      .getLayerManager()
      ?.moveOffDragLayer(this.comment, layers.BLOCK);
    this.comment.setDragging(false);

    this.comment.snapToGrid();

    this.workspace.setResizesEnabled(true);
    eventUtils.setGroup(false);
  }

  /** Fire a UI event at the start of a comment drag. */
  private fireDragStartEvent() {
    const event = new (eventUtils.get(eventUtils.COMMENT_DRAG))(
      this.comment,
      true,
    );
    eventUtils.fire(event);
  }

  /** Fire a UI event at the end of a comment drag. */
  private fireDragEndEvent() {
    const event = new (eventUtils.get(eventUtils.COMMENT_DRAG))(
      this.comment,
      false,
    );
    eventUtils.fire(event);
  }

  /** Fire a move event at the end of a comment drag. */
  private fireMoveEvent() {
    if (this.comment.isDeadOrDying()) return;
    const event = new (eventUtils.get(eventUtils.COMMENT_MOVE))(
      this.comment,
    ) as CommentMove;
    event.setReason(['drag']);
    event.oldCoordinate_ = this.startLoc!;
    event.recordNew();
    eventUtils.fire(event);
  }

  revertDrag(): void {
    if (this.startLoc) this.comment.moveDuringDrag(this.startLoc);
  }
}
