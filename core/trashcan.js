/**
 * @license
 * Copyright 2011 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a trash can icon.
 */
'use strict';

/**
 * Object representing a trash can icon.
 * @class
 */
goog.module('Blockly.Trashcan');

/* eslint-disable-next-line no-unused-vars */
const blocks = goog.requireType('Blockly.serialization.blocks');
const browserEvents = goog.require('Blockly.browserEvents');
const dom = goog.require('Blockly.utils.dom');
const eventUtils = goog.require('Blockly.Events.utils');
const registry = goog.require('Blockly.registry');
const toolbox = goog.require('Blockly.utils.toolbox');
const uiPosition = goog.require('Blockly.uiPosition');
/* eslint-disable-next-line no-unused-vars */
const {Abstract} = goog.requireType('Blockly.Events.Abstract');
/* eslint-disable-next-line no-unused-vars */
const {BlockDelete} = goog.requireType('Blockly.Events.BlockDelete');
/* eslint-disable-next-line no-unused-vars */
const {BlocklyOptions} = goog.requireType('Blockly.BlocklyOptions');
const {ComponentManager} = goog.require('Blockly.ComponentManager');
const {DeleteArea} = goog.require('Blockly.DeleteArea');
/* eslint-disable-next-line no-unused-vars */
const {IAutoHideable} = goog.require('Blockly.IAutoHideable');
/* eslint-disable-next-line no-unused-vars */
const {IDraggable} = goog.requireType('Blockly.IDraggable');
/* eslint-disable-next-line no-unused-vars */
const {IFlyout} = goog.requireType('Blockly.IFlyout');
/* eslint-disable-next-line no-unused-vars */
const {IPositionable} = goog.require('Blockly.IPositionable');
/* eslint-disable-next-line no-unused-vars */
const {MetricsManager} = goog.requireType('Blockly.MetricsManager');
const {Options} = goog.require('Blockly.Options');
const {Rect} = goog.require('Blockly.utils.Rect');
const {Size} = goog.require('Blockly.utils.Size');
const {SPRITE} = goog.require('Blockly.sprite');
const {Svg} = goog.require('Blockly.utils.Svg');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceSvg} = goog.requireType('Blockly.WorkspaceSvg');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.TrashcanOpen');


/**
 * Class for a trash can.
 * @implements {IAutoHideable}
 * @implements {IPositionable}
 * @extends {DeleteArea}
 * @alias Blockly.Trashcan
 */
class Trashcan extends DeleteArea {
  /**
   * @param {!WorkspaceSvg} workspace The workspace to sit in.
   */
  constructor(workspace) {
    super();
    /**
     * The workspace the trashcan sits in.
     * @type {!WorkspaceSvg}
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
     * A list of JSON (stored as strings) representing blocks in the trashcan.
     * @type {!Array<string>}
     * @private
     */
    this.contents_ = [];

    /**
     * The trashcan flyout.
     * @type {IFlyout}
     * @package
     */
    this.flyout = null;

    if (this.workspace_.options.maxTrashcanContents <= 0) {
      return;
    }

    /**
     * Current open/close state of the lid.
     * @type {boolean}
     */
    this.isLidOpen = false;

    /**
     * The minimum openness of the lid. Used to indicate if the trashcan
     * contains blocks.
     * @type {number}
     * @private
     */
    this.minOpenness_ = 0;

    /**
     * The SVG group containing the trash can.
     * @type {SVGElement}
     * @private
     */
    this.svgGroup_ = null;

    /**
     * The SVG image element of the trash can lid.
     * @type {SVGElement}
     * @private
     */
    this.svgLid_ = null;

    /**
     * Task ID of opening/closing animation.
     * @type {number}
     * @private
     */
    this.lidTask_ = 0;

    /**
     * Current state of lid opening (0.0 = closed, 1.0 = open).
     * @type {number}
     * @private
     */
    this.lidOpen_ = 0;

    /**
     * Left coordinate of the trash can.
     * @type {number}
     * @private
     */
    this.left_ = 0;

    /**
     * Top coordinate of the trash can.
     * @type {number}
     * @private
     */
    this.top_ = 0;

    /**
     * Whether this trash can has been initialized.
     * @type {boolean}
     * @private
     */
    this.initialized_ = false;

    // Create flyout options.
    const flyoutWorkspaceOptions = new Options(
        /** @type {!BlocklyOptions} */
        ({
          'scrollbars': true,
          'parentWorkspace': this.workspace_,
          'rtl': this.workspace_.RTL,
          'oneBasedIndex': this.workspace_.options.oneBasedIndex,
          'renderer': this.workspace_.options.renderer,
          'rendererOverrides': this.workspace_.options.rendererOverrides,
          'move': {
            'scrollbars': true,
          },
        }));
    // Create vertical or horizontal flyout.
    if (this.workspace_.horizontalLayout) {
      flyoutWorkspaceOptions.toolboxPosition =
          this.workspace_.toolboxPosition === toolbox.Position.TOP ?
          toolbox.Position.BOTTOM :
          toolbox.Position.TOP;
      const HorizontalFlyout = registry.getClassFromOptions(
          registry.Type.FLYOUTS_HORIZONTAL_TOOLBOX, this.workspace_.options,
          true);
      this.flyout = new HorizontalFlyout(flyoutWorkspaceOptions);
    } else {
      flyoutWorkspaceOptions.toolboxPosition =
          this.workspace_.toolboxPosition === toolbox.Position.RIGHT ?
          toolbox.Position.LEFT :
          toolbox.Position.RIGHT;
      const VerticalFlyout = registry.getClassFromOptions(
          registry.Type.FLYOUTS_VERTICAL_TOOLBOX, this.workspace_.options,
          true);
      this.flyout = new VerticalFlyout(flyoutWorkspaceOptions);
    }
    this.workspace_.addChangeListener(this.onDelete_.bind(this));
  }

