/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as browserEvents from '../browser_events.js';
import {getFocusManager} from '../focus_manager.js';
import {IFocusableNode} from '../interfaces/i_focusable_node.js';
import {IFocusableTree} from '../interfaces/i_focusable_tree.js';
import * as dom from '../utils/dom.js';
import {Svg} from '../utils/svg.js';
import {WorkspaceSvg} from '../workspace_svg.js';

export class CommentEditor implements IFocusableNode {
  id?: string;
  /** The foreignObject containing the HTML text area. */
  foreignObject: SVGForeignObjectElement;

  /** The text area where the user can type. */
  textArea: HTMLTextAreaElement;

  constructor(
    public workspace: WorkspaceSvg,
    commentSvgRoot: SVGGElement,
    commentId?: string,
  ) {
    this.foreignObject = dom.createSvgElement(
      Svg.FOREIGNOBJECT,
      {
        'class': 'blocklyCommentForeignObject',
      },
      commentSvgRoot,
    );
    const body = document.createElementNS(dom.HTML_NS, 'body');
    body.setAttribute('xmlns', dom.HTML_NS);
    body.className = 'blocklyMinimalBody';
    this.textArea = document.createElementNS(
      dom.HTML_NS,
      'textarea',
    ) as HTMLTextAreaElement;
    dom.addClass(this.textArea, 'blocklyCommentText');
    dom.addClass(this.textArea, 'blocklyTextarea');
    dom.addClass(this.textArea, 'blocklyText');
    body.appendChild(this.textArea);
    this.foreignObject.appendChild(body);

    if (commentId) {
      this.id = commentId + '_textarea_';
      this.textArea.setAttribute('id', this.id);
    }

    browserEvents.conditionalBind(
      this.textArea,
      'pointerdown',
      this,
      (e: PointerEvent) => {
        // don't allow this event to bubble up
        // and steal focus away from the editor/comment.
        e.stopPropagation();
        getFocusManager().focusNode(this);
      },
    );
  }

  getFocusableElement(): HTMLElement | SVGElement {
    return this.textArea;
  }
  getFocusableTree(): IFocusableTree {
    return this.workspace;
  }
  onNodeFocus(): void {}
  onNodeBlur(): void {}
  canBeFocused(): boolean {
    return true;
  }
}
