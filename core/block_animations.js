/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Methods for graphically rendering a block as SVG.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.BlockAnimations');

goog.require('Blockly.BlockSvg');
goog.require('Blockly.Block');


/**
 * Class for a block's SVG representation.
 * Not normally called directly, workspace.newBlock() is preferred.
 * @param {!Blockly.Workspace} workspace The block's workspace.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new id.
 * @extends {Blockly.Block}
 * @constructor
 */
Blockly.BlockAnimations = function(workspace, prototypeName, opt_id) {

  /**
   * @type {SVGElement}
   * @private
   */
  this.svgPath_ = Blockly.utils.createSvgElement('path', {'class': 'blocklyPath'},
      this.svgGroup_);

  /**
   * @type {SVGElement}
   * @private
   */
  this.svgPathLight_ = Blockly.utils.createSvgElement('path',
      {'class': 'blocklyPathLight'}, this.svgGroup_);
  this.svgPath_.tooltip = this;

  /** @type {boolean} */
  this.rendered = false;

  Blockly.Tooltip.bindMouseEvents(this.svgPath_);
  Blockly.BlockAnimations.superClass_.constructor.call(this,
      workspace, prototypeName, opt_id);
};
goog.inherits(Blockly.BlockAnimations, Blockly.Block);

/**
 * Constant for identifying rows that are to be rendered inline.
 * Don't collide with Blockly.INPUT_VALUE and friends.
 * @const
 */
Blockly.BlockAnimations.INLINE = -1;

/**
 * Animate a cloned block and eventually dispose of it.
 * This is a class method, not an instance method since the original block has
 * been destroyed and is no longer accessible.
 * @param {!Element} clone SVG element to animate and dispose of.
 * @param {boolean} rtl True if RTL, false if LTR.
 * @param {!Date} start Date of animation's start.
 * @param {number} workspaceScale Scale of workspace.
 * @private
 */
Blockly.BlockAnimations.disposeUiStep_ = function(clone, rtl, start, workspaceScale) {
  var ms = new Date - start;
  var percent = ms / 150;
  if (percent > 1) {
    goog.dom.removeNode(clone);
  } else {
    var x = clone.translateX_ +
        (rtl ? -1 : 1) * clone.bBox_.width * workspaceScale / 2 * percent;
    var y = clone.translateY_ + clone.bBox_.height * workspaceScale * percent;
    var scale = (1 - percent) * workspaceScale;
    clone.setAttribute('transform', 'translate(' + x + ',' + y + ')' +
        ' scale(' + scale + ')');
    var closure = function() {
      Blockly.BlockAnimations.disposeUiStep_(clone, rtl, start, workspaceScale);
    };
    setTimeout(closure, 10);
  }
};

/**
 * Expand a ripple around a connection.
 * @param {!Element} ripple Element to animate.
 * @param {!Date} start Date of animation's start.
 * @param {number} workspaceScale Scale of workspace.
 * @private
 */
Blockly.BlockAnimations.connectionUiStep_ = function(ripple, start, workspaceScale) {
  var ms = new Date - start;
  var percent = ms / 150;
  if (percent > 1) {
    goog.dom.removeNode(ripple);
  } else {
    ripple.setAttribute('r', percent * 25 * workspaceScale);
    ripple.style.opacity = 1 - percent;
    var closure = function() {
      Blockly.BlockAnimations.connectionUiStep_(ripple, start, workspaceScale);
    };
    Blockly.BlockAnimations.disconnectUiStop_.pid_ = setTimeout(closure, 10);
  }
};

/**
 * Animate a brief wiggle of a disconnected block.
 * @param {!Element} group SVG element to animate.
 * @param {number} magnitude Maximum degrees skew (reversed for RTL).
 * @param {!Date} start Date of animation's start.
 * @private
 */
Blockly.BlockAnimations.disconnectUiStep_ = function(group, magnitude, start) {
  var DURATION = 200;  // Milliseconds.
  var WIGGLES = 3;  // Half oscillations.

  var ms = new Date - start;
  var percent = ms / DURATION;

  if (percent > 1) {
    group.skew_ = '';
  } else {
    var skew = Math.round(Math.sin(percent * Math.PI * WIGGLES) *
        (1 - percent) * magnitude);
    group.skew_ = 'skewX(' + skew + ')';
    var closure = function() {
      Blockly.BlockAnimations.disconnectUiStep_(group, magnitude, start);
    };
    Blockly.BlockAnimations.disconnectUiStop_.group = group;
    Blockly.BlockAnimations.disconnectUiStop_.pid = setTimeout(closure, 10);
  }
  group.setAttribute('transform', group.translate_ + group.skew_);
};

/**
 * Stop the disconnect UI animation immediately.
 * @private
 */
Blockly.BlockAnimations.disconnectUiStop_ = function() {
  if (Blockly.BlockAnimations.disconnectUiStop_.group) {
    clearTimeout(Blockly.BlockAnimations.disconnectUiStop_.pid);
    var group = Blockly.BlockAnimations.disconnectUiStop_.group;
    group.skew_ = '';
    group.setAttribute('transform', group.translate_);
    Blockly.BlockAnimations.disconnectUiStop_.group = null;
  }
};

/**
 * PID of disconnect UI animation.  There can only be one at a time.
 * @type {number}
 */
Blockly.BlockAnimations.disconnectUiStop_.pid = 0;

/**
 * SVG group of wobbling block.  There can only be one at a time.
 * @type {Element}
 */
Blockly.BlockAnimations.disconnectUiStop_.group = null;