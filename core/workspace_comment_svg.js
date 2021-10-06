/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a code comment on a rendered workspace.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.WorkspaceCommentSvg');

goog.require('Blockly.Css');
goog.require('Blockly.Events');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.CommentCreate');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.CommentDelete');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.CommentMove');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.Selected');
goog.require('Blockly.utils');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.Rect');
goog.require('Blockly.utils.Svg');
goog.require('Blockly.WorkspaceComment');

goog.requireType('Blockly.IBoundedElement');
goog.requireType('Blockly.IBubble');
goog.requireType('Blockly.ICopyable');


/**
 * Class for a workspace comment's SVG representation.
 * @param {!Blockly.Workspace} workspace The block's workspace.
 * @param {string} content The content of this workspace comment.
 * @param {number} height Height of the comment.
 * @param {number} width Width of the comment.
 * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new ID.
 * @extends {Blockly.WorkspaceComment}
 * @implements {Blockly.IBoundedElement}
 * @implements {Blockly.IBubble}
 * @implements {Blockly.ICopyable}
 * @constructor
 */
Blockly.WorkspaceCommentSvg = function(
    workspace, content, height, width, opt_id) {
  /**
   * Mouse up event data.
   * @type {?Blockly.browserEvents.Data}
   * @private
   */
  this.onMouseUpWrapper_ = null;

  /**
   * Mouse move event data.
   * @type {?Blockly.browserEvents.Data}
   * @private
   */
  this.onMouseMoveWrapper_ = null;

  // Create core elements for the block.
  /**
   * @type {!SVGElement}
   * @private
   */
  this.svgGroup_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.G, {'class': 'blocklyComment'}, null);
  this.svgGroup_.translate_ = '';

  this.svgRect_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.RECT, {
        'class': 'blocklyCommentRect',
        'x': 0,
        'y': 0,
        'rx': Blockly.WorkspaceCommentSvg.BORDER_RADIUS,
        'ry': Blockly.WorkspaceCommentSvg.BORDER_RADIUS
      });
  this.svgGroup_.appendChild(this.svgRect_);

  /**
   * Whether the comment is rendered onscreen and is a part of the DOM.
   * @type {boolean}
   * @private
   */
  this.rendered_ = false;

  /**
   * Whether to move the comment to the drag surface when it is dragged.
   * True if it should move, false if it should be translated directly.
   * @type {boolean}
   * @private
   */
  this.useDragSurface_ =
      Blockly.utils.is3dSupported() && !!workspace.blockDragSurface_;

  Blockly.WorkspaceCommentSvg.superClass_.constructor.call(
      this, workspace, content, height, width, opt_id);

  this.render();
};
Blockly.utils.object.inherits(
    Blockly.WorkspaceCommentSvg, Blockly.WorkspaceComment);

/**
 * The width and height to use to size a workspace comment when it is first
 * added, before it has been edited by the user.
 * @type {number}
 * @package
 */
Blockly.WorkspaceCommentSvg.DEFAULT_SIZE = 100;

