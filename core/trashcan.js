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
 * @fileoverview Object representing a trash can icon.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Trashcan');

goog.require('Blockly.utils');

goog.require('goog.math.Rect');


/**
 * Class for a trash can.
 * @param {!Blockly.Workspace} workspace The workspace to sit in.
 * @constructor
 */
Blockly.Trashcan = function(workspace) {
  /**
   * The workspace the trashcan sits in.
   * @type {!Blockly.Workspace}
   * @private
   */
  this.workspace_ = workspace;

  /**
   * True if the trashcan contains blocks, otherwise false.
   * @type {boolean}
   * @private
   */
  this.hasBlocks_ = false;

  /**
   * A list of Xml (stored as strings) representing blocks "inside" the trashcan.
   * @type {Array}
   * @private
   */
  this.contents_ = [];


  if (this.workspace_.options.maxTrashcanContents <= 0) {
    return;
  }
  // Create flyout options.
  var flyoutWorkspaceOptions = {
    scrollbars: true,
    disabledPatternId: this.workspace_.options.disabledPatternId,
    parentWorkspace: this.workspace_,
    RTL: this.workspace_.RTL,
    oneBasedIndex: this.workspace_.options.oneBasedIndex,
  };
  // Create vertical or horizontal flyout.
  if (this.workspace_.horizontalLayout) {
    flyoutWorkspaceOptions.toolboxPosition =
        this.workspace_.toolboxPosition == Blockly.TOOLBOX_AT_TOP ?
        Blockly.TOOLBOX_AT_BOTTOM : Blockly.TOOLBOX_AT_TOP;
    this.flyout_ = new Blockly.HorizontalFlyout(flyoutWorkspaceOptions);
  } else {
    flyoutWorkspaceOptions.toolboxPosition =
      this.workspace_.toolboxPosition == Blockly.TOOLBOX_AT_RIGHT ?
        Blockly.TOOLBOX_AT_LEFT : Blockly.TOOLBOX_AT_RIGHT;
    this.flyout_ = new Blockly.VerticalFlyout(flyoutWorkspaceOptions);
  }
  this.workspace_.addChangeListener(this.onDelete_());
};

/**
 * Width of both the trash can and lid images.
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.WIDTH_ = 47;

/**
 * Height of the trashcan image (minus lid).
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.BODY_HEIGHT_ = 44;

/**
 * Height of the lid image.
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.LID_HEIGHT_ = 16;

/**
 * Distance between trashcan and bottom edge of workspace.
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.MARGIN_BOTTOM_ = 20;

/**
 * Distance between trashcan and right edge of workspace.
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.MARGIN_SIDE_ = 20;

/**
 * Extent of hotspot on all sides beyond the size of the image.
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.MARGIN_HOTSPOT_ = 10;

/**
 * Location of trashcan in sprite image.
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.SPRITE_LEFT_ = 0;

/**
 * Location of trashcan in sprite image.
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.SPRITE_TOP_ = 32;

/**
 * The openness of the lid when the trashcan contains blocks.
 *    (0.0 = closed, 1.0 = open)
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.HAS_BLOCKS_LID_ANGLE = 0.1;

/**
 * Current open/close state of the lid.
 * @type {boolean}
 */
Blockly.Trashcan.prototype.isOpen = false;

/**
 * The minimum openness of the lid. Used to indicate if the trashcan contains
 *  blocks.
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.minOpenness_ = 0;

/**
 * The SVG group containing the trash can.
 * @type {Element}
 * @private
 */
Blockly.Trashcan.prototype.svgGroup_ = null;

/**
 * The SVG image element of the trash can lid.
 * @type {Element}
 * @private
 */
Blockly.Trashcan.prototype.svgLid_ = null;

/**
 * Task ID of opening/closing animation.
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.lidTask_ = 0;

/**
 * Current state of lid opening (0.0 = closed, 1.0 = open).
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.lidOpen_ = 0;

/**
 * Left coordinate of the trash can.
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.left_ = 0;

/**
 * Top coordinate of the trash can.
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.top_ = 0;

/**
 * Create the trash can elements.
 * @return {!Element} The trash can's SVG group.
 */
