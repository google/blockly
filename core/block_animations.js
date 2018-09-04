/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
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
 * @fileoverview Methods animating a block on connection and disconnection.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.BlockAnimations');

goog.require('Blockly.utils');


/**
 * PID of disconnect UI animation.  There can only be one at a time.
 * @type {number}
 * @private
 */
Blockly.BlockAnimations.disconnectPid_ = 0;

/**
 * SVG group of wobbling block.  There can only be one at a time.
 * @type {Element}
 * @private
 */
Blockly.BlockAnimations.disconnectGroup_ = null;

/**
 * Play some UI effects (sound, animation) when disposing of a block.
 * @param {!Blockly.BlockSvg} block The block being disposed of.
 * @package
 */
Blockly.BlockAnimations.disposeUiEffect = function(block) {
  var workspace = block.workspace;
  var svgGroup = block.getSvgRoot();
  workspace.getAudioManager().play('delete');

  var xy = workspace.getSvgXY(svgGroup);
  // Deeply clone the current block.
  var clone = svgGroup.cloneNode(true);
  clone.translateX_ = xy.x;
  clone.translateY_ = xy.y;
  clone.setAttribute('transform', 'translate(' + xy.x + ',' + xy.y + ')');
  workspace.getParentSvg().appendChild(clone);
  clone.bBox_ = clone.getBBox();
  // Start the animation.
  Blockly.BlockAnimations.disposeUiStep_(clone, workspace.RTL, new Date,
      workspace.scale);
};

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
Blockly.BlockAnimations.disposeUiStep_ = function(clone, rtl, start,
    workspaceScale) {
  var ms = new Date - start;
  var percent = ms / 150;
  if (percent > 1) {
    Blockly.utils.removeNode(clone);
  } else {
    var x = clone.translateX_ +
        (rtl ? -1 : 1) * clone.bBox_.width * workspaceScale / 2 * percent;
    var y = clone.translateY_ + clone.bBox_.height * workspaceScale * percent;
    var scale = (1 - percent) * workspaceScale;
    clone.setAttribute('transform', 'translate(' + x + ',' + y + ')' +
        ' scale(' + scale + ')');
    setTimeout(Blockly.BlockAnimations.disposeUiStep_, 10, clone, rtl, start,
        workspaceScale);
  }
};

/**
 * Play some UI effects (sound, ripple) after a connection has been established.
 * @param {!Blockly.BlockSvg} block The block being connected.
 * @package
 */
Blockly.BlockAnimations.connectionUiEffect = function(block) {
  var workspace = block.workspace;
  var scale = workspace.scale;
  workspace.getAudioManager().play('click');
  if (scale < 1) {
    return;  // Too small to care about visual effects.
  }
  // Determine the absolute coordinates of the inferior block.
  var xy = workspace.getSvgXY(block.getSvgRoot());
  // Offset the coordinates based on the two connection types, fix scale.
  if (block.outputConnection) {
    xy.x += (block.RTL ? 3 : -3) * scale;
    xy.y += 13 * scale;
  } else if (block.previousConnection) {
    xy.x += (block.RTL ? -23 : 23) * scale;
    xy.y += 3 * scale;
  }
  var ripple = Blockly.utils.createSvgElement('circle',
      {
        'cx': xy.x,
        'cy': xy.y,
        'r': 0,
        'fill': 'none',
        'stroke': '#888',
        'stroke-width': 10
      },
      workspace.getParentSvg());
  // Start the animation.
  Blockly.BlockAnimations.connectionUiStep_(ripple, new Date, scale);
};

/**
 * Expand a ripple around a connection.
 * @param {!Element} ripple Element to animate.
 * @param {!Date} start Date of animation's start.
 * @param {number} scale Scale of workspace.
 * @private
 */
Blockly.BlockAnimations.connectionUiStep_ = function(ripple, start, scale) {
  var ms = new Date - start;
  var percent = ms / 150;
  if (percent > 1) {
    Blockly.utils.removeNode(ripple);
  } else {
    ripple.setAttribute('r', percent * 25 * scale);
    ripple.style.opacity = 1 - percent;
    Blockly.BlockAnimations.disconnectPid_ = setTimeout(
        Blockly.BlockAnimations.connectionUiStep_, 10, ripple, start, scale);
  }
};

/**
 * Play some UI effects (sound, animation) when disconnecting a block.
 * @param {!Blockly.BlockSvg} block The block being disconnected.
 * @package
 */
Blockly.BlockAnimations.disconnectUiEffect = function(block) {
  block.workspace.getAudioManager().play('disconnect');
  if (block.workspace.scale < 1) {
    return;  // Too small to care about visual effects.
  }
  // Horizontal distance for bottom of block to wiggle.
  var DISPLACEMENT = 10;
  // Scale magnitude of skew to height of block.
  var height = block.getHeightWidth().height;
  var magnitude = Math.atan(DISPLACEMENT / height) / Math.PI * 180;
  if (!block.RTL) {
    magnitude *= -1;
  }
  // Start the animation.
  Blockly.BlockAnimations.disconnectUiStep_(
      block.getSvgRoot(), magnitude, new Date);
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
    var skew = Math.round(
        Math.sin(percent * Math.PI * WIGGLES) * (1 - percent) * magnitude);
    group.skew_ = 'skewX(' + skew + ')';
    Blockly.BlockAnimations.disconnectGroup_ = group;
    Blockly.BlockAnimations.disconnectPid_ =
        setTimeout(Blockly.BlockAnimations.disconnectUiStep_, 10, group,
            magnitude, start);
  }
  group.setAttribute('transform', group.translate_ + group.skew_);
};

/**
 * Stop the disconnect UI animation immediately.
 * @package
 */
Blockly.BlockAnimations.disconnectUiStop = function() {
  if (Blockly.BlockAnimations.disconnectGroup_) {
    clearTimeout(Blockly.BlockAnimations.disconnectPid_);
    var group = Blockly.BlockAnimations.disconnectGroup_;
    group.skew_ = '';
    group.setAttribute('transform', group.translate_);
    Blockly.BlockAnimations.disconnectGroup_ = null;
  }
};
