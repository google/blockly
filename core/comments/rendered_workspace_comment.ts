/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {WorkspaceComment} from './workspace_comment.js';
import {WorkspaceSvg} from '../workspace_svg.js';
import {CommentView} from './comment_view.js';
import {Size} from '../utils.js';

export class RenderedWorkspaceComment extends WorkspaceComment {
  private view: CommentView;

  constructor(workspace: WorkspaceSvg, id?: string) {
    super(workspace, id);

    this.view = new CommentView(workspace);
    // Set the size to the default size as defined in the superclass.
    this.view.setSize(this.getSize());

    this.addModelUpdateBindings();
  }

  private addModelUpdateBindings() {
    this.view.addTextChangeListener(
      (_, newText: string) => void super.setText(newText),
    );
    this.view.addSizeChangeListener(
      (_, newSize: Size) => void super.setSize(newSize),
    );
    this.view.addOnCollapseListener(
      () => void super.setCollapsed(this.view.isCollapsed()),
    );
  }

  setText(text: string): void {
    // setText will trigger the change listener that updates
    // the model aka superclass.
    this.view.setText(text);
  }

  setSize(size: Size) {
    // setSize will trigger the change listener that updates
    // the model aka superclass.
    this.view.setSize(size);
  }

  setCollapsed(collapsed: boolean) {
    // setCollapsed will trigger the change listener that updates
    // the model aka superclass.
    this.view.setCollapsed(collapsed);
  }
}
