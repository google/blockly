/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {WorkspaceComment} from './workspace_comment.js';
import {WorkspaceSvg} from '../workspace_svg.js';
import {CommentView} from './comment_view.js';
import {Coordinate, Size} from '../utils.js';

export class RenderedWorkspaceComment extends WorkspaceComment {
  private view: CommentView;

  constructor(workspace: WorkspaceSvg, id?: string) {
    super(workspace, id);

    this.view = new CommentView(workspace);
    // Set the size to the default size as defined in the superclass.
    this.view.setSize(this.getSize());
    this.view.setEditable(this.isEditable());

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

  setEditable(editable: boolean): void {
    super.setEditable(editable);
    // Use isEditable rather than isOwnEditable to account for workspace state.
    this.view.setEditable(this.isEditable());
  }

  moveTo(location: Coordinate): void {
    super.moveTo(location);
    this.view.moveTo(location);
  }

  dispose() {
    this.view.dispose();
    super.dispose();
  }
}
