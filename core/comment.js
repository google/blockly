/**
 * @license
 * Copyright 2011 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Object representing a code comment.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Comment');

goog.require('Blockly.Bubble');
goog.require('Blockly.Events');
goog.require('Blockly.Events.BlockChange');
goog.require('Blockly.Events.Ui');
goog.require('Blockly.Icon');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.userAgent');
goog.require('Blockly.Warning');


/**
 * Class for a comment.
 * @param {!Blockly.Block} block The block associated with this comment.
 * @extends {Blockly.Icon}
 * @constructor
 */
Blockly.Comment = function(block) {
  Blockly.Comment.superClass_.constructor.call(this, block);

  /**
   * The model for this comment.
   * @type {!Blockly.Block.CommentModel}
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

  this.createIcon();
};
Blockly.utils.object.inherits(Blockly.Comment, Blockly.Icon);

/**
 * Draw the comment icon.
 * @param {!Element} group The icon group.
 * @private
 */
Blockly.Comment.prototype.drawIcon_ = function(group) {
  // Circle.
  Blockly.utils.dom.createSvgElement('circle',
      {'class': 'blocklyIconShape', 'r': '8', 'cx': '8', 'cy': '8'},
      group);
  // Can't use a real '?' text character since different browsers and operating
  // systems render it differently.
  // Body of question mark.
  Blockly.utils.dom.createSvgElement('path',
      {
        'class': 'blocklyIconSymbol',
        'd': 'm6.8,10h2c0.003,-0.617 0.271,-0.962 0.633,-1.266 2.875,-2.405' +
          '0.607,-5.534 -3.765,-3.874v1.7c3.12,-1.657 3.698,0.118 2.336,1.25' +
          '-1.201,0.998 -1.201,1.528 -1.204,2.19z'},
      group);
  // Dot of question mark.
  Blockly.utils.dom.createSvgElement('rect',
      {
        'class': 'blocklyIconSymbol',
        'x': '6.8',
        'y': '10.78',
        'height': '2',
        'width': '2'
      },
      group);
};

/**
 * Create the editor for the comment's bubble.
 * @return {!SVGElement} The top-level node of the editor.
 * @private
 */
Blockly.Comment.prototype.createEditor_ = function() {
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

  this.foreignObject_ = Blockly.utils.dom.createSvgElement('foreignObject',
      {'x': Blockly.Bubble.BORDER_WIDTH, 'y': Blockly.Bubble.BORDER_WIDTH},
      null);

  var body = document.createElementNS(Blockly.utils.dom.HTML_NS, 'body');
  body.setAttribute('xmlns', Blockly.utils.dom.HTML_NS);
  body.className = 'blocklyMinimalBody';

  this.textarea_ = document.createElementNS(
      Blockly.utils.dom.HTML_NS, 'textarea');
  var textarea = this.textarea_;
  textarea.className = 'blocklyCommentTextarea';
  textarea.setAttribute('dir', this.block_.RTL ? 'RTL' : 'LTR');
  textarea.value = this.model_.text;
  this.resizeTextarea_();

  body.appendChild(textarea);
  this.foreignObject_.appendChild(body);

  // Ideally this would be hooked to the focus event for the comment.
  // However doing so in Firefox swallows the cursor for unknown reasons.
  // So this is hooked to mouseup instead.  No big deal.
  Blockly.bindEventWithChecks_(textarea, 'mouseup', this, this.startEdit_,
      true, true);
  // Don't zoom with mousewheel.
  Blockly.bindEventWithChecks_(textarea, 'wheel', this, function(e) {
    e.stopPropagation();
  });
  Blockly.bindEventWithChecks_(textarea, 'change', this, function(_e) {
    if (this.cachedText_ != this.model_.text) {
      Blockly.Events.fire(new Blockly.Events.BlockChange(
          this.block_, 'comment', null, this.cachedText_, this.model_.text));
    }
  });
  Blockly.bindEventWithChecks_(textarea, 'input', this, function(_e) {
    this.model_.text = textarea.value;
  });

  setTimeout(textarea.focus.bind(textarea), 0);

  return this.foreignObject_;
};

/**
 * Add or remove editability of the comment.
 * @override
 */
Blockly.Comment.prototype.updateEditable = function() {
  Blockly.Comment.superClass_.updateEditable.call(this);
  if (this.isVisible()) {
    // Recreate the bubble with the correct UI.
    this.disposeBubble_();
    this.createBubble_();
  }
};

/**
 * Callback function triggered when the bubble has resized.
 * Resize the text area accordingly.
 * @private
 */
Blockly.Comment.prototype.onBubbleResize_ = function() {
  if (!this.isVisible()) {
    return;
  }
  this.model_.size = this.bubble_.getBubbleSize();
  this.resizeTextarea_();
};

/**
 * Resizes the text area to match the size defined on the model (which is
 * the size of the bubble).
 * @private
 */
Blockly.Comment.prototype.resizeTextarea_ = function() {
  var size = this.model_.size;
  var doubleBorderWidth = 2 * Blockly.Bubble.BORDER_WIDTH;
  var widthMinusBorder = size.width - doubleBorderWidth;
  var heightMinusBorder = size.height - doubleBorderWidth;
  this.foreignObject_.setAttribute('width', widthMinusBorder);
  this.foreignObject_.setAttribute('height', heightMinusBorder);
  this.textarea_.style.width = (widthMinusBorder - 4) + 'px';
  this.textarea_.style.height = (heightMinusBorder - 4) + 'px';
};

/**
 * Show or hide the comment bubble.
 * @param {boolean} visible True if the bubble should be visible.
 */
Blockly.Comment.prototype.setVisible = function(visible) {
  if (visible == this.isVisible()) {
    return;
  }
  Blockly.Events.fire(
      new Blockly.Events.Ui(this.block_, 'commentOpen', !visible, visible));
  this.model_.pinned = visible;
  if (visible) {
    this.createBubble_();
  } else {
    this.disposeBubble_();
  }
};

/**
 * Show the bubble. Handles deciding if it should be editable or not.
 * @private
 */
Blockly.Comment.prototype.createBubble_ = function() {
  if (!this.block_.isEditable() || Blockly.utils.userAgent.IE) {
    // Steal the code from warnings to make an uneditable text bubble.
    // MSIE does not support foreignobject; textareas are impossible.
    // https://docs.microsoft.com/en-us/openspecs/ie_standards/ms-svg/56e6e04c-7c8c-44dd-8100-bd745ee42034
    // Always treat comments in IE as uneditable.
    this.createNonEditableBubble_();
  } else {
    this.createEditableBubble_();
  }
};

/**
 * Show an editable bubble.
 * @private
 */
Blockly.Comment.prototype.createEditableBubble_ = function() {
  this.bubble_ = new Blockly.Bubble(
      /** @type {!Blockly.WorkspaceSvg} */ (this.block_.workspace),
      this.createEditor_(), this.block_.svgPath_,
      this.iconXY_, this.model_.size.width, this.model_.size.height);
  // Expose this comment's block's ID on its top-level SVG group.
  this.bubble_.setSvgId(this.block_.id);
  this.bubble_.registerResizeEvent(this.onBubbleResize_.bind(this));
  this.updateColour();
};

/**
 * Show a non-editable bubble.
 * @private
 */
Blockly.Comment.prototype.createNonEditableBubble_ = function() {
  // TODO (#2917): It would be great if the comment could support line breaks.
  Blockly.Warning.prototype.createBubble.call(this);
};

/**
 * Dispose of the bubble.
 * @private
 */
Blockly.Comment.prototype.disposeBubble_ = function() {
  if (this.paragraphElement_) {
    // We're using the warning UI so we have to let it dispose.
    Blockly.Warning.prototype.disposeBubble.call(this);
    return;
  }

  this.bubble_.dispose();
  this.bubble_ = null;
  this.textarea_ = null;
  this.foreignObject_ = null;
};

/**
 * Callback fired when an edit starts.
 *
 * Bring the comment to the top of the stack when clicked on. Also cache the
 * current text so it can be used to fire a change event.
 * @param {!Event} _e Mouse up event.
 * @private
 */
Blockly.Comment.prototype.startEdit_ = function(_e) {
  if (this.bubble_.promote_()) {
    // Since the act of moving this node within the DOM causes a loss of focus,
    // we need to reapply the focus.
    this.textarea_.focus();
  }

  this.cachedText_ = this.model_.text;
};

/**
 * Get the dimensions of this comment's bubble.
 * @return {Blockly.utils.Size} Object with width and height properties.
 */
Blockly.Comment.prototype.getBubbleSize = function() {
  return this.model_.size;
};

/**
 * Size this comment's bubble.
 * @param {number} width Width of the bubble.
 * @param {number} height Height of the bubble.
 */
Blockly.Comment.prototype.setBubbleSize = function(width, height) {
  if (this.bubble_) {
    this.bubble_.setBubbleSize(width, height);
  } else {
    this.model_.size.width = width;
    this.model_.size.height = height;
  }
};

/**
 * Returns this comment's text.
 * @return {string} Comment text.
 * @deprecated August 2019 Use block.getCommentText() instead.
 */
Blockly.Comment.prototype.getText = function() {
  return this.model_.text || '';
};

/**
 * Set this comment's text.
 *
 * If you want to receive a comment change event, then this should not be called
 * directly. Instead call block.setCommentText();
 * @param {string} text Comment text.
 * @deprecated August 2019 Use block.setCommentText() instead.
 */
Blockly.Comment.prototype.setText = function(text) {
  if (this.model_.text == text) {
    return;
  }
  this.model_.text = text;
  this.updateText();
};

/**
 * Update the comment's view to match the model.
 * @package
 */
Blockly.Comment.prototype.updateText = function() {
  if (this.textarea_) {
    this.textarea_.value = this.model_.text;
  } else if (this.paragraphElement_) {
    // Non-Editable mode.
    // TODO (#2917): If 2917 gets added this will probably need to be updated.
    this.paragraphElement_.firstChild.textContent = this.model_.text;
  }
};

/**
 * Dispose of this comment.
 *
 * If you want to receive a comment "delete" event (newValue: null), then this
 * should not be called directly. Instead call block.setCommentText(null);
 */
Blockly.Comment.prototype.dispose = function() {
  this.block_.comment = null;
  Blockly.Icon.prototype.dispose.call(this);
};