  /**
   * Create the trash can elements.
   * @return {!SVGElement} The trash can's SVG group.
   */
  createDom() {
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
    this.svgGroup_ =
        dom.createSvgElement(Svg.G, {'class': 'blocklyTrash'}, null);
    let clip;
    const rnd = String(Math.random()).substring(2);
    clip = dom.createSvgElement(
        Svg.CLIPPATH, {'id': 'blocklyTrashBodyClipPath' + rnd}, this.svgGroup_);
    dom.createSvgElement(
        Svg.RECT, {'width': WIDTH, 'height': BODY_HEIGHT, 'y': LID_HEIGHT},
        clip);
    const body = dom.createSvgElement(
        Svg.IMAGE, {
          'width': SPRITE.width,
          'x': -SPRITE_LEFT,
          'height': SPRITE.height,
          'y': -SPRITE_TOP,
          'clip-path': 'url(#blocklyTrashBodyClipPath' + rnd + ')',
        },
        this.svgGroup_);
    body.setAttributeNS(
        dom.XLINK_NS, 'xlink:href',
        this.workspace_.options.pathToMedia + SPRITE.url);

    clip = dom.createSvgElement(
        Svg.CLIPPATH, {'id': 'blocklyTrashLidClipPath' + rnd}, this.svgGroup_);
    dom.createSvgElement(
        Svg.RECT, {'width': WIDTH, 'height': LID_HEIGHT}, clip);
    this.svgLid_ = dom.createSvgElement(
        Svg.IMAGE, {
          'width': SPRITE.width,
          'x': -SPRITE_LEFT,
          'height': SPRITE.height,
          'y': -SPRITE_TOP,
          'clip-path': 'url(#blocklyTrashLidClipPath' + rnd + ')',
        },
        this.svgGroup_);
    this.svgLid_.setAttributeNS(
        dom.XLINK_NS, 'xlink:href',
        this.workspace_.options.pathToMedia + SPRITE.url);

    // bindEventWithChecks_ quashes events too aggressively. See:
    // https://groups.google.com/forum/#!topic/blockly/QF4yB9Wx00s
    // Using bindEventWithChecks_ for blocking mousedown causes issue in mobile.
    // See #4303
    browserEvents.bind(
        this.svgGroup_, 'mousedown', this, this.blockMouseDownWhenOpenable_);
    browserEvents.bind(this.svgGroup_, 'mouseup', this, this.click);
    // Bind to body instead of this.svgGroup_ so that we don't get lid jitters
    browserEvents.bind(body, 'mouseover', this, this.mouseOver_);
    browserEvents.bind(body, 'mouseout', this, this.mouseOut_);
    this.animateLid_();
    return this.svgGroup_;
  }

  /**
   * Initializes the trash can.
   */
  init() {
    if (this.workspace_.options.maxTrashcanContents > 0) {
      dom.insertAfter(
          this.flyout.createDom(Svg.SVG), this.workspace_.getParentSvg());
      this.flyout.init(this.workspace_);
    }
    this.workspace_.getComponentManager().addComponent({
      component: this,
      weight: 1,
      capabilities: [
        ComponentManager.Capability.AUTOHIDEABLE,
        ComponentManager.Capability.DELETE_AREA,
        ComponentManager.Capability.DRAG_TARGET,
        ComponentManager.Capability.POSITIONABLE,
      ],
    });
    this.initialized_ = true;
    this.setLidOpen(false);
  }

