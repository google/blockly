/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
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
 * @fileoverview Methods for rendering a workspace comment as SVG
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.WorkspaceCommentSvg.render');

goog.require('Blockly.WorkspaceCommentSvg');

Blockly.WorkspaceCommentSvg.prototype.render = function() {

  this.setPath_(this.getHeight(), this.getWidth());

  // Add text area
  this.createEditor_();
  this.svgGroup_.appendChild(this.foreignObject_);

  var doubleBorderWidth = 2 * Blockly.Bubble.BORDER_WIDTH;

  this.foreignObject_.setAttribute('width',
      this.getWidth() - doubleBorderWidth);
  this.foreignObject_.setAttribute('height',
      this.getHeight() - doubleBorderWidth);
  this.textarea_.style.width =
      (this.getWidth() - doubleBorderWidth - 4) + 'px';
  this.textarea_.style.height =
      (this.getHeight() - doubleBorderWidth - 4) + 'px';

  // Set the content
  this.textarea_.value = this.content;
};

/**
 * Set the path of the comment outline.
 * @param {number} height Height of the container.
 * @param {number} width Width of the container.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.setPath_ = function(height, width) {
  var steps = [];
  steps.push('m 0,0');
  steps.push('H', width);
  steps.push('v', height);
  steps.push('H 0');
  steps.push('z');

  var pathString = steps.join(' ');
  this.svgPath_.setAttribute('d', pathString);
  if (this.RTL) {
    // Mirror the block's path.
    this.svgPath_.setAttribute('transform', 'scale(-1 1)');
  }
};

/**
 * Create the text area for the comment.
 * @return {!Element} The top-level node of the editor.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.createEditor_ = function() {
  /* Create the editor.  Here's the markup that will be generated:
    <foreignObject x="8" y="8" width="164" height="164">
      <body xmlns="http://www.w3.org/1999/xhtml" class="blocklyMinimalBody">
        <textarea xmlns="http://www.w3.org/1999/xhtml"
            class="blocklyCommentTextarea"
            style="height: 164px; width: 164px;"></textarea>
      </body>
    </foreignObject>
  */
  this.foreignObject_ = Blockly.utils.createSvgElement('foreignObject',
      {'x': Blockly.Bubble.BORDER_WIDTH, 'y': Blockly.Bubble.BORDER_WIDTH},
      null);
  var body = document.createElementNS(Blockly.HTML_NS, 'body');
  body.setAttribute('xmlns', Blockly.HTML_NS);
  body.className = 'blocklyMinimalBody';
  var textarea = document.createElementNS(Blockly.HTML_NS, 'textarea');
  textarea.className = 'blocklyCommentTextarea';
  textarea.setAttribute('dir', this.RTL ? 'RTL' : 'LTR');
  body.appendChild(textarea);
  this.textarea_ = textarea;
  this.foreignObject_.appendChild(body);
  Blockly.bindEventWithChecks_(textarea, 'mouseup', this, this.textareaFocus_);
  // Don't zoom with mousewheel.
  Blockly.bindEventWithChecks_(textarea, 'wheel', this, function(e) {
    e.stopPropagation();
  });
  Blockly.bindEventWithChecks_(textarea, 'change', this, function(
      /* eslint-disable no-unused-vars */ e
      /* eslint-enable no-unused-vars */) {
    if (this.text_ != textarea.value) {
      Blockly.Events.fire(new Blockly.Events.BlockChange(
        this.block_, 'comment', null, this.text_, textarea.value));
      this.text_ = textarea.value;
    }
  });
  setTimeout(function() {
    textarea.focus();
  }, 0);
  return this.foreignObject_;
};
