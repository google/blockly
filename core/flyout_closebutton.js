/**
 * @license
 * Copyright 2016 Google LLC
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
 * @fileoverview Class for a button in the flyout.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.FlyoutCloseButton');

goog.require('Blockly.Css');
goog.require('Blockly.utils');
goog.require('Blockly.utils.dom');

/**
 * Class for a button in the flyout.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace in which to place this
 *     button.
 * @param {!Blockly.WorkspaceSvg} targetWorkspace The flyout's target workspace.
 * @constructor
 */
Blockly.FlyoutCloseButton = function (workspace, targetWorkspace, flyout) {
  /**
   * @type {!Blockly.WorkspaceSvg}
   * @private
   */
  this.workspace_ = workspace;

  /**
   * @type {!Blockly.WorkspaceSvg}
   * @private
   */
  this.targetWorkspace_ = targetWorkspace;

  this.flyout_ = flyout;

  this.createDom();
};

/**
 * The width of the button's rect.
 * @type {number}
 */
Blockly.FlyoutCloseButton.prototype.width = 16;

/**
 * The height of the button's rect.
 * @type {number}
 */
Blockly.FlyoutCloseButton.prototype.height = 60;

Blockly.FlyoutCloseButton.prototype.cssClass_ = 'blocklyFlyoutCloseButton blocklyFlyoutBackground';

/**
 * Opaque data that can be passed to Blockly.unbindEvent_.
 * @type {Array.<!Array>}
 * @private
 */
Blockly.FlyoutCloseButton.prototype.onMouseClickEvent_ = null;

/**
 * Create the button elements.
 * @return {!SVGElement} The button's SVG group.
 */
Blockly.FlyoutCloseButton.prototype.createDom = function () {
  this.outerSvg_ = Blockly.utils.dom.createSvgElement(
    'svg',
    {
      class: this.cssClass_,
      width: this.width,
      height: this.height,
      display: 'none'
    },
    null);

  var svgGroupTransform = 'translate(0, 0) scale(1)';
  if (this.flyout_.toolboxPosition_ === Blockly.TOOLBOX_AT_LEFT) {
    svgGroupTransform = 'translate(' + this.width + ', ' + this.height + ') scale(-1)';
  }

  this.svgGroup_ = Blockly.utils.dom.createSvgElement(
    'g',
    {
      transform: svgGroupTransform
    },
    this.outerSvg_);

  this.svgBackground_ = Blockly.utils.dom.createSvgElement(
    'path',
    {
      class: this.cssClass_,
      d: 'm 16,0 l -16, 15 v 30 l 16, 15 z',
      transform: 'translate(0, 0) scale(1)'
    },
    this.svgGroup_);

  this.svgImage_ = Blockly.utils.dom.createSvgElement(
    'image',
    {
      height: this.width,
      width: this.width,
      transform: 'translate(0,' + ((this.height - this.width) / 2) + ') scale(1)',
      href: 'media/images/arrow.png'
    },
    this.svgGroup_
  );

  this.onMouseClickEvent_ = Blockly.bindEventWithChecks_(
    this.outerSvg_, 'click', this, this.onMouseClick_);

  Blockly.utils.dom.insertAfter(this.outerSvg_, this.workspace_.getParentSvg());
};

Blockly.FlyoutCloseButton.prototype.setVisible = function (shouldShow) {
  if (shouldShow) {
    this.show();
  } else {
    this.hide();
  }
};

/**
 * Correctly position the flyout button and make it visible.
 */
Blockly.FlyoutCloseButton.prototype.show = function () {
  this.outerSvg_.setAttribute('display', 'block');
};

Blockly.FlyoutCloseButton.prototype.hide = function () {
  this.outerSvg_.setAttribute('display', 'none');
};

/**
 * Update SVG attributes to match internal state.
 * @private
 */
Blockly.FlyoutCloseButton.prototype.updateTransform_ = function (flyoutX, flyoutY, flyoutWidth) {
  var newX = flyoutX;
  var newY = flyoutY;

  if (this.flyout_.toolboxPosition_ === Blockly.TOOLBOX_AT_LEFT) {
    newX += flyoutWidth;
    newY += (this.height / 2);

    if (flyoutWidth - Math.floor(flyoutWidth) <= 0.5) {
      newX = Math.floor(newX);
    } else {
      newX = Math.ceil(newX);
    }
  } else if (this.flyout_.toolboxPosition_ === Blockly.TOOLBOX_AT_RIGHT) {
    newX -= this.width;
    newY += (this.height / 2);

    if (flyoutX - Math.ceil(flyoutX) <= 0.5) {
      newX = Math.ceil(newX);
    } else {
      newX = Math.floor(newX);
    }
  }

  this.outerSvg_.setAttribute('transform',
    'translate(' + newX + ',' + newY + ')');
};

/**
 * Dispose of this button.
 */
Blockly.FlyoutCloseButton.prototype.dispose = function () {
  if (this.onMouseClickEvent_) {
    Blockly.unbindEvent_(this.onMouseClickEvent_);
  }
  if (this.outerSvg_) {
    Blockly.utils.dom.removeNode(this.outerSvg_);
  }

  this.workspace_ = null;
};

/**
 * Do something when the button is clicked.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.FlyoutCloseButton.prototype.onMouseClick_ = function (e) {
  var gesture = this.targetWorkspace_.getGesture(e);
  if (gesture) {
    gesture.cancel();
  }

  // Clear the "selected" category when closing the Toolbox flyout
  var workspace = Blockly.getMainWorkspace();
  if (workspace.toolbox_ &&
    workspace.toolbox_.flyout_ &&
    this.flyout_ === workspace.toolbox_.flyout_) {
    workspace.toolbox_.clearSelection();
  }

  this.flyout_.hide();
};

/**
 * CSS for buttons and labels.  See css.js for use.
 */
Blockly.Css.register([
  /* eslint-disable indent */
  '.blocklyFlyoutCloseButton {',
    'cursor: default;',
    'outline: none;',
    'z-index: 21;',
  '}',

  '.blocklyFlyoutCloseButton > g > image {',
    'opacity: 0.7;',
    'transition: 0.3s;',
  '}',

  '.blocklyFlyoutCloseButton:hover > g > image {',
    'opacity: 1;',
  '}'
  /* eslint-enable indent */
]);
