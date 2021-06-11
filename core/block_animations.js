/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Methods animating a block on connection and disconnection.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.blockAnimations');

goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.Svg');

goog.requireType('Blockly.BlockSvg');


/**
 * PID of disconnect UI animation.  There can only be one at a time.
 * @type {number}
 * @private
 */
Blockly.blockAnimations.disconnectPid_ = 0;

/**
 * SVG group of wobbling block.  There can only be one at a time.
 * @type {Element}
 * @private
 */
Blockly.blockAnimations.disconnectGroup_ = null;

/**
 * Play some UI effects (sound, animation) when disposing of a block.
 * @param {!Blockly.BlockSvg} block The block being disposed of.
 * @package
 */
Blockly.blockAnimations.disposeUiEffect = function(block) {
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
  Blockly.blockAnimations.disposeUiStep_(clone, workspace.RTL, new Date,
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
Blockly.blockAnimations.disposeUiStep_ = function(clone, rtl, start,
    workspaceScale) {
  var ms = new Date - start;
  var percent = ms / 150;
  if (percent > 1) {
    Blockly.utils.dom.removeNode(clone);
  } else {
    var x = clone.translateX_ +
        (rtl ? -1 : 1) * clone.bBox_.width * workspaceScale / 2 * percent;
    var y = clone.translateY_ + clone.bBox_.height * workspaceScale * percent;
    var scale = (1 - percent) * workspaceScale;
    clone.setAttribute('transform', 'translate(' + x + ',' + y + ')' +
        ' scale(' + scale + ')');
    setTimeout(Blockly.blockAnimations.disposeUiStep_, 10, clone, rtl, start,
        workspaceScale);
  }
};

/**
 * Play some UI effects (sound, ripple) after a connection has been established.
 * @param {!Blockly.BlockSvg} block The block being connected.
 * @package
 */
Blockly.blockAnimations.connectionUiEffect = function(block) {
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
  var ripple = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.CIRCLE,
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
  Blockly.blockAnimations.connectionUiStep_(ripple, new Date, scale);
};

/**
 * Expand a ripple around a connection.
 * @param {!SVGElement} ripple Element to animate.
 * @param {!Date} start Date of animation's start.
 * @param {number} scale Scale of workspace.
 * @private
 */
Blockly.blockAnimations.connectionUiStep_ = function(ripple, start, scale) {
  var ms = new Date - start;
  var percent = ms / 150;
  if (percent > 1) {
    Blockly.utils.dom.removeNode(ripple);
  } else {
    ripple.setAttribute('r', percent * 25 * scale);
    ripple.style.opacity = 1 - percent;
    Blockly.blockAnimations.disconnectPid_ = setTimeout(
        Blockly.blockAnimations.connectionUiStep_, 10, ripple, start, scale);
  }
};

/**
 * Play some UI effects (sound, animation) when disconnecting a block.
 * @param {!Blockly.BlockSvg} block The block being disconnected.
 * @package
 */
Blockly.blockAnimations.disconnectUiEffect = function(block) {
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
  Blockly.blockAnimations.disconnectUiStep_(
      block.getSvgRoot(), magnitude, new Date);
};
/**
 * Animate a brief wiggle of a disconnected block.
 * @param {!SVGElement} group SVG element to animate.
 * @param {number} magnitude Maximum degrees skew (reversed for RTL).
 * @param {!Date} start Date of animation's start.
 * @private
 */
Blockly.blockAnimations.disconnectUiStep_ = function(group, magnitude, start) {
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
    Blockly.blockAnimations.disconnectGroup_ = group;
    Blockly.blockAnimations.disconnectPid_ =
        setTimeout(Blockly.blockAnimations.disconnectUiStep_, 10, group,
            magnitude, start);
  }
  group.setAttribute('transform', group.translate_ + group.skew_);
};

/**
 * Stop the disconnect UI animation immediately.
 * @package
 */
Blockly.blockAnimations.disconnectUiStop = function() {
  if (Blockly.blockAnimations.disconnectGroup_) {
    clearTimeout(Blockly.blockAnimations.disconnectPid_);
    var group = Blockly.blockAnimations.disconnectGroup_;
    group.skew_ = '';
    group.setAttribute('transform', group.translate_);
    Blockly.blockAnimations.disconnectGroup_ = null;
  }
};
