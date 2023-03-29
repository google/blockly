/**
 * @license
 * Copyright 2011 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Object representing a code comment.
 *
 * @class
 */
import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.Comment');

// Unused import preserved for side-effects. Remove if unneeded.
import './events/events_block_change.js';
// Unused import preserved for side-effects. Remove if unneeded.
import './events/events_bubble_open.js';

import type {CommentModel} from './block.js';
import type {BlockSvg} from './block_svg.js';
import * as browserEvents from './browser_events.js';
import {Bubble} from './bubble.js';
import * as Css from './css.js';
import * as eventUtils from './events/utils.js';
import {Icon} from './icon.js';
import type {Coordinate} from './utils/coordinate.js';
import * as dom from './utils/dom.js';
import type {Size} from './utils/size.js';
import {Svg} from './utils/svg.js';


/**
 * Class for a comment.
 */
export class Comment extends Icon {
  private readonly model: CommentModel;

  /**
   * The model's text value at the start of an edit.
   * Used to tell if an event should be fired at the end of an edit.
   */
  private cachedText: string|null = '';

  /**
   * Array holding info needed to unbind events.
   * Used for disposing.
   * Ex: [[node, name, func], [node, name, func]].
   */
  private boundEvents: browserEvents.Data[] = [];

  /**
   * The SVG element that contains the text edit area, or null if not created.
   */
  private foreignObject: SVGForeignObjectElement|null = null;

  /** The editable text area, or null if not created. */
  private textarea_: HTMLTextAreaElement|null = null;

  /** The top-level node of the comment text, or null if not created. */
  private paragraphElement_: SVGTextElement|null = null;

  /** @param block The block associated with this comment. */
  constructor(block: BlockSvg) {
    super(block);

    /** The model for this comment. */
    this.model = block.commentModel;
    // If someone creates the comment directly instead of calling
    // block.setCommentText we want to make sure the text is non-null;
    this.model.text = this.model.text ?? '';

    this.createIcon();
  }

  /**
   * Draw the comment icon.
   *
   * @param group The icon group.
   */
  protected override drawIcon_(group: Element) {
    // Circle.
    dom.createSvgElement(
        Svg.CIRCLE,
        {'class': 'blocklyIconShape', 'r': '8', 'cx': '8', 'cy': '8'}, group);
    // Can't use a real '?' text character since different browsers and
    // operating systems render it differently. Body of question mark.
    dom.createSvgElement(
        Svg.PATH, {
          'class': 'blocklyIconSymbol',
          'd': 'm6.8,10h2c0.003,-0.617 0.271,-0.962 0.633,-1.266 2.875,-2.405' +
              '0.607,-5.534 -3.765,-3.874v1.7c3.12,-1.657 3.698,0.118 2.336,1.25' +
              '-1.201,0.998 -1.201,1.528 -1.204,2.19z',
        },
        group);
    // Dot of question mark.
    dom.createSvgElement(
        Svg.RECT, {
          'class': 'blocklyIconSymbol',
          'x': '6.8',
          'y': '10.78',
          'height': '2',
          'width': '2',
        },
        group);
  }

  /**
   * Create the editor for the comment's bubble.
   *
   * @returns The top-level node of the editor.
   */
  private createEditor(): SVGElement {
    /* Create the editor.  Here's the markup that will be generated in
         * editable mode:
          <foreignObject x="8" y="8" width="164" height="164">
            <body xmlns="http://www.w3.org/1999/xhtml"
       class="blocklyMinimalBody"> <textarea
       xmlns="http://www.w3.org/1999/xhtml" class="blocklyCommentTextarea"
                  style="height: 164px; width: 164px;"></textarea>
            </body>
          </foreignObject>
         * For non-editable mode see Warning.textToDom_.
         */

    this.foreignObject = dom.createSvgElement(
        Svg.FOREIGNOBJECT,
        {'x': Bubble.BORDER_WIDTH, 'y': Bubble.BORDER_WIDTH});

    const body = document.createElementNS(dom.HTML_NS, 'body');
    body.setAttribute('xmlns', dom.HTML_NS);
    body.className = 'blocklyMinimalBody';

    this.textarea_ = document.createElementNS(dom.HTML_NS, 'textarea') as
        HTMLTextAreaElement;
    const textarea = this.textarea_;
    textarea.className = 'blocklyCommentTextarea';
    textarea.setAttribute('dir', this.getBlock().RTL ? 'RTL' : 'LTR');
    textarea.value = this.model.text ?? '';
    this.resizeTextarea();

    body.appendChild(textarea);
    this.foreignObject!.appendChild(body);

    this.boundEvents.push(browserEvents.conditionalBind(
        textarea, 'focus', this, this.startEdit, true));
    // Don't zoom with mousewheel.
    this.boundEvents.push(browserEvents.conditionalBind(
        textarea, 'wheel', this, function(e: Event) {
          e.stopPropagation();
        }));
    this.boundEvents.push(browserEvents.conditionalBind(
        textarea, 'change', this,
        /**
         * @param _e Unused event parameter.
         */
        function(this: Comment, _e: Event) {
          if (this.cachedText !== this.model.text) {
            eventUtils.fire(new (eventUtils.get(eventUtils.BLOCK_CHANGE))(
                this.getBlock(), 'comment', null, this.cachedText,
                this.model.text));
          }
        }));
    this.boundEvents.push(browserEvents.conditionalBind(
        textarea, 'input', this,
        /**
         * @param _e Unused event parameter.
         */
        function(this: Comment, _e: Event) {
          this.model.text = textarea.value;
        }));

    setTimeout(textarea.focus.bind(textarea), 0);

    return this.foreignObject;
  }

