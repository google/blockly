/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {ISerializer} from '../interfaces/i_serializer.js';
import {Workspace} from '../workspace.js';
import * as priorities from './priorities.js';

export interface State {
  id: string;
  text: string;
  location: {x: number; y: number};
  size: {height: number; width: number};
  collapsed: boolean;
  editable: boolean;
  movable: boolean;
  deletable: boolean;
}

export class WorkspaceCommentSerializer implements ISerializer {
  priority = priorities.WORKSPACE_COMMENTS;

  save(workspace: Workspace): State[] | null {}

  load(state: State[], workspace: Workspace) {}

  clear(workspace: Workspace) {}
}