/**
 * Dispose of this comment.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.dispose = function() {
  if (!this.workspace) {
    // The comment has already been deleted.
    return;
  }
  // If this comment is being dragged, unlink the mouse events.
  if (Blockly.selected == this) {
    this.unselect();
    this.workspace.cancelCurrentGesture();
  }

  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(
        new (Blockly.Events.get(Blockly.Events.COMMENT_DELETE))(this));
  }

  Blockly.utils.dom.removeNode(this.svgGroup_);
  // Sever JavaScript to DOM connections.
  this.svgGroup_ = null;
  this.svgRect_ = null;
  // Dispose of any rendered components
  this.disposeInternal_();

  Blockly.Events.disable();
  Blockly.WorkspaceCommentSvg.superClass_.dispose.call(this);
  Blockly.Events.enable();
};

/**
 * Create and initialize the SVG representation of a workspace comment.
 * May be called more than once.
 *
 * @param {boolean=} opt_noSelect Text inside text area will be selected if false
 *
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.initSvg = function(opt_noSelect) {
  if (!this.workspace.rendered) {
    throw TypeError('Workspace is headless.');
  }
  if (!this.workspace.options.readOnly && !this.eventsInit_) {
    Blockly.browserEvents.conditionalBind(
        this.svgRectTarget_, 'mousedown', this, this.pathMouseDown_);
    Blockly.browserEvents.conditionalBind(
        this.svgHandleTarget_, 'mousedown', this, this.pathMouseDown_);
  }
  this.eventsInit_ = true;

  this.updateMovable();
  if (!this.getSvgRoot().parentNode) {
    this.workspace.getBubbleCanvas().appendChild(this.getSvgRoot());
  }

  if (!opt_noSelect && this.textarea_) {
    this.textarea_.select();
  }
};

/**
 * Handle a mouse-down on an SVG comment.
 * @param {!Event} e Mouse down event or touch start event.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.pathMouseDown_ = function(e) {
  var gesture = this.workspace.getGesture(e);
  if (gesture) {
    gesture.handleBubbleStart(e, this);
  }
};

/**
 * Show the context menu for this workspace comment.
 * @param {!Event} e Mouse event.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.showContextMenu = function(e) {
  if (this.workspace.options.readOnly) {
    return;
  }
  // Save the current workspace comment in a variable for use in closures.
  var comment = this;
  var menuOptions = [];

  if (this.isDeletable() && this.isMovable()) {
    menuOptions.push(Blockly.ContextMenu.commentDuplicateOption(comment));
    menuOptions.push(Blockly.ContextMenu.commentDeleteOption(comment));
  }

  Blockly.ContextMenu.show(e, menuOptions, this.RTL);
};

/**
 * Select this comment.  Highlight it visually.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.select = function() {
  if (Blockly.selected == this) {
    return;
  }
  var oldId = null;
  if (Blockly.selected) {
    oldId = Blockly.selected.id;
    // Unselect any previously selected block.
    Blockly.Events.disable();
    try {
      Blockly.selected.unselect();
    } finally {
      Blockly.Events.enable();
    }
  }
  var event = new (Blockly.Events.get(Blockly.Events.SELECTED))(oldId, this.id,
      this.workspace.id);
  Blockly.Events.fire(event);
  Blockly.selected = this;
  this.addSelect();
};

/**
 * Unselect this comment.  Remove its highlighting.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.unselect = function() {
  if (Blockly.selected != this) {
    return;
  }
  var event = new (Blockly.Events.get(Blockly.Events.SELECTED))(this.id, null,
      this.workspace.id);
  Blockly.Events.fire(event);
  Blockly.selected = null;
  this.removeSelect();
  this.blurFocus();
};

/**
 * Select this comment.  Highlight it visually.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.addSelect = function() {
  Blockly.utils.dom.addClass(
      /** @type {!Element} */ (this.svgGroup_), 'blocklySelected');
  this.setFocus();
};

/**
 * Unselect this comment.  Remove its highlighting.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.removeSelect = function() {
  Blockly.utils.dom.removeClass(
      /** @type {!Element} */ (this.svgGroup_), 'blocklySelected');
  this.blurFocus();
};

/**
 * Focus this comment.  Highlight it visually.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.addFocus = function() {
  Blockly.utils.dom.addClass(
      /** @type {!Element} */ (this.svgGroup_), 'blocklyFocused');
};

/**
 * Unfocus this comment.  Remove its highlighting.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.removeFocus = function() {
  Blockly.utils.dom.removeClass(
      /** @type {!Element} */ (this.svgGroup_), 'blocklyFocused');
};

