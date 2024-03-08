/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Workspace} from '../workspace.js';
import {Size} from '../utils/size.js';
import {Coordinate} from '../utils/coordinate.js';
import * as idGenerator from '../utils/idgenerator.js';

export class WorkspaceComment {
  public readonly id: string;

  private text = '';
  private size = new Size(120, 100);
  private collapsed = false;
  private editable = true;
  private movable = true;
  private deletable = true;
  private location = new Coordinate(0, 0);
  private disposed = false;

  constructor(
    protected readonly workspace: Workspace,
    id?: string,
  ) {
    // TODO: Before merging, file issue to update getCommentById.
    this.id = id && !workspace.getCommentById(id) ? id : idGenerator.genUid();

    // TODO: Before merging, file issue to add top comment.
    // workspace.addTopComment(this);

    // TODO(7909): Fire events.
  }

  setText(text: string) {
    this.text = text;
  }

  getText(): string {
    return this.text;
  }

  setSize(size: Size) {
    this.size = size;
  }

  getSize(): Size {
    return this.size;
  }

  setCollapsed(collapsed: boolean) {
    this.collapsed = collapsed;
  }

  isCollapssed(): boolean {
    return this.collapsed;
  }

  setEditable(editable: boolean) {
    this.editable = editable;
  }

  isEditable(): boolean {
    return this.editable && !this.workspace.options.readOnly;
  }

  setMovable(movable: boolean) {
    this.movable = movable;
  }

  isMovable() {
    return this.movable && !this.workspace.options.readOnly;
  }

  setDeletable(deletable: boolean) {
    this.deletable = deletable;
  }

  isDeletable(): boolean {
    return this.deletable && !this.workspace.options.readOnly;
  }

  moveTo(location: Coordinate) {
    this.location = location;
  }

  getRelativetoSurfaceXY(): Coordinate {
    return this.location;
  }

  dispose() {
    this.disposed = true;
  }

  isDisposed() {
    return this.disposed;
  }
}
