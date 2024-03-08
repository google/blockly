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
    return this.isOwnEditable() && !this.workspace.options.readOnly;
  }

  isOwnEditable(): boolean {
    return this.editable;
  }

  setMovable(movable: boolean) {
    this.movable = movable;
  }

  isMovable() {
    return this.isOwnMovable() && !this.workspace.options.readOnly;
  }

  isOwnMovable() {
    return this.movable;
  }

  setDeletable(deletable: boolean) {
    this.deletable = deletable;
  }

  isDeletable(): boolean {
    return this.isOwnDeletable() && !this.workspace.options.readOnly;
  }

  isOwnDeletable(): boolean {
    return this.deletable;
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
