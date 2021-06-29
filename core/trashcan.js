/**
 * @license
 * Copyright 2011 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a trash can icon.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Trashcan');

goog.require('Blockly.browserEvents');
goog.require('Blockly.ComponentManager');
/** @suppress {extraRequire} */
goog.require('Blockly.constants');
goog.require('Blockly.DeleteArea');
goog.require('Blockly.Events');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.TrashcanOpen');
goog.require('Blockly.IAutoHideable');
goog.require('Blockly.IPositionable');
goog.require('Blockly.Options');
goog.require('Blockly.registry');
goog.require('Blockly.uiPosition');
goog.require('Blockly.utils');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.Rect');
goog.require('Blockly.utils.Svg');
goog.require('Blockly.utils.toolbox');
goog.require('Blockly.Xml');

goog.requireType('Blockly.Events.Abstract');
goog.requireType('Blockly.IDraggable');
goog.requireType('Blockly.IFlyout');
goog.requireType('Blockly.utils.Rect');
goog.requireType('Blockly.WorkspaceSvg');


/**
 * Class for a trash can.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace to sit in.
 * @constructor
 * @implements {Blockly.IAutoHideable}
 * @implements {Blockly.IPositionable}
 * @extends {Blockly.DeleteArea}
 */
Blockly.Trashcan = function(workspace) {
  Blockly.Trashcan.superClass_.constructor.call(this);
  /**
   * The workspace the trashcan sits in.
   * @type {!Blockly.WorkspaceSvg}
   * @private
   */
  this.workspace_ = workspace;

  /**
   * The unique id for this component that is used to register with the
   * ComponentManager.
   * @type {string}
   */
  this.id = 'trashcan';

  /**
   * A list of XML (stored as strings) representing blocks in the trashcan.
   * @type {!Array<string>}
   * @private
   */
  this.contents_ = [];

  /**
   * The trashcan flyout.
   * @type {Blockly.IFlyout}
   * @package
   */
  this.flyout = null;

  if (this.workspace_.options.maxTrashcanContents <= 0) {
    return;
  }
  // Create flyout options.
  var flyoutWorkspaceOptions = new Blockly.Options(
      /** @type {!Blockly.BlocklyOptions} */
      ({
        'scrollbars': true,
        'parentWorkspace': this.workspace_,
        'rtl': this.workspace_.RTL,
        'oneBasedIndex': this.workspace_.options.oneBasedIndex,
        'renderer': this.workspace_.options.renderer,
        'rendererOverrides': this.workspace_.options.rendererOverrides,
        'move': {
          'scrollbars': true,
        }
      }));
  // Create vertical or horizontal flyout.
  if (this.workspace_.horizontalLayout) {
    flyoutWorkspaceOptions.toolboxPosition =
        this.workspace_.toolboxPosition == Blockly.utils.toolbox.Position.TOP ?
        Blockly.utils.toolbox.Position.BOTTOM : Blockly.utils.toolbox.Position.TOP;
    var HorizontalFlyout = Blockly.registry.getClassFromOptions(
        Blockly.registry.Type.FLYOUTS_HORIZONTAL_TOOLBOX,
        this.workspace_.options, true);
    this.flyout = new HorizontalFlyout(flyoutWorkspaceOptions);
  } else {
    flyoutWorkspaceOptions.toolboxPosition =
      this.workspace_.toolboxPosition == Blockly.utils.toolbox.Position.RIGHT ?
        Blockly.utils.toolbox.Position.LEFT : Blockly.utils.toolbox.Position.RIGHT;
    var VerticalFlyout = Blockly.registry.getClassFromOptions(
        Blockly.registry.Type.FLYOUTS_VERTICAL_TOOLBOX,
        this.workspace_.options, true);
    this.flyout = new VerticalFlyout(flyoutWorkspaceOptions);
  }
  this.workspace_.addChangeListener(this.onDelete_.bind(this));
};
Blockly.utils.object.inherits(Blockly.Trashcan, Blockly.DeleteArea);

/**
 * Width of both the trash can and lid images.
 * @const {number}
 * @private
 */
Blockly.Trashcan.prototype.WIDTH_ = 47;

/**
 * Height of the trashcan image (minus lid).
 * @const {number}
 * @private
 */
Blockly.Trashcan.prototype.BODY_HEIGHT_ = 44;

/**
 * Height of the lid image.
 * @const {number}
 * @private
 */
Blockly.Trashcan.prototype.LID_HEIGHT_ = 16;

/**
 * Distance between trashcan and bottom or top edge of workspace.
 * @const {number}
 * @private
 */
