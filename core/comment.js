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
goog.require('Blockly.Icon');
goog.require('goog.userAgent');


/**
 * Class for a comment.
 * @param {!Blockly.Block} block The block associated with this comment.
 * @extends {Blockly.Icon}
 * @constructor
 */
Blockly.Comment = function(block) {
  Blockly.Comment.superClass_.constructor.call(this, block);
  this.createIcon();
};
goog.inherits(Blockly.Comment, Blockly.Icon);

/**
 * Comment text (if bubble is not visible).
 * @private
 */
Blockly.Comment.prototype.text_ = '';

/**
 * Width of bubble.
 * @private
 */
Blockly.Comment.prototype.width_ = 160;

/**
 * Height of bubble.
 * @private
 */
Blockly.Comment.prototype.height_ = 80;

/**
 * Draw the comment icon.
 * @param {!Element} group The icon group.
 * @private
 */
Blockly.Comment.prototype.drawIcon_ = function(group) {
  // Circle.
  Blockly.createSvgElement('circle',
      {'class': 'blocklyIconShape', 'r': '8', 'cx': '8', 'cy': '8'},
       group);
  // Can't use a real '?' text character since different browsers and operating
  // systems render it differently.
  // Body of question mark.
  Blockly.createSvgElement('path',
      {'class': 'blocklyIconSymbol',
       'd': 'm6.8,10h2c0.003,-0.617 0.271,-0.962 0.633,-1.266 2.875,-2.405 0.607,-5.534 -3.765,-3.874v1.7c3.12,-1.657 3.698,0.118 2.336,1.25 -1.201,0.998 -1.201,1.528 -1.204,2.19z'},
       group);
  // Dot of question point.
  Blockly.createSvgElement('rect',
      {'class': 'blocklyIconSymbol',
       'x': '6.8', 'y': '10.78', 'height': '2', 'width': '2'},
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
  this.foreignObject_ = Blockly.createSvgElement('foreignObject',
      {'x': Blockly.Bubble.BORDER_WIDTH, 'y': Blockly.Bubble.BORDER_WIDTH},
      null);
  var body = document.createElementNS(Blockly.HTML_NS, 'body');
  body.setAttribute('xmlns', Blockly.HTML_NS);
  body.className = 'blocklyMinimalBody';
  this.textarea_ = document.createElementNS(Blockly.HTML_NS, 'textarea');
  this.textarea_.className = 'blocklyCommentTextarea';
  this.textarea_.setAttribute('dir', this.block_.RTL ? 'RTL' : 'LTR');
  body.appendChild(this.textarea_);
  this.foreignObject_.appendChild(body);
  Blockly.bindEvent_(this.textarea_, 'mouseup', this, this.textareaFocus_);
  // Don't zoom with mousewheel.
  Blockly.bindEvent_(this.textarea_, 'wheel', this, function(e) {
    e.stopPropagation();
  });
  Blockly.bindEvent_(this.textarea_, 'change', this, function(e) {
    if (this.text_ != this.textarea_.value) {
      Blockly.Events.fire(new Blockly.Events.Change(
        this.block_, 'comment', null, this.text_, this.textarea_.value));
      this.text_ = this.textarea_.value;
    }
  });

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
  Blockly.Icon.prototype.updateEditable.call(this);
};

/**
 * Callback function triggered when the bubble has resized.
 * Resize the text area accordingly.
 * @private
 */
Blockly.Comment.prototype.resizeBubble_ = function() {
  var size = this.bubble_.getBubbleSize();
  var doubleBorderWidth = 2 * Blockly.Bubble.BORDER_WIDTH;
  this.foreignObject_.setAttribute('width', size.width - doubleBorderWidth);
  this.foreignObject_.setAttribute('height', size.height - doubleBorderWidth);
  this.textarea_.style.width = (size.width - doubleBorderWidth - 4) + 'px';
  this.textarea_.style.height = (size.height - doubleBorderWidth - 4) + 'px';
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
  if ((!this.block_.isEditable() && !this.textarea_) || goog.userAgent.IE) {
    // Steal the code from warnings to make an uneditable text bubble.
    // MSIE does not support foreignobject; textareas are impossible.
    // http://msdn.microsoft.com/en-us/library/hh834675%28v=vs.85%29.aspx
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
        this.iconXY_, this.width_, this.height_);
    this.bubble_.registerResizeEvent(this, this.resizeBubble_);
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
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.Comment.prototype.textareaFocus_ = function(e) {
  // Ideally this would be hooked to the focus event for the comment.
  // However doing so in Firefox swallows the cursor for unknown reasons.
  // So this is hooked to mouseup instead.  No big deal.
  this.bubble_.promote_();
  // Since the act of moving this node within the DOM causes a loss of focus,
  // we need to reapply the focus.
  this.textarea_.focus();
};

/**
 * Get the dimensions of this comment's bubble.
 * @return {!Object} Object with width and height properties.
 */
Blockly.Comment.prototype.getBubbleSize = function() {
  if (this.isVisible()) {
    return this.bubble_.getBubbleSize();
  } else {
    return {width: this.width_, height: this.height_};
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
    this.width_ = width;
    this.height_ = height;
  }
};

/**
 * Returns this comment's text.
 * @return {string} Comment text.
 */
Blockly.Comment.prototype.getText = function() {
  return this.textarea_ ? this.textarea_.value : this.text_;
};

/**
 * Set this comment's text.
 * @param {string} text Comment text.
 */
Blockly.Comment.prototype.setText = function(text) {
  if (this.text_ != text) {
    Blockly.Events.fire(new Blockly.Events.Change(
      this.block_, 'comment', null, this.text_, text));
    this.text_ = text;
  }
  if (this.textarea_) {
    this.textarea_.value = text;
  }
};

/**
 * Dispose of this comment.
 */
Blockly.Comment.prototype.dispose = function() {
  if (Blockly.Events.isEnabled()) {
    this.setText('');  // Fire event to delete comment.
  }
  this.block_.comment = null;
  Blockly.Icon.prototype.dispose.call(this);
};