/**
 * Return the coordinates of the top-left corner of this comment relative to
 * the drawing surface's origin (0,0), in workspace units.
 * If the comment is on the workspace, (0, 0) is the origin of the workspace
 * coordinate system.
 * This does not change with workspace scale.
 * @return {!Blockly.utils.Coordinate} Object with .x and .y properties in
 *     workspace coordinates.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.getRelativeToSurfaceXY = function() {
  var x = 0;
  var y = 0;

  var dragSurfaceGroup =
      this.useDragSurface_ ? this.workspace.blockDragSurface_.getGroup() : null;

  var element = this.getSvgRoot();
  if (element) {
    do {
      // Loop through this comment and every parent.
      var xy = Blockly.utils.getRelativeXY(element);
      x += xy.x;
      y += xy.y;
      // If this element is the current element on the drag surface, include
      // the translation of the drag surface itself.
      if (this.useDragSurface_ &&
          this.workspace.blockDragSurface_.getCurrentBlock() == element) {
        var surfaceTranslation =
            this.workspace.blockDragSurface_.getSurfaceTranslation();
        x += surfaceTranslation.x;
        y += surfaceTranslation.y;
      }
      element = element.parentNode;
    } while (element && element != this.workspace.getBubbleCanvas() &&
             element != dragSurfaceGroup);
  }
  this.xy_ = new Blockly.utils.Coordinate(x, y);
  return this.xy_;
};

/**
 * Move a comment by a relative offset.
 * @param {number} dx Horizontal offset, in workspace units.
 * @param {number} dy Vertical offset, in workspace units.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.moveBy = function(dx, dy) {
  var event = new (Blockly.Events.get(Blockly.Events.COMMENT_MOVE))(this);
  // TODO: Do I need to look up the relative to surface XY position here?
  var xy = this.getRelativeToSurfaceXY();
  this.translate(xy.x + dx, xy.y + dy);
  this.xy_ = new Blockly.utils.Coordinate(xy.x + dx, xy.y + dy);
  event.recordNew();
  Blockly.Events.fire(event);
  this.workspace.resizeContents();
};

/**
 * Transforms a comment by setting the translation on the transform attribute
 * of the block's SVG.
 * @param {number} x The x coordinate of the translation in workspace units.
 * @param {number} y The y coordinate of the translation in workspace units.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.translate = function(x, y) {
  this.xy_ = new Blockly.utils.Coordinate(x, y);
  this.getSvgRoot().setAttribute('transform', 'translate(' + x + ',' + y + ')');
};

/**
 * Move this comment to its workspace's drag surface, accounting for
 * positioning.  Generally should be called at the same time as
 * setDragging(true).  Does nothing if useDragSurface_ is false.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.moveToDragSurface = function() {
  if (!this.useDragSurface_) {
    return;
  }
  // The translation for drag surface blocks,
  // is equal to the current relative-to-surface position,
  // to keep the position in sync as it move on/off the surface.
  // This is in workspace coordinates.
  var xy = this.getRelativeToSurfaceXY();
  this.clearTransformAttributes_();
  this.workspace.blockDragSurface_.translateSurface(xy.x, xy.y);
  // Execute the move on the top-level SVG component
  this.workspace.blockDragSurface_.setBlocksAndShow(this.getSvgRoot());
};

/**
 * Move this comment back to the workspace block canvas.
 * Generally should be called at the same time as setDragging(false).
 * Does nothing if useDragSurface_ is false.
 * @param {!Blockly.utils.Coordinate} newXY The position the comment should take
 *     on on the workspace canvas, in workspace coordinates.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.moveOffDragSurface = function(newXY) {
  if (!this.useDragSurface_) {
    return;
  }
  // Translate to current position, turning off 3d.
  this.translate(newXY.x, newXY.y);
  this.workspace.blockDragSurface_.clearAndHide(this.workspace.getCanvas());
};

/**
 * Move this comment during a drag, taking into account whether we are using a
 * drag surface to translate blocks.
 * @param {Blockly.BlockDragSurfaceSvg} dragSurface The surface that carries
 *     rendered items during a drag, or null if no drag surface is in use.
 * @param {!Blockly.utils.Coordinate} newLoc The location to translate to, in
 *     workspace coordinates.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.moveDuringDrag = function(
    dragSurface, newLoc) {
  if (dragSurface) {
    dragSurface.translateSurface(newLoc.x, newLoc.y);
  } else {
    this.svgGroup_.translate_ = 'translate(' + newLoc.x + ',' + newLoc.y + ')';
    this.svgGroup_.setAttribute(
        'transform', this.svgGroup_.translate_ + this.svgGroup_.skew_);
  }
};

/**
 * Move the bubble group to the specified location in workspace coordinates.
 * @param {number} x The x position to move to.
 * @param {number} y The y position to move to.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.moveTo = function(x, y) {
  this.translate(x, y);
};

/**
 * Clear the comment of transform="..." attributes.
 * Used when the comment is switching from 3d to 2d transform or vice versa.
 * @private
 */