Blockly.Trashcan.prototype.MARGIN_VERTICAL_ = 20;

/**
 * Distance between trashcan and right or left edge of workspace.
 * @const {number}
 * @private
 */
Blockly.Trashcan.prototype.MARGIN_HORIZONTAL_ = 20;

/**
 * Extent of hotspot on all sides beyond the size of the image.
 * @const {number}
 * @private
 */
Blockly.Trashcan.prototype.MARGIN_HOTSPOT_ = 10;

/**
 * Location of trashcan in sprite image.
 * @const {number}
 * @private
 */
Blockly.Trashcan.prototype.SPRITE_LEFT_ = 0;

/**
 * Location of trashcan in sprite image.
 * @const {number}
 * @private
 */
Blockly.Trashcan.prototype.SPRITE_TOP_ = 32;

/**
 * The openness of the lid when the trashcan contains blocks.
 *    (0.0 = closed, 1.0 = open)
 * @const {number}
 * @private
 */
Blockly.Trashcan.prototype.HAS_BLOCKS_LID_ANGLE_ = 0.1;

/**
 * The length of the lid open/close animation in milliseconds.
 * @const {number}
 * @private
 */
Blockly.Trashcan.ANIMATION_LENGTH_ = 80;

/**
 * The number of frames in the animation.
 * @const {number}
 * @private
 */
Blockly.Trashcan.ANIMATION_FRAMES_ = 4;

/**
 * The minimum (resting) opacity of the trashcan and lid.
 * @const {number}
 * @private
 */
Blockly.Trashcan.OPACITY_MIN_ = 0.4;

/**
 * The maximum (hovered) opacity of the trashcan and lid.
 * @const {number}
 * @private
 */
Blockly.Trashcan.OPACITY_MAX_ = 0.8;

/**
 * The maximum angle the trashcan lid can opens to. At the end of the open
 * animation the lid will be open to this angle.
 * @const {number}
 * @private
 */
Blockly.Trashcan.MAX_LID_ANGLE_ = 45;

/**
 * Current open/close state of the lid.
 * @type {boolean}
 */
Blockly.Trashcan.prototype.isLidOpen = false;

/**
 * The minimum openness of the lid. Used to indicate if the trashcan contains
 *  blocks.
 * @type {number}
 * @private
 */
Blockly.Trashcan.prototype.minOpenness_ = 0;

/**
 * The SVG group containing the trash can.
 * @type {SVGElement}
 * @private
 */
Blockly.Trashcan.prototype.svgGroup_ = null;

/**
 * The SVG image element of the trash can lid.
 * @type {SVGElement}
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
 * Whether this has been initialized.
 * @type {boolean}
 * @private
 */
Blockly.Trashcan.prototype.initialized_ = false;

/**
 * Create the trash can elements.
 * @return {!SVGElement} The trash can's SVG group.
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
  this.svgGroup_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.G,
      {'class': 'blocklyTrash'}, null);
  var clip;
  var rnd = String(Math.random()).substring(2);
  clip = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.CLIPPATH,
      {'id': 'blocklyTrashBodyClipPath' + rnd},
      this.svgGroup_);
  Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.RECT,
      {
        'width': this.WIDTH_,
        'height': this.BODY_HEIGHT_,
        'y': this.LID_HEIGHT_
      },
      clip);
  var body = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.IMAGE,
      {
        'width': Blockly.SPRITE.width,
        'x': -this.SPRITE_LEFT_,
        'height': Blockly.SPRITE.height,
        'y': -this.SPRITE_TOP_,
        'clip-path': 'url(#blocklyTrashBodyClipPath' + rnd + ')'
      },
      this.svgGroup_);
  body.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
      this.workspace_.options.pathToMedia + Blockly.SPRITE.url);

  clip = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.CLIPPATH,
      {'id': 'blocklyTrashLidClipPath' + rnd},
      this.svgGroup_);
  Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.RECT,
      {'width': this.WIDTH_, 'height': this.LID_HEIGHT_}, clip);
  this.svgLid_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.IMAGE,
      {
        'width': Blockly.SPRITE.width,
        'x': -this.SPRITE_LEFT_,
        'height': Blockly.SPRITE.height,
        'y': -this.SPRITE_TOP_,
        'clip-path': 'url(#blocklyTrashLidClipPath' + rnd + ')'
      },
      this.svgGroup_);
  this.svgLid_.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
      this.workspace_.options.pathToMedia + Blockly.SPRITE.url);

  // bindEventWithChecks_ quashes events too aggressively. See:
  // https://groups.google.com/forum/#!topic/blockly/QF4yB9Wx00s
  // Using bindEventWithChecks_ for blocking mousedown causes issue in mobile.
  // See #4303
  Blockly.browserEvents.bind(
      this.svgGroup_, 'mousedown', this, this.blockMouseDownWhenOpenable_);
  Blockly.browserEvents.bind(this.svgGroup_, 'mouseup', this, this.click);
  // Bind to body instead of this.svgGroup_ so that we don't get lid jitters
  Blockly.browserEvents.bind(body, 'mouseover', this, this.mouseOver_);
  Blockly.browserEvents.bind(body, 'mouseout', this, this.mouseOut_);
  this.animateLid_();
  return this.svgGroup_;
};

/**
 * Initializes the trash can.
 */
