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
  /** The class encompassing the svg elements making up the workspace comment. */
  private view: CommentView;

  /** Constructs the workspace comment, including the view. */
  constructor(workspace: WorkspaceSvg, id?: string) {
    super(workspace, id);

    this.view = new CommentView(workspace);
    // Set the size to the default size as defined in the superclass.
    this.view.setSize(this.getSize());
    this.view.setEditable(this.isEditable());

    this.addModelUpdateBindings();
  }

  /**
   * Adds listeners to the view that updates the model (i.e. the superclass)
   * when changes are made to the view.
   */
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

  /** Sets the text of the comment. */
  override setText(text: string): void {
    // setText will trigger the change listener that updates
    // the model aka superclass.
    this.view.setText(text);
  }

  /** Sets the size of the comment. */
  override setSize(size: Size) {
    // setSize will trigger the change listener that updates
    // the model aka superclass.
    this.view.setSize(size);
  }

  /** Sets whether the comment is collapsed or not. */
  override setCollapsed(collapsed: boolean) {
    // setCollapsed will trigger the change listener that updates
    // the model aka superclass.
    this.view.setCollapsed(collapsed);
  }

  /** Sets whether the comment is editable or not. */
  override setEditable(editable: boolean): void {
    super.setEditable(editable);
    // Use isEditable rather than isOwnEditable to account for workspace state.
    this.view.setEditable(this.isEditable());
  }

  /** Moves the comment to the given location in workspace coordinates. */
  override moveTo(location: Coordinate): void {
    super.moveTo(location);
    this.view.moveTo(location);
  }

  /** Disposes of the view. */
  override dispose() {
    this.view.dispose();
    super.dispose();
  }
}
