/**
 * @license
 * Copyright 2011 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a code comment.
 */
'use strict';

/**
 * Object representing a code comment.
 * @class
 */
goog.module('Blockly.Comment');

const Css = goog.require('Blockly.Css');
const browserEvents = goog.require('Blockly.browserEvents');
const dom = goog.require('Blockly.utils.dom');
const eventUtils = goog.require('Blockly.Events.utils');
const userAgent = goog.require('Blockly.utils.userAgent');
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');
const {Bubble} = goog.require('Blockly.Bubble');
/* eslint-disable-next-line no-unused-vars */
const {Coordinate} = goog.requireType('Blockly.utils.Coordinate');
const {Icon} = goog.require('Blockly.Icon');
/* eslint-disable-next-line no-unused-vars */
const {Size} = goog.requireType('Blockly.utils.Size');
const {Svg} = goog.require('Blockly.utils.Svg');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceSvg} = goog.requireType('Blockly.WorkspaceSvg');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.BlockChange');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.BubbleOpen');
/** @suppress {extraRequire} */
goog.require('Blockly.Warning');


/**
 * Class for a comment.
 * @extends {Icon}
 * @alias Blockly.Comment
 */
class Comment extends Icon {
  /**
   * @param {!BlockSvg} block The block associated with this comment.
   */
  constructor(block) {
    super(block);

    /**
     * The model for this comment.
     * @type {!Block.CommentModel}
     * @private
     */
    this.model_ = block.commentModel;
    // If someone creates the comment directly instead of calling
    // block.setCommentText we want to make sure the text is non-null;
    this.model_.text = this.model_.text || '';

    /**
     * The model's text value at the start of an edit.
     * Used to tell if an event should be fired at the end of an edit.
     * @type {?string}
     * @private
     */
    this.cachedText_ = '';

    /**
     * Mouse up event data.
     * @type {?browserEvents.Data}
     * @private
     */
    this.onMouseUpWrapper_ = null;

    /**
     * Wheel event data.
     * @type {?browserEvents.Data}
     * @private
     */
    this.onWheelWrapper_ = null;

    /**
     * Change event data.
     * @type {?browserEvents.Data}
     * @private
     */
    this.onChangeWrapper_ = null;

    /**
     * Input event data.
     * @type {?browserEvents.Data}
     * @private
     */
    this.onInputWrapper_ = null;

    /**
     * The SVG element that contains the text edit area, or null if not created.
     * @type {?SVGForeignObjectElement}
     * @private
     */
    this.foreignObject_ = null;

    /**
     * The editable text area, or null if not created.
     * @type {?Element}
     * @private
     */
    this.textarea_ = null;

    /**
     * The top-level node of the comment text, or null if not created.
     * @type {?SVGTextElement}
     * @private
     */
    this.paragraphElement_ = null;

    this.createIcon();
  }