Blockly.Trashcan.prototype.createDom = function() {
  /* Here's the markup that will be generated:
  <g class="blocklyTrash">
    <clippath id="blocklyTrashBodyClipPath837493">
      <rect width="47" height="45" y="15"></rect>
    </clippath>
    <image width="64" height="92" y="-32" xlink:href="media/sprites.png"
        clip-path="url(#blocklyTrashBodyClipPath837493)"></image>
    <clippath id="blocklyTrashLidClipPath837493">
      <rect width="47" height="15"></rect>
    </clippath>
    <image width="84" height="92" y="-32" xlink:href="media/sprites.png"
        clip-path="url(#blocklyTrashLidClipPath837493)"></image>
  </g>
  */
  this.svgGroup_ = Blockly.utils.createSvgElement('g',
      {'class': 'blocklyTrash'}, null);
  var clip;
  var rnd = String(Math.random()).substring(2);
  clip = Blockly.utils.createSvgElement('clipPath',
      {'id': 'blocklyTrashBodyClipPath' + rnd},
      this.svgGroup_);
  Blockly.utils.createSvgElement('rect',
      {
        'width': this.WIDTH_,
        'height': this.BODY_HEIGHT_,
        'y': this.LID_HEIGHT_
      },
      clip);
  var body = Blockly.utils.createSvgElement('image',
      {
        'width': Blockly.SPRITE.width,
        'x': -this.SPRITE_LEFT_,
        'height': Blockly.SPRITE.height,
        'y': -this.SPRITE_TOP_,
        'clip-path': 'url(#blocklyTrashBodyClipPath' + rnd + ')'
      },
      this.svgGroup_);
  body.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      this.workspace_.options.pathToMedia + Blockly.SPRITE.url);

  clip = Blockly.utils.createSvgElement('clipPath',
      {'id': 'blocklyTrashLidClipPath' + rnd},
      this.svgGroup_);
  Blockly.utils.createSvgElement('rect',
      {'width': this.WIDTH_, 'height': this.LID_HEIGHT_}, clip);
  this.svgLid_ = Blockly.utils.createSvgElement('image',
      {
        'width': Blockly.SPRITE.width,
        'x': -this.SPRITE_LEFT_,
        'height': Blockly.SPRITE.height,
        'y': -this.SPRITE_TOP_,
        'clip-path': 'url(#blocklyTrashLidClipPath' + rnd + ')'
      },
      this.svgGroup_);
  this.svgLid_.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
      this.workspace_.options.pathToMedia + Blockly.SPRITE.url);

  Blockly.bindEventWithChecks_(this.svgGroup_, 'mouseup', this, this.click);
  // bindEventWithChecks_ quashes events too aggressively. See:
  // https://groups.google.com/forum/#!topic/blockly/QF4yB9Wx00s
  // Bind to body instead of this.svgGroup_ so that we don't get lid jitters
  Blockly.bindEvent_(body, 'mouseover', this, this.mouseOver_);
  Blockly.bindEvent_(body, 'mouseout', this, this.mouseOut_);
  this.animateLid_();
  return this.svgGroup_;
};

/**
 * Initialize the trash can.
 * @param {number} verticalSpacing Vertical distance from workspace edge to the
 *    same edge of the trashcan.
 * @return {number} Vertical distance from workspace edge to the opposite
 *    edge of the trashcan.
 */
Blockly.Trashcan.prototype.init = function(verticalSpacing) {
  if (this.workspace_.options.maxTrashcanContents > 0) {
    Blockly.utils.insertAfter(this.flyout_.createDom('svg'),
        this.workspace_.getParentSvg());
    this.flyout_.init(this.workspace_);
    this.flyout_.isBlockCreatable_ = function() {
      // All blocks, including disabled ones, can be dragged from the
      // trashcan flyout.
      return true;
    };
  }

  this.verticalSpacing_ = this.MARGIN_BOTTOM_ + verticalSpacing;
  this.setOpen_(false);
  return this.verticalSpacing_ + this.BODY_HEIGHT_ + this.LID_HEIGHT_;
};