Blockly.Trashcan.prototype.init = function() {
  if (this.workspace_.options.maxTrashcanContents > 0) {
    Blockly.utils.dom.insertAfter(
        this.flyout.createDom(Blockly.utils.Svg.SVG),
        this.workspace_.getParentSvg());
    this.flyout.init(this.workspace_);
  }
  this.workspace_.getComponentManager().addComponent({
    component: this,
    weight: 1,
    capabilities: [
      Blockly.ComponentManager.Capability.AUTOHIDEABLE,
      Blockly.ComponentManager.Capability.DELETE_AREA,
      Blockly.ComponentManager.Capability.DRAG_TARGET,
      Blockly.ComponentManager.Capability.POSITIONABLE
    ]
  });
  this.initialized_ = true;
  this.setLidOpen(false);
};

/**
 * Dispose of this trash can.
 * Unlink from all DOM elements to prevent memory leaks.
 * @suppress {checkTypes}
 */
Blockly.Trashcan.prototype.dispose = function() {
  this.workspace_.getComponentManager().removeComponent('trashcan');
  if (this.svgGroup_) {
    Blockly.utils.dom.removeNode(this.svgGroup_);
    this.svgGroup_ = null;
  }
  this.svgLid_ = null;
  this.workspace_ = null;
  clearTimeout(this.lidTask_);
};

/**
 * Whether the trashcan has contents.
 * @return {boolean} True if the trashcan has contents.
 * @private
 */
Blockly.Trashcan.prototype.hasContents_ = function() {
  return !!this.contents_.length;
};

/**
 * Returns true if the trashcan contents-flyout is currently open.
 * @return {boolean} True if the trashcan contents-flyout is currently open.
 */
Blockly.Trashcan.prototype.contentsIsOpen = function() {
  return this.flyout.isVisible();
};

/**
 * Opens the trashcan flyout.
 */
Blockly.Trashcan.prototype.openFlyout = function() {
  if (this.contentsIsOpen()) {
    return;
  }
  var xml = this.contents_.map(Blockly.Xml.textToDom);
  this.flyout.show(xml);
  this.fireUiEvent_(true);
};

/**
 * Closes the trashcan flyout.
 */
Blockly.Trashcan.prototype.closeFlyout = function() {
  if (!this.contentsIsOpen()) {
    return;
  }
  this.flyout.hide();
  this.fireUiEvent_(false);
};

/**
 * Hides the component. Called in Blockly.hideChaff.
 * @param {boolean} onlyClosePopups Whether only popups should be closed.
 *     Flyouts should not be closed if this is true.
 */
Blockly.Trashcan.prototype.autoHide = function(onlyClosePopups) {
  // For now the trashcan flyout always autocloses because it overlays the
  // trashcan UI (no trashcan to click to close it).
  if (!onlyClosePopups && this.flyout) {
    this.closeFlyout();
  }
};

/**
 * Empties the trashcan's contents. If the contents-flyout is currently open
 * it will be closed.
 */
Blockly.Trashcan.prototype.emptyContents = function() {
  if (!this.hasContents_()) {
    return;
  }
  this.contents_.length = 0;
  this.setMinOpenness_(0);
  this.closeFlyout();
};

/**
 * Positions the trashcan.
 * It is positioned in the opposite corner to the corner the
 * categories/toolbox starts at.
 * @param {!Blockly.MetricsManager.UiMetrics} metrics The workspace metrics.
 * @param {!Array<!Blockly.utils.Rect>} savedPositions List of rectangles that
 *     are already on the workspace.
 */
