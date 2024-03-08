/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {WorkspaceComment} from './workspace_comment.js';
import {WorkspaceSvg} from '../workspace_svg.js';
import {CommentView} from './comment_view.js';

export class RenderedWorkspaceComment extends WorkspaceComment {
  private view: CommentView;

  constructor(workspace: WorkspaceSvg, id?: string) {
    super(workspace, id);

    this.view = new CommentView(workspace);
    // Set the size to the default size as defined in the superclass.
    this.view.setSize(this.getSize());
  }
}
