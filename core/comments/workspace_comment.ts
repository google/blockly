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

  setText(text: string) {}

  getText(): string;

  setSize(size: Size) {}

  getSize(): Size {}

  setCollapsed(collapsed: boolean) {}

  isCollapssed(): boolean {}

  setEditable(editable: boolean) {}

  isEditable(): boolean {}

  setMovable(movable: boolean) {}

  isMovable() {}

  setDeletable(deletable: boolean) {}

  isDeletable(): boolean {}

  moveTo(loc: Coordinate) {}

  getRelativetoSurfaceXY(): Coordinate {}

  dispose() {}
}
