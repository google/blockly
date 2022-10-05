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
 *
 * @alias Blockly.Comment
 */
export class Comment extends Icon {
  private readonly model_: CommentModel;

  /**
   * The model's text value at the start of an edit.
   * Used to tell if an event should be fired at the end of an edit.
   */
  private cachedText_: string|null = '';

  /** Mouse up event data. */
  private onMouseUpWrapper_: browserEvents.Data|null = null;

  /** Wheel event data. */
  private onWheelWrapper_: browserEvents.Data|null = null;

  /** Change event data. */
  private onChangeWrapper_: browserEvents.Data|null = null;

  /** Input event data. */
  private onInputWrapper_: browserEvents.Data|null = null;

  /**
   * The SVG element that contains the text edit area, or null if not created.
   */
  private foreignObject_: SVGForeignObjectElement|null = null;

  /** The editable text area, or null if not created. */
  private textarea_: HTMLTextAreaElement|null = null;

  /** The top-level node of the comment text, or null if not created. */
  private paragraphElement_: SVGTextElement|null = null;

  /** @param block The block associated with this comment. */
  constructor(block: BlockSvg) {
    super(block);

    /** The model for this comment. */
    this.model_ = block.commentModel;
    // If someone creates the comment directly instead of calling
    // block.setCommentText we want to make sure the text is non-null;
    this.model_.text = this.model_.text ?? '';

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
  private createEditor_(): SVGElement {
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

    this.foreignObject_ = dom.createSvgElement(
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
    textarea.value = this.model_.text ?? '';
    this.resizeTextarea_();

    body.appendChild(textarea);
    this.foreignObject_!.appendChild(body);

    // Ideally this would be hooked to the focus event for the comment.
    // However doing so in Firefox swallows the cursor for unknown reasons.
    // So this is hooked to mouseup instead.  No big deal.
    this.onMouseUpWrapper_ = browserEvents.conditionalBind(
        textarea, 'mouseup', this, this.startEdit_, true, true);
    // Don't zoom with mousewheel.
    this.onWheelWrapper_ = browserEvents.conditionalBind(
        textarea, 'wheel', this, function(e: Event) {
          e.stopPropagation();
        });
    this.onChangeWrapper_ = browserEvents.conditionalBind(
        textarea, 'change', this,
        /**
         * @param _e Unused event parameter.
         */
        function(this: Comment, _e: Event) {
          if (this.cachedText_ !== this.model_.text) {
            eventUtils.fire(new (eventUtils.get(eventUtils.BLOCK_CHANGE))(
                this.getBlock(), 'comment', null, this.cachedText_,
                this.model_.text));
          }
        });
    this.onInputWrapper_ = browserEvents.conditionalBind(
        textarea, 'input', this,
        /**
         * @param _e Unused event parameter.
         */
        function(this: Comment, _e: Event) {
          this.model_.text = textarea.value;
        });

    setTimeout(textarea.focus.bind(textarea), 0);

    return this.foreignObject_;
  }

  /** Add or remove editability of the comment. */
  override updateEditable() {
    super.updateEditable();
    if (this.isVisible()) {
      // Recreate the bubble with the correct UI.
      this.disposeBubble_();
      this.createBubble_();
    }
  }

  /**
   * Callback function triggered when the bubble has resized.
   * Resize the text area accordingly.
   */
  private onBubbleResize_() {
    if (!this.isVisible() || !this.bubble_) {
      return;
    }

    this.model_.size = this.bubble_.getBubbleSize();
    this.resizeTextarea_();
  }

  /**
   * Resizes the text area to match the size defined on the model (which is
   * the size of the bubble).
   */
  private resizeTextarea_() {
    const size = this.model_.size;
    const doubleBorderWidth = 2 * Bubble.BORDER_WIDTH;
    const widthMinusBorder = size.width - doubleBorderWidth;
    const heightMinusBorder = size.height - doubleBorderWidth;
    this.foreignObject_!.setAttribute('width', `${widthMinusBorder}`);
    this.foreignObject_!.setAttribute('height', `${heightMinusBorder}`);
    this.textarea_!.style.width = widthMinusBorder - 4 + 'px';
    this.textarea_!.style.height = heightMinusBorder - 4 + 'px';
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
    this.model_.pinned = visible;
    if (visible) {
      this.createBubble_();
    } else {
      this.disposeBubble_();
    }
  }

  /** Show the bubble. Handles deciding if it should be editable or not. */
  private createBubble_() {
    if (!this.getBlock().isEditable()) {
      this.createNonEditableBubble_();
    } else {
      this.createEditableBubble_();
    }
  }

  /** Show an editable bubble. */
  private createEditableBubble_() {
    const block = this.getBlock();
    this.bubble_ = new Bubble(
        block.workspace, this.createEditor_(), block.pathObject.svgPath,
        (this.iconXY_ as Coordinate), this.model_.size.width,
        this.model_.size.height);
    // Expose this comment's block's ID on its top-level SVG group.
    this.bubble_.setSvgId(block.id);
    this.bubble_.registerResizeEvent(this.onBubbleResize_.bind(this));
    this.applyColour();
  }

  /**
   * Show a non-editable bubble.
   *
   * @suppress {checkTypes} Suppress `this` type mismatch.
   */
  private createNonEditableBubble_() {
    // TODO (#2917): It would be great if the comment could support line breaks.
    this.paragraphElement_ = Bubble.textToDom(this.model_.text ?? '');
    this.bubble_ = Bubble.createNonEditableBubble(
        this.paragraphElement_, this.getBlock(), this.iconXY_ as Coordinate);
    this.applyColour();
  }

  /**
   * Dispose of the bubble.
   *
   * @suppress {checkTypes} Suppress `this` type mismatch.
   */
  private disposeBubble_() {
    if (this.onMouseUpWrapper_) {
      browserEvents.unbind(this.onMouseUpWrapper_);
      this.onMouseUpWrapper_ = null;
    }
    if (this.onWheelWrapper_) {
      browserEvents.unbind(this.onWheelWrapper_);
      this.onWheelWrapper_ = null;
    }
    if (this.onChangeWrapper_) {
      browserEvents.unbind(this.onChangeWrapper_);
      this.onChangeWrapper_ = null;
    }
    if (this.onInputWrapper_) {
      browserEvents.unbind(this.onInputWrapper_);
      this.onInputWrapper_ = null;
    }
    if (this.bubble_) {
      this.bubble_.dispose();
      this.bubble_ = null;
    }
    this.textarea_ = null;
    this.foreignObject_ = null;
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
  private startEdit_(_e: Event) {
    if (this.bubble_?.promote()) {
      // Since the act of moving this node within the DOM causes a loss of
      // focus, we need to reapply the focus.
      this.textarea_!.focus();
    }

    this.cachedText_ = this.model_.text;
  }

  /**
   * Get the dimensions of this comment's bubble.
   *
   * @returns Object with width and height properties.
   */
  getBubbleSize(): Size {
    return this.model_.size;
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
      this.model_.size.width = width;
      this.model_.size.height = height;
    }
  }

  /**
   * Update the comment's view to match the model.
   *
   * @internal
   */
  updateText() {
    if (this.textarea_) {
      this.textarea_.value = this.model_.text ?? '';
    } else if (this.paragraphElement_) {
      // Non-Editable mode.
      // TODO (#2917): If 2917 gets added this will probably need to be updated.
      this.paragraphElement_.firstChild!.textContent = this.model_.text;
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