  /** Add or remove editability of the comment. */
  override updateEditable() {
    super.updateEditable();
    if (this.isVisible()) {
      // Recreate the bubble with the correct UI.
      this.disposeBubble();
      this.createBubble();
    }
  }

  /**
   * Callback function triggered when the bubble has resized.
   * Resize the text area accordingly.
   */
  private onBubbleResize() {
    if (!this.isVisible() || !this.bubble_) {
      return;
    }

    this.model.size = this.bubble_.getBubbleSize();
    this.resizeTextarea();
  }

  /**
   * Resizes the text area to match the size defined on the model (which is
   * the size of the bubble).
   */
  private resizeTextarea() {
    if (!this.textarea_ || !this.foreignObject) {
      return;
    }
    const size = this.model.size;
    const doubleBorderWidth = 2 * Bubble.BORDER_WIDTH;
    const widthMinusBorder = size.width - doubleBorderWidth;
    const heightMinusBorder = size.height - doubleBorderWidth;
    this.foreignObject.setAttribute('width', `${widthMinusBorder}`);
    this.foreignObject.setAttribute('height', `${heightMinusBorder}`);
    this.textarea_.style.width = widthMinusBorder - 4 + 'px';
    this.textarea_.style.height = heightMinusBorder - 4 + 'px';
  }

  /**
   * Show or hide the comment bubble.
   *
   * @param visible True if the bubble should be visible.
   */
  override setVisible(visible: boolean) {
    if (visible === this.isVisible()) {
      return;
    }
    eventUtils.fire(new (eventUtils.get(eventUtils.BUBBLE_OPEN))(
        this.getBlock(), visible, 'comment'));
    this.model.pinned = visible;
    if (visible) {
      this.createBubble();
    } else {
      this.disposeBubble();
    }
  }

  /** Show the bubble. Handles deciding if it should be editable or not. */
  private createBubble() {
    if (!this.getBlock().isEditable()) {
      this.createNonEditableBubble();
    } else {
      this.createEditableBubble();
    }
  }

  /** Show an editable bubble. */
  private createEditableBubble() {
    const block = this.getBlock();
    this.bubble_ = new Bubble(
        block.workspace, this.createEditor(), block.pathObject.svgPath,
        (this.iconXY_ as Coordinate), this.model.size.width,
        this.model.size.height);
    // Expose this comment's block's ID on its top-level SVG group.
    this.bubble_.setSvgId(block.id);
    this.bubble_.registerResizeEvent(this.onBubbleResize.bind(this));
    this.applyColour();
  }

  /**
   * Show a non-editable bubble.
   */
  private createNonEditableBubble() {
    // TODO (#2917): It would be great if the comment could support line breaks.
    this.paragraphElement_ = Bubble.textToDom(this.model.text ?? '');
    this.bubble_ = Bubble.createNonEditableBubble(
        this.paragraphElement_, this.getBlock(), this.iconXY_ as Coordinate);
    this.applyColour();
  }

  /**
   * Dispose of the bubble.
   */
  private disposeBubble() {
    for (const event of this.boundEvents) {
      browserEvents.unbind(event);
    }
    this.boundEvents.length = 0;
    if (this.bubble_) {
      this.bubble_.dispose();
      this.bubble_ = null;
    }
    this.textarea_ = null;
    this.foreignObject = null;
    this.paragraphElement_ = null;
  }

  /**
   * Callback fired when an edit starts.
   *
   * Bring the comment to the top of the stack when clicked on. Also cache the
   * current text so it can be used to fire a change event.
   *
   * @param _e Mouse up event.
   */
  private startEdit(_e: PointerEvent) {
    if (this.bubble_?.promote()) {
      // Since the act of moving this node within the DOM causes a loss of
      // focus, we need to reapply the focus.
      this.textarea_!.focus();
    }

    this.cachedText = this.model.text;
  }

  /**
   * Get the dimensions of this comment's bubble.
   *
   * @returns Object with width and height properties.
   */
  getBubbleSize(): Size {
    return this.model.size;
  }

  /**
   * Size this comment's bubble.
   *
   * @param width Width of the bubble.
   * @param height Height of the bubble.
   */
  setBubbleSize(width: number, height: number) {
    if (this.bubble_) {
      this.bubble_.setBubbleSize(width, height);
    } else {
      this.model.size.width = width;
      this.model.size.height = height;
    }
  }

  /**
   * Update the comment's view to match the model.
   *
   * @internal
   */
  updateText() {
    if (this.textarea_) {
      this.textarea_.value = this.model.text ?? '';
    } else if (this.paragraphElement_) {
      // Non-Editable mode.
      // TODO (#2917): If 2917 gets added this will probably need to be updated.
      this.paragraphElement_.firstChild!.textContent = this.model.text;
    }
  }

  /**
   * Dispose of this comment.
   *
   * If you want to receive a comment "delete" event (newValue: null), then this
   * should not be called directly. Instead call block.setCommentText(null);
   */
  override dispose() {
    this.getBlock().comment = null;
    super.dispose();
  }
}

/** CSS for block comment.  See css.js for use. */
Css.register(`
.blocklyCommentTextarea {
  background-color: #fef49c;
  border: 0;
  display: block;
  margin: 0;
  outline: 0;
  padding: 3px;
  resize: none;
  text-overflow: hidden;
}
`);