/**
 * Dispose of this trash can.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.Trashcan.prototype.dispose = function() {
  if (this.svgGroup_) {
    Blockly.utils.removeNode(this.svgGroup_);
    this.svgGroup_ = null;
  }
  this.svgLid_ = null;
  this.workspace_ = null;
  clearTimeout(this.lidTask_);
};

/**
 * Position the trashcan.
 * It is positioned in the opposite corner to the corner the
 * categories/toolbox starts at.
 */
Blockly.Trashcan.prototype.position = function() {
  // Not yet initialized.
  if (!this.verticalSpacing_) {
    return;
  }
  var metrics = this.workspace_.getMetrics();
  if (!metrics) {
    // There are no metrics available (workspace is probably not visible).
    return;
  }
  if (metrics.toolboxPosition == Blockly.TOOLBOX_AT_LEFT ||
      (this.workspace_.horizontalLayout && !this.workspace_.RTL)) {
    // Toolbox starts in the left corner.
    this.left_ = metrics.viewWidth + metrics.absoluteLeft -
        this.WIDTH_ - this.MARGIN_SIDE_ - Blockly.Scrollbar.scrollbarThickness;
  } else {
    // Toolbox starts in the right corner.
    this.left_ = this.MARGIN_SIDE_ + Blockly.Scrollbar.scrollbarThickness;
  }

  if (metrics.toolboxPosition == Blockly.TOOLBOX_AT_BOTTOM) {
    this.top_ = this.verticalSpacing_;
  } else {
    this.top_ = metrics.viewHeight + metrics.absoluteTop -
        (this.BODY_HEIGHT_ + this.LID_HEIGHT_) - this.verticalSpacing_;
  }

  this.svgGroup_.setAttribute('transform',
      'translate(' + this.left_ + ',' + this.top_ + ')');
};

/**
 * Return the deletion rectangle for this trash can.
 * @return {goog.math.Rect} Rectangle in which to delete.
 */
Blockly.Trashcan.prototype.getClientRect = function() {
  if (!this.svgGroup_) {
    return null;
  }

  var trashRect = this.svgGroup_.getBoundingClientRect();
  var left = trashRect.left + this.SPRITE_LEFT_ - this.MARGIN_HOTSPOT_;
  var top = trashRect.top + this.SPRITE_TOP_ - this.MARGIN_HOTSPOT_;
  var width = this.WIDTH_ + 2 * this.MARGIN_HOTSPOT_;
  var height = this.LID_HEIGHT_ + this.BODY_HEIGHT_ + 2 * this.MARGIN_HOTSPOT_;
  return new goog.math.Rect(left, top, width, height);

};

/**
 * Flip the lid open or shut.
 * @param {boolean} state True if open.
 * @private
 */
Blockly.Trashcan.prototype.setOpen_ = function(state) {
  if (this.isOpen == state) {
    return;
  }
  clearTimeout(this.lidTask_);
  this.isOpen = state;
  this.animateLid_();
};

/**
 * Rotate the lid open or closed by one step.  Then wait and recurse.
 * @private
 */
Blockly.Trashcan.prototype.animateLid_ = function() {
  this.lidOpen_ += this.isOpen ? 0.2 : -0.2;
  this.lidOpen_ = Math.min(Math.max(this.lidOpen_, this.minOpenness_), 1);
  this.setLidAngle_(this.lidOpen_ * 45);
  // Linear interpolation between 0.4 and 0.8.
  var opacity = 0.4 + this.lidOpen_ * (0.8 - 0.4);
  this.svgGroup_.style.opacity = opacity;
  if (this.lidOpen_ > this.minOpenness_ && this.lidOpen_ < 1) {
    this.lidTask_ = setTimeout(this.animateLid_.bind(this), 20);
  }
};

/**
 * Set the angle of the trashcan's lid.
 * @param {number} lidAngle The angle at which to set the lid.
 * @private
 */