  /**
   * Dispose of this trash can.
   * Unlink from all DOM elements to prevent memory leaks.
   * @suppress {checkTypes}
   */
  dispose() {
    this.workspace_.getComponentManager().removeComponent('trashcan');
    if (this.svgGroup_) {
      dom.removeNode(this.svgGroup_);
      this.svgGroup_ = null;
    }
    this.svgLid_ = null;
    this.workspace_ = null;
    clearTimeout(this.lidTask_);
  }

  /**
   * Whether the trashcan has contents.
   * @return {boolean} True if the trashcan has contents.
   * @private
   */
  hasContents_() {
    return !!this.contents_.length;
  }

  /**
   * Returns true if the trashcan contents-flyout is currently open.
   * @return {boolean} True if the trashcan contents-flyout is currently open.
   */
  contentsIsOpen() {
    return !!this.flyout && this.flyout.isVisible();
  }

  /**
   * Opens the trashcan flyout.
   */
  openFlyout() {
    if (this.contentsIsOpen()) {
      return;
    }
    const contents = this.contents_.map(function(string) {
      return JSON.parse(string);
    });
    this.flyout.show(contents);
    this.fireUiEvent_(true);
  }

  /**
   * Closes the trashcan flyout.
   */
  closeFlyout() {
    if (!this.contentsIsOpen()) {
      return;
    }
    this.flyout.hide();
    this.fireUiEvent_(false);
    this.workspace_.recordDragTargets();
  }

  /**
   * Hides the component. Called in WorkspaceSvg.hideChaff.
   * @param {boolean} onlyClosePopups Whether only popups should be closed.
   *     Flyouts should not be closed if this is true.
   */
  autoHide(onlyClosePopups) {
    // For now the trashcan flyout always autocloses because it overlays the
    // trashcan UI (no trashcan to click to close it).
    if (!onlyClosePopups && this.flyout) {
      this.closeFlyout();
    }
  }

  /**
   * Empties the trashcan's contents. If the contents-flyout is currently open
   * it will be closed.
   */
  emptyContents() {
    if (!this.hasContents_()) {
      return;
    }
    this.contents_.length = 0;
    this.setMinOpenness_(0);
    this.closeFlyout();
  }

  /**
   * Positions the trashcan.
   * It is positioned in the opposite corner to the corner the
   * categories/toolbox starts at.
   * @param {!MetricsManager.UiMetrics} metrics The workspace metrics.
   * @param {!Array<!Rect>} savedPositions List of rectangles that
   *     are already on the workspace.
   */
  position(metrics, savedPositions) {
    // Not yet initialized.
    if (!this.initialized_) {
      return;
    }

    const cornerPosition =
        uiPosition.getCornerOppositeToolbox(this.workspace_, metrics);

    const height = BODY_HEIGHT + LID_HEIGHT;
    const startRect = uiPosition.getStartPositionRect(
        cornerPosition, new Size(WIDTH, height), MARGIN_HORIZONTAL,
        MARGIN_VERTICAL, metrics, this.workspace_);

    const verticalPosition = cornerPosition.vertical;
    const bumpDirection = verticalPosition === uiPosition.verticalPosition.TOP ?
        uiPosition.bumpDirection.DOWN :
        uiPosition.bumpDirection.UP;
    const positionRect = uiPosition.bumpPositionRect(
        startRect, MARGIN_VERTICAL, bumpDirection, savedPositions);

    this.top_ = positionRect.top;
    this.left_ = positionRect.left;
    this.svgGroup_.setAttribute(
        'transform', 'translate(' + this.left_ + ',' + this.top_ + ')');
  }

  /**
   * Returns the bounding rectangle of the UI element in pixel units relative to
   * the Blockly injection div.
   * @return {?Rect} The UI elements's bounding box. Null if
   *   bounding box should be ignored by other UI elements.
   */
  getBoundingRectangle() {
    const bottom = this.top_ + BODY_HEIGHT + LID_HEIGHT;
    const right = this.left_ + WIDTH;
    return new Rect(this.top_, bottom, this.left_, right);
  }