Blockly.Trashcan.prototype.position = function(metrics, savedPositions) {
  // Not yet initialized.
  if (!this.initialized_) {
    return;
  }

  var cornerPosition =
      Blockly.uiPosition.getCornerOppositeToolbox(this.workspace_, metrics);

  var height = this.BODY_HEIGHT_ + this.LID_HEIGHT_;
  var startRect = Blockly.uiPosition.getStartPositionRect(
      cornerPosition, new Blockly.utils.Size(this.WIDTH_, height),
      this.MARGIN_HORIZONTAL_, this.MARGIN_VERTICAL_, metrics, this.workspace_);

  var verticalPosition = cornerPosition.vertical;
  var bumpDirection =
      verticalPosition === Blockly.uiPosition.verticalPosition.TOP ?
          Blockly.uiPosition.bumpDirection.DOWN :
          Blockly.uiPosition.bumpDirection.UP;
  var positionRect = Blockly.uiPosition.bumpPositionRect(
      startRect, this.MARGIN_VERTICAL_, bumpDirection, savedPositions);

  this.top_ = positionRect.top;
  this.left_ = positionRect.left;
  this.svgGroup_.setAttribute('transform',
      'translate(' + this.left_ + ',' + this.top_ + ')');
};

/**
 * Returns the bounding rectangle of the UI element in pixel units relative to
 * the Blockly injection div.
 * @return {?Blockly.utils.Rect} The UI elements’s bounding box. Null if
 *   bounding box should be ignored by other UI elements.
 */
Blockly.Trashcan.prototype.getBoundingRectangle = function() {
  var bottom = this.top_ + this.BODY_HEIGHT_ + this.LID_HEIGHT_;
  var right = this.left_ + this.WIDTH_;
  return new Blockly.utils.Rect(this.top_, bottom, this.left_, right);
};

/**
 * Returns the bounding rectangle of the drag target area in pixel units
 * relative to viewport.
 * @return {?Blockly.utils.Rect} The component's bounding box. Null if drag
 *   target area should be ignored.
 */
Blockly.Trashcan.prototype.getClientRect = function() {
  if (!this.svgGroup_) {
    return null;
  }

  var trashRect = this.svgGroup_.getBoundingClientRect();
  var top = trashRect.top + this.SPRITE_TOP_ - this.MARGIN_HOTSPOT_;
  var bottom = top + this.LID_HEIGHT_ + this.BODY_HEIGHT_ +
      2 * this.MARGIN_HOTSPOT_;
  var left = trashRect.left + this.SPRITE_LEFT_ - this.MARGIN_HOTSPOT_;
  var right = left + this.WIDTH_ + 2 * this.MARGIN_HOTSPOT_;
  return new Blockly.utils.Rect(top, bottom, left, right);
};

/**
 * Handles when a cursor with a block or bubble is dragged over this drag
 * target.
 * @param {!Blockly.IDraggable} _dragElement The block or bubble currently being
 *   dragged.
 * @override
 */
Blockly.Trashcan.prototype.onDragOver = function(_dragElement) {
  this.setLidOpen(this.wouldDelete_);
};

/**
 * Handles when a cursor with a block or bubble exits this drag target.
 * @param {!Blockly.IDraggable} _dragElement The block or bubble currently being
 *   dragged.
 * @override
 */
Blockly.Trashcan.prototype.onDragExit = function(_dragElement) {
  this.setLidOpen(false);
};

/**
 * Handles when a block or bubble is dropped on this component.
 * Should not handle delete here.
 * @param {!Blockly.IDraggable} _dragElement The block or bubble currently being
 *   dragged.
 * @override
 */
Blockly.Trashcan.prototype.onDrop = function(_dragElement) {
  setTimeout(this.setLidOpen.bind(this, false), 100);
};

/**
 * Flip the lid open or shut.
 * @param {boolean} state True if open.
 * @package
 */
Blockly.Trashcan.prototype.setLidOpen = function(state) {
  if (this.isLidOpen == state) {
    return;
  }
  clearTimeout(this.lidTask_);
  this.isLidOpen = state;
  this.animateLid_();
};

/**
 * Rotate the lid open or closed by one step.  Then wait and recurse.
 * @private
 */
Blockly.Trashcan.prototype.animateLid_ = function() {
  var frames = Blockly.Trashcan.ANIMATION_FRAMES_;

  var delta = 1 / (frames + 1);
  this.lidOpen_ += this.isLidOpen ? delta : -delta;
  this.lidOpen_ = Math.min(Math.max(this.lidOpen_, this.minOpenness_), 1);

  this.setLidAngle_(this.lidOpen_ * Blockly.Trashcan.MAX_LID_ANGLE_);

  var minOpacity = Blockly.Trashcan.OPACITY_MIN_;
  var maxOpacity = Blockly.Trashcan.OPACITY_MAX_;
  // Linear interpolation between min and max.
  var opacity = minOpacity + this.lidOpen_ * (maxOpacity - minOpacity);
  this.svgGroup_.style.opacity = opacity;

  if (this.lidOpen_ > this.minOpenness_ && this.lidOpen_ < 1) {
    this.lidTask_ = setTimeout(this.animateLid_.bind(this),
        Blockly.Trashcan.ANIMATION_LENGTH_ / frames);
  }
};