Blockly.WorkspaceCommentSvg.prototype.clearTransformAttributes_ = function() {
  this.getSvgRoot().removeAttribute('transform');
};

/**
 * Returns the coordinates of a bounding box describing the dimensions of this
 * comment.
 * Coordinate system: workspace coordinates.
 * @return {!Blockly.utils.Rect} Object with coordinates of the bounding box.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.getBoundingRectangle = function() {
  var blockXY = this.getRelativeToSurfaceXY();
  var commentBounds = this.getHeightWidth();
  var top = blockXY.y;
  var bottom = blockXY.y + commentBounds.height;
  var left, right;
  if (this.RTL) {
    left = blockXY.x - commentBounds.width;
    // Add the width of the tab/puzzle piece knob to the x coordinate
    // since X is the corner of the rectangle, not the whole puzzle piece.
    right = blockXY.x;
  } else {
    // Subtract the width of the tab/puzzle piece knob to the x coordinate
    // since X is the corner of the rectangle, not the whole puzzle piece.
    left = blockXY.x;
    right = blockXY.x + commentBounds.width;
  }
  return new Blockly.utils.Rect(top, bottom, left, right);
};

/**
 * Add or remove the UI indicating if this comment is movable or not.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.updateMovable = function() {
  if (this.isMovable()) {
    Blockly.utils.dom.addClass(
        /** @type {!Element} */ (this.svgGroup_), 'blocklyDraggable');
  } else {
    Blockly.utils.dom.removeClass(
        /** @type {!Element} */ (this.svgGroup_), 'blocklyDraggable');
  }
};

/**
 * Set whether this comment is movable or not.
 * @param {boolean} movable True if movable.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.setMovable = function(movable) {
  Blockly.WorkspaceCommentSvg.superClass_.setMovable.call(this, movable);
  this.updateMovable();
};

/**
 * Set whether this comment is editable or not.
 * @param {boolean} editable True if editable.
 */
Blockly.WorkspaceCommentSvg.prototype.setEditable = function(editable) {
  Blockly.WorkspaceCommentSvg.superClass_.setEditable.call(this, editable);
  if (this.textarea_) {
    this.textarea_.readOnly = !editable;
  }
};

/**
 * Recursively adds or removes the dragging class to this node and its children.
 * @param {boolean} adding True if adding, false if removing.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.setDragging = function(adding) {
  if (adding) {
    var group = this.getSvgRoot();
    group.translate_ = '';
    group.skew_ = '';
    Blockly.utils.dom.addClass(
        /** @type {!Element} */ (this.svgGroup_), 'blocklyDragging');
  } else {
    Blockly.utils.dom.removeClass(
        /** @type {!Element} */ (this.svgGroup_), 'blocklyDragging');
  }
};

/**
 * Return the root node of the SVG or null if none exists.
 * @return {!SVGElement} The root SVG node (probably a group).
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.getSvgRoot = function() {
  return this.svgGroup_;
};

/**
 * Returns this comment's text.
 * @return {string} Comment text.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.getContent = function() {
  return this.textarea_ ? this.textarea_.value : this.content_;
};

/**
 * Set this comment's content.
 * @param {string} content Comment content.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.setContent = function(content) {
  Blockly.WorkspaceCommentSvg.superClass_.setContent.call(this, content);
  if (this.textarea_) {
    this.textarea_.value = content;
  }
};

/**
 * Update the cursor over this comment by adding or removing a class.
 * @param {boolean} enable True if the delete cursor should be shown, false
 *     otherwise.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.setDeleteStyle = function(enable) {
  if (enable) {
    Blockly.utils.dom.addClass(
        /** @type {!Element} */ (this.svgGroup_), 'blocklyDraggingDelete');
  } else {
    Blockly.utils.dom.removeClass(
        /** @type {!Element} */ (this.svgGroup_), 'blocklyDraggingDelete');
  }
};

