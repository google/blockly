/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Methods animating a block on connection and disconnection.
 */
'use strict';

/**
 * Methods animating a block on connection and disconnection.
 * @namespace Blockly.blockAnimations
 */
goog.module('Blockly.blockAnimations');

const dom = goog.require('Blockly.utils.dom');
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
const {Svg} = goog.require('Blockly.utils.Svg');


/**
 * PID of disconnect UI animation.  There can only be one at a time.
 * @type {number}
 */
let disconnectPid = 0;

/**
 * SVG group of wobbling block.  There can only be one at a time.
 * @type {Element}
 */
let disconnectGroup = null;

/**
 * Play some UI effects (sound, animation) when disposing of a block.
 * @param {!BlockSvg} block The block being disposed of.
 * @alias Blockly.blockAnimations.disposeUiEffect
 * @package
 */
const disposeUiEffect = function(block) {
  const workspace = block.workspace;
  const svgGroup = block.getSvgRoot();
  workspace.getAudioManager().play('delete');

  const xy = workspace.getSvgXY(svgGroup);
  // Deeply clone the current block.
  const clone = svgGroup.cloneNode(true);
  clone.translateX_ = xy.x;
  clone.translateY_ = xy.y;
  clone.setAttribute('transform', 'translate(' + xy.x + ',' + xy.y + ')');
  workspace.getParentSvg().appendChild(clone);
  clone.bBox_ = clone.getBBox();
  // Start the animation.
  disposeUiStep(clone, workspace.RTL, new Date, workspace.scale);
};
exports.disposeUiEffect = disposeUiEffect;

/**
 * Animate a cloned block and eventually dispose of it.
 * This is a class method, not an instance method since the original block has
 * been destroyed and is no longer accessible.
 * @param {!Element} clone SVG element to animate and dispose of.
 * @param {boolean} rtl True if RTL, false if LTR.
 * @param {!Date} start Date of animation's start.
 * @param {number} workspaceScale Scale of workspace.
 */
const disposeUiStep = function(clone, rtl, start, workspaceScale) {
  const ms = new Date - start;
  const percent = ms / 150;
  if (percent > 1) {
    dom.removeNode(clone);
  } else {
    const x = clone.translateX_ +
        (rtl ? -1 : 1) * clone.bBox_.width * workspaceScale / 2 * percent;
    const y = clone.translateY_ + clone.bBox_.height * workspaceScale * percent;
    const scale = (1 - percent) * workspaceScale;
    clone.setAttribute(
        'transform',
        'translate(' + x + ',' + y + ')' +
            ' scale(' + scale + ')');
    setTimeout(disposeUiStep, 10, clone, rtl, start, workspaceScale);
  }
};

/**
 * Play some UI effects (sound, ripple) after a connection has been established.
 * @param {!BlockSvg} block The block being connected.
 * @alias Blockly.blockAnimations.connectionUiEffect
 * @package
 */
const connectionUiEffect = function(block) {
  const workspace = block.workspace;
  const scale = workspace.scale;
  workspace.getAudioManager().play('click');
  if (scale < 1) {
    return;  // Too small to care about visual effects.
  }
  // Determine the absolute coordinates of the inferior block.
  const xy = workspace.getSvgXY(block.getSvgRoot());
  // Offset the coordinates based on the two connection types, fix scale.
  if (block.outputConnection) {
    xy.x += (block.RTL ? 3 : -3) * scale;
    xy.y += 13 * scale;
  } else if (block.previousConnection) {
    xy.x += (block.RTL ? -23 : 23) * scale;
    xy.y += 3 * scale;
  }
  const ripple = dom.createSvgElement(
      Svg.CIRCLE, {
        'cx': xy.x,
        'cy': xy.y,
        'r': 0,
        'fill': 'none',
        'stroke': '#888',
        'stroke-width': 10,
      },
      workspace.getParentSvg());
  // Start the animation.
  connectionUiStep(ripple, new Date, scale);
};
exports.connectionUiEffect = connectionUiEffect;

/**
 * Expand a ripple around a connection.
 * @param {!SVGElement} ripple Element to animate.
 * @param {!Date} start Date of animation's start.
 * @param {number} scale Scale of workspace.
 */
const connectionUiStep = function(ripple, start, scale) {
  const ms = new Date - start;
  const percent = ms / 150;
  if (percent > 1) {
    dom.removeNode(ripple);
  } else {
    ripple.setAttribute('r', percent * 25 * scale);
    ripple.style.opacity = 1 - percent;
    disconnectPid = setTimeout(connectionUiStep, 10, ripple, start, scale);
  }
};

/**
 * Play some UI effects (sound, animation) when disconnecting a block.
 * @param {!BlockSvg} block The block being disconnected.
 * @alias Blockly.blockAnimations.disconnectUiEffect
 * @package
 */
const disconnectUiEffect = function(block) {
  block.workspace.getAudioManager().play('disconnect');
  if (block.workspace.scale < 1) {
    return;  // Too small to care about visual effects.
  }
  // Horizontal distance for bottom of block to wiggle.
  const DISPLACEMENT = 10;
  // Scale magnitude of skew to height of block.
  const height = block.getHeightWidth().height;
  let magnitude = Math.atan(DISPLACEMENT / height) / Math.PI * 180;
  if (!block.RTL) {
    magnitude *= -1;
  }
  // Start the animation.
  disconnectUiStep(block.getSvgRoot(), magnitude, new Date);
};
exports.disconnectUiEffect = disconnectUiEffect;

/**
 * Animate a brief wiggle of a disconnected block.
 * @param {!SVGElement} group SVG element to animate.
 * @param {number} magnitude Maximum degrees skew (reversed for RTL).
 * @param {!Date} start Date of animation's start.
 */
const disconnectUiStep = function(group, magnitude, start) {
  const DURATION = 200;  // Milliseconds.
  const WIGGLES = 3;     // Half oscillations.

  const ms = new Date - start;
  const percent = ms / DURATION;

  if (percent > 1) {
    group.skew_ = '';
  } else {
    const skew = Math.round(
        Math.sin(percent * Math.PI * WIGGLES) * (1 - percent) * magnitude);
    group.skew_ = 'skewX(' + skew + ')';
    disconnectGroup = group;
    disconnectPid = setTimeout(disconnectUiStep, 10, group, magnitude, start);
  }
  group.setAttribute('transform', group.translate_ + group.skew_);
};

/**
 * Stop the disconnect UI animation immediately.
 * @alias Blockly.blockAnimations.disconnectUiStop
 * @package
 */
const disconnectUiStop = function() {
  if (disconnectGroup) {
    clearTimeout(disconnectPid);
    const group = disconnectGroup;
    group.skew_ = '';
    group.setAttribute('transform', group.translate_);
    disconnectGroup = null;
  }
};
exports.disconnectUiStop = disconnectUiStop;