Blockly.Trashcan.prototype.setLidAngle_ = function(lidAngle) {
  var openAtRight = this.workspace_.toolboxPosition == Blockly.TOOLBOX_AT_RIGHT
      || (this.workspace_.horizontalLayout && this.workspace_.RTL);
  this.svgLid_.setAttribute('transform', 'rotate(' +
      (openAtRight ? -lidAngle : lidAngle) + ',' +
      (openAtRight ? 4 : this.WIDTH_ - 4) + ',' +
      (this.LID_HEIGHT_ - 2) + ')');
};

/**
 * Flip the lid shut.
 * Called externally after a drag.
 */
Blockly.Trashcan.prototype.close = function() {
  this.setOpen_(false);
};

/**
 * Inspect the contents of the trash.
 */
Blockly.Trashcan.prototype.click = function() {
  if (!this.hasBlocks_) {
    return;
  }

  var xml = [];
  for (var i = 0, text; text = this.contents_[i]; i++) {
    xml[i] = Blockly.Xml.textToDom(text).firstChild;
  }
  this.flyout_.show(xml);
};

/**
 * Indicate that the trashcan can be clicked (by opening it) if it has blocks.
 * @private
 */
Blockly.Trashcan.prototype.mouseOver_ = function() {
  if (!this.hasBlocks_) {
    return;
  }
  this.setOpen_(true);
};

/**
 * Close the lid of the trashcan if it was open (Vis. it was indicating it had
 *    blocks).
 * @private
 */
Blockly.Trashcan.prototype.mouseOut_ = function() {
  // No need to do a .hasBlocks check here because if it doesn't the trashcan
  // wont be open in the first place, and setOpen_ won't run.
  this.setOpen_(false);
};

/**
 * Handle a BLOCK_DELETE event. Adds deleted blocks oldXml to the content array.
 * @return {!Function} Function to call when a block is deleted.
 * @private
 */
Blockly.Trashcan.prototype.onDelete_ = function() {
  var trashcan = this;
  return function(event) {
    if (trashcan.workspace_.options.maxTrashcanContents <= 0) {
      return;
    }
    if (event.type == Blockly.Events.BLOCK_DELETE) {
      var cleanedXML = trashcan.cleanBlockXML_(event.oldXml);
      if (trashcan.contents_.indexOf(cleanedXML) != -1) {
        return;
      }
      trashcan.contents_.unshift(cleanedXML);
      if (trashcan.contents_.length >
          trashcan.workspace_.options.maxTrashcanContents) {
        trashcan.contents_.splice(
            trashcan.workspace_.options.maxTrashcanContents,
            trashcan.contents_.length -
            trashcan.workspace_.options.maxTrashcanContents);
      }

      trashcan.hasBlocks_ = true;
      trashcan.minOpenness_ = trashcan.HAS_BLOCKS_LID_ANGLE;
      trashcan.setLidAngle_(trashcan.minOpenness_ * 45);
    }
  };
};

/**
 * Converts XML representing a block into text that can be stored in the
 *    content array.
 * @param {!Element} xml An XML tree defining the block and any
 *    connected child blocks.
 * @return {string} Text representing the XML tree, cleaned of all unnecessary
 * attributes.
 * @private
 */
Blockly.Trashcan.prototype.cleanBlockXML_ = function(xml) {
  var xmlBlock = xml.cloneNode(true);
  var node = xmlBlock;
  while (node) {
    // Things like text inside tags are still treated as nodes, but they
    // don't have attributes (or the removeAttribute function) so we can
    // skip removing attributes from them.
    if (node.removeAttribute) {
      node.removeAttribute('x');
      node.removeAttribute('y');
      node.removeAttribute('id');
    }

    // Try to go down the tree
    var nextNode = node.firstChild || node.nextSibling;
    // If we can't go down, try to go back up the tree.
    if (!nextNode) {
      nextNode = node.parentNode;
      while (nextNode) {
        // We are valid again!
        if (nextNode.nextSibling) {
          nextNode = nextNode.nextSibling;
          break;
        }
        // Try going up again. If parentNode is null that means we have
        // reached the top, and we will break out of both loops.
        nextNode = nextNode.parentNode;
      }
    }
    node = nextNode;
  }
  return '<xml>' + Blockly.Xml.domToText(xmlBlock) + '</xml>';
};
