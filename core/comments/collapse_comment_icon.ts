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
export const COMMENT_COLLAPSE_ICON_FOCUS_IDENTIFIER = '_collapse_icon';

/**
 * Icon that toggles the collapsed state of a comment.
 */
export class CollapseCommentIcon extends CommentIcon {
  /**
   * Opaque ID used to unbind event handlers during disposal.
   */
  private readonly bindId: browserEvents.Data;

  /**
   * SVG image displayed by this icon.
   */
  protected override readonly icon: SVGImageElement;

  /**
   * Creates a new CollapseCommentIcon instance.
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
        'class': 'blocklyFoldoutIcon',
        'href': `${this.workspace.options.pathToMedia}foldout-icon.svg`,
        'id': `${this.id}${COMMENT_COLLAPSE_ICON_FOCUS_IDENTIFIER}`,
      },
      this.container,
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
    this.icon.setAttribute('y', `${margin}`);
    this.icon.setAttribute('x', `${margin}`);
  }

  /**
   * Toggles the collapsed state of the parent comment.
   *
   * @param e The event that triggered this action.
   */
  override performAction(e?: Event) {
    touch.clearTouchIdentifier();

    const comment = this.getParentComment();
    comment.view.bringToFront();
    if (e && e instanceof PointerEvent && browserEvents.isRightButton(e)) {
      e.stopPropagation();
      return;
    }

    comment.setCollapsed(!comment.isCollapsed());
    this.workspace.hideChaff();

    e?.stopPropagation();
  }
}