  /**
   * Returns the bounding rectangle of the drag target area in pixel units
   * relative to viewport.
   * @return {?Rect} The component's bounding box. Null if drag
   *   target area should be ignored.
   */
  getClientRect() {
    if (!this.svgGroup_) {
      return null;
    }

    const trashRect = this.svgGroup_.getBoundingClientRect();
    const top = trashRect.top + SPRITE_TOP - MARGIN_HOTSPOT;
    const bottom = top + LID_HEIGHT + BODY_HEIGHT + 2 * MARGIN_HOTSPOT;
    const left = trashRect.left + SPRITE_LEFT - MARGIN_HOTSPOT;
    const right = left + WIDTH + 2 * MARGIN_HOTSPOT;
    return new Rect(top, bottom, left, right);
  }

  /**
   * Handles when a cursor with a block or bubble is dragged over this drag
   * target.
   * @param {!IDraggable} _dragElement The block or bubble currently being
   *   dragged.
   * @override
   */
  onDragOver(_dragElement) {
    this.setLidOpen(this.wouldDelete_);
  }

  /**
   * Handles when a cursor with a block or bubble exits this drag target.
   * @param {!IDraggable} _dragElement The block or bubble currently being
   *   dragged.
   * @override
   */
  onDragExit(_dragElement) {
    this.setLidOpen(false);
  }

  /**
   * Handles when a block or bubble is dropped on this component.
   * Should not handle delete here.
   * @param {!IDraggable} _dragElement The block or bubble currently being
   *   dragged.
   * @override
   */
  onDrop(_dragElement) {
    setTimeout(this.setLidOpen.bind(this, false), 100);
  }

  /**
   * Flip the lid open or shut.
   * @param {boolean} state True if open.
   * @package
   */
  setLidOpen(state) {
    if (this.isLidOpen === state) {
      return;
    }
    clearTimeout(this.lidTask_);
    this.isLidOpen = state;
    this.animateLid_();
  }

  /**
   * Rotate the lid open or closed by one step.  Then wait and recurse.
   * @private
   */
  animateLid_() {
    const frames = ANIMATION_FRAMES;

    const delta = 1 / (frames + 1);
    this.lidOpen_ += this.isLidOpen ? delta : -delta;
    this.lidOpen_ = Math.min(Math.max(this.lidOpen_, this.minOpenness_), 1);

    this.setLidAngle_(this.lidOpen_ * MAX_LID_ANGLE);

    // Linear interpolation between min and max.
    const opacity = OPACITY_MIN + this.lidOpen_ * (OPACITY_MAX - OPACITY_MIN);
    this.svgGroup_.style.opacity = opacity;

    if (this.lidOpen_ > this.minOpenness_ && this.lidOpen_ < 1) {
      this.lidTask_ =
          setTimeout(this.animateLid_.bind(this), ANIMATION_LENGTH / frames);
    }
  }

  /**
   * Set the angle of the trashcan's lid.
   * @param {number} lidAngle The angle at which to set the lid.
   * @private
   */
  setLidAngle_(lidAngle) {
    const openAtRight =
        this.workspace_.toolboxPosition === toolbox.Position.RIGHT ||
        (this.workspace_.horizontalLayout && this.workspace_.RTL);
    this.svgLid_.setAttribute(
        'transform',
        'rotate(' + (openAtRight ? -lidAngle : lidAngle) + ',' +
            (openAtRight ? 4 : WIDTH - 4) + ',' + (LID_HEIGHT - 2) + ')');
  }

  /**
   * Sets the minimum openness of the trashcan lid. If the lid is currently
   * closed, this will update lid's position.
   * @param {number} newMin The new minimum openness of the lid. Should be
   *     between 0 and 1.
   * @private
   */
  setMinOpenness_(newMin) {
    this.minOpenness_ = newMin;
    if (!this.isLidOpen) {
      this.setLidAngle_(newMin * MAX_LID_ANGLE);
    }
  }

  /**
   * Flip the lid shut.
   * Called externally after a drag.
   */
  closeLid() {
    this.setLidOpen(false);
  }

  /**
   * Inspect the contents of the trash.
   */
  click() {
    if (!this.hasContents_()) {
      return;
    }
    this.openFlyout();
  }

  /**
   * Fires a UI event for trashcan flyout open or close.
   * @param {boolean} trashcanOpen Whether the flyout is opening.
   * @private
   */
  fireUiEvent_(trashcanOpen) {
    const uiEvent = new (eventUtils.get(eventUtils.TRASHCAN_OPEN))(
        trashcanOpen, this.workspace_.id);
    eventUtils.fire(uiEvent);
  }

  /**
   * Prevents a workspace scroll and click event if the trashcan has blocks.
   * @param {!Event} e A mouse down event.
   * @private
   */
  blockMouseDownWhenOpenable_(e) {
    if (!this.contentsIsOpen() && this.hasContents_()) {
      e.stopPropagation();  // Don't start a workspace scroll.
    }
  }

