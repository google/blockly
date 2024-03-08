/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Workspace} from '../workspace.js';
import {Size} from '../utils/size.js';
import {Coordinate} from '../utils/coordinate.js';

class WorkspaceComment {
  constructor(workspace: Workspace, id?: string) {}

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