/**
 * Set whether auto-layout of this bubble is enabled.  The first time a bubble
 * is shown it positions itself to not cover any blocks.  Once a user has
 * dragged it to reposition, it renders where the user put it.
 * @param {boolean} _enable True if auto-layout should be enabled, false
 *     otherwise.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.setAutoLayout = function(_enable) {
  // NOP for compatibility with the bubble dragger.
};

/**
 * Decode an XML comment tag and create a rendered comment on the workspace.
 * @param {!Element} xmlComment XML comment element.
 * @param {!Blockly.Workspace} workspace The workspace.
 * @param {number=} opt_wsWidth The width of the workspace, which is used to
 *     position comments correctly in RTL.
 * @return {!Blockly.WorkspaceCommentSvg} The created workspace comment.
 * @package
 */
Blockly.WorkspaceCommentSvg.fromXml = function(
    xmlComment, workspace, opt_wsWidth) {
  Blockly.Events.disable();
  try {
    var info = Blockly.WorkspaceComment.parseAttributes(xmlComment);

    var comment = new Blockly.WorkspaceCommentSvg(
        workspace, info.content, info.h, info.w, info.id);
    if (workspace.rendered) {
      comment.initSvg(true);
      comment.render(false);
    }
    // Position the comment correctly, taking into account the width of a
    // rendered RTL workspace.
    if (!isNaN(info.x) && !isNaN(info.y)) {
      if (workspace.RTL) {
        var wsWidth = opt_wsWidth || workspace.getWidth();
        comment.moveBy(wsWidth - info.x, info.y);
      } else {
        comment.moveBy(info.x, info.y);
      }
    }
  } finally {
    Blockly.Events.enable();
  }
  Blockly.WorkspaceComment.fireCreateEvent(comment);

  return comment;
};

/**
 * Encode a comment subtree as XML with XY coordinates.
 * @param {boolean=} opt_noId True if the encoder should skip the comment ID.
 * @return {!Element} Tree of XML elements.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.toXmlWithXY = function(opt_noId) {
  var width;  // Not used in LTR.
  if (this.workspace.RTL) {
    // Here be performance dragons: This calls getMetrics().
    width = this.workspace.getWidth();
  }
  var element = this.toXml(opt_noId);
  var xy = this.getRelativeToSurfaceXY();
  element.setAttribute(
      'x', Math.round(this.workspace.RTL ? width - xy.x : xy.x));
  element.setAttribute('y', Math.round(xy.y));
  element.setAttribute('h', this.getHeight());
  element.setAttribute('w', this.getWidth());
  return element;
};

/**
 * Encode a comment for copying.
 * @return {!Blockly.ICopyable.CopyData} Copy metadata.
 * @package
 */
Blockly.WorkspaceCommentSvg.prototype.toCopyData = function() {
  return {xml: this.toXmlWithXY(), source: this.workspace, typeCounts: null};
};

/**
 * CSS for workspace comment.  See css.js for use.
 */
Blockly.Css.register([
  // clang-format off
  /* eslint-disable indent */
  '.blocklyCommentForeignObject {',
    'position: relative;',
    'z-index: 0;',
  '}',

  '.blocklyCommentRect {',
    'fill: #E7DE8E;',
    'stroke: #bcA903;',
    'stroke-width: 1px;',
  '}',

  '.blocklyCommentTarget {',
    'fill: transparent;',
    'stroke: #bcA903;',
  '}',

  '.blocklyCommentTargetFocused {',
    'fill: none;',
  '}',

  '.blocklyCommentHandleTarget {',
    'fill: none;',
  '}',

  '.blocklyCommentHandleTargetFocused {',
    'fill: transparent;',
  '}',

  '.blocklyFocused>.blocklyCommentRect {',
    'fill: #B9B272;',
    'stroke: #B9B272;',
  '}',

  '.blocklySelected>.blocklyCommentTarget {',
    'stroke: #fc3;',
    'stroke-width: 3px;',
  '}',

  '.blocklyCommentDeleteIcon {',
    'cursor: pointer;',
    'fill: #000;',
    'display: none;',
  '}',

  '.blocklySelected > .blocklyCommentDeleteIcon {',
    'display: block;',
  '}',

  '.blocklyDeleteIconShape {',
    'fill: #000;',
    'stroke: #000;',
    'stroke-width: 1px;',
  '}',

  '.blocklyDeleteIconShape.blocklyDeleteIconHighlighted {',
    'stroke: #fc3;',
  '}'
  /* eslint-enable indent */
  // clang-format on
]);