  /**
   * Draw the comment icon.
   * @param {!Element} group The icon group.
   * @protected
   */
  drawIcon_(group) {
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
   * @return {!SVGElement} The top-level node of the editor.
   * @private
   */
  createEditor_() {
    /* Create the editor.  Here's the markup that will be generated in
     * editable mode:
      <foreignObject x="8" y="8" width="164" height="164">
        <body xmlns="http://www.w3.org/1999/xhtml" class="blocklyMinimalBody">
          <textarea xmlns="http://www.w3.org/1999/xhtml"
              class="blocklyCommentTextarea"
              style="height: 164px; width: 164px;"></textarea>
        </body>
      </foreignObject>
     * For non-editable mode see Warning.textToDom_.
     */

    this.foreignObject_ = dom.createSvgElement(
        Svg.FOREIGNOBJECT, {'x': Bubble.BORDER_WIDTH, 'y': Bubble.BORDER_WIDTH},
        null);

    const body = document.createElementNS(dom.HTML_NS, 'body');
    body.setAttribute('xmlns', dom.HTML_NS);
    body.className = 'blocklyMinimalBody';

    this.textarea_ = document.createElementNS(dom.HTML_NS, 'textarea');
    const textarea = this.textarea_;
    textarea.className = 'blocklyCommentTextarea';
    textarea.setAttribute('dir', this.block_.RTL ? 'RTL' : 'LTR');
    textarea.value = this.model_.text;
    this.resizeTextarea_();

    body.appendChild(textarea);
    this.foreignObject_.appendChild(body);

    // Ideally this would be hooked to the focus event for the comment.
    // However doing so in Firefox swallows the cursor for unknown reasons.
    // So this is hooked to mouseup instead.  No big deal.
    this.onMouseUpWrapper_ = browserEvents.conditionalBind(
        textarea, 'mouseup', this, this.startEdit_, true, true);
    // Don't zoom with mousewheel.
    this.onWheelWrapper_ =
        browserEvents.conditionalBind(textarea, 'wheel', this, function(e) {
          e.stopPropagation();
        });
    this.onChangeWrapper_ = browserEvents.conditionalBind(
        textarea, 'change', this,
        /**
         * @this {Comment}
         * @param {Event} _e Unused event parameter.
         */
        function(_e) {
          if (this.cachedText_ !== this.model_.text) {
            eventUtils.fire(new (eventUtils.get(eventUtils.BLOCK_CHANGE))(
                this.block_, 'comment', null, this.cachedText_,
                this.model_.text));
          }
        });
    this.onInputWrapper_ = browserEvents.conditionalBind(
        textarea, 'input', this,
        /**
         * @this {Comment}
         * @param {Event} _e Unused event parameter.
         */
        function(_e) {
          this.model_.text = textarea.value;
        });

    setTimeout(textarea.focus.bind(textarea), 0);

    return this.foreignObject_;
  }

  /**
   * Add or remove editability of the comment.
   * @override
   */
  updateEditable() {
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
   * @private
   */
  onBubbleResize_() {
    if (!this.isVisible()) {
      return;
    }
    this.model_.size = this.bubble_.getBubbleSize();
    this.resizeTextarea_();
  }

  /**
   * Resizes the text area to match the size defined on the model (which is
   * the size of the bubble).
   * @private
   */
  resizeTextarea_() {
    const size = this.model_.size;
    const doubleBorderWidth = 2 * Bubble.BORDER_WIDTH;
    const widthMinusBorder = size.width - doubleBorderWidth;
    const heightMinusBorder = size.height - doubleBorderWidth;
    this.foreignObject_.setAttribute('width', widthMinusBorder);
    this.foreignObject_.setAttribute('height', heightMinusBorder);
    this.textarea_.style.width = (widthMinusBorder - 4) + 'px';
    this.textarea_.style.height = (heightMinusBorder - 4) + 'px';
  }

  /**
   * Show or hide the comment bubble.
   * @param {boolean} visible True if the bubble should be visible.
   */
  setVisible(visible) {
    if (visible === this.isVisible()) {
      return;
    }
    eventUtils.fire(new (eventUtils.get(eventUtils.BUBBLE_OPEN))(
        this.block_, visible, 'comment'));
    this.model_.pinned = visible;
    if (visible) {
      this.createBubble_();
    } else {
      this.disposeBubble_();
    }
  }

  /**
   * Show the bubble. Handles deciding if it should be editable or not.
   * @private
   */
  createBubble_() {
    if (!this.block_.isEditable() || userAgent.IE) {
      // MSIE does not support foreignobject; textareas are impossible.
      // https://docs.microsoft.com/en-us/openspecs/ie_standards/ms-svg/56e6e04c-7c8c-44dd-8100-bd745ee42034
      // Always treat comments in IE as uneditable.
      this.createNonEditableBubble_();
    } else {
      this.createEditableBubble_();
    }
  }

  /**
   * Show an editable bubble.
   * @private
   */
  createEditableBubble_() {
    this.bubble_ = new Bubble(
        /** @type {!WorkspaceSvg} */ (this.block_.workspace),
        this.createEditor_(), this.block_.pathObject.svgPath,
        /** @type {!Coordinate} */ (this.iconXY_), this.model_.size.width,
        this.model_.size.height);
    // Expose this comment's block's ID on its top-level SVG group.
    this.bubble_.setSvgId(this.block_.id);
    this.bubble_.registerResizeEvent(this.onBubbleResize_.bind(this));
    this.applyColour();
  }

  /**
   * Show a non-editable bubble.
   * @private
   * @suppress {checkTypes} Suppress `this` type mismatch.
   */
  createNonEditableBubble_() {
    // TODO (#2917): It would be great if the comment could support line breaks.
    this.paragraphElement_ = Bubble.textToDom(this.block_.getCommentText());
    this.bubble_ = Bubble.createNonEditableBubble(
        this.paragraphElement_, /** @type {!BlockSvg} */ (this.block_),
        /** @type {!Coordinate} */ (this.iconXY_));
    this.applyColour();
  }

  /**
   * Dispose of the bubble.
   * @private
   * @suppress {checkTypes} Suppress `this` type mismatch.
   */
  disposeBubble_() {
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
    this.bubble_.dispose();
    this.bubble_ = null;
    this.textarea_ = null;
    this.foreignObject_ = null;
    this.paragraphElement_ = null;
  }

  /**
   * Callback fired when an edit starts.
   *
   * Bring the comment to the top of the stack when clicked on. Also cache the
   * current text so it can be used to fire a change event.
   * @param {!Event} _e Mouse up event.
   * @private
   */
  startEdit_(_e) {
    if (this.bubble_.promote()) {
      // Since the act of moving this node within the DOM causes a loss of
      // focus, we need to reapply the focus.
      this.textarea_.focus();
    }

    this.cachedText_ = this.model_.text;
  }

  /**
   * Get the dimensions of this comment's bubble.
   * @return {Size} Object with width and height properties.
   */
  getBubbleSize() {
    return this.model_.size;
  }

  /**
   * Size this comment's bubble.
   * @param {number} width Width of the bubble.
   * @param {number} height Height of the bubble.
   */
  setBubbleSize(width, height) {
    if (this.bubble_) {
      this.bubble_.setBubbleSize(width, height);
    } else {
      this.model_.size.width = width;
      this.model_.size.height = height;
    }
  }

  /**
   * Update the comment's view to match the model.
   * @package
   */
  updateText() {
    if (this.textarea_) {
      this.textarea_.value = this.model_.text;
    } else if (this.paragraphElement_) {
      // Non-Editable mode.
      // TODO (#2917): If 2917 gets added this will probably need to be updated.
      this.paragraphElement_.firstChild.textContent = this.model_.text;
    }
  }

  /**
   * Dispose of this comment.
   *
   * If you want to receive a comment "delete" event (newValue: null), then this
   * should not be called directly. Instead call block.setCommentText(null);
   */
  dispose() {
    this.block_.comment = null;
    Icon.prototype.dispose.call(this);
  }
}

/**
 * CSS for block comment.  See css.js for use.
 */
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

exports.Comment = Comment;
