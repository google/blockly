/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * https://developers.google.com/blockly/
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
   * @type {TextBubbleModel}
   * @private
   */
  this.model_ = block.commentModel;

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
 * @return {!Element} The top-level node of the editor.
 * @private
 */
Blockly.Comment.prototype.createEditor_ = function() {
  /* Create the editor.  Here's the markup that will be generated:
    <foreignObject x="8" y="8" width="164" height="164">
      <body xmlns="http://www.w3.org/1999/xhtml" class="blocklyMinimalBody">
        <textarea xmlns="http://www.w3.org/1999/xhtml"
            class="blocklyCommentTextarea"
            style="height: 164px; width: 164px;"></textarea>
      </body>
    </foreignObject>
  */
  this.foreignObject_ = Blockly.utils.dom.createSvgElement('foreignObject',
      {'x': Blockly.Bubble.BORDER_WIDTH, 'y': Blockly.Bubble.BORDER_WIDTH},
      null);
  var body = document.createElementNS(Blockly.utils.dom.HTML_NS, 'body');
  body.setAttribute('xmlns', Blockly.utils.dom.HTML_NS);
  body.className = 'blocklyMinimalBody';
  var textarea = document.createElementNS(Blockly.utils.dom.HTML_NS, 'textarea');
  textarea.className = 'blocklyCommentTextarea';
  textarea.setAttribute('dir', this.block_.RTL ? 'RTL' : 'LTR');
  body.appendChild(textarea);
  this.textarea_ = textarea;
  this.foreignObject_.appendChild(body);
  Blockly.bindEventWithChecks_(textarea, 'mouseup', this, this.textareaFocus_,
      true, true);
  // Don't zoom with mousewheel.
  Blockly.bindEventWithChecks_(textarea, 'wheel', this, function(e) {
    e.stopPropagation();
  });
  Blockly.bindEventWithChecks_(textarea, 'change', this, function(_e) {
    if (this.model_.text != textarea.value) {
      Blockly.Events.fire(new Blockly.Events.BlockChange(
          this.block_, 'comment', null, this.model_.text, textarea.value));
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
  if (this.isVisible()) {
    // Toggling visibility will force a rerendering.
    this.setVisible(false);
    this.setVisible(true);
  }
  // Allow the icon to update.
  Blockly.Comment.superClass_.updateEditable.call(this);
};

/**
 * Callback function triggered when the bubble has resized.
 * Resize the text area accordingly.
 * @private
 */
Blockly.Comment.prototype.resizeBubble_ = function() {
  if (this.isVisible()) {
    var size = this.bubble_.getBubbleSize();
    var doubleBorderWidth = 2 * Blockly.Bubble.BORDER_WIDTH;
    this.foreignObject_.setAttribute('width', size.width - doubleBorderWidth);
    this.foreignObject_.setAttribute('height', size.height - doubleBorderWidth);
    this.textarea_.style.width = (size.width - doubleBorderWidth - 4) + 'px';
    this.textarea_.style.height = (size.height - doubleBorderWidth - 4) + 'px';
  }
};

/**
 * Show or hide the comment bubble.
 * @param {boolean} visible True if the bubble should be visible.
 */
Blockly.Comment.prototype.setVisible = function(visible) {
  if (visible == this.isVisible()) {
    // No change.
    return;
  }
  Blockly.Events.fire(
      new Blockly.Events.Ui(this.block_, 'commentOpen', !visible, visible));
  if ((!this.block_.isEditable() && !this.textarea_) ||
      Blockly.utils.userAgent.IE) {
    // Steal the code from warnings to make an uneditable text bubble.
    // MSIE does not support foreignobject; textareas are impossible.
    // https://docs.microsoft.com/en-us/openspecs/ie_standards/ms-svg/56e6e04c-7c8c-44dd-8100-bd745ee42034
    // Always treat comments in IE as uneditable.
    Blockly.Warning.prototype.setVisible.call(this, visible);
    return;
  }
  // Save the bubble stats before the visibility switch.
  var text = this.getText();
  var size = this.getBubbleSize();
  if (visible) {
    // Create the bubble.
    this.bubble_ = new Blockly.Bubble(
        /** @type {!Blockly.WorkspaceSvg} */ (this.block_.workspace),
        this.createEditor_(), this.block_.svgPath_,
        this.iconXY_, this.model_.size.width, this.model_.size.height);
    // Expose this comment's block's ID on its top-level SVG group.
    this.bubble_.setSvgId(this.block_.id);
    this.bubble_.registerResizeEvent(this.resizeBubble_.bind(this));
    this.updateColour();
  } else {
    // Dispose of the bubble.
    this.bubble_.dispose();
    this.bubble_ = null;
    this.textarea_ = null;
    this.foreignObject_ = null;
  }
  // Restore the bubble stats after the visibility switch.
  this.setText(text);
  this.setBubbleSize(size.width, size.height);
};

/**
 * Bring the comment to the top of the stack when clicked on.
 * @param {!Event} _e Mouse up event.
 * @private
 */
Blockly.Comment.prototype.textareaFocus_ = function(_e) {
  // Ideally this would be hooked to the focus event for the comment.
  // However doing so in Firefox swallows the cursor for unknown reasons.
  // So this is hooked to mouseup instead.  No big deal.
  if (this.bubble_.promote_()) {
    // Since the act of moving this node within the DOM causes a loss of focus,
    // we need to reapply the focus.
    this.textarea_.focus();
  }
};

/**
 * Get the dimensions of this comment's bubble.
 * @return {!Object} Object with width and height properties.
 */
Blockly.Comment.prototype.getBubbleSize = function() {
  if (this.isVisible()) {
    return this.bubble_.getBubbleSize();
  } else {
    return this.model_.size;
  }
};

/**
 * Size this comment's bubble.
 * @param {number} width Width of the bubble.
 * @param {number} height Height of the bubble.
 */
Blockly.Comment.prototype.setBubbleSize = function(width, height) {
  if (this.textarea_) {
    this.bubble_.setBubbleSize(width, height);
  } else {
    this.model_.size.width = width;
    this.model_.size.height = height;
  }
};

/**
 * Returns this comment's text.
 * @return {string} Comment text.
 */
Blockly.Comment.prototype.getText = function() {
  return this.model_.text;
};

/**
 * Set this comment's text.
 * @param {string} text Comment text.
 */
Blockly.Comment.prototype.setText = function(text) {
  if (this.model_.text != text) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
        this.block_, 'comment', null, this.model_.text, text));
  }
  this.model_.text = text;
  if (this.textarea_) {
    this.textarea_.value = text;
  }
};

/**
 * Dispose of this comment.
 *
 * If you want to get the event, then this should not be called directly.
 * Instead call block.setCommentText(null);
 */
Blockly.Comment.prototype.dispose = function() {
  this.block_.comment = null;
  Blockly.Icon.prototype.dispose.call(this);
};