/**
 * Set the angle of the trashcan's lid.
 * @param {number} lidAngle The angle at which to set the lid.
 * @private
 */
Blockly.Trashcan.prototype.setLidAngle_ = function(lidAngle) {
  var openAtRight =
      this.workspace_.toolboxPosition == Blockly.utils.toolbox.Position.RIGHT ||
      (this.workspace_.horizontalLayout && this.workspace_.RTL);
  this.svgLid_.setAttribute('transform', 'rotate(' +
      (openAtRight ? -lidAngle : lidAngle) + ',' +
      (openAtRight ? 4 : this.WIDTH_ - 4) + ',' +
      (this.LID_HEIGHT_ - 2) + ')');
};

/**
 * Sets the minimum openness of the trashcan lid. If the lid is currently
 * closed, this will update lid's position.
 * @param {number} newMin The new minimum openness of the lid. Should be between
 *     0 and 1.
 * @private
 */
Blockly.Trashcan.prototype.setMinOpenness_ = function(newMin) {
  this.minOpenness_ = newMin;
  if (!this.isLidOpen) {
    this.setLidAngle_(newMin * Blockly.Trashcan.MAX_LID_ANGLE_);
  }
};

/**
 * Flip the lid shut.
 * Called externally after a drag.
 */
Blockly.Trashcan.prototype.closeLid = function() {
  this.setLidOpen(false);
};

/**
 * Inspect the contents of the trash.
 */
Blockly.Trashcan.prototype.click = function() {
  if (!this.hasContents_()) {
    return;
  }
  this.openFlyout();
};

/**
 * Fires a UI event for trashcan flyout open or close.
 * @param {boolean} trashcanOpen Whether the flyout is opening.
 * @private
 */
Blockly.Trashcan.prototype.fireUiEvent_ = function(trashcanOpen) {
  var uiEvent = new (Blockly.Events.get(Blockly.Events.TRASHCAN_OPEN))(
      trashcanOpen,this.workspace_.id);
  Blockly.Events.fire(uiEvent);
};

/**
 * Prevents a workspace scroll and click event if the trashcan has blocks.
 * @param {!Event} e A mouse down event.
 * @private
 */
Blockly.Trashcan.prototype.blockMouseDownWhenOpenable_ = function(e) {
  if (!this.contentsIsOpen() && this.hasContents_()) {
    e.stopPropagation();  // Don't start a workspace scroll.
  }
};

/**
 * Indicate that the trashcan can be clicked (by opening it) if it has blocks.
 * @private
 */
Blockly.Trashcan.prototype.mouseOver_ = function() {
  if (this.hasContents_()) {
    this.setLidOpen(true);
  }
};

/**
 * Close the lid of the trashcan if it was open (Vis. it was indicating it had
 *    blocks).
 * @private
 */
Blockly.Trashcan.prototype.mouseOut_ = function() {
  // No need to do a .hasBlocks check here because if it doesn't the trashcan
  // won't be open in the first place, and setOpen won't run.
  this.setLidOpen(false);
};

/**
 * Handle a BLOCK_DELETE event. Adds deleted blocks oldXml to the content array.
 * @param {!Blockly.Events.Abstract} event Workspace event.
 * @private
 */
Blockly.Trashcan.prototype.onDelete_ = function(event) {
  if (this.workspace_.options.maxTrashcanContents <= 0) {
    return;
  }
  // Must check that the tagName exists since oldXml can be a DocumentFragment.
  if (event.type == Blockly.Events.BLOCK_DELETE && event.oldXml.tagName &&
      event.oldXml.tagName.toLowerCase() != 'shadow') {
    var cleanedXML = this.cleanBlockXML_(event.oldXml);
    if (this.contents_.indexOf(cleanedXML) != -1) {
      return;
    }
    this.contents_.unshift(cleanedXML);
    while (this.contents_.length >
        this.workspace_.options.maxTrashcanContents) {
      this.contents_.pop();
    }

    this.setMinOpenness_(this.HAS_BLOCKS_LID_ANGLE_);
  }
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
      node.removeAttribute('disabled');
      if (node.nodeName == 'comment') {  // Future proof just in case.
        node.removeAttribute('h');
        node.removeAttribute('w');
        node.removeAttribute('pinned');
      }
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
  return Blockly.Xml.domToText(xmlBlock);
};
