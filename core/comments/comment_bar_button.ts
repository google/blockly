/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {IFocusableNode} from '../interfaces/i_focusable_node.js';
import {Rect} from '../utils/rect.js';
import type {WorkspaceSvg} from '../workspace_svg.js';
import type {RenderedWorkspaceComment} from './rendered_workspace_comment.js';

/**
 * Button displayed on a comment's top bar.
 */
export abstract class CommentBarButton implements IFocusableNode {
  /**
   * SVG image displayed on this button.
   */
  protected abstract readonly icon: SVGImageElement;

  /**
   * Creates a new CommentBarButton instance.
   *
   * @param id The ID of this button's parent comment.
   * @param workspace The workspace this button's parent comment is on.
   * @param container An SVG group that this button should be a child of.
   */
  constructor(
    protected readonly id: string,
    protected readonly workspace: WorkspaceSvg,
    protected readonly container: SVGGElement,
  ) {}

  /**
   * Returns whether or not this button is currently visible.
   */
  isVisible(): boolean {
    return this.icon.checkVisibility();
  }

  /**
   * Returns the parent comment of this comment bar button.
   */
  getParentComment(): RenderedWorkspaceComment {
    const comment = this.workspace.getCommentById(this.id);
    if (!comment) {
      throw new Error(
        `Comment bar button ${this.id} has no corresponding comment`,
      );
    }

    return comment;
  }

  /** Adjusts the position of this button within its parent container. */
  abstract reposition(): void;

  /** Perform the action this button should take when it is acted on. */
  abstract performAction(e?: Event): void;

  /**
   * Returns the dimensions of this button in workspace coordinates.
   *
   * @param includeMargin True to include the margin when calculating the size.
   * @returns The size of this button.
   */
  getSize(includeMargin = false): Rect {
    const bounds = this.icon.getBBox();
    const rect = Rect.from(bounds);
    if (includeMargin) {
      const margin = this.getMargin();
      rect.left -= margin;
      rect.top -= margin;
      rect.bottom += margin;
      rect.right += margin;
    }
    return rect;
  }

  /** Returns the margin in workspace coordinates surrounding this button. */
  getMargin(): number {
    return (this.container.getBBox().height - this.icon.getBBox().height) / 2;
  }

  /** Returns a DOM element representing this button that can receive focus. */
  getFocusableElement() {
    return this.icon;
  }

  /** Returns the workspace this button is a child of. */
  getFocusableTree() {
    return this.workspace;
  }

  /** Called when this button's focusable DOM element gains focus. */
  onNodeFocus() {}

  /** Called when this button's focusable DOM element loses focus. */
  onNodeBlur() {}

  /** Returns whether this button can be focused. True if it is visible. */
  canBeFocused() {
    return this.isVisible();
  }
}
