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
  /** The unique identifier for this comment. */
  public readonly id: string;

  /** The text of the comment. */
  private text = '';

  /** The size of the comment in workspace units. */
  private size = new Size(120, 100);

  /** Whether the comment is collapsed or not. */
  private collapsed = false;

  /** Whether the comment is editable or not. */
  private editable = true;

  /** Whether the comment is movable or not. */
  private movable = true;

  /** Whether the comment is deletable or not. */
  private deletable = true;

  /** The location of the comment in workspace coordinates. */
  private location = new Coordinate(0, 0);

  /** Whether this comment has been disposed or not. */
  private disposed = false;

  /**
   * Constructs the comment.
   *
   * @param workspace The workspace to construct the comment in.
   * @param id An optional ID to give to the comment. If not provided, one will
   *     be generated.
   */
  constructor(
    protected readonly workspace: Workspace,
    id?: string,
  ) {
    this.id = id && !workspace.getCommentById(id) ? id : idGenerator.genUid();

    // TODO(7909): Fire events.
  }

  /** Sets the text of the comment. */
  setText(text: string) {
    this.text = text;
  }

  /** Returns the text of the comment. */
  getText(): string {
    return this.text;
  }

  /** Sets the comment's size in workspace units. */
  setSize(size: Size) {
    this.size = size;
  }

  /** Returns the comment's size in workspace units. */
  getSize(): Size {
    return this.size;
  }

  /** Sets whether the comment is collapsed or not. */
  setCollapsed(collapsed: boolean) {
    this.collapsed = collapsed;
  }

  /** Returns whether the comment is collapsed or not. */
  isCollapsed(): boolean {
    return this.collapsed;
  }

  /** Sets whether the comment is editable or not. */
  setEditable(editable: boolean) {
    this.editable = editable;
  }

  /**
   * Returns whether the comment is editable or not, respecting whether the
   * workspace is read-only.
   */
  isEditable(): boolean {
    return this.isOwnEditable() && !this.workspace.options.readOnly;
  }

  /**
   * Returns whether the comment is editable or not, only examining its own
   * state and ignoring the state of the workspace.
   */
  isOwnEditable(): boolean {
    return this.editable;
  }

  /** Sets whether the comment is movable or not. */
  setMovable(movable: boolean) {
    this.movable = movable;
  }

  /**
   * Returns whether the comment is movable or not, respecting whether the
   * workspace is read-only.
   */
  isMovable() {
    return this.isOwnMovable() && !this.workspace.options.readOnly;
  }

  /**
   * Returns whether the comment is movable or not, only examining its own
   * state and ignoring the state of the workspace.
   */
  isOwnMovable() {
    return this.movable;
  }

  /** Sets whether the comment is deletable or not. */
  setDeletable(deletable: boolean) {
    this.deletable = deletable;
  }

  /**
   * Returns whether the comment is deletable or not, respecting whether the
   * workspace is read-only.
   */
  isDeletable(): boolean {
    return this.isOwnDeletable() && !this.workspace.options.readOnly;
  }

  /**
   * Returns whether the comment is deletable or not, only examining its own
   * state and ignoring the state of the workspace.
   */
  isOwnDeletable(): boolean {
    return this.deletable;
  }

  /** Moves the comment to the given location in workspace coordinates. */
  moveTo(location: Coordinate) {
    this.location = location;
  }

  /** Returns the position of the comment in workspace coordinates. */
  getRelativeToSurfaceXY(): Coordinate {
    return this.location;
  }

  /** Disposes of this comment. */
  dispose() {
    this.disposed = true;
  }

  /** Returns whether the comment has been disposed or not. */
  isDisposed() {
    return this.disposed;
  }
}
