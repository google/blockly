/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as browserEvents from '../browser_events.js';
import * as touch from '../touch.js';
import * as dom from '../utils/dom.js';
import {Svg} from '../utils/svg.js';
import type {WorkspaceSvg} from '../workspace_svg.js';
import {CommentIcon} from './comment_icon.js';

/**
 * Magic string appended to the comment ID to create a unique ID for this icon.
 */
export const COMMENT_DELETE_ICON_FOCUS_IDENTIFIER = '_delete_icon';

/**
 * Icon that deletes a comment.
 */
export class DeleteCommentIcon extends CommentIcon {
  /**
   * Opaque ID used to unbind event handlers during disposal.
   */
  private readonly bindId: browserEvents.Data;

  /**
   * SVG image displayed by this icon.
   */
  protected override readonly icon: SVGImageElement;

  /**
   * Creates a new DeleteCommentIcon instance.
   *
   * @param id The ID of this icon's parent comment.
   * @param workspace The workspace this icon's parent comment is displayed on.
   * @param container An SVG group that this icon should be a child of.
   */
  constructor(
    protected readonly id: string,
    protected readonly workspace: WorkspaceSvg,
    protected readonly container: SVGGElement,
  ) {
    super(id, workspace, container);

    this.icon = dom.createSvgElement(
      Svg.IMAGE,
      {
        'class': 'blocklyDeleteIcon',
        'href': `${this.workspace.options.pathToMedia}delete-icon.svg`,
        'id': `${this.id}${COMMENT_DELETE_ICON_FOCUS_IDENTIFIER}`,
      },
      container,
    );
    this.bindId = browserEvents.conditionalBind(
      this.icon,
      'pointerdown',
      this,
      this.performAction.bind(this),
    );
  }

  /**
   * Disposes of this icon.
   */
  dispose() {
    browserEvents.unbind(this.bindId);
  }

  /**
   * Adjusts the positioning of this icon within its container.
   */
  override reposition() {
    const margin = this.getMargin();
    const containerSize = this.container.getBBox();
    this.icon.setAttribute('y', `${margin}`);
    this.icon.setAttribute(
      'x',
      `${containerSize.width - this.getSize(true).getWidth()}`,
    );
  }

  /**
   * Deletes parent comment.
   *
   * @param e The event that triggered this action.
   */
  override performAction(e?: Event) {
    touch.clearTouchIdentifier();
    if (e && e instanceof PointerEvent && browserEvents.isRightButton(e)) {
      e.stopPropagation();
      return;
    }

    this.getParentComment().dispose();
    e?.stopPropagation();
  }
}
