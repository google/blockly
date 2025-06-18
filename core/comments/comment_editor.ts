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
import {Size} from '../utils/size.js';
import {Svg} from '../utils/svg.js';
import {WorkspaceSvg} from '../workspace_svg.js';

/** The part of a comment that can be typed into. */
export class CommentEditor implements IFocusableNode {
  id?: string;
  /** The foreignObject containing the HTML text area. */
  private foreignObject: SVGForeignObjectElement;

  /** The text area where the user can type. */
  private textArea: HTMLTextAreaElement;

  /** Listeners for changes to text. */
  private textChangeListeners: Array<
    (oldText: string, newText: string) => void
  > = [];

  /** The current text of the comment. Updates on text area change. */
  private text: string = '';

  constructor(
    public workspace: WorkspaceSvg,
    commentId?: string,
  ) {
    this.foreignObject = dom.createSvgElement(Svg.FOREIGNOBJECT, {
      'class': 'blocklyCommentForeignObject',
    });
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
      this.id = commentId + '_comment_textarea_';
      this.textArea.setAttribute('id', this.id);
    }

    // Register browser event listeners for the user typing in the textarea.
    browserEvents.conditionalBind(
      this.textArea,
      'change',
      this,
      this.onTextChange,
    );

    // Register listener for pointerdown to focus the textarea.
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

  /** Gets the dom structure for this comment editor. */
  getDom(): SVGForeignObjectElement {
    return this.foreignObject;
  }

  /** Gets the current text of the comment. */
  getText(): string {
    return this.text;
  }
  /** Sets the current text of the comment and fires change listeners. */
  setText(text: string) {
    this.textArea.value = text;
    this.onTextChange();
  }

  /**
   * Triggers listeners when the text of the comment changes, either
   * programmatically or manually by the user.
   */
  private onTextChange() {
    const oldText = this.text;
    this.text = this.textArea.value;
    // Loop through listeners backwards in case they remove themselves.
    for (let i = this.textChangeListeners.length - 1; i >= 0; i--) {
      this.textChangeListeners[i](oldText, this.text);
    }
  }

  /** Registers a callback that listens for text changes. */
  addTextChangeListener(listener: (oldText: string, newText: string) => void) {
    this.textChangeListeners.push(listener);
  }

  /** Removes the given listener from the list of text change listeners. */
  removeTextChangeListener(listener: () => void) {
    this.textChangeListeners.splice(
      this.textChangeListeners.indexOf(listener),
      1,
    );
  }

  /** Sets the placeholder text displayed for an empty comment. */
  setPlaceholderText(text: string) {
    this.textArea.placeholder = text;
  }

  /** Sets whether the textarea is editable. If not, the textarea will be readonly. */
  setEditable(isEditable: boolean) {
    if (isEditable) {
      this.textArea.removeAttribute('readonly');
    } else {
      this.textArea.setAttribute('readonly', 'true');
    }
  }

  /** Update the size of the comment editor element. */
  updateSize(size: Size, topBarSize: Size) {
    this.foreignObject.setAttribute(
      'height',
      `${size.height - topBarSize.height}`,
    );
    this.foreignObject.setAttribute('width', `${size.width}`);
    this.foreignObject.setAttribute('y', `${topBarSize.height}`);
    if (this.workspace.RTL) {
      this.foreignObject.setAttribute('x', `${-size.width}`);
    }
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
    if (this.id) return true;
    return false;
  }
}