  /**
   * Indicate that the trashcan can be clicked (by opening it) if it has blocks.
   * @private
   */
  mouseOver_() {
    if (this.hasContents_()) {
      this.setLidOpen(true);
    }
  }

  /**
   * Close the lid of the trashcan if it was open (Vis. it was indicating it had
   *    blocks).
   * @private
   */
  mouseOut_() {
    // No need to do a .hasBlocks check here because if it doesn't the trashcan
    // won't be open in the first place, and setOpen won't run.
    this.setLidOpen(false);
  }

  /**
   * Handle a BLOCK_DELETE event. Adds deleted blocks oldXml to the content
   * array.
   * @param {!Abstract} event Workspace event.
   * @private
   */
  onDelete_(event) {
    if (this.workspace_.options.maxTrashcanContents <= 0 ||
        event.type !== eventUtils.BLOCK_DELETE) {
      return;
    }
    const deleteEvent = /** @type {!BlockDelete} */ (event);
    if (event.type === eventUtils.BLOCK_DELETE && !deleteEvent.wasShadow) {
      const cleanedJson = this.cleanBlockJson_(deleteEvent.oldJson);
      if (this.contents_.indexOf(cleanedJson) !== -1) {
        return;
      }
      this.contents_.unshift(cleanedJson);
      while (this.contents_.length >
             this.workspace_.options.maxTrashcanContents) {
        this.contents_.pop();
      }

      this.setMinOpenness_(HAS_BLOCKS_LID_ANGLE);
    }
  }

  /**
   * Converts JSON representing a block into text that can be stored in the
   * content array.
   * @param {!blocks.State} json A JSON representation of
   *     a block's state.
   * @return {string} Text representing the JSON, cleaned of all unnecessary
   *     attributes.
   * @private
   */
  cleanBlockJson_(json) {
    // Create a deep copy.
    json = /** @type {!blocks.State} */ (JSON.parse(JSON.stringify(json)));

    /**
     * Reshape JSON into a nicer format.
     * @param {!blocks.State} json The JSON to clean.
     */
    function cleanRec(json) {
      if (!json) {
        return;
      }

      delete json['id'];
      delete json['x'];
      delete json['y'];
      delete json['enabled'];

      if (json['icons'] && json['icons']['comment']) {
        const comment = json['icons']['comment'];
        delete comment['height'];
        delete comment['width'];
        delete comment['pinned'];
      }

      const inputs = json['inputs'];
      for (const name in inputs) {
        const input = inputs[name];
        cleanRec(input['block']);
        cleanRec(input['shadow']);
      }
      if (json['next']) {
        const next = json['next'];
        cleanRec(next['block']);
        cleanRec(next['shadow']);
      }
    }

    cleanRec(json);
    json['kind'] = 'BLOCK';
    return JSON.stringify(json);
  }
}

/**
 * Width of both the trash can and lid images.
 */
const WIDTH = 47;

/**
 * Height of the trashcan image (minus lid).
 */
const BODY_HEIGHT = 44;

/**
 * Height of the lid image.
 */
const LID_HEIGHT = 16;

/**
 * Distance between trashcan and bottom or top edge of workspace.
 */
const MARGIN_VERTICAL = 20;

/**
 * Distance between trashcan and right or left edge of workspace.
 */
const MARGIN_HORIZONTAL = 20;

/**
 * Extent of hotspot on all sides beyond the size of the image.
 */
const MARGIN_HOTSPOT = 10;

/**
 * Location of trashcan in sprite image.
 */
const SPRITE_LEFT = 0;

/**
 * Location of trashcan in sprite image.
 */
const SPRITE_TOP = 32;

/**
 * The openness of the lid when the trashcan contains blocks.
 *    (0.0 = closed, 1.0 = open)
 */
const HAS_BLOCKS_LID_ANGLE = 0.1;

/**
 * The length of the lid open/close animation in milliseconds.
 */
const ANIMATION_LENGTH = 80;

/**
 * The number of frames in the animation.
 */
const ANIMATION_FRAMES = 4;

/**
 * The minimum (resting) opacity of the trashcan and lid.
 */
const OPACITY_MIN = 0.4;

/**
 * The maximum (hovered) opacity of the trashcan and lid.
 */
const OPACITY_MAX = 0.8;

/**
 * The maximum angle the trashcan lid can opens to. At the end of the open
 * animation the lid will be open to this angle.
 */
const MAX_LID_ANGLE = 45;

exports.Trashcan = Trashcan;
